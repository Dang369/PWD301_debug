'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/fnb';

interface KdsOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onNotifyRunner?: (orderId: string) => void;
}

export default function KdsOrderCard({
  order,
  onUpdateStatus,
  onNotifyRunner,
}: KdsOrderCardProps) {
  const isPending = order.status === 'PENDING';
  const isCooking = order.status === 'COOKING';
  const isReady = order.status === 'READY';
  const isDelivered = order.status === 'DELIVERED';

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});
  const [showThermalSlip, setShowThermalSlip] = useState(false);

  useEffect(() => {
    if (isReady || isDelivered) {
      if (order.cookingStartedAt && order.completedAt) {
        const start = new Date(order.cookingStartedAt).getTime();
        const end = new Date(order.completedAt).getTime();
        const diff = Math.max(0, Math.floor((end - start) / 1000));
        setElapsedSeconds(diff);
      }
      return;
    }

    const calculateElapsed = () => {
      const now = Date.now();
      let startTime = 0;

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
  }, [order.status, order.cookingStartedAt, order.createdAt, order.completedAt, isCooking, isReady, isDelivered]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formattedTimer = formatTime(elapsedSeconds);

  const toggleItemCheck = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getBorderColor = () => {
    if (isPending) return 'border-rose-500/60 shadow-[0_0_15px_rgba(255,42,85,0.2)]';
    if (isCooking) {
      if (elapsedSeconds >= 480) {
        return 'border-rose-500 shadow-[0_0_20px_rgba(255,42,85,0.4)] animate-pulse';
      }
      return 'border-amber-500/60 shadow-[0_0_15px_rgba(255,183,3,0.25)]';
    }
    if (isReady) return 'border-emerald-500/60 shadow-[0_0_15px_rgba(0,255,136,0.2)]';
    return 'border-slate-800 opacity-60';
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
      return 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 font-bold';
    }
    return 'text-slate-400 bg-slate-900 border border-slate-700';
  };

  return (
    <>
      <div
        className={`bg-slate-900 rounded-xl border flex flex-col justify-between p-5 shadow-xl transition-all ${getBorderColor()}`}
      >
        <div>
          <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono font-bold tracking-wider">
                  ĐƠN #{order.orderNumber}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded uppercase font-bold font-mono tracking-wider bg-[#141b2b] text-slate-300 border border-slate-700">
                  {order.paymentMethod === 'ACCOUNT_BALANCE' ? 'VÍ TÀI KHOẢN' : 'TIỀN MẶT / QR'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{order.zoneName}</div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-cyan-400 font-mono font-black text-xl tracking-wide">{order.pcName}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setShowThermalSlip(true)}
                  className="px-1.5 py-0.5 bg-[#1a2438] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 rounded text-[10px] font-mono flex items-center gap-1 transition"
                  title="In phiếu bếp 80mm"
                >
                  <span className="material-symbols-outlined text-[13px]">print</span>
                  <span>IN</span>
                </button>
                <div
                  className={`text-xs font-mono px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-sm ${getTimerColor()}`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${isCooking ? 'animate-spin' : ''}`}>
                    {isReady ? 'check_circle' : isCooking ? 'progress_activity' : 'timer'}
                  </span>
                  <span>
                    {isReady
                      ? `XONG (${formattedTimer})`
                      : isDelivered
                      ? 'ĐÃ GIAO'
                      : formattedTimer}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isCooking && (
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg mb-3 text-xs text-amber-300 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                ĐANG NẤU...
              </span>
              <span className="text-[11px] text-amber-400 font-bold">
                {elapsedSeconds >= 480 ? '⚠️ QUÁ 8 PHÚT' : 'Cam kết < 8p'}
              </span>
            </div>
          )}

          {isPending && (
            <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg mb-3 text-xs text-rose-300 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                CHỜ NHẬN BẾP
              </span>
              <span className="text-[11px] text-rose-400">Chờ nhận đơn</span>
            </div>
          )}

          <div className="space-y-2 mb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Danh sách món ({order.items.length})</span>
              <span className="text-[10px] text-slate-500">Chạm để tick xong</span>
            </div>

            {order.items.map((item, idx) => {
              const itemText =
                typeof item === 'string'
                  ? item
                  : `${item.quantity}x ${item.name || item.menuItemId}${
                      item.options ? ` (${item.options})` : ''
                    }`;
              const isChecked = checkedItems[idx] || isReady || isDelivered;

              return (
                <div
                  key={idx}
                  onClick={() => toggleItemCheck(idx)}
                  className={`p-2.5 rounded-lg text-sm font-semibold cursor-pointer select-none transition-all flex items-center justify-between border ${
                    isChecked
                      ? 'bg-[#0f241a] border-emerald-500/40 text-emerald-200 line-through opacity-75'
                      : 'bg-[#141b2b] border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{itemText}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {isChecked ? 'check_box' : 'check_box_outline_blank'}
                  </span>
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
            <button
              onClick={() => onUpdateStatus(order.id, 'COOKING')}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-lg font-mono tracking-wide shadow-lg shadow-rose-600/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">skillet</span>
              <span>🍳 NHẬN ĐƠN &amp; BẮT ĐẦU NẤU</span>
            </button>
          )}

          {isCooking && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateStatus(order.id, 'READY')}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black py-3 rounded-lg font-mono text-xs uppercase tracking-wider active:scale-98 transition flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>✓ HOÀN THÀNH</span>
              </button>
              <button
                onClick={() => {
                  if (onNotifyRunner) onNotifyRunner(order.id);
                  onUpdateStatus(order.id, 'READY');
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-lg font-mono text-xs uppercase tracking-wider active:scale-98 transition flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span>🔔 BÁO GIAO</span>
              </button>
            </div>
          )}

          {isReady && (
            <button
              onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-lg font-mono tracking-wide shadow-lg shadow-emerald-500/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
              <span>🛵 ĐÃ GIAO CHO KHÁCH TẠI MÁY</span>
            </button>
          )}

          {isDelivered && (
            <div className="w-full bg-[#141b2b] border border-slate-700 text-slate-400 font-mono text-xs py-2.5 rounded-lg text-center flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[16px]">task_alt</span>
              <span>ĐƠN HÀNG ĐÃ HOÀN TẤT</span>
            </div>
          )}
        </div>
      </div>

      {showThermalSlip && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black font-mono w-full max-w-[340px] p-5 rounded-lg shadow-2xl border border-slate-300 select-text">
            <div className="text-center pb-3 border-b-2 border-dashed border-black">
              <div className="font-black text-base uppercase">CYBERNET ESPORTS</div>
              <div className="text-[11px] font-bold uppercase tracking-wider">PHIẾU BẾP &amp; BAR (80MM)</div>
              <div className="text-[10px] text-slate-700 mt-1">Trần Đại Nghĩa, Hai Bà Trưng, HN</div>
            </div>

            <div className="py-2.5 border-b border-dashed border-black text-xs space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>VỊ TRÍ:</span>
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
                <span>{new Date().toLocaleTimeString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Thanh toán:</span>
                <span className="font-bold">
                  {order.paymentMethod === 'ACCOUNT_BALANCE' ? 'Ví tài khoản máy' : 'Tiền mặt/QR'}
                </span>
              </div>
            </div>

            <div className="py-3 border-b-2 border-dashed border-black">
              <div className="text-[11px] font-bold uppercase mb-1.5 flex justify-between">
                <span>TÊN MÓN</span>
                <span>SL</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {order.items.map((item, idx) => {
                  const text = typeof item === 'string' ? item : `${item.quantity}x ${item.name || item.menuItemId}`;
                  return (
                    <div key={idx} className="font-bold leading-tight">
                      • {text}
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

            <div className="py-2.5 border-b-2 border-black flex justify-between font-bold text-sm">
              <span>TỔNG TIỀN:</span>
              <span>{order.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="text-center text-[10px] text-slate-600 pt-2">
              --- CHÚC QUÝ KHÁCH LEO RANK VUI VẺ ---
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowThermalSlip(false)}
                className="w-1/2 py-2 bg-slate-200 hover:bg-slate-300 text-black font-bold text-xs rounded transition uppercase"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-1/2 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded transition uppercase flex items-center justify-center gap-1"
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