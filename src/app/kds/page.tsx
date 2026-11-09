'use client';

import React, { useState, useEffect } from 'react';
import KdsOrderCard from '@/components/fnb/KdsOrderCard';
import { Order, OrderStatus, KdsFilterStation } from '@/types/fnb';
import {
  getStoredOrders,
  updateOrderStatus,
  toggleOrderItemCheck,
  clearCompletedOrders,
  resetOrdersToDefault,
  STORAGE_EVENT_NAME,
} from '@/lib/orderStore';
import { topupWallet } from '@/lib/walletStore';
import {
  StaffRequest,
  getStoredStaffRequests,
  resolveStaffRequest,
  STAFF_REQUEST_EVENT,
} from '@/lib/staffRequestStore';

const DRINK_KEYWORDS = [
  'sting',
  'monster',
  'red bull',
  'trà đào',
  'trà sữa',
  'cà phê',
  'soda',
  'nước',
  'pepsi',
  'coca',
];

function isDrinkOrder(ord: Order): boolean {
  if (ord.station === 'BAR') return true;
  return ord.items.some((it) => {
    const str = (typeof it === 'string' ? it : it.name || '').toLowerCase();
    return DRINK_KEYWORDS.some((kw) => str.includes(kw));
  });
}

export default function KitchenDisplaySystem() {
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stationFilter, setStationFilter] = useState<KdsFilterStation>('ALL');
  const [runnerNotification, setRunnerNotification] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);

  useEffect(() => {
    setOrders(getStoredOrders());
    setStaffRequests(getStoredStaffRequests());

    const syncHandler = () => {
      setOrders(getStoredOrders());
      setStaffRequests(getStoredStaffRequests());
    };

    window.addEventListener(STORAGE_EVENT_NAME, syncHandler);
    window.addEventListener(STAFF_REQUEST_EVENT, syncHandler);
    window.addEventListener('storage', syncHandler);

    return () => {
      window.removeEventListener(STORAGE_EVENT_NAME, syncHandler);
      window.removeEventListener(STAFF_REQUEST_EVENT, syncHandler);
      window.removeEventListener('storage', syncHandler);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}:${secs}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const playSoundEffect = (type: 'beep' | 'success' = 'beep') => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const cookingCount = orders.filter((o) => o.status === 'COOKING').length;
  const readyToDeliverCount = orders.filter((o) => o.status === 'READY').length;
  const archivableCount = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'CANCELLED').length;
  const pendingStaffRequests = staffRequests.filter((r) => r.status === 'PENDING' && r.target === 'KITCHEN');

  const handleToggleItemCheck = (orderId: string, itemIdx: number) => {
    const updated = toggleOrderItemCheck(orderId, itemIdx);
    setOrders(updated);
  };

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    const existingOrder = orders.find((o) => o.id === orderId);
    if (!existingOrder) return;

    if (nextStatus === 'CANCELLED') {
      const confirmMsg =
        existingOrder.paymentMethod === 'ACCOUNT_BALANCE'
          ? `Xác nhận HỦY đơn #${existingOrder.orderNumber} (${existingOrder.pcName}) và HOÀN LẠI +${existingOrder.totalAmount.toLocaleString('vi-VN')}đ vào ví cho khách?`
          : `Xác nhận HỦY đơn #${existingOrder.orderNumber} (${existingOrder.pcName})?`;
      if (!confirm(confirmMsg)) return;
    }

    playSoundEffect(nextStatus === 'READY' || nextStatus === 'DELIVERED' ? 'success' : 'beep');
    const updated = updateOrderStatus(orderId, nextStatus);
    setOrders(updated);

    const target = updated.find((o) => o.id === orderId);
    if (!target) return;

    if (nextStatus === 'COOKING') {
      setRunnerNotification(
        `🍳 Đã nhận đơn #${target.orderNumber} (${target.pcName}) — Bếp bắt đầu chế biến!`
      );
      setTimeout(() => setRunnerNotification(null), 3500);
      return;
    }

    if (nextStatus === 'READY') {
      if (typeof window !== 'undefined') {
        const payload = {
          orderNumber: target.orderNumber,
          pcName: target.pcName,
          items: target.items,
          timestamp: Date.now(),
        };
        try {
          localStorage.setItem('cyber_kds_food_ready', JSON.stringify(payload));
          window.dispatchEvent(new CustomEvent('cyber_kds_food_ready', { detail: payload }));
        } catch {}
      }
      setRunnerNotification(
        `🔔 Đã chế biến xong đơn #${target.orderNumber} (${target.pcName})! Đã phát chuông báo Runner mang món ra bàn.`
      );
      setTimeout(() => setRunnerNotification(null), 4500);
      return;
    }

    if (nextStatus === 'DELIVERED') {
      setRunnerNotification(
        `✓ Đã giao tận bàn đơn #${target.orderNumber} (${target.pcName}) — Doanh thu +${target.totalAmount.toLocaleString('vi-VN')}đ đã được ghi nhận vào Bảng Vận Hành!`
      );
      setTimeout(() => setRunnerNotification(null), 4500);
      return;
    }

    if (nextStatus === 'CANCELLED') {
      if (target.paymentMethod === 'ACCOUNT_BALANCE') {
        topupWallet(
          target.totalAmount,
          'HOÀN TIỀN F&B',
          `Hoàn tiền đơn F&B #${target.orderNumber} do bếp hủy đơn`,
          target.pcName
        );
      }
      setRunnerNotification(
        target.paymentMethod === 'ACCOUNT_BALANCE'
          ? `✕ Đã hủy đơn #${target.orderNumber} (${target.pcName}) và hoàn trả +${target.totalAmount.toLocaleString('vi-VN')}đ vào ví khách hàng!`
          : `✕ Đã hủy đơn #${target.orderNumber} (${target.pcName})!`
      );
      setTimeout(() => setRunnerNotification(null), 4500);
    }
  };

  const handleNotifyRunner = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      playSoundEffect('success');
      if (typeof window !== 'undefined') {
        const payload = {
          orderNumber: targetOrder.orderNumber,
          pcName: targetOrder.pcName,
          items: targetOrder.items,
          timestamp: Date.now(),
        };
        try {
          localStorage.setItem('cyber_kds_food_ready', JSON.stringify(payload));
          window.dispatchEvent(new CustomEvent('cyber_kds_food_ready', { detail: payload }));
        } catch {}
      }
      setRunnerNotification(
        `🔔 Đã phát lại chuông điều phối Runner mang món đến máy ${targetOrder.pcName}!`
      );
      setTimeout(() => {
        setRunnerNotification(null);
      }, 4000);
    }
  };

  const handleClearCompleted = () => {
    if (archivableCount === 0) return;
    playSoundEffect('beep');
    const updated = clearCompletedOrders();
    setOrders(updated);
    setRunnerNotification('✓ Đã lưu trữ và dọn sạch các đơn đã giao / đã hủy khỏi màn hình KDS!');
    setTimeout(() => setRunnerNotification(null), 3500);
  };

  const handleResetData = () => {
    if (confirm('Xóa toàn bộ danh sách đơn trên màn hình KDS?')) {
      const reset = resetOrdersToDefault();
      setOrders(reset);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (stationFilter === 'ALL') return true;
    if (stationFilter === 'BAR') return isDrinkOrder(ord);
    return ord.station === 'HOT_KITCHEN' || !isDrinkOrder(ord);
  });

  return (
    <div className="min-h-screen bg-[#070e1d] text-slate-100 p-4 lg:p-6 flex flex-col font-sans select-none">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[#0c1322] border border-cyan-500/20 p-4 rounded-xl mb-6 shadow-xl gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-[#141b2b] border border-cyan-500/40 px-4 py-2 rounded-lg font-mono text-2xl lg:text-3xl font-black text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            {currentTime}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="bg-rose-500/20 border border-rose-500/40 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse"></span>
              CHỜ NHẬN: {pendingCount}
            </span>
            <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              ĐANG NẤU: {cookingCount}
            </span>
            <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping"></span>
              CHỜ BƯNG: {readyToDeliverCount}
            </span>
            <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              ĐÃ GIAO: {archivableCount}
            </span>
            {pendingStaffRequests.length > 0 && (
              <span className="bg-red-600/30 border border-red-500 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-black font-mono flex items-center gap-1.5 animate-pulse">
                <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                NHẮN BẾP: {pendingStaffRequests.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStationFilter('ALL')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition font-mono cursor-pointer ${
              stationFilter === 'ALL'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-[#141b2b] border border-slate-700 text-slate-300 hover:bg-[#1a233a]'
            }`}
          >
            Tất cả trạm ({orders.length})
          </button>
          <button
            onClick={() => setStationFilter('HOT_KITCHEN')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition font-mono cursor-pointer ${
              stationFilter === 'HOT_KITCHEN'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-[#141b2b] border border-slate-700 text-slate-300 hover:bg-[#1a233a]'
            }`}
          >
            🍳 Bếp Nóng ({orders.filter((o) => o.station === 'HOT_KITCHEN' || !isDrinkOrder(o)).length})
          </button>
          <button
            onClick={() => setStationFilter('BAR')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition font-mono cursor-pointer ${
              stationFilter === 'BAR'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-[#141b2b] border border-slate-700 text-slate-300 hover:bg-[#1a233a]'
            }`}
          >
            🍹 Pha Chế Bar ({orders.filter((o) => isDrinkOrder(o)).length})
          </button>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              audioEnabled
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {audioEnabled ? 'notifications_active' : 'notifications_off'}
            </span>
            <span>Âm Báo: {audioEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleClearCompleted}
            disabled={archivableCount === 0}
            className="bg-[#141b2b] hover:bg-emerald-500/20 disabled:opacity-40 text-emerald-400 border border-emerald-500/40 px-3 py-2 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 cursor-pointer"
            title="Chỉ lưu trữ các đơn ĐÃ GIAO TẬN BÀN hoặc ĐÃ HỦY (giữ nguyên các đơn đang chờ bưng)"
          >
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>Lưu Trữ Đơn Đã Giao ({archivableCount})</span>
          </button>

          <button
            onClick={handleResetData}
            className="bg-[#141b2b] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 px-2.5 py-2 rounded-lg text-xs transition cursor-pointer"
            title="Xóa toàn bộ đơn bếp"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
          </button>
        </div>
      </header>

      {pendingStaffRequests.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-rose-950/90 via-[#180d19] to-rose-950/90 border-2 border-rose-500 rounded-xl p-4 shadow-[0_0_25px_rgba(255,42,85,0.4)] animate-pulse">
          <div className="flex items-center justify-between pb-3 border-b border-rose-500/30 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <h2 className="font-mono font-black text-rose-300 text-sm md:text-base uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-400 text-xl">notifications_active</span>
                <span>YÊU CẦU NHẮN BẾP TẬN MÁY CẦN XỬ LÝ ({pendingStaffRequests.length})</span>
              </h2>
            </div>
            <span className="text-[11px] font-mono text-rose-400/80">Ưu tiên hỗ trợ ngay cho khách tại máy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingStaffRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#0e1627] border border-rose-500/40 rounded-lg p-3 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-rose-500 text-white font-mono font-black text-sm px-2 py-0.5 rounded shadow">
                      {req.pcName}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {new Date(req.createdAt).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-amber-400">priority_high</span>
                    <span>{req.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-white/5 font-mono">
                    {req.details}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSoundEffect('success');
                    const updated = resolveStaffRequest(req.id);
                    setStaffRequests(updated);
                  }}
                  className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-extrabold text-xs py-2 rounded transition flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">done</span>
                  <span>ĐÃ XỬ LÝ XONG</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {runnerNotification && (
        <div className="bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 px-4 py-3 rounded-xl mb-4 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce">
          <span className="material-symbols-outlined text-2xl text-emerald-400">check_circle</span>
          <div className="font-bold text-sm">{runnerNotification}</div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 bg-[#0c1322] rounded-xl border border-slate-800">
          <span className="material-symbols-outlined text-5xl mb-2 text-slate-600">restaurant</span>
          <p className="text-base font-bold text-slate-300">Không có đơn hàng nào ở trạm này</p>
          <p className="text-xs text-slate-500 mt-1">Đơn hàng mới từ khách sẽ xuất hiện tự động tại đây</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">
          {filteredOrders.map((ord) => (
            <KdsOrderCard
              key={ord.id}
              order={ord}
              onUpdateStatus={handleUpdateStatus}
              onToggleItemCheck={handleToggleItemCheck}
              onNotifyRunner={handleNotifyRunner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
