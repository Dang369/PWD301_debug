'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ALL_SEATS_CONFIG,
  getStoredBookings,
  saveBooking,
  cancelBooking,
  SeatBooking,
  BOOKING_STORAGE_EVENT,
} from '@/lib/bookingStore';
import { getLoggedInUser, AuthUser, AUTH_EVENT_NAME } from '@/lib/authStore';
import AuthModal from '@/components/auth/AuthModal';

const FLOOR1_SEATS_CONFIG = ALL_SEATS_CONFIG.filter((s) => s.floor === 1);
const FLOOR2_SEATS_CONFIG = ALL_SEATS_CONFIG.filter((s) => s.floor === 2);

export default function BookingSeatMap() {
  const [selectedSeat, setSelectedSeat] = useState<string>('VIP-08');
  const [activeFloor, setActiveFloor] = useState<'floor1' | 'floor2'>('floor2');
  const [bookings, setBookings] = useState<SeatBooking[]>([]);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState<string | undefined>(undefined);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTime, setFormTime] = useState('18:00 - 22:00 (Giờ cao điểm)');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setBookings(getStoredBookings());
    };
    update();

    const user = getLoggedInUser();
    setCurrentUser(user);
    if (user) {
      setFormName(user.fullName);
      setFormPhone(user.phone);
    }

    const handleAuthChange = () => {
      const u = getLoggedInUser();
      setCurrentUser(u);
      if (u) {
        setFormName(u.fullName);
        setFormPhone(u.phone);
      }
    };

    window.addEventListener(BOOKING_STORAGE_EVENT, update);
    window.addEventListener(AUTH_EVENT_NAME, handleAuthChange);
    window.addEventListener('storage', update);

    return () => {
      window.removeEventListener(BOOKING_STORAGE_EVENT, update);
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthChange);
      window.removeEventListener('storage', update);
    };
  }, []);

  const baseSeats = activeFloor === 'floor2' ? FLOOR2_SEATS_CONFIG : FLOOR1_SEATS_CONFIG;

  const computedSeats = baseSeats.map((seat) => {
    const booking = bookings.find((b) => b.seatId === seat.id && b.status === 'RESERVED');
    if (booking) {
      return {
        ...seat,
        status: 'RESERVED' as const,
        booking,
        user: booking.customerName,
      };
    }
    return {
      ...seat,
      status: seat.defaultStatus,
      booking: undefined,
      user: seat.defaultStatus === 'CURRENT' ? 'Bạn đang ngồi tại đây' : undefined,
    };
  });

  const currentSeatObj = computedSeats.find((s) => s.id === selectedSeat) || computedSeats[0];
  const activeBooking = currentSeatObj.booking;

  const handleOpenBooking = () => {
    const user = getLoggedInUser();
    if (!user) {
      setAuthModalMessage(`Bạn cần đăng nhập tài khoản Cyber Zone để đặt giữ chỗ máy ${currentSeatObj.id}!`);
      setShowAuthModal(true);
      return;
    }
    setFormName(user.fullName);
    setFormPhone(user.phone);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const user = getLoggedInUser();
    if (!user) {
      setShowBookingModal(false);
      setAuthModalMessage(`Bạn cần đăng nhập tài khoản Cyber Zone để đặt giữ chỗ máy ${currentSeatObj.id}!`);
      setShowAuthModal(true);
      return;
    }

    if (!formName.trim()) return;

    const newBooking = saveBooking({
      seatId: currentSeatObj.id,
      customerName: formName.trim(),
      phone: formPhone.trim() || user.phone || '0988.888.888',
      timeSlot: formTime,
      date: new Date().toISOString().split('T')[0],
      zone: currentSeatObj.zoneName,
      branch: 'Zone 01: 182 Lê Duẩn, TP. Vinh (Flagship Complex)',
      status: 'RESERVED',
      notes: 'Đặt trực tiếp trên sơ đồ máy Cyber Zone',
    });

    setShowBookingModal(false);
    setSuccessToast(`Đã giữ chỗ máy ${newBooking.seatId} cho game thủ ${newBooking.customerName} (${newBooking.bookingCode})!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleCancelBooking = (seatId: string) => {
    if (confirm(`Bạn có chắc muốn hủy đặt chỗ cho máy ${seatId}?`)) {
      cancelBooking(seatId);
      setSuccessToast(`Đã hủy giữ chỗ máy ${seatId}. Chỗ đã trở lại trạng thái sẵn sàng!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 lg:p-6 font-sans">

      {successToast && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-400 text-emerald-300 font-bold text-xs flex items-center justify-between shadow-2xl animate-bounce">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[#070d1e]/90 border border-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl mb-6 shadow-2xl gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 text-black font-black text-sm flex items-center justify-center shadow-md">
              CZ
            </div>
            <span className="font-gaming font-black text-xl sm:text-2xl text-white tracking-wider">
              SƠ ĐỒ MÁY TRẠM &amp; ĐẶT CHỖ REALTIME
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              ĐỒNG BỘ 24/7 VỚI CỔNG BẠN THÁI
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Hạ tầng liên thông: Khi khách đặt giữ chỗ trên trang của bạn Thái, sơ đồ máy tại đây lập tức cập nhật trạng thái <strong className="text-amber-400">ĐÃ ĐẶT TRƯỚC</strong> kèm tên khách hàng theo thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/90 border border-white/10 p-1 rounded-xl flex text-xs font-mono">
            <button
              onClick={() => setActiveFloor('floor1')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeFloor === 'floor1'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tầng 1 (Arena &amp; Billiards)
            </button>
            <button
              onClick={() => setActiveFloor('floor2')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeFloor === 'floor2'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tầng 2 (Ultra VIP &amp; Stream)
            </button>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Trạng thái máy: <strong className="text-emerald-400">Trực tiếp</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-8 bg-[#070d1e]/80 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-center pb-4 border-b border-white/10 mb-5 gap-3">
              <div className="flex items-center gap-3">
                <span className="font-gaming font-black text-base text-white tracking-wide">
                  {activeFloor === 'floor2'
                    ? 'PHÂN KHU TẦNG 2: ULTRA VIP • STREAM SUITE • CONSOLE'
                    : 'PHÂN KHU TẦNG 1: ARENA 540Hz • BILLIARDS CLUB • STANDARD'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Máy Trống
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block animate-pulse"></span> Đã Đặt Trước
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block"></span> Máy Của Bạn
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block"></span> Đang Chơi
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {computedSeats.map((seat) => {
                const isSelected = selectedSeat === seat.id;
                const isCurrent = seat.status === 'CURRENT';
                const isReserved = seat.status === 'RESERVED';
                const isAvailable = seat.status === 'AVAILABLE';
                const isOccupied = seat.status === 'OCCUPIED';

                return (
                  <div
                    key={seat.id}
                    onClick={() => setSelectedSeat(seat.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between select-none relative overflow-hidden ${
                      isReserved
                        ? 'bg-amber-950/40 border-amber-500/80 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
                        : isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] ring-1 ring-cyan-300'
                        : isSelected
                        ? 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : isAvailable
                        ? 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-800'
                        : isOccupied
                        ? 'bg-[#0a0f1d] border-white/5 opacity-60'
                        : 'bg-[#150d12] border-rose-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-gaming font-black text-base text-white">{seat.id}</span>

                      {isReserved ? (
                        <span className="bg-amber-500 text-black text-[9px] font-mono px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-1 shadow-sm animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-black"></span> ĐÃ ĐẶT
                        </span>
                      ) : isCurrent ? (
                        <span className="bg-cyan-400 text-black text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-black">
                          MÁY BẠN
                        </span>
                      ) : isAvailable ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                          TRỐNG
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                          {seat.status}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">{seat.price}</div>

                    {isReserved && seat.booking && (
                      <div className="mt-2 pt-1.5 border-t border-amber-500/30 font-mono">
                        <div className="text-[10px] text-amber-300 font-bold truncate flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-amber-400">person</span>
                          <span>{seat.booking.customerName}</span>
                        </div>
                        <div className="text-[9px] text-amber-400/80 truncate">
                          🕒 {seat.booking.timeSlot.split(' ')[0]} • {seat.booking.bookingCode}
                        </div>
                      </div>
                    )}

                    {isCurrent && (
                      <div className="text-[10px] text-cyan-300 truncate mt-1.5 font-mono">
                        ● Đang trực tuyến
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center text-xs text-slate-400 font-mono">
            <span>Server: <strong className="text-emerald-400 font-bold">10Gbps Multi-ISP Trunk (Ping ≤ 1ms)</strong></span>
            <span>Khử mùi ion &amp; Điều hòa âm trần 21°C</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#070d1e]/90 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-white/10 mb-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">CHI TIẾT VỊ TRÍ CHỌN</span>
                <h3 className="font-gaming font-black text-3xl text-emerald-400 mt-0.5">{currentSeatObj.id}</h3>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold border ${
                currentSeatObj.status === 'RESERVED'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                  : currentSeatObj.status === 'CURRENT'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
              }`}>
                {currentSeatObj.zoneName}
              </span>
            </div>

            {activeBooking ? (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/70 mb-5 space-y-3 font-mono shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
                  <span className="material-symbols-outlined text-[18px] text-amber-400">event_seat</span>
                  <span>MÁY ĐÃ ĐƯỢC GIỮ CHỖ TRƯỚC!</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-amber-500/20 pb-1">
                    <span className="text-slate-400">Khách hàng:</span>
                    <strong className="text-white">{activeBooking.customerName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-amber-500/20 pb-1">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <strong className="text-amber-300">{activeBooking.phone}</strong>
                  </div>
                  <div className="flex justify-between border-b border-amber-500/20 pb-1">
                    <span className="text-slate-400">Khung giờ:</span>
                    <span className="text-white font-bold">{activeBooking.timeSlot}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-500/20 pb-1">
                    <span className="text-slate-400">Mã đặt chỗ:</span>
                    <span className="text-emerald-400 font-bold font-mono">{activeBooking.bookingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chi nhánh:</span>
                    <span className="text-slate-300 text-[10px] text-right truncate max-w-[160px]">{activeBooking.branch}</span>
                  </div>
                </div>
                <p className="text-[10px] text-amber-400/80 italic">
                </p>
              </div>
            ) : null}

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">memory</span>CPU
                </span>
                <span className="font-bold text-white text-right truncate max-w-[200px]">{currentSeatObj.cpu}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">view_in_ar</span>VGA
                </span>
                <span className="font-bold text-emerald-400 text-right truncate max-w-[200px]">{currentSeatObj.gpu}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">desktop_windows</span>Màn hình
                </span>
                <span className="font-bold text-cyan-300 text-right truncate max-w-[200px]">{currentSeatObj.screen}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-purple-400">keyboard</span>Gaming Gear
                </span>
                <span className="font-bold text-slate-200 text-right truncate max-w-[200px]">{currentSeatObj.gear}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">chair</span>Ghế ngồi
                </span>
                <span className="font-bold text-slate-200 text-right truncate max-w-[200px]">{currentSeatObj.chair}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5 font-mono">
            {activeBooking ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Bạn đang giữ chỗ máy {currentSeatObj.id}</span>
                </div>
                <button
                  onClick={() => handleCancelBooking(currentSeatObj.id)}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-bold py-2.5 rounded-xl text-xs uppercase transition cursor-pointer"
                >
                  HỦY GIỮ CHỖ MÁY NÀY
                </button>
              </div>
            ) : currentSeatObj.status === 'AVAILABLE' ? (
              <div>
                <button
                  onClick={handleOpenBooking}
                  className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:brightness-110 text-black font-extrabold py-3.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                  <span>ĐẶT GIỮ CHỖ MÁY {currentSeatObj.id} NGAY</span>
                </button>
              </div>
            ) : currentSeatObj.status === 'MAINTENANCE' ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">build</span>
                <span>Máy {currentSeatObj.id} đang bảo trì kỹ thuật định kỳ</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">person</span>
                <span>Máy {currentSeatObj.id} đang có khách sử dụng</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative font-sans">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  CZ
                </div>
                <h3 className="font-gaming font-black text-xl text-white">ĐẶT GIỮ MÁY {currentSeatObj.id}</h3>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">HỌ TÊN BẠN / NICKNAME (*)</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A / ProGamer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">SỐ ĐIỆN THOẠI (*)</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">KHUNG GIỜ NHẬN MÁY</label>
                <select
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                >
                  <option>Ngay bây giờ (Tức thì)</option>
                  <option>13:00 - 17:00</option>
                  <option>18:00 - 22:00 (Giờ cao điểm)</option>
                  <option>22:00 - 06:00 (Combo cày đêm)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Vị trí:</span>
                  <strong className="text-emerald-400">{currentSeatObj.id} ({currentSeatObj.zoneName})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Giá giờ chơi:</span>
                  <strong className="text-white">{currentSeatObj.price}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian giữ chỗ:</span>
                  <strong className="text-cyan-300">30 phút kể từ mốc giờ</strong>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg transition"
                >
                  XÁC NHẬN GIỮ CHỖ NGAY
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        defaultTab="login"
        message={authModalMessage}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setFormName(user.fullName);
          setFormPhone(user.phone);
          setShowBookingModal(true);
        }}
      />
    </div>
  );
}