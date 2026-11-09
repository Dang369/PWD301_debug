'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/fnb';

interface KdsOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onToggleItemCheck?: (orderId: string, itemIdx: number) => void;
  onNotifyRunner?: (orderId: string) => void;
}

export default function KdsOrderCard({
  order,
  onUpdateStatus,
  onToggleItemCheck,
  onNotifyRunner,
}: KdsOrderCardProps) {
  const isPending = order.status === 'PENDING';
  const isCooking = order.status === 'COOKING';
  const isReady = order.status === 'READY';
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showThermalSlip, setShowThermalSlip] = useState(false);

  const persistedChecked = Array.isArray(order.checkedIndices) ? order.checkedIndices : [];
  const cancelledIndices = Array.isArray(order.cancelledIndices) ? order.cancelledIndices : [];
  const checkedCount =
    isReady || isDelivered
      ? persistedChecked.length > 0
        ? persistedChecked.length
        : order.items.length - cancelledIndices.length
      : persistedChecked.length;
  const allItemsChecked = order.items.length > 0 && checkedCount >= order.items.length;

  useEffect(() => {
    if (isReady || isDelivered || isCancelled) {
      const startIso = order.cookingStartedAt || order.createdAt;
      const endIso = order.completedAt || order.deliveredAt || order.updatedAt;
      if (startIso && endIso) {
        const start = new Date(startIso).getTime();
        const end = new Date(endIso).getTime();
        const diff = Math.max(0, Math.floor((end - start) / 1000));
        setElapsedSeconds(diff);
      }
      return;
    }

    const calculateElapsed = () => {
      const now = Date.now();
      let startTime = now;

      if (isCooking) {
        startTime = order.cookingStartedAt
          ? new Date(order.cookingStartedAt).getTime()
          : order.createdAt
          ? new Date(order.createdAt).getTime()
          : now;
      } else {
        startTime = order.createdAt ? new Date(order.createdAt).getTime() : now;
      }

      const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diffSecs);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [
    order.status,
    order.cookingStartedAt,
    order.createdAt,
    order.completedAt,
    order.deliveredAt,
    order.updatedAt,
    isCooking,
    isReady,
    isDelivered,
    isCancelled,
  ]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formattedTimer = formatTime(elapsedSeconds);

  const handleItemRowClick = (idx: number) => {
    if (!isCooking) return;
    if (onToggleItemCheck) {
      onToggleItemCheck(order.id, idx);
    }
  };

  const getBorderColor = () => {
    if (isPending) return 'border-rose-500/60 shadow-[0_0_15px_rgba(255,42,85,0.2)]';
    if (isCooking) {
      if (elapsedSeconds >= 480) {
        return 'border-rose-500 shadow-[0_0_20px_rgba(255,42,85,0.4)] animate-pulse';
      }
      return 'border-amber-500/60 shadow-[0_0_15px_rgba(255,183,3,0.25)]';
    }
    if (isReady) return 'border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.25)]';
    if (isCancelled) return 'border-rose-900/60 opacity-60';
    return 'border-emerald-500/30 opacity-75';
  };

  const getTimerColor = () => {
    if (isPending) {
      return 'text-rose-400 bg-rose-950/40 border border-rose-500/40';
    }
    if (isCooking) {
      if (elapsedSeconds >= 480) {
        return 'text-rose-300 bg-rose-950/80 border border-rose-500 animate-pulse font-black';
      }
      if (elapsedSeconds >= 300) {
        return 'text-amber-300 bg-amber-950/70 border border-amber-500/80 font-bold';
      }
      return 'text-amber-400 bg-amber-950/40 border border-amber-500/40 font-bold';
    }
    if (isReady) {
      return 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/50 font-bold';
    }
    if (isCancelled) {
      return 'text-rose-400 bg-rose-950/40 border border-rose-800';
    }
    return 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 font-bold';
  };

  const orderCreatedTimeStr = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : new Date().toLocaleTimeString('vi-VN');

  return (
    <>
      <div
        className={`bg-slate-900 rounded-xl border flex flex-col justify-between p-5 shadow-xl transition-all ${getBorderColor()}`}
      >
        <div>
          <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-white font-mono font-black tracking-wider">
                  ĐƠN #{order.orderNumber}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold font-mono tracking-wider border ${
                    order.station === 'BAR'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                  }`}
                >
                  {order.station === 'BAR' ? '🍹 QUẦY BAR' : '🍳 BẾP NÓNG'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">{order.zoneName}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {order.paymentMethod === 'ACCOUNT_BALANCE' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ✓ ĐÃ TRỪ VÍ: {order.totalAmount.toLocaleString('vi-VN')}đ
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    💰 THU TẠI BÀN: {order.totalAmount.toLocaleString('vi-VN')}đ
                  </span>
                )}
                {order.refundedAmount && order.refundedAmount > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {order.paymentMethod === 'ACCOUNT_BALANCE'
                      ? `↩ ĐÃ HOÀN VÍ (${cancelledIndices.length} MÓN THIẾU): +${order.refundedAmount.toLocaleString('vi-VN')}đ`
                      : `✂ ĐÃ TRỪ ${cancelledIndices.length} MÓN THIẾU: -${order.refundedAmount.toLocaleString('vi-VN')}đ`}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-cyan-400 font-mono font-black text-xl tracking-wide">{order.pcName}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setShowThermalSlip(true)}
                  className="px-1.5 py-0.5 bg-[#1a2438] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 rounded text-[10px] font-mono flex items-center gap-1 transition cursor-pointer"
                  title="In phiếu bếp 80mm"
                >
                  <span className="material-symbols-outlined text-[13px]">print</span>
                  <span>IN</span>
                </button>
                <div
                  className={`text-xs font-mono px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-sm ${getTimerColor()}`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${isCooking ? 'animate-spin' : ''}`}>
                    {isDelivered
                      ? 'task_alt'
                      : isReady
                      ? 'notifications_active'
                      : isCooking
                      ? 'progress_activity'
                      : isCancelled
                      ? 'cancel'
                      : 'timer'}
                  </span>
                  <span>
                    {isDelivered
                      ? 'ĐÃ GIAO'
                      : isCancelled
                      ? 'ĐÃ HỦY'
                      : isReady
                      ? `CHỜ GIAO (${formattedTimer})`
                      : formattedTimer}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isPending && (
            <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg mb-3 text-xs text-rose-300 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                1. CHỜ BẾP NHẬN ĐƠN
              </span>
              <span className="text-[10px] text-rose-400">Lúc {orderCreatedTimeStr}</span>
            </div>
          )}

          {isCooking && (
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg mb-3 text-xs text-amber-300 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                2. ĐANG CHẾ BIẾN ({checkedCount}/{order.items.length} MÓN)
              </span>
              <span className="text-[11px] text-amber-400 font-bold">
                {elapsedSeconds >= 480 ? '⚠️ QUÁ 8 PHÚT' : 'Cam kết < 8p'}
              </span>
            </div>
          )}

          {isReady && (
            <div className="bg-cyan-500/15 border border-cyan-400/50 px-3 py-2 rounded-lg mb-3 text-xs text-cyan-200 font-mono space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  3. ĐÃ XONG {checkedCount}/{order.items.length} MÓN • CHỜ BƯNG RA {order.pcName}
                </span>
              </div>
              {order.paymentMethod === 'CASH_OR_QR' && (
                <div className="text-[11px] text-amber-300 font-bold bg-amber-950/60 px-2 py-1 rounded border border-amber-500/40">
                  ⚠️ Runner lưu ý thu khách: {order.totalAmount.toLocaleString('vi-VN')}đ (Tiền mặt / QR)
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 mb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Danh sách món ({order.items.length})</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isPending
                  ? 'Nhận đơn để bắt đầu chế biến'
                  : isCooking
                  ? `Chạm để tick món xong (${checkedCount}/${order.items.length})`
                  : isReady || isDelivered
                  ? cancelledIndices.length > 0
                    ? `✓ Giao ${checkedCount}/${order.items.length} món • ✕ Hủy ${cancelledIndices.length} món`
                    : `✓ Đã hoàn tất ${order.items.length}/${order.items.length} món`
                  : 'Đơn đã hủy'}
              </span>
            </div>

            {order.items.map((item, idx) => {
              const itemText =
                typeof item === 'string'
                  ? item
                  : `${item.quantity}x ${item.name || item.menuItemId}${
                      item.options ? ` (${item.options})` : ''
                    }`;
              const isItemCancelled = isCancelled || cancelledIndices.includes(idx);
              const isChecked =
                !isItemCancelled &&
                (persistedChecked.includes(idx) ||
                  ((isReady || isDelivered) &&
                    cancelledIndices.length === 0 &&
                    persistedChecked.length === 0));

              return (
                <div
                  key={idx}
                  onClick={() => handleItemRowClick(idx)}
                  className={`p-2.5 rounded-lg text-sm font-semibold select-none transition-all flex items-center justify-between gap-2 border ${
                    isItemCancelled
                      ? 'bg-rose-950/25 border-rose-500/40 text-rose-300/80 line-through'
                      : isChecked
                      ? 'bg-[#0f241a] border-emerald-500/40 text-emerald-200 line-through opacity-90'
                      : isCooking
                      ? 'bg-[#141b2b] border-amber-500/40 text-slate-100 hover:border-amber-400 cursor-pointer'
                      : 'bg-[#141b2b] border-slate-800 text-slate-300 opacity-80 cursor-default'
                  }`}
                >
                  <span className="flex-1">{itemText}</span>
                  {isItemCancelled && !isCancelled ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 no-underline shrink-0">
                      ✕ HẾT MÓN
                    </span>
                  ) : (
                    <span
                      className={`material-symbols-outlined text-[18px] shrink-0 ${
                        isItemCancelled
                          ? 'text-rose-400'
                          : isChecked
                          ? 'text-emerald-400'
                          : isCooking
                          ? 'text-amber-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {isItemCancelled
                        ? 'block'
                        : isChecked
                        ? 'check_box'
                        : isCooking
                        ? 'check_box_outline_blank'
                        : 'hourglass_empty'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {order.note && (
            <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-lg text-xs text-amber-300 mb-4 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-400 flex-shrink-0 mt-0.5">
                warning
              </span>
              <div className="font-medium leading-relaxed">{order.note}</div>
            </div>
          )}
        </div>

        <div className="pt-2">
          {isPending && (
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'COOKING')}
                className="col-span-3 bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-2 rounded-lg font-mono text-xs tracking-wide shadow-lg shadow-rose-600/30 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">skillet</span>
                <span>NHẬN ĐƠN &amp; NẤU</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                className="col-span-1 bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 font-bold py-3 rounded-lg font-mono text-xs transition flex items-center justify-center cursor-pointer"
                title="Từ chối / Hủy đơn và tự động hoàn tiền ví nếu khách đã trả trước"
              >
                ✕ HỦY
              </button>
            </div>
          )}

          {isCooking && (
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'READY')}
                className={`col-span-3 font-black py-3 px-2 rounded-lg font-mono text-[11px] uppercase tracking-wide active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  allItemsChecked
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : checkedCount > 0
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {allItemsChecked
                    ? 'notifications_active'
                    : checkedCount > 0
                    ? 'fact_check'
                    : 'touch_app'}
                </span>
                <span>
                  {allItemsChecked
                    ? `🔔 ĐỦ ${order.items.length}/${order.items.length} MÓN — BÁO GIAO`
                    : checkedCount > 0
                    ? `🔔 GIAO ${checkedCount}/${order.items.length} MÓN (HỦY ${order.items.length - checkedCount} MÓN THIẾU)`
                    : `CHỌN MÓN XONG ĐỂ GIAO (0/${order.items.length})`}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                className="col-span-1 bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 font-bold py-3 rounded-lg font-mono text-xs transition flex items-center justify-center cursor-pointer"
                title="Hủy toàn bộ đơn và tự động hoàn tiền ví nếu khách đã trả trước"
              >
                ✕ HỦY
              </button>
            </div>
          )}

          {isReady && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onNotifyRunner) onNotifyRunner(order.id);
                }}
                className="col-span-1 bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold py-3 px-2 rounded-lg font-mono text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                title="Phát lại chuông gọi Runner và nhắc thông báo trên màn hình máy khách"
              >
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span>Nhắc Chuông</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
                className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 px-2 rounded-lg font-mono text-xs tracking-wide shadow-lg shadow-emerald-500/30 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                <span>🛵 ĐÃ GIAO TẬN BÀN</span>
              </button>
            </div>
          )}

          {isDelivered && (
            <div className="w-full bg-[#0f241a] border border-emerald-500/40 text-emerald-300 font-mono text-xs py-2.5 rounded-lg text-center flex items-center justify-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">task_alt</span>
              <span>ĐÃ GIAO TẬN MÁY &amp; KHỚP DOANH THU</span>
            </div>
          )}

          {isCancelled && (
            <div className="w-full bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-xs py-2.5 rounded-lg text-center flex items-center justify-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-rose-400 text-[16px]">cancel</span>
              <span>
                ĐƠN ĐÃ HỦY ({order.paymentMethod === 'ACCOUNT_BALANCE' ? 'ĐÃ HOÀN TIỀN VÍ' : 'KHÔNG THU TIỀN'})
              </span>
            </div>
          )}
        </div>
      </div>

      {showThermalSlip && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black font-mono w-full max-w-[340px] p-5 rounded-lg shadow-2xl border border-slate-300 select-text">
            <div className="text-center pb-3 border-b-2 border-dashed border-black">
              <div className="font-black text-base uppercase">CYBERZONE ESPORTS</div>
              <div className="text-[11px] font-bold uppercase tracking-wider">PHIẾU BẾP &amp; BAR (80MM)</div>
              <div className="text-[10px] text-slate-700 mt-1">182 Lê Duẩn, P. Bến Thủy, TP. Vinh</div>
            </div>

            <div className="py-2.5 border-b border-dashed border-black text-xs space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>VỊ TRÍ GIAO:</span>
                <span className="bg-black text-white px-1.5 rounded">{order.pcName}</span>
              </div>
              <div className="flex justify-between">
                <span>Mã đơn:</span>
                <span className="font-bold">#{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Khu vực:</span>
                <span>{order.zoneName}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Giờ đặt:</span>
                <span>{orderCreatedTimeStr}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Thanh toán:</span>
                <span className="font-bold">
                  {order.paymentMethod === 'ACCOUNT_BALANCE' ? 'Đã trừ Ví tài khoản' : 'Thu tại bàn (Tiền mặt/QR)'}
                </span>
              </div>
            </div>

            <div className="py-3 border-b-2 border-dashed border-black">
              <div className="text-[11px] font-bold uppercase mb-1.5 flex justify-between">
                <span>DANH SÁCH MÓN</span>
                <span>TRẠNG THÁI</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {order.items.map((item, idx) => {
                  const text = typeof item === 'string' ? item : `${item.quantity}x ${item.name || item.menuItemId}`;
                  const itemCancelled = isCancelled || cancelledIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`font-bold leading-tight flex justify-between gap-2 ${
                        itemCancelled ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      <span>• {text}</span>
                      <span>{itemCancelled ? '✕ HẾT' : '✓'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.note && (
              <div className="py-2 border-b border-dashed border-black text-xs">
                <span className="font-bold">Ghi chú bếp: </span>
                <span className="italic">{order.note}</span>
              </div>
            )}

            {order.refundedAmount && order.refundedAmount > 0 ? (
              <div className="py-1.5 border-b border-dashed border-black text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Tổng gốc:</span>
                  <span>{(order.originalTotalAmount || order.totalAmount + order.refundedAmount).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{order.paymentMethod === 'ACCOUNT_BALANCE' ? 'Hoàn ví món hết:' : 'Trừ món hết:'}</span>
                  <span>-{order.refundedAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            ) : null}

            <div className="py-2.5 border-b-2 border-black flex justify-between font-bold text-sm">
              <span>{order.paymentMethod === 'ACCOUNT_BALANCE' ? 'ĐÃ THANH TOÁN:' : 'CẦN THU KHÁCH:'}</span>
              <span>{order.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="text-center text-[10px] text-slate-600 pt-2">
              --- CHÚC QUÝ KHÁCH LEO RANK VUI VẺ ---
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowThermalSlip(false)}
                className="w-1/2 py-2 bg-slate-200 hover:bg-slate-300 text-black font-bold text-xs rounded transition uppercase cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-1/2 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded transition uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">print</span>
                <span>In Phiếu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
