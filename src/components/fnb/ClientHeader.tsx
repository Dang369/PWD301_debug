'use client';

import React, { useState, useEffect } from 'react';
import { createStaffRequest } from '@/lib/staffRequestStore';

interface ClientHeaderProps {
  pcName?: string;
  zoneName?: string;
  balance?: number;
  remainingTime?: string;
  userName?: string;
  userTier?: string;
  onCallStaff?: () => void;
  onTopup?: () => void;
  currentOrderTicker?: {
    orderCode: string;
    description: string;
    eta: string;
    progressPercent: number;
  } | null;
}

export default function ClientHeader({
  pcName = 'VIP-08',
  zoneName = 'Tầng 2',
  balance = 250000,
  remainingTime = '03:45:12',
  userName = 'Tài khoản Hội viên',
  userTier = 'Hội viên Cyber',
  onCallStaff,
  onTopup,
  currentOrderTicker = null,
}: ClientHeaderProps) {
  const [showCallModal, setShowCallModal] = useState(false);
  const [callAlertActive, setCallAlertActive] = useState(false);
  const [requestType, setRequestType] = useState<'TOPUP_CASH' | 'HARDWARE_ISSUE' | 'CLEAN_DESK' | 'EXTRA_SERVICE' | 'OTHER'>('TOPUP_CASH');
  const [requestNote, setRequestNote] = useState('');
  const [destination, setDestination] = useState<'SERVER' | 'KITCHEN'>('SERVER');
  const [displayTime, setDisplayTime] = useState(remainingTime);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('CYBER_ACTIVE_PLAYING_GAME');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.gameName) {
            setActiveGame(parsed.gameName);
          }
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    const parts = remainingTime.split(':').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      setDisplayTime(remainingTime);
      return;
    }
    let totalSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];

    const interval = setInterval(() => {
      totalSecs = Math.max(0, totalSecs - 1);
      const h = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
      const s = String(totalSecs % 60).padStart(2, '0');
      setDisplayTime(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  const handleSubmitStaffRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const typeTitles: Record<string, string> = {
      TOPUP_CASH: 'Nạp tiền mặt tại máy',
      HARDWARE_ISSUE: 'Báo lỗi chuột/phím/tai nghe',
      CLEAN_DESK: 'Dọn dẹp bàn & gạt tàn',
      EXTRA_SERVICE: 'Thêm đá lạnh & nước lọc',
      OTHER: 'Yêu cầu hỗ trợ khác',
    };

    const finalTarget: 'SERVER' | 'KITCHEN' = destination || (requestType === 'EXTRA_SERVICE' ? 'KITCHEN' : 'SERVER');
    createStaffRequest({
      pcName,
      type: requestType,
      target: finalTarget,
      title: typeTitles[requestType] || 'Yêu cầu phục vụ',
      details: requestNote.trim() || `Khách tại máy ${pcName} gọi nhân viên hỗ trợ: ${typeTitles[requestType]}`,
    });

    setShowCallModal(false);
    setRequestNote('');
    setCallAlertActive(true);
    if (onCallStaff) onCallStaff();

    setTimeout(() => {
      setCallAlertActive(false);
    }, 5000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#060b14]/95 backdrop-blur-md border-b border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <div className="w-full px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-[#26354f]">
              <div className="w-9 h-9 rounded bg-primary/10 border border-primary/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                <span className="material-symbols-outlined text-primary text-[24px]">sports_esports</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-gaming text-[14px] font-black tracking-widest text-primary">CYBERNET</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-primary/20 text-primary border border-primary/30 rounded uppercase tracking-wider">
                    F&amp;B CLIENT
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                  <span>G-Cafe Pro v4.8</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#0c1626] border border-primary/40 px-3 py-1.5 rounded shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]">
              <span className="material-symbols-outlined text-primary text-[18px]">desktop_windows</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">VỊ TRÍ MÁY</span>
                <span className="font-gaming text-[14px] text-primary font-black tracking-wide">
                  {pcName} <span className="text-[11px] font-normal text-slate-400">/ {zoneName}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-[#0a1220] border border-secondary/30 px-3 py-1.5 rounded">
              <div className="w-7 h-7 rounded bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Số dư tài khoản</span>
                <span className="font-gaming text-[15px] font-extrabold text-secondary tracking-wide">
                  {balance.toLocaleString('vi-VN')}<span className="text-[11px]">đ</span>
                </span>
              </div>
              <button
                onClick={onTopup || (() => alert('Tính năng nạp tiền nhanh: Vui lòng quét mã QR tại máy hoặc nạp tại quầy thu ngân!'))}
                className="ml-1 text-[11px] font-bold px-2 py-1 bg-secondary/20 hover:bg-secondary text-secondary hover:text-black rounded transition-colors flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[13px]">add</span> NẠP
              </button>
            </div>

            <div className="flex items-center gap-2.5 bg-[#0a1220] border border-[#26354f] px-3 py-1.5 rounded">
              <div className="w-7 h-7 rounded bg-[#24324a] flex items-center justify-center text-cyber-yellow">
                <span className="material-symbols-outlined text-[18px]">timelapse</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Thời gian chơi</span>
                <span className="font-gaming text-[14px] font-bold text-cyber-yellow tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {displayTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/client-pc"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/40 text-xs font-bold font-gaming tracking-wide transition cursor-pointer shrink-0"
              title="Quay lại màn hình điều khiển máy trạm"
            >
              <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
              <span className="hidden lg:inline">MÁY TRẠM</span>
            </a>

            <a
              href="/games"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 text-xs font-bold font-gaming tracking-wide transition cursor-pointer shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              title="Quay lại giao diện kho trò chơi"
            >
              <span className="material-symbols-outlined text-[16px]">sports_esports</span>
              <span className="hidden sm:inline">{activeGame ? `VỀ GAME (${activeGame}) \u2192` : 'VỀ KHO GAME \u2192'}</span>
            </a>

            <button
              onClick={() => setShowCallModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded border transition-all font-headline-sm font-bold text-[13px] uppercase tracking-wider active:scale-95 ${
                callAlertActive
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-cyber-red/90 hover:bg-cyber-red text-white border-cyber-red shadow-[0_0_15px_rgba(255,42,85,0.45)] hover:shadow-[0_0_22px_rgba(255,42,85,0.7)]'
              }`}
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] ${callAlertActive ? '' : 'animate-bounce'}`}>
                {callAlertActive ? 'check_circle' : 'notifications_active'}
              </span>
              <span>{callAlertActive ? 'ĐÃ GỌI XONG' : 'GỌI NHÂN VIÊN'}</span>
            </button>

            <div className="flex items-center gap-2 bg-[#0c1626] border border-[#26354f] pl-2 pr-3 py-1 rounded">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0a1220] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                </div>
              </div>
              <div className="hidden xl:flex flex-col leading-none text-left">
                <span className="text-[12px] font-bold text-slate-100">{userName}</span>
                <span className="text-[9px] text-secondary font-semibold uppercase">{userTier}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {currentOrderTicker && (
        <div className="bg-[#0b1320] border-b border-[#26354f] px-4 py-1.5 flex items-center justify-between text-[12px] gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="font-bold text-secondary uppercase tracking-wider text-[11px] flex-shrink-0">
              ĐANG CHẾ BIẾN:
            </span>
            <span className="text-slate-200 truncate">
              Mã đơn <strong className="text-primary font-mono">{currentOrderTicker.orderCode}</strong> • {currentOrderTicker.description}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-slate-400 text-[11px]">
              Dự kiến giao: <span className="font-gaming font-bold text-primary">{currentOrderTicker.eta}</span>
            </span>
            <span className="w-16 bg-[#121b2b] h-1.5 rounded-full overflow-hidden inline-block border border-slate-700">
              <span
                className="bg-primary h-full block rounded-full transition-all duration-500"
                style={{ width: `${currentOrderTicker.progressPercent}%` }}
              ></span>
            </span>
          </div>
        </div>
      )}

      {callAlertActive && (
        <div className="fixed top-14 right-6 z-50 bg-[#0f1d33] border-2 border-emerald-400 text-emerald-300 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-2xl text-emerald-400">support_agent</span>
          <div>
            <div className="font-bold text-sm">ĐÃ GỌI NHÂN VIÊN TẠI MÁY {pcName}</div>
            <div className="text-xs text-slate-300">Yêu cầu đã được chuyển tới bếp &amp; quầy thu ngân. Nhân viên sẽ đến ngay!</div>
          </div>
        </div>
      )}

      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1320] border-2 border-rose-500/70 rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(255,42,85,0.3)] animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 text-2xl">notifications_active</span>
                <h3 className="font-gaming text-lg font-black text-white">GỌI NHÂN VIÊN TẠI MÁY {pcName}</h3>
              </div>
              <button
                onClick={() => setShowCallModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitStaffRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Nơi Tiếp Nhận Yêu Cầu
                </label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setDestination('SERVER')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${destination === 'SERVER' ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-400' : 'bg-[#121c2e] border-slate-700/60 text-slate-400 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">dns</span>
                    <span>🖥️ Máy Chủ (Lễ Tân)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestination('KITCHEN')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${destination === 'KITCHEN' ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400' : 'bg-[#121c2e] border-slate-700/60 text-slate-400 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
                    <span>🍳 Bếp F&B / Bar</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Chọn Loại Yêu Cầu Nhanh
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'TOPUP_CASH', label: '💵 Nạp tiền mặt tại máy', icon: 'payments' },
                    { id: 'HARDWARE_ISSUE', label: '🎧 Báo lỗi Chuột / Phím / Tai nghe', icon: 'headset_mic' },
                    { id: 'CLEAN_DESK', label: '🧹 Dọn dẹp bàn / Gạt tàn thuốc', icon: 'cleaning_services' },
                    { id: 'EXTRA_SERVICE', label: '🧊 Thêm đá lạnh / Nước lọc', icon: 'local_drink' },
                    { id: 'OTHER', label: '💬 Yêu cầu hỗ trợ khác', icon: 'help' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setRequestType(item.id as any);
                        if (item.id === 'EXTRA_SERVICE') setDestination('KITCHEN');
                        else setDestination('SERVER');
                      }}
                      className={`text-left px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                        requestType === item.id
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-[#121c2e] border-slate-700/60 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-rose-400">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {requestType === item.id && (
                        <span className="material-symbols-outlined text-rose-400 text-[18px]">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Ghi chú chi tiết (nếu có)
                </label>
                <input
                  type="text"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Ví dụ: Nạp 50k tiền mặt, đổi tai nghe bên trái bị rè..."
                  className="w-full bg-[#121c2e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase transition"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold uppercase shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>GỬI YÊU CẦU NGAY</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}