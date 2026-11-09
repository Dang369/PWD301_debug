'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredOrders, STORAGE_EVENT_NAME } from '@/lib/orderStore';
import { getStoredWallet, WALLET_EVENT_NAME, UserWallet, INITIAL_WALLET, getActiveClientStation, ACTIVE_STATION_EVENT } from '@/lib/walletStore';
import { getLoggedInUser, logoutUser, AUTH_EVENT_NAME, AuthUser } from '@/lib/authStore';
import { getTierByName } from '@/lib/gamerPass';
import AuthModal from '@/components/auth/AuthModal';

export default function GlobalNavBar() {
  const pathname = usePathname();
  const isDedicatedSystem =
    pathname?.startsWith('/client-pc') ||
    pathname?.startsWith('/server') ||
    pathname?.startsWith('/kds') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/menu') ||
    pathname?.startsWith('/games');

  const [isMounted, setIsMounted] = useState(false);
  const [stationLabel, setStationLabel] = useState('ARENA-A1');

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [wallet, setWallet] = useState<UserWallet>(INITIAL_WALLET);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [isSystemDrawerOpen, setIsSystemDrawerOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeStationLabel = isMounted ? stationLabel : 'ARENA-A1';

  const ecosystemModes = [
    { href: '/', label: '1. Cổng Khách Hàng (Trang Chủ)', icon: 'public' },
    { href: '/client-pc', label: `2. Khách Ngồi Tại Máy (${activeStationLabel})`, icon: 'desktop_windows' },
    { href: '/server', label: '3. Máy Chủ Phòng Máy (Server Tổng)', icon: 'dns' },
    { href: '/kds', label: '4. Màn Hình Bếp (KDS)', icon: 'soup_kitchen', countBadge: true },
    { href: '/dashboard', label: '5. Quản Lý Doanh Thu', icon: 'monitoring', liveBadge: true },
  ];

  useEffect(() => {
    setIsMounted(true);
    const updateAll = () => {
      try {
        const orders = getStoredOrders();
        const pending = orders.filter((o) => o.status === 'PENDING' || o.status === 'COOKING').length;
        setPendingOrdersCount(pending);
        const w = getStoredWallet();
        setWallet(w);
        setCurrentUser(getLoggedInUser());
        const stn = getActiveClientStation();
        setStationLabel(stn?.stationId || w.pcName || 'ARENA-A1');
      } catch {
      }
    };

    updateAll();
    window.addEventListener(STORAGE_EVENT_NAME, updateAll);
    window.addEventListener(WALLET_EVENT_NAME, updateAll);
    window.addEventListener(AUTH_EVENT_NAME, updateAll);
    window.addEventListener(ACTIVE_STATION_EVENT, updateAll);
    window.addEventListener('storage', updateAll);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener(STORAGE_EVENT_NAME, updateAll);
      window.removeEventListener(WALLET_EVENT_NAME, updateAll);
      window.removeEventListener(AUTH_EVENT_NAME, updateAll);
      window.removeEventListener(ACTIVE_STATION_EVENT, updateAll);
      window.removeEventListener('storage', updateAll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalTab(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
      logoutUser();
      setCurrentUser(null);
    }
  };

      return (
    <>
      
      {isDedicatedSystem && !isSystemDrawerOpen && !isPinned && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsSystemDrawerOpen(true)}
            onMouseEnter={() => setIsSystemDrawerOpen(true)}
            className="group flex items-center gap-2 px-4 py-1.5 bg-[#020617]/95 border border-emerald-500/50 border-t-0 rounded-b-xl text-emerald-400 font-mono text-[11px] font-bold shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:bg-emerald-950/90 hover:border-emerald-400 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            title="Rê chuột hoặc click để trượt xuống thanh chuyển đổi 5 giao diện hệ thống"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
            <span>GIAO DIỆN HỆ THỐNG</span>
            <span className="material-symbols-outlined text-[15px] group-hover:translate-y-0.5 transition-transform">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      
      <header
        className={
          isDedicatedSystem
            ? `fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
                isSystemDrawerOpen || isPinned ? 'pointer-events-auto shadow-2xl' : 'pointer-events-none'
              }`
            : 'sticky top-0 z-50 flex flex-col bg-[#070d1e] shadow-2xl'
        }
      >
        <div
          onMouseEnter={() => setIsSystemDrawerOpen(true)}
          onMouseLeave={() => {
            if (!isPinned) setIsSystemDrawerOpen(false);
          }}
          className={`bg-[#020617] border-b border-emerald-500/30 overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto ${
            isSystemDrawerOpen || isPinned
              ? 'max-h-36 opacity-100 py-2.5 px-3 sm:px-4'
              : 'max-h-0 opacity-0 py-0 px-3 sm:px-4 pointer-events-none border-b-0'
          }`}
        >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 font-mono text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider">
              CHỌN GIAO DIỆN HỆ THỐNG:
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">5 Phân hệ trải nghiệm</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {ecosystemModes.map((mode) => {
              const isActive = pathname === mode.href;
              return (
                <Link
                  key={mode.href}
                  href={mode.href}
                  onClick={() => {
                    if (!isPinned) setIsSystemDrawerOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-bold font-mono text-[10px] sm:text-[11px] transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-105'
                      : 'bg-slate-900/90 text-slate-300 hover:text-white border border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{mode.icon}</span>
                  <span suppressHydrationWarning>{mode.label}</span>
                  {mode.countBadge && pendingOrdersCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                  {mode.liveBadge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Bỏ ghim (tự động ẩn khi rời chuột)' : 'Ghim cố định thanh này'}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer ${
                isPinned
                  ? 'bg-emerald-400 text-black shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{isPinned ? 'push_pin' : 'keep'}</span>
              <span>{isPinned ? 'Đã ghim' : 'Ghim'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPinned(false);
                setIsSystemDrawerOpen(false);
              }}
              title="Thu gọn thanh hệ thống"
              className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 transition"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      
      {!isDedicatedSystem && (
        <nav className="border-b border-white/10 bg-[#070d1e] px-4 py-2.5 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              CZ
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg sm:text-xl font-black tracking-wider text-white font-gaming block">
                CYBER<span className="text-emerald-400">ZONE</span>
              </span>
              <span className="text-[9px] text-cyan-400 tracking-widest font-mono uppercase block mt-0.5 font-bold">
                ESPORTS &amp; COMPLEX
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            <Link
              href="/"
              className={`transition hover:text-emerald-400 ${pathname === '/' ? 'text-emerald-400 font-black' : ''}`}
            >
              TRANG CHỦ
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                className="flex items-center gap-1 hover:text-emerald-400 transition py-2"
              >
                <span>Khu máy &amp; Dịch vụ</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {isServiceDropdownOpen && (
                <div className="absolute left-0 top-full w-80 pt-2 z-50">
                  <div className="p-3 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl space-y-1">
                    <Link
                      href="/#phan-khu"
                      onClick={() => setIsServiceDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-emerald-400 transition"
                    >
                      <span className="material-symbols-outlined text-emerald-400 text-lg">computer</span>
                      <div>
                        <div className="font-bold text-white normal-case">Standard Zone (12.000đ/h)</div>
                        <div className="text-[10px] text-slate-400 normal-case">Màn Fast-IPS 280Hz • RTX 4060Ti</div>
                      </div>
                    </Link>
                    <Link
                      href="/#phan-khu"
                      onClick={() => setIsServiceDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-cyan-400 transition"
                    >
                      <span className="material-symbols-outlined text-cyan-400 text-lg">speed</span>
                      <div>
                        <div className="font-bold text-white normal-case">Cyber Pro 540Hz (18.000đ/h)</div>
                        <div className="text-[10px] text-slate-400 normal-case">Ryzen 7 7800X3D • Màn 540Hz</div>
                      </div>
                    </Link>
                    <Link
                      href="/#phan-khu"
                      onClick={() => setIsServiceDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-emerald-400 transition"
                    >
                      <span className="material-symbols-outlined text-emerald-400 text-lg">workspace_premium</span>
                      <div>
                        <div className="font-bold text-white normal-case">Ultra VIP Suite (22.000đ/h)</div>
                        <div className="text-[10px] text-slate-400 normal-case">i7 14700K / i9 • RTX 4090 • Màn 240Hz</div>
                      </div>
                    </Link>
                    <Link
                      href="/#phan-khu"
                      onClick={() => setIsServiceDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-purple-400 transition"
                    >
                      <span className="material-symbols-outlined text-purple-400 text-lg">podium</span>
                      <div>
                        <div className="font-bold text-white normal-case">Đấu Trường Arena (25.000đ/h)</div>
                        <div className="text-[10px] text-slate-400 normal-case">5vs5 Thi đấu chuẩn IESF Major</div>
                      </div>
                    </Link>
                    <Link
                      href="/#phan-khu"
                      onClick={() => setIsServiceDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-pink-400 transition"
                    >
                      <span className="material-symbols-outlined text-pink-400 text-lg">favorite</span>
                      <div>
                        <div className="font-bold text-white normal-case">Couple Sanctuary (45.000đ/h)</div>
                        <div className="text-[10px] text-slate-400 normal-case">Sofa đôi Nappa ngả 180° cách âm</div>
                      </div>
                    </Link>
                    <Link
                      href="/#phan-khu"
                      onClick={() => setIsServiceDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-blue-400 transition"
                    >
                      <span className="material-symbols-outlined text-blue-400 text-lg">sports_esports</span>
                      <div>
                        <div className="font-bold text-white normal-case">Console Lounge (79.000đ/h)</div>
                        <div className="text-[10px] text-slate-400 normal-case">PS5 Pro + TV 75" 4K OLED 120Hz</div>
                      </div>
                    </Link>
                    <Link
                      href="/#phan-khu"
                      onClick={() => setIsServiceDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-amber-400 transition"
                    >
                      <span className="material-symbols-outlined text-amber-400 text-lg">sports</span>
                      <div>
                        <div className="font-bold text-white normal-case">Billiards Club (79.000đ/h)</div>
                        <div className="text-[10px] text-slate-400 normal-case">10 Bàn Aileex King 9020 &amp; Min Carom</div>
                      </div>
                    </Link>
                    <Link
                      href="/#showroom"
                      onClick={() => setIsServiceDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-amber-400 transition border-t border-white/5 mt-1 pt-2"
                    >
                      <span className="material-symbols-outlined text-amber-400 text-lg">storefront</span>
                      <div>
                        <div className="font-bold text-white normal-case">Showroom Gear &amp; Mod Phím</div>
                        <div className="text-[10px] text-slate-400 normal-case">Chuột 8000Hz, lót chuột Artisan</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <Link
                href="/#bang-gia"
                className="flex items-center gap-1 hover:text-emerald-400 transition py-2"
              >
                <span>GÓI HỘI VIÊN</span>
                <span className="material-symbols-outlined text-[15px] group-hover:rotate-180 transition duration-300">
                  expand_more
                </span>
              </Link>

              <div className="absolute left-0 top-full hidden group-hover:block w-72 pt-2 z-50">
                <div className="p-3 bg-slate-900/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl space-y-1.5 font-mono text-xs">
                  <Link
                    href="/#bang-gia"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-emerald-400 transition"
                  >
                    <span className="material-symbols-outlined text-emerald-400 text-xl">card_membership</span>
                    <div>
                      <div className="font-bold text-white normal-case">1. Hệ Thống Gamer Pass (4 Hạng)</div>
                      <div className="text-[10px] text-slate-400 normal-case">Tân Thủ • Bạc • Vàng • Kim Cương</div>
                    </div>
                  </Link>

                  <Link
                    href="/auth"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-cyan-400 transition border-t border-white/5 pt-2.5"
                  >
                    <span className="material-symbols-outlined text-cyan-400 text-xl">wallet</span>
                    <div>
                      <div className="font-bold text-white normal-case">2. Cổng Ví & Nạp Tiền Trực Tuyến</div>
                      <div className="text-[10px] text-slate-400 normal-case">Nạp tiền, kiểm tra số dư & hồ sơ bảo mật</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/#community"
              className="hover:text-emerald-400 transition"
            >
              CỘNG ĐỒNG
            </Link>

            <Link
              href="/#showroom"
              className="hover:text-emerald-400 transition"
            >
              SHOWROOM
            </Link>

            <button
              type="button"
              onClick={() => setIsSystemDrawerOpen(!isSystemDrawerOpen)}
              onMouseEnter={() => setIsSystemDrawerOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all border cursor-pointer ${
                isSystemDrawerOpen || isPinned
                  ? 'bg-emerald-400 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-900/90 text-slate-300 hover:text-emerald-400 border-emerald-500/40 hover:border-emerald-400 shadow-sm'
              }`}
              title="Mở thanh chuyển đổi 5 giao diện hệ thống (nằm phía trên thanh Trang Chủ)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>GIAO DIỆN HỆ THỐNG</span>
              <span className="material-symbols-outlined text-[15px]">
                {isSystemDrawerOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            <button
              type="button"
              onClick={() => setIsSystemDrawerOpen(!isSystemDrawerOpen)}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold cursor-pointer"
              title="Giao diện hệ thống"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HỆ THỐNG</span>
              <span className="material-symbols-outlined text-[14px]">
                {isSystemDrawerOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>

            <a
              href="tel:19008888"
              className="hidden xl:flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white px-2 py-1.5 rounded-lg transition"
            >
              <span className="text-emerald-400">📞</span> 1900 8888
            </a>

            <Link
              href="/#dat-cho"
              className="px-3.5 sm:px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition uppercase font-sans flex items-center gap-1"
            >
              <span>ĐẶT MÁY TRƯỚC</span>
            </Link>

            {isMounted && currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/50 hover:border-emerald-400 transition"
                >
                  <div className="text-right font-mono text-[11px] hidden sm:block">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-white font-bold block truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${getTierByName(currentUser.userTier || wallet.userTier).badgeClass}`}>
                        {getTierByName(currentUser.userTier || wallet.userTier).shortName}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold block">
                      {(typeof currentUser.balance === 'number' ? currentUser.balance : wallet.balance).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-base">person</span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Đăng xuất tài khoản"
                  className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500 transition flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">power_settings_new</span>
                </button>
              </div>
            ) : (

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition border border-white/10"
                >
                  ĐĂNG NHẬP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 sm:px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-black shadow-lg shadow-cyan-500/20 transition"
                >
                  ĐĂNG KÝ
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      )}
    </header>

    {!isDedicatedSystem && (
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    )}
  </>
  );
}