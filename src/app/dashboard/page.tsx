'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getStoredOrders,
  calculateLiveDashboardStats,
  STORAGE_EVENT_NAME,
} from '@/lib/orderStore';
import {
  calculateTotalTopupRevenue,
  WALLET_EVENT_NAME,
  WalletTransaction,
} from '@/lib/walletStore';
import {
  getStoredStaffRequests,
  resolveStaffRequest,
  STAFF_REQUEST_EVENT,
  StaffRequest,
} from '@/lib/staffRequestStore';
import { Order } from '@/types/fnb';

export default function DashboardFnb() {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  const [orders, setOrders] = useState<Order[]>([]);
  const [fnbStats, setFnbStats] = useState(() => calculateLiveDashboardStats([], 'today'));
  const [topupStats, setTopupStats] = useState<{ totalTopup: number; recentTopups: WalletTransaction[] }>({
    totalTopup: 0,
    recentTopups: [],
  });
  const [lastNotice, setLastNotice] = useState<string | null>(null);
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);

  useEffect(() => {
    const updateDashboard = () => {
      const storedOrders = getStoredOrders();
      setOrders(storedOrders);
      setFnbStats(calculateLiveDashboardStats(storedOrders, dateFilter));
      setTopupStats(calculateTotalTopupRevenue(dateFilter));
      setStaffRequests(getStoredStaffRequests());
    };

    updateDashboard();

    const handleSync = () => {
      updateDashboard();
    };

    window.addEventListener(STORAGE_EVENT_NAME, handleSync);
    window.addEventListener(WALLET_EVENT_NAME, handleSync);
    window.addEventListener(STAFF_REQUEST_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(STORAGE_EVENT_NAME, handleSync);
      window.removeEventListener(WALLET_EVENT_NAME, handleSync);
      window.removeEventListener(STAFF_REQUEST_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [dateFilter]);

  useEffect(() => {
    const readyOrDelivered = orders.filter((o) => o.status === 'READY' || o.status === 'DELIVERED');
    if (readyOrDelivered.length > 0) {
      const latest = readyOrDelivered[0];
      setLastNotice(
        `Bếp vừa hoàn tất đơn #${latest.orderNumber} (${latest.pcName}) - Doanh thu F&B +${latest.totalAmount.toLocaleString('vi-VN')}đ!`
      );
    }
  }, [orders]);

  const handleResolveCall = (id: string) => {
    const updated = resolveStaffRequest(id);
    setStaffRequests(updated);
  };

  const totalCombinedRevenue = fnbStats.totalRevenue + topupStats.totalTopup;

  return (
    <div className="min-h-screen bg-[#070e1d] text-slate-100 p-4 lg:p-6 font-sans select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0c1322] border border-amber-500/30 p-4 rounded-xl mb-6 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-gaming font-black text-xl text-amber-400 tracking-wider">
              BẢNG VẬN HÀNH &amp; DOANH THU TOÀN QUÁN (OPS PORTAL)
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              REALTIME TỰ ĐỘNG KHỚP 2 CỔNG
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dữ liệu đồng bộ trực tiếp: Khách đặt món ở Cổng Người Chơi ➔ Màn hình bếp nhảy đơn; Khách nạp tiền ví ➔ Doanh thu tự động cập nhật vào Bảng Vận Hành.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#141b2b] border border-slate-700 p-1 rounded-lg flex text-xs font-mono">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-md font-bold transition ${
                dateFilter === 'today' ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hôm Nay
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-3 py-1.5 rounded-md font-bold transition ${
                dateFilter === 'week' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Ngày
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1.5 rounded-md font-bold transition ${
                dateFilter === 'month' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tháng Này
            </button>
          </div>

          <Link
            href="/kds"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(255,183,3,0.3)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
            <span>Mở Màn Hình Bếp (KDS) &rarr;</span>
          </Link>
        </div>
      </div>

      {lastNotice && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl mb-6 flex items-center justify-between text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <span className="font-semibold">{lastNotice}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-900/60 px-2 py-0.5 rounded">
            + Doanh Thu Tự Động Khớp
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0c1322] border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-400 font-semibold">Doanh Thu F&amp;B Bếp</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/20 text-cyan-400">
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black text-cyan-400 font-gaming tracking-wide">
              {fnbStats.formattedRevenue}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-400 font-mono">
                +{fnbStats.formattedLiveCompleted}
              </span>
              <span className="text-[11px] text-slate-400 truncate">từ các đơn bếp đã nấu xong</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0c1322] border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-400 font-semibold">Doanh Thu Nạp Ví Giờ Chơi</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black text-emerald-400 font-gaming tracking-wide">
              {topupStats.totalTopup.toLocaleString('vi-VN')}đ
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-400 font-mono">Realtime</span>
              <span className="text-[11px] text-slate-400 truncate">từ các lượt khách nạp tài khoản</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0c1322] border border-amber-500/40 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Tổng Doanh Thu Hợp Nhất</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/20 text-amber-400">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black text-amber-400 font-gaming tracking-wide">
              {totalCombinedRevenue.toLocaleString('vi-VN')}đ
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-amber-400 font-mono">F&amp;B + Giờ Chơi</span>
              <span className="text-[11px] text-slate-400 truncate">tổng hợp tự động từ 2 cổng</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0c1322] border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between shadow-lg transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-400 font-semibold">Tình Trạng Đơn Bếp (KDS)</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20 text-purple-400">
              <span className="material-symbols-outlined text-[18px]">soup_kitchen</span>
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-black text-white font-gaming tracking-wide">
              {fnbStats.totalOrdersCount} đơn
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-amber-400 font-mono">
                Đang nấu: {fnbStats.cookingCount}
              </span>
              <span className="text-[11px] text-slate-400">
                • Chờ: {fnbStats.pendingCount} • Xong: {fnbStats.completedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0c1322] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-xl">star</span>
                <h3 className="font-bold text-base text-white">Top Món Ăn Bán Chạy Nhất (Khớp dữ liệu đơn)</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Tự động cập nhật</span>
            </div>

            <div className="space-y-3">
              {fnbStats.bestSellers.length === 0 ? (
                <div className="text-xs text-slate-400 bg-[#141b2b] border border-slate-800 rounded-lg p-4 text-center leading-relaxed">
                  Chưa phát sinh đơn F&amp;B hoàn tất trong hôm nay. Khách đặt món tại{' '}
                  <Link href="/menu" className="text-cyan-400 underline font-bold">/menu</Link> và Bếp xác nhận xong tại{' '}
                  <Link href="/kds" className="text-amber-400 underline font-bold">/kds</Link> sẽ tự động xếp hạng tại đây (hoặc chọn tab <strong>7 Ngày / Tháng Này</strong>).
                </div>
              ) : (
                fnbStats.bestSellers.map((item) => (
                  <div
                    key={item.rank}
                    className="bg-[#141b2b] p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono font-black text-xs ${
                          item.rank === 1
                            ? 'bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : item.rank === 2
                            ? 'bg-slate-300 text-black'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{item.rank}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-slate-200">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Đã phục vụ: <strong className="text-cyan-400">{item.count} suất</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-emerald-400">{item.revenue}</span>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: item.rate }}></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-base">task_alt</span>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Đơn Hàng Vừa Hoàn Tất Từ Bếp ({fnbStats.recentCompletedOrders.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Khớp 100% với KDS Bếp</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {fnbStats.recentCompletedOrders.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-3">
                  Chưa có đơn mới hoàn thành. Vào <Link href="/kds" className="text-cyan-400 underline font-bold">Màn hình Bếp</Link> để bấm hoàn thành đơn!
                </div>
              ) : (
                fnbStats.recentCompletedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2.5 rounded-lg bg-[#141b2b] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">#{ord.orderNumber}</span>
                      <span className="bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                        {ord.pcName}
                      </span>
                      <span className="text-slate-400 truncate max-w-[200px]">
                        {ord.items.map((i) => (typeof i === 'string' ? i : i.name)).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">
                        +{ord.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                        ĐÃ XONG
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-xl">account_balance_wallet</span>
                <h3 className="font-bold text-base text-white">Lịch Sử Nạp Tiền Ví Của Khách</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                TỪ CỔNG NGƯỜI CHƠI
              </span>
            </div>

            <div className="space-y-2.5">
              {topupStats.recentTopups.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-lg bg-[#141b2b] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{tx.pcName}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono uppercase">
                        {tx.method || 'ONLINE'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{tx.description}</div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      +{tx.amount.toLocaleString('vi-VN')}đ
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono">{tx.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0c1322] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 text-xl animate-pulse">
                  notifications_active
                </span>
                <h3 className="font-bold text-base text-white">Yêu Cầu Gọi Nhân Viên Tại Máy</h3>
              </div>
              <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded font-mono font-bold">
                REALTIME
              </span>
            </div>

            <div className="space-y-3">
              {staffRequests.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">
                  Không có yêu cầu gọi nhân viên nào.
                </div>
              ) : (
                staffRequests.map((call) => {
                  const isPending = call.status === 'PENDING';

                  return (
                    <div
                      key={call.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isPending
                          ? 'bg-[#1a1525] border-rose-500/60 shadow-[0_0_12px_rgba(255,42,85,0.2)]'
                          : 'bg-[#141b2b] border-slate-800 opacity-70'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-cyan-400 text-sm">{call.pcName}</span>
                          <span className="text-[11px] text-amber-300 font-bold">{call.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(call.createdAt).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-2 leading-relaxed">{call.details}</p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            isPending ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {isPending ? 'Chờ phục vụ' : 'Đã xử lý xong'}
                        </span>

                        {isPending && (
                          <button
                            onClick={() => handleResolveCall(call.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-3 py-1 rounded transition font-mono cursor-pointer"
                          >
                            Xác Nhận Đã Xử Lý
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/menu"
                className="w-full bg-[#141b2b] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
                <span>Mở Menu Đặt Món (/menu)</span>
              </Link>
              <Link
                href="/server"
                className="w-full bg-[#141b2b] hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">dns</span>
                <span>Sơ Đồ Máy Trạm (/server)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}