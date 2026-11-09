'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getStoredWallet,
  WALLET_EVENT_NAME,
  STORAGE_KEY_WALLET,
  UserWallet,
  WalletTransaction,
  INITIAL_WALLET,
  updateStationAndRate,
  deductPlayTimeFee,
  topupWallet,
  deductWallet,
  calculateRemainingPlayTime,
  broadcastWalletUpdate,
  getCumulativeTopupAmount,
  saveActiveClientStation,
  getActiveClientStation,
  ACTIVE_STATION_EVENT,
} from '@/lib/walletStore';
import {
  getClientPcSession,
  saveClientPcSession,
  clearClientPcSession,
  CLIENT_PC_EVENT_NAME,
  AuthUser,
  authenticateUser,
  getLoggedInUser,
  loginUser,
  AUTH_EVENT_NAME,
} from '@/lib/authStore';
import AuthModal from '@/components/auth/AuthModal';
import { createStaffRequest } from '@/lib/staffRequestStore';
import {
  getTierByName,
  determineTierByAmount,
  calculateTierProgression,
  GAMER_PASS_TIERS,
  TIERS_ORDER,
  TierInfo,
} from '@/lib/gamerPass';

interface StationTheme {
  name: string;
  badgeText: string;
  colorName: string;
  bgGradient: string;
  glowAura: string;
  accentText: string;
  accentBorder: string;
  bannerBg: string;
  hudGlow: string;
  stationTagBg: string;
  exclusiveDesc: string;
  roomIcon: string;
}

interface StationPreset {
  id: string;
  name: string;
  zone: string;
  hourlyRate: number;
  cpu: string;
  gpu: string;
  screen: string;
  gear: string;
  chair: string;
  badge: string;
  theme: StationTheme;
}

const STATION_PRESETS: StationPreset[] = [
  {
    id: 'VIP-08',
    name: 'Máy Trạm VIP-08',
    zone: 'Phòng Riêng VIP Tầng 2',
    hourlyRate: 22000,
    cpu: 'Intel Core i7 14700K (20 Cores)',
    gpu: 'NVIDIA RTX 4070 Ti Super 16GB',
    screen: 'ASUS ROG Swift 27" 240Hz Fast-IPS',
    gear: 'Zowie EC2-CW + Akko Custom Lube',
    chair: 'Ghế bọc da Nappa ngả 160°',
    badge: 'ULTRA VIP',
    theme: {
      name: 'Ultra VIP Gold Luxury',
      badgeText: 'VÀNG KIM & CYAN VIP',
      colorName: 'amber-cyan',
      bgGradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#231a06] via-[#091428] to-[#020617]',
      glowAura: 'shadow-[0_0_60px_rgba(245,158,11,0.25)]',
      accentText: 'text-amber-400',
      accentBorder: 'border-amber-500/50',
      bannerBg: 'bg-gradient-to-r from-amber-500/25 via-yellow-500/10 to-transparent border-l-4 border-amber-400',
      hudGlow: 'border-b border-amber-500/40 shadow-[0_4px_25px_rgba(245,158,11,0.25)]',
      stationTagBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950',
      exclusiveDesc: '👑 ĐẶC QUYỀN ULTRA VIP: Da Nappa ngả 160°, màn ASUS ROG 240Hz Fast-IPS & Akko Lube',
      roomIcon: 'workspace_premium',
    },
  },
  {
    id: 'PRO-01',
    name: 'Khu Thi Đấu PRO-01',
    zone: 'Khu Máy FPS 540Hz Tầng 2',
    hourlyRate: 18000,
    cpu: 'AMD Ryzen 7 7800X3D Gaming King',
    gpu: 'NVIDIA RTX 4080 Super 16GB',
    screen: 'BenQ Zowie XL2566K 540Hz DyAc+',
    gear: 'Razer Viper V3 Pro + Huntsman V3',
    chair: 'Ghế công thái học Herman Miller Embody',
    badge: 'CYBER PRO',
    theme: {
      name: 'Cyber Pro 540Hz FPS Lime',
      badgeText: 'LIME NEON & LỤC ESPORTS',
      colorName: 'emerald-neon',
      bgGradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#032918] via-[#041a24] to-[#020617]',
      glowAura: 'shadow-[0_0_60px_rgba(16,185,129,0.3)]',
      accentText: 'text-emerald-400',
      accentBorder: 'border-emerald-500/50',
      bannerBg: 'bg-gradient-to-r from-emerald-500/25 via-teal-500/10 to-transparent border-l-4 border-emerald-400',
      hudGlow: 'border-b border-emerald-500/40 shadow-[0_4px_25px_rgba(16,185,129,0.25)]',
      stationTagBg: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950',
      exclusiveDesc: '⚡ ĐẶC QUYỀN CYBER PRO: Tần số quét kỷ lục 540Hz DyAc+, Ryzen 7 7800X3D & Ghế Herman Miller',
      roomIcon: 'bolt',
    },
  },
  {
    id: 'STD-01',
    name: 'Máy Tiêu Chuẩn STD-01',
    zone: 'Khu Tiêu Chuẩn Standard Tầng 1',
    hourlyRate: 12000,
    cpu: 'Intel Core i5 13400F (10 Cores)',
    gpu: 'NVIDIA RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 Lightsync + DareU EK87',
    chair: 'Ghế bọc da đúc chống mỏi lưng',
    badge: 'STANDARD',
    theme: {
      name: 'Standard Electric Sky Blue',
      badgeText: 'CYBER SKY BLUE',
      colorName: 'sky-blue',
      bgGradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#071d40] via-[#061226] to-[#020617]',
      glowAura: 'shadow-[0_0_50px_rgba(56,189,248,0.2)]',
      accentText: 'text-sky-400',
      accentBorder: 'border-sky-500/40',
      bannerBg: 'bg-gradient-to-r from-sky-500/20 via-blue-500/10 to-transparent border-l-4 border-sky-400',
      hudGlow: 'border-b border-sky-500/40 shadow-[0_4px_25px_rgba(56,189,248,0.15)]',
      stationTagBg: 'bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950',
      exclusiveDesc: '🎮 KHU TIÊU CHUẨN STANDARD: Tần số quét 280Hz Fast-IPS, Core i5 13400F & RTX 4060 Ti mát lạnh',
      roomIcon: 'desktop_windows',
    },
  },
  {
    id: 'ARENA-A1',
    name: 'Đấu Trường ARENA-A1',
    zone: 'Sàn Đấu 5vs5 Tầng 1 (Đội Xanh)',
    hourlyRate: 25000,
    cpu: 'Intel Core i9 14900K Flagship',
    gpu: 'NVIDIA RTX 4090 24GB OC Gaming',
    screen: 'ROG Swift Pro OLED 540Hz Kỷ Lục',
    gear: 'Wooting 60HE Rapid Trigger + EC2-CW',
    chair: 'Ghế thi đấu chuẩn giải IESF Major',
    badge: 'ARENA 5VS5',
    theme: {
      name: 'Arena Crimson Battle Flame',
      badgeText: 'CRIMSON RED & RUBY',
      colorName: 'rose-crimson',
      bgGradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#32060e] via-[#1a0513] to-[#020617]',
      glowAura: 'shadow-[0_0_70px_rgba(244,63,94,0.35)]',
      accentText: 'text-rose-400',
      accentBorder: 'border-rose-500/50',
      bannerBg: 'bg-gradient-to-r from-rose-500/25 via-red-500/10 to-transparent border-l-4 border-rose-500',
      hudGlow: 'border-b border-rose-500/50 shadow-[0_4px_30px_rgba(244,63,94,0.3)]',
      stationTagBg: 'bg-gradient-to-r from-rose-500 to-red-600 text-white',
      exclusiveDesc: '⚔️ ĐẶC QUYỀN ĐẤU TRƯỜNG 5VS5: RTX 4090 24GB, OLED 540Hz, Phím Wooting 60HE Rapid Trigger',
      roomIcon: 'swords',
    },
  },
  {
    id: 'STREAM-01',
    name: 'Phòng Stream STREAM-01',
    zone: 'Stream Studio Tầng 2 (Cách Âm)',
    hourlyRate: 35000,
    cpu: 'Dual PC Core i7 14700K + RTX 4080',
    gpu: 'Card Capture 4K60 Pro HDR',
    screen: 'Dual Monitor ROG 27" 2K 240Hz',
    gear: 'GoXLR + Shure SM7B + Sony Cam 4K',
    chair: 'Ghế Streamer Corsair T3 Rush',
    badge: 'STREAM STUDIO',
    theme: {
      name: 'Stream Neon Violet RGB',
      badgeText: 'VIOLET & FUCHSIA RGB',
      colorName: 'purple-fuchsia',
      bgGradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a053b] via-[#140826] to-[#020617]',
      glowAura: 'shadow-[0_0_60px_rgba(192,132,252,0.3)]',
      accentText: 'text-purple-300',
      accentBorder: 'border-purple-500/50',
      bannerBg: 'bg-gradient-to-r from-purple-500/25 via-fuchsia-500/10 to-transparent border-l-4 border-purple-400',
      hudGlow: 'border-b border-purple-500/40 shadow-[0_4px_30px_rgba(192,132,252,0.25)]',
      stationTagBg: 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white',
      exclusiveDesc: '🎙️ ĐẶC QUYỀN PHÒNG STREAM 4K: Cách âm tuyệt đối, Mic Shure SM7B, Dual PC Core i7 & Cam 4K',
      roomIcon: 'videocam',
    },
  },
  {
    id: 'COUPLE-01',
    name: 'Phòng Đôi COUPLE-01',
    zone: 'Couple Suite Tầng 2 (Phòng Riêng)',
    hourlyRate: 45000,
    cpu: 'Intel Core i7 14700K Dual System',
    gpu: 'NVIDIA RTX 4070 Super 12GB x2',
    screen: '2x Samsung Odyssey G7 27" 240Hz Cong',
    gear: 'Sofa Da Nappa Đôi + 2 Tai Nghe Kép',
    chair: 'Sofa giường đôi công thái học ngả 180°',
    badge: 'COUPLE SUITE',
    theme: {
      name: 'Romantic Rose Pink Suite',
      badgeText: 'ROSE GOLD & PINK',
      colorName: 'pink-coral',
      bgGradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2f081d] via-[#18071f] to-[#020617]',
      glowAura: 'shadow-[0_0_55px_rgba(244,114,182,0.25)]',
      accentText: 'text-pink-300',
      accentBorder: 'border-pink-500/50',
      bannerBg: 'bg-gradient-to-r from-pink-500/20 via-rose-500/10 to-transparent border-l-4 border-pink-400',
      hudGlow: 'border-b border-pink-500/40 shadow-[0_4px_25px_rgba(244,114,182,0.2)]',
      stationTagBg: 'bg-gradient-to-r from-pink-400 to-rose-400 text-slate-950',
      exclusiveDesc: '💖 ĐẶC QUYỀN COUPLE SUITE: Sofa đôi ngả 180°, 2 màn cong Odyssey G7 240Hz riêng biệt',
      roomIcon: 'favorite',
    },
  },
  {
    id: 'CONSOLE-01',
    name: 'Phòng CONSOLE-01',
    zone: 'Console Lounge PS5 Pro Tầng 2',
    hourlyRate: 79000,
    cpu: 'PlayStation 5 Pro + Switch OLED',
    gpu: 'Custom RDNA 3 67WGP Pro Architecture',
    screen: 'LG OLED G3 75" 4K 120Hz Dolby Vision',
    gear: '4 Tay Cầm DualSense Edge + Soundbar Atmos',
    chair: 'Ghế LazyBoy bọc da thư giãn cao cấp',
    badge: 'PS5 PRO LOUNGE',
    theme: {
      name: 'PlayStation Deep Cobalt',
      badgeText: 'PLAYSTATION COBALT BLUE',
      colorName: 'indigo-blue',
      bgGradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#071647] via-[#050e2b] to-[#020617]',
      glowAura: 'shadow-[0_0_65px_rgba(59,130,246,0.35)]',
      accentText: 'text-blue-400',
      accentBorder: 'border-blue-500/50',
      bannerBg: 'bg-gradient-to-r from-blue-500/25 via-indigo-500/10 to-transparent border-l-4 border-blue-400',
      hudGlow: 'border-b border-blue-500/50 shadow-[0_4px_30px_rgba(59,130,246,0.25)]',
      stationTagBg: 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white',
      exclusiveDesc: '🕹️ ĐẶC QUYỀN PS5 PRO LOUNGE: Màn LG OLED 75" 4K 120Hz Dolby Atmos & Ghế Sofa LazyBoy',
      roomIcon: 'sports_esports',
    },
  },
  {
    id: 'BIDA-01',
    name: 'Bàn Bida BIDA-01',
    zone: 'Billiards Lounge Tầng 1',
    hourlyRate: 79000,
    cpu: 'Bàn Aileex King 9020 Pool Nhập Khẩu',
    gpu: 'Mặt đá tự nhiên 3 tấm phẳng tuyệt đối',
    screen: 'Bóng Aramith Tournament Pro Bỉ',
    gear: 'Cơ Carbon Rhino Pro + Bảng Điểm Điện Tử',
    chair: 'Ghế quầy bar quan sát cao cấp bọc nỉ',
    badge: 'BILLIARDS CLUB',
    theme: {
      name: 'Billiards Felt Emerald & Amber',
      badgeText: 'FELT GREEN & AMBER',
      colorName: 'emerald-amber',
      bgGradient: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#042c1b] via-[#1f1a04] to-[#020617]',
      glowAura: 'shadow-[0_0_60px_rgba(16,185,129,0.3)]',
      accentText: 'text-emerald-300',
      accentBorder: 'border-emerald-500/50',
      bannerBg: 'bg-gradient-to-r from-emerald-500/20 via-amber-500/10 to-transparent border-l-4 border-emerald-400',
      hudGlow: 'border-b border-emerald-500/40 shadow-[0_4px_25px_rgba(16,185,129,0.2)]',
      stationTagBg: 'bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950',
      exclusiveDesc: '🎱 ĐẶC QUYỀN BIDA CLUB: Bàn Aileex King 9020 đá tự nhiên 3 tấm, Cơ Carbon Rhino Pro & Bảng điện tử',
      roomIcon: 'sports',
    },
  },
];

interface ComboHourPack {
  id: string;
  name: string;
  amount: number;
  bonusMinutes: number;
  tag: string;
  tagColor: string;
  icon: string;
  desc: string;
  bonusText: string;
}

const COMBO_HOUR_PACKS: ComboHourPack[] = [
  {
    id: 'combo-1h',
    name: 'GÓI 1 GIỜ CHƠI',
    amount: 20000,
    bonusMinutes: 0,
    tag: 'TRẢI NGHIỆM',
    tagColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    icon: 'schedule',
    desc: 'Cộng ~1 giờ chơi theo giá máy trạm • Tích lũy thăng hạng',
    bonusText: 'Đủ 1 trận Rank nhanh',
  },
  {
    id: 'combo-3h',
    name: 'COMBO 3 GIỜ CHIẾN',
    amount: 50000,
    bonusMinutes: 15,
    tag: 'TIẾT KIỆM 15%',
    tagColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    icon: 'bolt',
    desc: 'Cộng ~3 giờ chơi + Tặng 15 phút giờ chơi bonus',
    bonusText: 'Tặng thêm +15 phút chơi Free',
  },
  {
    id: 'combo-6h',
    name: 'COMBO CÀY RANK 6 GIỜ',
    amount: 100000,
    bonusMinutes: 45,
    tag: 'HOT COMBO',
    tagColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    icon: 'stars',
    desc: 'Cộng ~6 giờ chơi + Tặng 45 phút bonus + Tích lũy Hội Viên Bạc',
    bonusText: 'Tặng thêm +45 phút chơi Free',
  },
  {
    id: 'combo-12h',
    name: 'COMBO THÔNG ĐÊM 12 GIỜ',
    amount: 200000,
    bonusMinutes: 90,
    tag: 'SIÊU COMBO ĐÊM',
    tagColor: 'text-purple-300 border-purple-500/40 bg-purple-500/10',
    icon: 'nightlife',
    desc: 'Cộng ~12 giờ chơi + Tặng 90 phút bonus + Đạt mốc Hội Viên Vàng (-20% F&B)',
    bonusText: 'Tặng thêm +90 phút chơi Free',
  },
];

function formatSecondsToHMS(totalSecs: number): string {
  if (totalSecs <= 0) return '00:00:00';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const MarqueeTag = 'marquee' as any;



export default function ClientPcPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [wallet, setWallet] = useState<UserWallet>(INITIAL_WALLET);

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [currentStation, setCurrentStation] = useState<StationPreset>(STATION_PRESETS[0]);
  const [customRate, setCustomRate] = useState<number>(22000);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [showStationModal, setShowStationModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [newRateInput, setNewRateInput] = useState('22000');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showSystemSwitcher, setShowSystemSwitcher] = useState(false);
  const [topupAmountInput, setTopupAmountInput] = useState('100000');
  const [topupContextTitle, setTopupContextTitle] = useState<string | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<ComboHourPack | null>(null);
  const [topupPaymentMode, setTopupPaymentMode] = useState<'VIETQR' | 'CASH'>('VIETQR');
  const [topupErrorMsg, setTopupErrorMsg] = useState<string | null>(null);

  const [showCallModal, setShowCallModal] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [customStaffNote, setCustomStaffNote] = useState('');

  const [showGamerPassModal, setShowGamerPassModal] = useState(false);
  const [showUpgradeSuccessModal, setShowUpgradeSuccessModal] = useState(false);
  const [newUpgradedTierName, setNewUpgradedTierName] = useState('');
  const [upgradePerks, setUpgradePerks] = useState<string[]>([]);
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);
  const [directAdminMessage, setDirectAdminMessage] = useState<string | null>(null);
  const [isRebooting, setIsRebooting] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
    const isOrderDismissed = (orderNumber?: number) => {
    if (!orderNumber || typeof window === 'undefined') return false;
    try {
      const dismissed = JSON.parse(localStorage.getItem('CYBER_KDS_DISMISSED_ORDERS') || '[]');
      return Array.isArray(dismissed) && dismissed.includes(orderNumber);
    } catch {
      return false;
    }
  };

  const handleAcknowledgeFoodNotice = () => {
    if (kdsFoodNotice?.orderNumber && typeof window !== 'undefined') {
      try {
        const dismissed = JSON.parse(localStorage.getItem('CYBER_KDS_DISMISSED_ORDERS') || '[]');
        if (Array.isArray(dismissed) && !dismissed.includes(kdsFoodNotice.orderNumber)) {
          dismissed.push(kdsFoodNotice.orderNumber);
          localStorage.setItem('CYBER_KDS_DISMISSED_ORDERS', JSON.stringify(dismissed));
        }
      } catch {}
    }
    setKdsFoodNotice(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cyber_kds_food_ready');
      } catch {}
    }
  };

  const [kdsFoodNotice, setKdsFoodNotice] = useState<{
    orderNumber: number | string;
    pcName: string;
    items?: any[];
  } | null>(null);

  const [activePlayingGame, setActivePlayingGame] = useState<string | null>(null);

  useEffect(() => {
    const checkActiveGame = () => {
      try {
        const saved = localStorage.getItem('CYBER_ACTIVE_PLAYING_GAME');
        if (saved) {
          const parsed = JSON.parse(saved);
          setActivePlayingGame(parsed?.gameName || null);
        } else {
          setActivePlayingGame(null);
        }
      } catch {
        setActivePlayingGame(null);
      }
    };
    checkActiveGame();
    window.addEventListener('storage', checkActiveGame);
    return () => window.removeEventListener('storage', checkActiveGame);
  }, []);

  const playDingSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.7);
    } catch {}
  };

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const handleKdsReady = (detail: any) => {
      if (!detail || !detail.orderNumber) return;
      if (isOrderDismissed(detail.orderNumber)) return;
      playDingSound();
      setKdsFoodNotice({
        orderNumber: detail.orderNumber,
        pcName: detail.pcName || currentStation.id,
        items: detail.items || [],
      });
    };

    try {
      const rawKds = localStorage.getItem('cyber_kds_food_ready');
      if (rawKds) {
        const parsed = JSON.parse(rawKds);
        if (parsed.orderNumber && isOrderDismissed(parsed.orderNumber)) {
          localStorage.removeItem('cyber_kds_food_ready');
        } else if (Date.now() - (parsed.timestamp || 0) < 600000) {
          setKdsFoodNotice({
            orderNumber: parsed.orderNumber,
            pcName: parsed.pcName || currentStation.id,
            items: parsed.items || [],
          });
        }
      }
    } catch {}

    const handleCustomKdsEvent = (e: any) => {
      handleKdsReady(e.detail);
    };

    const handleStorageKds = (e: StorageEvent) => {
      if (e.key === 'cyber_kds_food_ready' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleKdsReady(parsed);
        } catch {}
      }
    };

    window.addEventListener('cyber_kds_food_ready', handleCustomKdsEvent);
    window.addEventListener('storage', handleStorageKds);

    return () => {
      window.removeEventListener('cyber_kds_food_ready', handleCustomKdsEvent);
      window.removeEventListener('storage', handleStorageKds);
    };
  }, [currentStation.id]);

  useEffect(() => {
    const isExplicitlyLocked = typeof window !== 'undefined' && (
      localStorage.getItem('CYBER_CLIENT_PC_EXPLICITLY_LOCKED') === 'true' ||
      localStorage.getItem('CYBER_CLIENT_PC_UNLOCKED') === 'false'
    );
    const activeUser = getLoggedInUser() || getClientPcSession();

    if (isExplicitlyLocked || !activeUser) {
      setIsLocked(true);
      setCurrentUser(null);
      setRemainingSeconds(0);
      return;
    }

    let storedWallet = getStoredWallet();

    const matched = STATION_PRESETS.find((s) => s.id === storedWallet.pcName) || STATION_PRESETS[0];
    setCurrentStation(matched);
    const initialRate = storedWallet.hourlyRate || matched.hourlyRate || 22000;
    setCustomRate(initialRate);
    setNewRateInput(String(initialRate));

    saveClientPcSession(activeUser);
    setCurrentUser(activeUser);

    storedWallet = {
      ...storedWallet,
      userName: activeUser.fullName,
      userTier: activeUser.userTier,
      tierExpiresAt: activeUser.tierExpiresAt,
      balance: activeUser.balance,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(storedWallet));
    }
    setWallet(storedWallet);

    const secs = Math.max(0, Math.floor((activeUser.balance / initialRate) * 3600));
    setRemainingSeconds(secs);
    if (secs <= 0) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('CYBER_CLIENT_PC_UNLOCKED', 'true');
      }
    }

    saveActiveClientStation({
      stationId: matched.id,
      stationName: matched.name,
      zone: matched.zone,
      hourlyRate: initialRate,
      occupantName: activeUser.fullName,
      occupantTier: activeUser.userTier,
      balance: activeUser.balance,
      isOnline: true,
    });

    const handleStationSync = (e?: any) => {
      const isExplicitlyLocked = typeof window !== 'undefined' && (
        localStorage.getItem('CYBER_CLIENT_PC_EXPLICITLY_LOCKED') === 'true' ||
        localStorage.getItem('CYBER_CLIENT_PC_UNLOCKED') === 'false'
      );
      const sUser = e?.detail || getLoggedInUser() || getClientPcSession();
      if (isExplicitlyLocked || !sUser) {
        setIsLocked(true);
        setCurrentUser(null);
        setRemainingSeconds(0);
      } else {
        setCurrentUser(sUser);
        const w = getStoredWallet();
        setWallet(w);
        // Chỉ tính toán lại giây chơi nếu máy đang bị khóa để mở máy lần đầu
        if (isLocked) {
          setIsLocked(false);
          const activeRate = customRate > 0 ? customRate : currentStation.hourlyRate;
          const calcSeconds = activeRate > 0 ? Math.floor((sUser.balance / activeRate) * 3600) : 0;
          setRemainingSeconds(calcSeconds);
        }
      }
    };

    window.addEventListener(CLIENT_PC_EVENT_NAME, handleStationSync);
    window.addEventListener(AUTH_EVENT_NAME, handleStationSync);

    const handleBroadcast = (e: any) => {
      setActiveBroadcast(e.detail?.message || e.detail || null);
      playDingSound();
    };

    const handleDirectMessage = (e: any) => {
      const detail = e.detail;
      const isTarget = !detail?.targetSeatId || detail?.targetSeatId === currentStation.id || detail?.targetSeatId === 'ALL' || detail?.seatId === currentStation.id;
      if (isTarget) {
        setDirectAdminMessage(detail?.message || 'Có tin nhắn mới từ quầy lễ tân!');
        playDingSound();
      }
    };

    const handleRemoteReboot = (e: any) => {
      const detail = e.detail;
      const isTarget = !detail?.targetSeatId || detail?.targetSeatId === currentStation.id || detail?.targetSeatId === 'ALL' || detail?.seatId === currentStation.id;
      if (isTarget) {
        setIsRebooting(true);
        setAlertSuccess('🔄 ĐANG KHỞI ĐỘNG LẠI MÁY THEO LỆNH TỪ SERVER...');
        playDingSound();
        setTimeout(() => {
          setIsRebooting(false);
          setIsLocked(true);
          localStorage.removeItem('CYBER_CLIENT_PC_UNLOCKED');
          setAlertSuccess('✅ MÁY ĐÃ KHỞI ĐỘNG LẠI THÀNH CÔNG! VUI LÒNG ĐĂNG NHẬP LẠI.');
        }, 3000);
      }
    };

    const handleLocalWalletUpdate = () => {
      const updatedWallet = getStoredWallet();
      setWallet(updatedWallet);
      // Chỉ tự động mở khóa và nạp giờ nếu máy đang ở trạng thái khóa (Lễ tân nạp mở máy)
      // Khi khách đang chơi, tuyệt đối KHÔNG ghi đè remainingSeconds để bảo toàn gói combo/giờ đã mua
      if (isLocked) {
        const activeRate = customRate > 0 ? customRate : currentStation.hourlyRate;
        const calcSeconds = activeRate > 0 ? Math.floor((updatedWallet.balance / activeRate) * 3600) : 0;
        if (calcSeconds > 0) {
          setRemainingSeconds(calcSeconds);
          setIsLocked(false);
          localStorage.setItem('CYBER_CLIENT_PC_UNLOCKED', 'true');
          setAlertSuccess('🎉 QUẦY LỄ TÂN ĐÃ NẠP TIỀN CHO BẠN! Máy đã tự động mở khóa.');
          playDingSound();
        }
      }
    };



    const handleStorageCrossTab = (e: StorageEvent) => {
      if (!e.newValue) return;



      if (e.key === 'CYBER_REMOTE_COMMAND') {
        try {
          const cmd = JSON.parse(e.newValue);
          const isTarget = !cmd.targetSeatId || cmd.targetSeatId === currentStation.id || cmd.targetSeatId === 'ALL';
          if (isTarget && cmd.action === 'REBOOT') {
            setIsRebooting(true);
            setAlertSuccess('🔄 ĐANG KHỞI ĐỘNG LẠI MÁY THEO LỆNH TỪ SERVER...');
            playDingSound();
            setTimeout(() => {
              setIsRebooting(false);
              setIsLocked(true);
              localStorage.removeItem('CYBER_CLIENT_PC_UNLOCKED');
              setAlertSuccess('✅ MÁY ĐÃ KHỞI ĐỘNG LẠI THÀNH CÔNG! VUI LÒNG ĐĂNG NHẬP LẠI.');
            }, 3000);
          }
        } catch {}
      }

      if (e.key === 'CYBER_ACTIVE_BROADCAST') {
        try {
          const bcast = JSON.parse(e.newValue);
          if (bcast.message) {
            setActiveBroadcast(bcast.message);
            playDingSound();
          }
        } catch {
          setActiveBroadcast(e.newValue);
          playDingSound();
        }
      }

      if (e.key === 'CYBER_DIRECT_MESSAGE') {
        try {
          const dm = JSON.parse(e.newValue);
          const isTarget = !dm.targetSeatId || dm.targetSeatId === currentStation.id || dm.targetSeatId === 'ALL';
          if (isTarget) {
            setDirectAdminMessage(dm.message || 'Có tin nhắn mới từ quầy lễ tân!');
            playDingSound();
          }
        } catch {}
      }

      if (e.key === STORAGE_KEY_WALLET) {
        try {
          const updatedWallet = getStoredWallet();
          setWallet(updatedWallet);
          if (isLocked) {
            const activeRate = customRate > 0 ? customRate : currentStation.hourlyRate;
            const calcSeconds = activeRate > 0 ? Math.floor((updatedWallet.balance / activeRate) * 3600) : 0;
            if (calcSeconds > 0) {
              setRemainingSeconds(calcSeconds);
              setIsLocked(false);
              localStorage.setItem('CYBER_CLIENT_PC_UNLOCKED', 'true');
              setAlertSuccess('🎉 QUẦY LỄ TÂN ĐÃ NẠP TIỀN CHO BẠN! Máy đã tự động mở khóa.');
              playDingSound();
            }
          }
        } catch {}
      }

      if (e.key === 'CYBER_CUSTOM_SEAT_RATES') {
        try {
          const rates = JSON.parse(e.newValue);
          if (rates && rates[currentStation.id]) {
            const newRate = Number(rates[currentStation.id]);
            if (!isNaN(newRate) && newRate > 0) {
              setCustomRate(newRate);
              const calcSeconds = Math.floor((wallet.balance / newRate) * 3600);
              setRemainingSeconds(calcSeconds);
            }
          }
        } catch {}
      }
    };

    window.addEventListener('cyber_broadcast_alert', handleBroadcast);
    window.addEventListener('cyber_client_direct_message', handleDirectMessage);
    window.addEventListener('cyber_remote_reboot_command', handleRemoteReboot);
        window.addEventListener(WALLET_EVENT_NAME, handleLocalWalletUpdate);
    window.addEventListener('storage', handleStorageCrossTab);

    return () => {
      window.removeEventListener(CLIENT_PC_EVENT_NAME, handleStationSync);
      window.removeEventListener('cyber_broadcast_alert', handleBroadcast);
      window.removeEventListener('cyber_client_direct_message', handleDirectMessage);
      window.removeEventListener('cyber_remote_reboot_command', handleRemoteReboot);
            window.removeEventListener(WALLET_EVENT_NAME, handleLocalWalletUpdate);
      window.removeEventListener('storage', handleStorageCrossTab);
    };
  }, []);

  useEffect(() => {
    if (isLocked) return;

    let elapsedSeconds = 0;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(true);
          setAlertSuccess('⚠️ HẾT THỜI GIAN CHƠI! Máy ' + currentStation.id + ' đã tự động khóa. Vui lòng nạp thêm tiền tại quầy hoặc qua cổng nạp.');
          return 0;
        }
        return prev - 1;
      });

      elapsedSeconds += 1;
      if (elapsedSeconds >= 30) {
        elapsedSeconds = 0;
        const effectiveRate = customRate > 0 ? customRate : currentStation.hourlyRate;
        const tickFee = Math.max(1, Math.round(effectiveRate / 120));
        const res = deductPlayTimeFee(
          tickFee,
          currentStation.id,
          `Trừ tự động 30 giây giờ chơi tại ${currentStation.id} (${effectiveRate.toLocaleString('vi-VN')}đ/h)`
        );
        if (res.success) {
          setWallet(res.wallet);
          if (res.wallet.balance <= 0) {
            setIsLocked(true);
            setRemainingSeconds(0);
          }
        }
        saveActiveClientStation({
          stationId: currentStation.id,
          stationName: currentStation.name,
          zone: currentStation.zone,
          hourlyRate: effectiveRate,
          occupantName: currentUser?.fullName || res.wallet.userName,
          occupantTier: currentUser?.userTier || res.wallet.userTier,
          balance: res.wallet.balance,
          isOnline: res.wallet.balance > 0,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, customRate, currentStation.id, currentStation.name, currentStation.zone, currentStation.hourlyRate, currentUser]);

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanUname = loginUsername.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanUname || !cleanPass) {
      setLoginError('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu hội viên!');
      return;
    }

    const authRes = authenticateUser(cleanUname, cleanPass);
    if (!authRes.success) {
      setLoginError(authRes.error || 'Đăng nhập không thành công! Vui lòng kiểm tra lại.');
      return;
    }

    const userObj = authRes.user!;
    loginUser(userObj);
    setCurrentUser(userObj);

    const effectiveRate = customRate > 0 ? customRate : currentStation.hourlyRate;
    updateStationAndRate(currentStation.id, currentStation.zone, effectiveRate);

    const secs = Math.floor((userObj.balance / effectiveRate) * 3600);
    setRemainingSeconds(secs);
    setIsLocked(false);
    setLoginError(null);
    setAlertSuccess(`Chào mừng ${userObj.fullName}! Máy ${currentStation.id} đã mở khóa thành công. Thời gian: ${formatSecondsToHMS(secs)}`);
    setTimeout(() => setAlertSuccess(null), 4000);
  };

  const handleQuickDemoLogin = (uname: string = 'admin1', pass: string = '123') => {
    setLoginError(null);
    const authRes = authenticateUser(uname, pass);
    if (!authRes.success) {
      setLoginError(authRes.error || 'Đăng nhập mẫu thất bại!');
      return;
    }

    const userObj = { ...authRes.user! };

    // Khôi phục số dư mặc định nếu tài khoản mẫu đã dùng hết sạch tiền (0đ) để có thể mở máy
    if (userObj.balance <= 0) {
      if (uname === 'admin1') {
        userObj.balance = 200000;
        userObj.userTier = 'HỘI VIÊN BẠC 🥈';
      } else if (uname === 'admin2') {
        userObj.balance = 500000;
        userObj.userTier = 'HỘI VIÊN VÀNG ⭐';
      } else if (uname === 'gamer01') {
        userObj.balance = 50000;
        userObj.userTier = 'TÂN THỦ (ROOKIE)';
      }
    }

    loginUser(userObj);
    setCurrentUser(userObj);

    const effectiveRate = customRate > 0 ? customRate : currentStation.hourlyRate;
    updateStationAndRate(currentStation.id, currentStation.zone, effectiveRate);

    const updatedWallet = getStoredWallet();
    updatedWallet.balance = userObj.balance;
    updatedWallet.userName = userObj.fullName;
    updatedWallet.userTier = userObj.userTier;
    setWallet(updatedWallet);
    broadcastWalletUpdate(updatedWallet);

    const secs = Math.floor((userObj.balance / effectiveRate) * 3600);
    setRemainingSeconds(secs);
    setIsLocked(false);
    saveActiveClientStation({
      stationId: currentStation.id,
      stationName: currentStation.name,
      zone: currentStation.zone,
      hourlyRate: effectiveRate,
      occupantName: userObj.fullName,
      occupantTier: userObj.userTier,
      balance: userObj.balance,
      isOnline: true,
    });
    setAlertSuccess(`Đã mở khóa máy ${currentStation.id} với tài khoản Hội viên ${userObj.fullName} (${userObj.balance.toLocaleString('vi-VN')}đ • ${formatSecondsToHMS(secs)})!`);
    setTimeout(() => setAlertSuccess(null), 4000);
  };

  const handleLockClient = () => {
    if (confirm(`Bạn có chắc muốn đăng xuất và khóa máy trạm ${currentStation.id}?`)) {
      clearClientPcSession();
      setCurrentUser(null);
      setIsLocked(true);
      setRemainingSeconds(0);
      if (typeof window !== 'undefined') {
        localStorage.setItem('CYBER_CLIENT_PC_EXPLICITLY_LOCKED', 'true');
        localStorage.setItem('CYBER_CLIENT_PC_UNLOCKED', 'false');
      }
      saveActiveClientStation({
        stationId: currentStation.id,
        isOnline: false,
      });
    }
  };

  const handleSelectComboPack = (pack: ComboHourPack) => {
    setSelectedCombo(pack);
    setTopupAmountInput(String(pack.amount));
    setTopupContextTitle(`ĐẶT MUA ${pack.name.toUpperCase()} (+${pack.amount.toLocaleString('vi-VN')}Đ)`);
    setTopupPaymentMode('VIETQR');
    setTopupErrorMsg(null);
    setShowTopupModal(true);
  };

  const handleOpenRankTopup = (neededAmount: number, targetTierName: string) => {
    const depositAmount = neededAmount > 0 ? neededAmount : 50000;
    setSelectedCombo(null);
    setTopupAmountInput(String(depositAmount));
    setTopupContextTitle(`NẠP TIỀN LÊN HẠNG: ${targetTierName.toUpperCase()} (CẦN NẠP THÊM +${depositAmount.toLocaleString('vi-VN')}Đ)`);
    setTopupPaymentMode('VIETQR');
    setShowTopupModal(true);
  };

  const handleConfirmTopupOnClient = (amountToPay: number, forceMode?: 'VIETQR' | 'CASH') => {
    if (isNaN(amountToPay) || amountToPay < 10000) {
      setTopupErrorMsg('Vui lòng chọn hoặc nhập số tiền nạp tối thiểu từ 10.000đ!');
      return;
    }

    const mode = forceMode || topupPaymentMode;
    const effectiveRate = customRate > 0 ? customRate : currentStation.hourlyRate;
    const isComboMatch = selectedCombo && selectedCombo.amount === amountToPay;
    const bonusBonusSecs = isComboMatch ? selectedCombo.bonusMinutes * 60 : 0;
    const bonusMoneyValue = isComboMatch && selectedCombo.bonusMinutes > 0
      ? Math.round((selectedCombo.bonusMinutes / 60) * effectiveRate)
      : 0;
    const totalCreditedAmount = amountToPay + bonusMoneyValue;
    const addedSeconds = Math.floor((amountToPay / effectiveRate) * 3600) + bonusBonusSecs;

    setTopupErrorMsg(null);
    const prevTier = getTierByName(currentUser?.userTier || wallet.userTier);
    const methodLabel = mode === 'VIETQR' ? 'VietQR MB Bank' : 'Tiền mặt / Thẻ tại máy';
    const desc = isComboMatch
      ? `Nạp ${methodLabel}: ${selectedCombo.name} máy ${currentStation.id}`
      : `Nạp ${methodLabel} cộng giờ chơi máy ${currentStation.id}`;

    const updatedW = topupWallet(totalCreditedAmount, mode, desc, currentStation.id);
    setWallet(updatedW);

    const newTierInfo = getTierByName(updatedW.userTier);

    if (currentUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        balance: updatedW.balance,
        userTier: updatedW.userTier,
      };
      setCurrentUser(updatedUser);
      saveClientPcSession(updatedUser);
    }

    setRemainingSeconds((prev) => prev + addedSeconds);
    setIsLocked(false);

    saveActiveClientStation({
      stationId: currentStation.id,
      stationName: currentStation.name,
      zone: currentStation.zone,
      hourlyRate: effectiveRate,
      occupantName: currentUser?.fullName || updatedW.userName,
      occupantTier: updatedW.userTier,
      balance: updatedW.balance,
      isOnline: true,
    });

    setShowTopupModal(false);
    setSelectedCombo(null);
    setTopupContextTitle(null);

    const addedTimeStr = formatSecondsToHMS(addedSeconds);
    const comboBonusMsg = isComboMatch && selectedCombo.bonusMinutes > 0
      ? ` (Tặng thêm +${selectedCombo.bonusMinutes} phút Free trị giá +${bonusMoneyValue.toLocaleString('vi-VN')}đ!)`
      : '';

    if (newTierInfo.minAmount > prevTier.minAmount) {
      setNewUpgradedTierName(newTierInfo.name);
      setUpgradePerks(newTierInfo.perks);
      setShowUpgradeSuccessModal(true);
    } else {
      setAlertSuccess(
        `🎉 NẠP TIỀN THÀNH CÔNG (+${amountToPay.toLocaleString('vi-VN')}Đ): Đã cộng +${addedTimeStr}${comboBonusMsg} vào máy ${currentStation.id}. Số dư ví mới: ${updatedW.balance.toLocaleString('vi-VN')}đ!`
      );
      setTimeout(() => setAlertSuccess(null), 8000);
    }
  };

  const handleChangeStation = (preset: StationPreset) => {
    const oldStation = currentStation;
    const oldRate = customRate > 0 ? customRate : oldStation.hourlyRate;

    const newRate = preset.hourlyRate;
    // Quy đổi giờ chơi bảo toàn giá trị: value = remainingSeconds * oldRate; newSeconds = value / newRate
    const newSeconds = remainingSeconds > 0 && oldRate > 0
      ? Math.max(0, Math.floor((remainingSeconds * oldRate) / newRate))
      : 0;

    setCurrentStation(preset);
    setCustomRate(newRate);
    setNewRateInput(String(newRate));
    setRemainingSeconds(newSeconds);

    // Cập nhật cấu hình trạm máy, TUYỆT ĐỐI KHÔNG can thiệp thay đổi số dư ví
    const updatedWallet = updateStationAndRate(preset.id, preset.zone, newRate);
    setWallet(updatedWallet);
    setShowStationModal(false);

    saveActiveClientStation({
      stationId: preset.id,
      stationName: preset.name,
      zone: preset.zone,
      hourlyRate: newRate,
      occupantName: currentUser?.fullName || updatedWallet.userName || 'Trần Ngọc Thái',
      occupantTier: currentUser?.userTier || updatedWallet.userTier || 'TÂN THỦ (ROOKIE)',
      balance: updatedWallet.balance,
      isOnline: !isLocked,
    });

    const oldTimeStr = formatSecondsToHMS(remainingSeconds);
    const newTimeStr = formatSecondsToHMS(newSeconds);
    setAlertSuccess(
      `⚡ ĐỔI PHÒNG THÀNH CÔNG: Chuyển từ [${oldStation.id}] (${oldRate.toLocaleString('vi-VN')}đ/h) sang [${preset.id}] (${newRate.toLocaleString('vi-VN')}đ/h). Giờ chơi quy đổi: ${oldTimeStr} ➔ ${newTimeStr}. Số dư tài khoản giữ nguyên: ${updatedWallet.balance.toLocaleString('vi-VN')}đ.`
    );
    setTimeout(() => setAlertSuccess(null), 7000);
  };

  const handleSaveCustomRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseInt(newRateInput, 10);
    if (isNaN(rateNum) || rateNum < 1000) {
      alert('Vui lòng nhập giá tiền giờ hợp lệ (tối thiểu 1.000đ)!');
      return;
    }

    const oldRate = customRate > 0 ? customRate : currentStation.hourlyRate;
    const currentMoney = remainingSeconds > 0 ? (remainingSeconds / 3600) * oldRate : wallet.balance;
    const newSeconds = Math.max(0, Math.floor((currentMoney / rateNum) * 3600));

    setCustomRate(rateNum);
    setRemainingSeconds(newSeconds);
    updateStationAndRate(currentStation.id, currentStation.zone, rateNum);
    setShowRateModal(false);

    const oldTimeStr = formatSecondsToHMS(remainingSeconds);
    const newTimeStr = formatSecondsToHMS(newSeconds);
    setAlertSuccess(
      `⚡ ĐÃ SETUP ĐƠN GIÁ MỚI: ${rateNum.toLocaleString('vi-VN')}đ/h. Giờ chơi tự động quy đổi: ${oldTimeStr} ➔ ${newTimeStr}!`
    );
    setTimeout(() => setAlertSuccess(null), 6000);
  };



  const handleSimulatePlayTime = (minutes: number) => {
    const deductSeconds = minutes * 60;
    if (remainingSeconds < deductSeconds) {
      alert(`Thời gian chơi còn lại không đủ ${minutes} phút! Vui lòng nạp thêm tiền.`);
      return;
    }

    const fee = Math.round((customRate / 60) * minutes);
    const res = deductPlayTimeFee(
      fee,
      currentStation.id,
      `Trừ tiền chơi ${minutes} phút tại ${currentStation.id} (${customRate.toLocaleString('vi-VN')}đ/h)`
    );

    const newSecs = Math.max(0, remainingSeconds - deductSeconds);
    setRemainingSeconds(newSecs);

    if (res.success) {
      setWallet(res.wallet);
      setAlertSuccess(
        `⚡ ĐÃ TRỪ GIỜ CHƠI: -${minutes} phút (-${fee.toLocaleString('vi-VN')}đ tại ${customRate.toLocaleString('vi-VN')}đ/h). Thời gian mới: ${formatSecondsToHMS(newSecs)}`
      );
      setTimeout(() => setAlertSuccess(null), 6000);
    }
  };

  const handleQuickAddMoney = (amount: number) => {
    setSelectedCombo(null);
    setTopupAmountInput(String(amount));
    setTopupContextTitle(`NẠP TIỀN VÀO MÁY TRẠM: +${amount.toLocaleString('vi-VN')}Đ`);
    setShowTopupModal(true);
  };

  const handleCallStaff = (reason: string) => {
    try {
      createStaffRequest({
        pcName: currentStation.id,
        type: 'EXTRA_SERVICE',
        title: reason,
        details: `Khách máy ${currentStation.id} (${currentStation.name}) yêu cầu: ${reason}`,
      });
      setShowCallModal(false);
      setAlertSuccess(`Đã gửi yêu cầu: "${reason}". Nhân viên đang đến máy bạn ngay!`);
      setTimeout(() => setAlertSuccess(null), 5000);
    } catch {
      setAlertSuccess('Đã gửi tín hiệu tới quầy thu ngân!');
      setTimeout(() => setAlertSuccess(null), 4000);
    }
  };

  const liveBalance = Math.max(0, wallet.balance > 0 ? wallet.balance : Math.round((remainingSeconds / 3600) * (customRate || currentStation.hourlyRate)));

  if (isRebooting) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white p-6 font-mono text-center space-y-4 animate-fadeIn select-none">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-xl font-bold text-amber-400">🔄 ĐANG KHỞI ĐỘNG LẠI MÁY TRẠM (PXE BOOTROM)...</div>
        <p className="text-xs text-slate-400 max-w-md">Lệnh điều khiển từ Quầy Lễ Tân Server. Hệ thống đang giải phóng RAM và tải lại phiên máy trạm mới.</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans select-none">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950 to-black pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {activeBroadcast && (
          <div className="relative z-20 w-full mb-3 bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-700 text-white py-2 px-3 rounded-xl shadow-2xl overflow-hidden flex items-center border border-white/30 animate-fadeIn select-none">
            <span className="shrink-0 flex items-center gap-1.5 font-gaming font-black text-xs uppercase bg-black/50 px-2 py-0.5 rounded text-amber-300 mr-2 border border-amber-400/50">
              <span className="material-symbols-outlined text-sm animate-pulse">campaign</span>
              <span>LOA:</span>
            </span>
            <div className="flex-1 overflow-hidden whitespace-nowrap">
              <MarqueeTag scrollamount="7" className="text-xs font-mono font-bold tracking-wider">
                🔥 {activeBroadcast} &nbsp;&nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp;&nbsp; 🔥 {activeBroadcast}
              </MarqueeTag>
            </div>
            <button onClick={() => setActiveBroadcast(null)} className="ml-2 text-white/80 hover:text-white px-2 cursor-pointer font-bold">✕</button>
          </div>
        )}

        {kdsFoodNotice && (
          <div className="relative z-20 w-full mb-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 py-3 px-4 rounded-xl shadow-[0_0_35px_rgba(16,185,129,0.6)] flex items-center justify-between font-mono text-xs font-black animate-bounce border-2 border-white">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-2xl text-slate-950 animate-spin">soup_kitchen</span>
              <div>
                <span className="text-xs uppercase font-gaming block tracking-wide">
                  🔔 BẾP TRẠM KDS BÁO GIAO: ĐƠN #{kdsFoodNotice.orderNumber}
                </span>
                <span className="text-[11px] font-sans font-bold text-slate-950">
                  Món ăn của bạn đã làm xong và đang được bưng tới máy {kdsFoodNotice.pcName || currentStation.id}!
                </span>
              </div>
            </div>
            <button
              onClick={handleAcknowledgeFoodNotice}
              className="bg-slate-950 text-white px-3 py-1 rounded text-xs uppercase font-bold cursor-pointer"
            >
              ĐÃ NHẬN ✓
            </button>
          </div>
        )}

        {directAdminMessage && (
          <div className="relative z-20 w-full mb-3 bg-amber-400 text-slate-950 py-2.5 px-4 rounded-xl shadow-2xl flex items-center justify-between font-mono text-xs font-bold animate-bounce">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">sms</span>
              <span>💬 LỄ TÂN NHẮN RIÊNG: &quot;{directAdminMessage}&quot;</span>
            </span>
            <button onClick={() => setDirectAdminMessage(null)} className="bg-slate-950 text-white px-3 py-1 rounded-lg text-[10px] cursor-pointer font-bold">ĐÃ ĐỌC</button>
          </div>
        )}

        <div className="relative z-10 max-w-6xl mx-auto w-full flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-emerald-500/20">
              CZ
            </div>
            <div>
              <span className="font-gaming font-black text-xl text-white tracking-wider block">
                CYBER<span className="text-emerald-400">ZONE</span> CLIENT OS
              </span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase block -mt-0.5">
                SMART GAMING STATION • v2.6 PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 text-slate-300 hover:text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Toàn màn hình / Kiosk Demo"
            >
              <span className="material-symbols-outlined text-sm">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
              <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>
            <button
              onClick={() => setShowStationModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">sync_alt</span>
              <span>Đổi máy trạm: <strong>{currentStation.id}</strong></span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span> MÁY ĐANG KHÓA
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-[#070e22]/95 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-xl space-y-5">

            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/30">
                <span className="material-symbols-outlined text-3xl font-black">lock_open</span>
              </div>
              <h2 className="text-2xl font-black text-white font-gaming mt-2">
                ĐĂNG NHẬP MỞ MÁY {currentStation.id}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {currentStation.name} • Đơn giá: <strong className="text-emerald-400">{customRate.toLocaleString('vi-VN')}đ/h</strong>
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleClientLogin} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">TÊN TÀI KHOẢN HỘI VIÊN</label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Ví dụ: admin1 hoặc admin2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">MẬT KHẨU</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 transition font-gaming mt-2"
              >
                MỞ MÁY &amp; BẮT ĐẦU CHIẾN GAME &rarr;
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-mono cursor-pointer transition flex items-center justify-center gap-1 mx-auto"
              >
                <span>Chưa có tài khoản hội viên?</span>
                <strong className="text-emerald-400 font-bold">Đăng ký mới ngay &rarr;</strong>
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                <span>TÀI KHOẢN TRẢI NGHIỆM CÓ SẴN:</span>
                <span className="text-emerald-400">MK: 123</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin1', '123')}
                  className="py-2 px-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl transition text-[11px] font-mono flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>admin1 (200k)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin2', '123')}
                  className="py-2 px-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold rounded-xl transition text-[11px] font-mono flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span>admin2 (500k)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('gamer01', '123')}
                  className="py-2 px-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl transition text-[11px] font-mono flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[14px]">sports_esports</span>
                  <span>gamer01 (50k)</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Cấu hình:</span>
                <span className="text-white font-bold">{currentStation.cpu}</span>
              </div>
              <div className="flex justify-between">
                <span>Đồ họa:</span>
                <span className="text-emerald-400 font-bold">{currentStation.gpu}</span>
              </div>
              <div className="flex justify-between">
                <span>Màn hình:</span>
                <span className="text-cyan-400 font-bold">{currentStation.screen}</span>
              </div>
            </div>

          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 font-mono pt-4 border-t border-white/10">
          <span>Trạm máy: <strong className="text-slate-300">{currentStation.name}</strong> • IP: 192.168.1.{currentStation.id.replace(/\D/g, '') || '8'}</span>
          <span>Hotline hỗ trợ nạp thẻ tại quầy: <strong className="text-emerald-400">1900 8888</strong></span>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          defaultTab="register"
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            setLoginUsername(u.username);
            setLoginPassword('');
            setIsAuthModalOpen(false);
            setAlertSuccess(`Đã tạo thành công tài khoản "${u.username}"! Vui lòng nhập mật khẩu để mở máy.`);
            setTimeout(() => setAlertSuccess(null), 4000);
          }}
        />

        {showStationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-2xl">sync_alt</span>
                  <h3 className="font-gaming font-black text-xl text-white">CHỌN PHÒNG MÁY ĐỂ NGỒI</h3>
                </div>
                <button onClick={() => setShowStationModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 font-mono text-xs">
                {STATION_PRESETS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleChangeStation(p)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      currentStation.id === p.id
                        ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-950 border-white/10 hover:border-cyan-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-gaming font-black text-base text-white">{p.id}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        {p.badge}
                      </span>
                    </div>
                    <div className="text-slate-300 font-bold">{p.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{p.zone}</div>
                    <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                      <span className="text-emerald-400 font-black text-sm">{p.hourlyRate.toLocaleString('vi-VN')}đ/h</span>
                      <span className="text-[10px] text-cyan-400 font-bold">Chọn máy &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentStation.theme.bgGradient} text-slate-100 font-sans selection:bg-emerald-400 selection:text-black pb-16 transition-colors duration-700 relative`}>

      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 ${currentStation.theme.glowAura} rounded-full blur-3xl pointer-events-none opacity-30 transition-all duration-700`}></div>

      {activeBroadcast && (
        <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-700 text-white py-2 px-3 shadow-2xl z-50 overflow-hidden flex items-center border-b-2 border-white/30 animate-fadeIn select-none">
          <span className="shrink-0 flex items-center gap-1.5 font-gaming font-black text-xs uppercase bg-black/50 px-2.5 py-1 rounded text-amber-300 mr-2 border border-amber-400/50">
            <span className="material-symbols-outlined text-sm animate-pulse">campaign</span>
            <span>LOA PHÒNG MÁY:</span>
          </span>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <MarqueeTag scrollamount="7" className="text-xs font-mono font-bold tracking-wider">
              🔥 {activeBroadcast} &nbsp;&nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp;&nbsp; 🔥 {activeBroadcast}
            </MarqueeTag>
          </div>
          <button
            onClick={() => setActiveBroadcast(null)}
            className="ml-2 shrink-0 bg-black/40 hover:bg-black/70 text-white/90 hover:text-white px-2 py-0.5 rounded text-xs font-bold cursor-pointer transition"
            title="Đóng thông báo"
          >
            ✕
          </button>
        </div>
      )}

      {directAdminMessage && (
        <div className="bg-amber-400 text-slate-950 py-2.5 px-4 shadow-2xl flex items-center justify-between font-mono text-xs font-bold z-50 animate-bounce">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">sms</span>
              <span>💬 LỄ TÂN NHẮN RIÊNG: &quot;{directAdminMessage}&quot;</span>
            </span>
            <button
              onClick={() => setDirectAdminMessage(null)}
              className="bg-slate-950 text-white px-3 py-1 rounded-lg text-[10px] cursor-pointer"
            >
              ĐÃ ĐỌC ✓
            </button>
          </div>
        </div>
      )}

      {kdsFoodNotice && (
        <div className="bg-emerald-500 text-slate-950 py-3 px-4 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-between font-mono text-xs font-black z-50 animate-bounce border-b-2 border-white">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-2xl text-slate-950 animate-spin">soup_kitchen</span>
              <div>
                <span className="text-sm uppercase font-gaming block tracking-wide">
                  🔔 BẾP TRẠM KDS THÔNG BÁO: ĐƠN #{kdsFoodNotice.orderNumber}
                </span>
                <span className="text-[11px] font-sans font-bold text-slate-950">
                  Món của bạn đã chế biến xong, runner đang bưng tới máy {kdsFoodNotice.pcName}! Chúc bạn ngon miệng và chiến game vui vẻ!
                </span>
              </div>
            </div>
            <button
              onClick={handleAcknowledgeFoodNotice}
              className="bg-slate-950 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs uppercase cursor-pointer shadow font-mono font-bold"
            >
              ĐÃ NHẬN MÓN ✓
            </button>
          </div>
        </div>
      )}

      <div className={`bg-slate-950/80 backdrop-blur-md ${currentStation.theme.hudGlow} py-3 px-4 sticky top-0 z-40 transition-all duration-500`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${currentStation.theme.stationTagBg} flex items-center justify-center font-black font-gaming text-lg shadow-lg`}>
              {currentStation.id.slice(-2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-gaming font-black text-white text-base tracking-wide">
                  MÁY: <span className={currentStation.theme.accentText}>{currentStation.id}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ONLINE
                </span>

                <button
                  onClick={() => setShowStationModal(true)}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Bấm để đổi sang Arena, Bida, VIP, Couple hoặc Console"
                >
                  <span className="material-symbols-outlined text-[12px]">sync_alt</span>
                  <span>Đổi Phòng</span>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 font-mono">
                  Đơn giá: <strong className="text-emerald-400">{customRate.toLocaleString('vi-VN')}đ/h</strong>
                </span>
                <button
                  onClick={() => setShowRateModal(true)}
                  className="text-[10px] text-amber-400 hover:underline font-mono font-bold flex items-center gap-0.5"
                >
                  <span>[⚙️ Setup Giá]</span>
                </button>
              </div>
            </div>
          </div>

          
          <div className="flex items-center gap-1.5 font-mono">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
              title="Quay lại Cổng Khách Hàng (Trang Chủ)"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span className="hidden sm:inline">TRANG CHỦ</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowSystemSwitcher(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/60 hover:bg-emerald-400 hover:text-black text-emerald-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Chuyển đổi giữa 5 giao diện hệ thống CyberZone"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="material-symbols-outlined text-[16px]">dns</span>
              <span className="hidden sm:inline">HỆ THỐNG</span>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-2xl shadow-inner font-mono">
            <span className="material-symbols-outlined text-amber-400 text-[20px] animate-pulse">timer</span>
            <div className="text-center">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-sans font-bold">
                THỜI GIAN CÒN LẠI ({customRate.toLocaleString('vi-VN')}đ/H)
              </span>
              <span className="text-xl md:text-2xl font-black text-amber-300 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                {formatSecondsToHMS(remainingSeconds)}
              </span>
            </div>
            <button
              onClick={() => setShowTopupModal(true)}
              className="ml-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-[11px] rounded-lg transition uppercase font-sans tracking-wide cursor-pointer flex items-center gap-1 shadow-md transform hover:scale-105"
              title="Mở cổng nạp tiền trực tuyến tại máy và đồng bộ sang Trang Chủ"
            >
              <span className="material-symbols-outlined text-[15px]">add_card</span>
              <span>NẠP TIỀN</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/menu?seat=${currentStation.id}`}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition transform hover:scale-105 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
              <span>GỌI MÓN F&amp;B</span>
            </Link>

            <Link
              href="/games"
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activePlayingGame
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500 hover:bg-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/40'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${activePlayingGame ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>sports_esports</span>
              <span>{activePlayingGame ? `TRẬN: ${activePlayingGame}` : 'KHO GAME'}</span>
            </Link>

            <button
              onClick={toggleFullscreen}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer"
              title="Toàn màn hình / Kiosk Demo"
            >
              <span className="material-symbols-outlined text-[16px]">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
              <span className="hidden lg:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>

            <div className="text-right hidden xl:block font-mono">
              <div className="flex items-center justify-end gap-1.5 text-xs">
                <span className="text-white font-bold">{currentUser?.fullName || wallet.userName}</span>
                {(() => {
                  const t = getTierByName(currentUser?.userTier || wallet.userTier);
                  return (
                    <button
                      type="button"
                      onClick={() => setShowGamerPassModal(true)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${t.badgeClass} cursor-pointer hover:brightness-125 transition flex items-center gap-1`}
                      title="Bấm để xem đặc quyền Gamer Pass"
                    >
                      <span>{t.name}</span>
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </button>
                  );
                })()}
              </div>
              <div className="text-emerald-400 font-extrabold text-xs">
                Ví khả dụng: {liveBalance.toLocaleString('vi-VN')}đ
              </div>
            </div>

            <button
              onClick={() => setShowCallModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-rose-500/30 transition transform hover:scale-105 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              <span className="hidden md:inline">GỌI NHÂN VIÊN</span>
            </button>

            <button
              onClick={handleLockClient}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer"
              title="Khóa máy & Đăng xuất"
            >
              <span className="material-symbols-outlined text-[16px] text-rose-400">lock</span>
              <span className="hidden md:inline">Khóa Máy</span>
            </button>
          </div>

        </div>
      </div>

      {alertSuccess && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-xl animate-bounce">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              {alertSuccess}
            </span>
            <span className="text-[10px] text-slate-400">Hệ thống đồng bộ</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-8">

        {activePlayingGame && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-2 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.35)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-400">
                <span className="material-symbols-outlined text-[24px] animate-pulse">sports_esports</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 font-mono">
                    ĐANG TRONG TRẬN ĐẤU
                  </span>
                  <span className="text-white font-gaming font-black text-base">{activePlayingGame}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  Bạn đang có trận game đang chơi. Bấm nút bên phải để quay lại kho game và tiếp tục trận đấu!
                </div>
              </div>
            </div>
            <Link
              href="/games"
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase font-mono shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <span>VÀO LẠI TRẬN GAME</span>
              <span>&rarr;</span>
            </Link>
          </div>
        )}

        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-r from-[#0c1833] via-[#081224] to-[#040812] border border-white/10 shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              MÁY ĐÃ ĐĂNG NHẬP THÀNH CÔNG • SẴN SÀNG THI ĐẤU
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-gaming tracking-wide uppercase leading-tight">
              CHÀO MỪNG BẠN TỚI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                CYBER ZONE COMPLEX
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
              Dàn máy thi đấu cao cấp <strong className="text-emerald-400 font-bold">{currentStation.id}</strong> • Màn hình 240Hz Fast-IPS • Đơn giá: <strong className="text-amber-300 font-mono">{customRate.toLocaleString('vi-VN')}đ/h</strong>
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <Link
                href={`/menu?seat=${currentStation.id}`}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:brightness-110 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                <span>GỌI ĐỒ ĂN &amp; NƯỚC UỐNG TẬN MÁY</span>
              </Link>
              <Link
                href="/games"
                className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-white font-bold rounded-xl transition flex items-center gap-2 hover:border-cyan-400"
              >
                <span className="material-symbols-outlined text-[18px] text-cyan-400">sports_esports</span>
                <span>MỞ KHO 16 GAME BẢN QUYỀN</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#07132a] via-[#091834] to-[#07132a] border border-cyan-400/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] font-mono uppercase tracking-wider">
                  CỔNG NẠP TRỰC TUYẾN 24/7
                </span>
                <h3 className="text-lg font-black text-white font-gaming tracking-wide">
                  NẠP GIỜ CHƠI TỰ ĐỘNG &amp; NÂNG HẠNG GAMER PASS
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1">
                Đơn giá máy: <strong className="text-emerald-400 font-bold">{customRate.toLocaleString('vi-VN')}đ/h</strong> • Nạp tích lũy tự động cộng giờ chơi và thăng hạng tức thì.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStationModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs font-mono transition hover:border-cyan-400 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                <span>Chuyển Máy Trạm</span>
              </button>
              <button
                onClick={() => setShowRateModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-extrabold text-xs font-mono transition hover:border-amber-400 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Đơn Giá Giờ</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 font-mono text-xs">
            {COMBO_HOUR_PACKS.map((pack) => {
              const approxHours = (pack.amount / (customRate || currentStation.hourlyRate)).toFixed(1);
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => handleSelectComboPack(pack)}
                  className="p-4 rounded-2xl bg-[#091428]/95 border border-white/10 hover:border-amber-400 text-slate-200 hover:text-white transition-all flex flex-col justify-between cursor-pointer group shadow-xl hover:-translate-y-1 relative overflow-hidden text-left"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${pack.tagColor}`}>
                      {pack.tag}
                    </span>
                    <span className="material-symbols-outlined text-amber-400 text-lg group-hover:scale-125 transition-transform">
                      {pack.icon}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white font-gaming group-hover:text-amber-300 transition-colors">
                      {pack.name}
                    </h4>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      +{pack.amount.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-[11px] text-emerald-400 font-bold">
                      ~{approxHours}h máy {pack.bonusMinutes > 0 ? `(+${pack.bonusMinutes}p bonus)` : ''}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {pack.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-amber-400 group-hover:text-amber-300">
                    <span>Nạp Qua QR / Quầy</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <Link
            href={`/menu?seat=${currentStation.id}`}
            className="group p-5 rounded-2xl bg-[#070d1e]/90 border border-white/10 hover:border-emerald-500/60 transition-all shadow-xl hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl border border-emerald-500/30">
                  <span className="material-symbols-outlined text-[26px]">restaurant</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono text-[9px] font-bold uppercase">
                  BƯNG TẬN BÀN
                </span>
              </div>
              <h3 className="font-gaming font-black text-lg text-white group-hover:text-emerald-400 transition-colors">
                Thực Đơn Bếp F&amp;B
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Mì xào bò xúc xích, Cơm sườn trứng ốp la, Trà sữa trân châu, Sting dâu lạnh. Tự trừ ví và nhân viên mang tận nơi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs font-mono text-emerald-400 font-bold">
              <span>Mở Menu Gọi Món</span>
              <span>&rarr;</span>
            </div>
          </Link>

          <Link
            href="/games"
            className="group p-5 rounded-2xl bg-[#070d1e]/90 border border-white/10 hover:border-cyan-500/60 transition-all shadow-xl hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-2xl border border-cyan-500/30">
                  <span className="material-symbols-outlined text-[26px]">sports_esports</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-[9px] font-bold uppercase">
                  16 GAME READY
                </span>
              </div>
              <h3 className="font-gaming font-black text-lg text-white group-hover:text-cyan-400 transition-colors">
                Kho Game Bản Quyền
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Khởi động siêu tốc LMHT, Valorant, CS2, Black Myth Wukong, FC Online, PUBG. Bản quyền Steam &amp; Riot cài sẵn.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <span>Mở Launcher Game</span>
                <span>&rarr;</span>
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/menu?seat=${currentStation.id}`;
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                title="Gọi đồ ăn kèm khi chơi game"
              >
                <span className="material-symbols-outlined text-[12px]">restaurant_menu</span>
                <span>+ Đặt Món Ăn Kèm</span>
              </span>
            </div>
          </Link>

          <div
            onClick={() => setShowTopupModal(true)}
            className="group p-5 rounded-2xl bg-[#070d1e]/90 border border-white/10 hover:border-amber-500/60 transition-all shadow-xl hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/30">
                  <span className="material-symbols-outlined text-[26px]">account_balance_wallet</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[9px] font-bold uppercase">
                  TỰ ĐỘNG +100%
                </span>
              </div>
              <h3 className="font-gaming font-black text-lg text-white group-hover:text-amber-400 transition-colors">
                Nạp Tiền Trực Tuyến &amp; Ví
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Nạp tiền trực tiếp tại máy qua VietQR MB Bank. Tự động cộng giờ và đồng bộ sang tài khoản Cổng Trang Chủ.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs font-mono text-amber-400 font-bold">
              <span>Mở Cổng Nạp Tiền &rarr;</span>
              <span>💳</span>
            </div>
          </div>

          <div
            onClick={() => setShowCallModal(true)}
            className="group p-5 rounded-2xl bg-[#070d1e]/90 border border-white/10 hover:border-rose-500/60 transition-all shadow-xl hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-2xl border border-rose-500/30 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">notifications_active</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[9px] font-bold uppercase">
                  HỖ TRỢ 24/7
                </span>
              </div>
              <h3 className="font-gaming font-black text-lg text-white group-hover:text-rose-400 transition-colors">
                Gọi Nhân Viên Tận Máy
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Nhấn để yêu cầu mang ca đá, đổi tai nghe, kiểm tra mạng hoặc hỗ trợ nạp tiền mặt tại máy chỉ sau 60 giây.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs font-mono text-rose-400 font-bold">
              <span>Gửi Tín Hiệu Gọi</span>
              <span>🛎️</span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-7 bg-[#070d1e]/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">TELEMETRY PHÒNG MÁY</span>
                <h3 className="text-xl font-black text-white font-gaming mt-0.5">
                  Cấu Hình Máy {currentStation.id} ({currentStation.badge})
                </h3>
              </div>
              <button
                onClick={() => setShowStationModal(true)}
                className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold hover:bg-cyan-500/20 transition cursor-pointer"
              >
                Đổi phòng máy &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">VI XỬ LÝ (CPU)</span>
                <span className="font-bold text-white block">{currentStation.cpu}</span>
                <span className="text-[10px] text-emerald-400 block">Nhiệt độ: 48°C • Tải 24%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">CARD ĐỒ HỌA (GPU)</span>
                <span className="font-bold text-cyan-400 block">{currentStation.gpu}</span>
                <span className="text-[10px] text-slate-400 block">Driver: Game Ready 565.90</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">MÀN HÌNH / HIỂN THỊ</span>
                <span className="font-bold text-white block">{currentStation.screen}</span>
                <span className="text-[10px] text-emerald-400 block">Độ phản hồi 0.03ms G-Sync</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">GEAR &amp; GHẾ NGỒI</span>
                <span className="font-bold text-purple-400 block">{currentStation.gear}</span>
                <span className="text-[10px] text-slate-400 block">{currentStation.chair}</span>
              </div>
            </div>
          </div>

          {(() => {
            const currentTier = getTierByName(currentUser?.userTier || wallet.userTier);
            const cumulative = getCumulativeTopupAmount(wallet);
            const progression = calculateTierProgression(cumulative);
            return (
              <div className={`lg:col-span-5 bg-gradient-to-br from-[#0c1730] to-[#060b18] border ${currentTier.borderColor} rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden`}>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <span className={`text-xs font-mono font-bold uppercase ${currentTier.textColor}`}>
                      THẺ GAMER PASS HỘI VIÊN
                    </span>
                    <h3 className="text-xl font-black text-white font-gaming mt-0.5">
                      {currentTier.name}
                    </h3>
                  </div>
                  <span className={`w-10 h-10 rounded-2xl ${currentTier.accentBg} ${currentTier.textColor} border ${currentTier.borderColor} flex items-center justify-center font-bold text-lg shadow-lg`}>
                    <span className="material-symbols-outlined">{currentTier.icon}</span>
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Đặc quyền giờ chơi:</span>
                    <span className="text-emerald-400 font-bold">
                      {currentTier.playDiscountPercent > 0 ? `Giảm ${currentTier.playDiscountPercent}% toàn bộ máy` : 'Giá niêm yết chuẩn'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Đặc quyền menu Bếp F&amp;B:</span>
                    <span className="text-cyan-400 font-bold">
                      {currentTier.fnbDiscountPercent > 0 ? `Giảm ${currentTier.fnbDiscountPercent}% toàn menu Bếp` : 'Giá niêm yết chuẩn'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Thời gian giữ máy trước:</span>
                    <span className="text-amber-400 font-bold">
                      {currentTier.reserveDurationMinutes >= 999 ? 'Ưu tiên tuyệt đối' : `${currentTier.reserveDurationMinutes} phút`}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">
                        {progression.isMaxTier ? 'Cấp độ hội viên:' : `Tiến trình lên ${progression.nextTier?.shortName}:`}
                      </span>
                      <span className="text-white font-bold">
                        {progression.isMaxTier
                          ? '100% (ĐỈNH CAO VIP)'
                          : `${progression.progressPercent}% (Cần +${progression.neededAmount.toLocaleString('vi-VN')}đ)`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${progression.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setShowGamerPassModal(true)}
                    className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs font-mono text-center transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">badge</span>
                    <span>Xem Đặc Quyền</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (progression.isMaxTier) {
                        setShowGamerPassModal(true);
                      } else {
                        handleOpenRankTopup(progression.neededAmount, progression.nextTier?.name || 'Hạng Kế Tiếp');
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl ${
                      progression.isMaxTier
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-extrabold'
                    } text-xs font-mono text-center transition tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-1`}
                  >
                    <span className="material-symbols-outlined text-sm">upgrade</span>
                    <span>{progression.isMaxTier ? 'Kim Cương Max' : 'Nạp Lên Hạng'}</span>
                  </button>
                </div>
              </div>
            );
          })()}

        </div>

      </div>

      {showStationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-2xl">sync_alt</span>
                <div>
                  <h3 className="font-gaming font-black text-xl text-white">CHUYỂN ĐỔI PHÒNG MÁY</h3>
                  <span className="text-xs text-slate-400 font-mono">Thời gian chơi sẽ tự động tính lại theo đơn giá phòng mới!</span>
                </div>
              </div>
              <button onClick={() => setShowStationModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 font-mono text-xs">
              {STATION_PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleChangeStation(p)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    currentStation.id === p.id
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                      : 'bg-slate-950 border-white/10 hover:border-cyan-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-gaming font-black text-base text-white">{p.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${p.theme.stationTagBg}`}>
                      {p.theme.badgeText}
                    </span>
                  </div>
                  <div className="text-slate-200 font-bold">{p.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{p.zone}</div>

                  <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className="text-emerald-400 font-black text-sm">{p.hourlyRate.toLocaleString('vi-VN')}đ/h</span>
                    <span className="text-[10px] text-cyan-300 font-bold">
                      {currentStation.id === p.id ? 'Đang ngồi' : 'Chuyển máy →'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-2xl">tune</span>
                <h3 className="font-gaming font-black text-xl text-white">SETUP GIÁ TIỀN GIỜ CHƠI</h3>
              </div>
              <button onClick={() => setShowRateModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveCustomRate} className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Máy trạm đang áp dụng:</span>
                <strong className="text-emerald-400 text-sm">{currentStation.id} ({currentStation.name})</strong>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">NHẬP ĐƠN GIÁ GIỜ MỚI (VNĐ / GIỜ):</label>
                <input
                  type="number"
                  step="1000"
                  min="1000"
                  value={newRateInput}
                  onChange={(e) => setNewRateInput(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-3 text-emerald-400 font-black text-base focus:border-amber-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[15000, 20000, 25000, 30000, 40000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewRateInput(String(preset))}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-white/5"
                  >
                    {preset / 1000}k/h
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400">
                Khi đổi giá, thời gian chơi còn lại sẽ được tính lại tức thì:
                <div className="text-cyan-300 font-bold mt-1">
                  Thời gian mới = {liveBalance.toLocaleString('vi-VN')}đ / {parseInt(newRateInput || '0').toLocaleString('vi-VN')}đ/h
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg transition"
                >
                  ÁP DỤNG ĐƠN GIÁ NÀY
                </button>
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 font-sans">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-black">
                  <span className="material-symbols-outlined text-2xl">add_card</span>
                </div>
                <div>
                  <h3 className="font-gaming font-black text-lg text-white">NẠP TIỀN &amp; CỘNG GIỜ MÁY TRẠM</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Máy: <strong className="text-amber-400">{currentStation.id}</strong> • Khách: <strong className="text-white">{currentUser?.fullName || wallet.userName}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTopupModal(false);
                  setSelectedCombo(null);
                  setTopupContextTitle(null);
                }}
                className="text-slate-400 hover:text-white text-lg w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            
            {topupContextTitle && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-start gap-2.5 font-mono text-xs">
                <span className="material-symbols-outlined text-amber-400 text-xl shrink-0 mt-0.5">verified</span>
                <div className="space-y-1">
                  <div className="text-amber-300 font-black uppercase text-[11px] tracking-wide">
                    {topupContextTitle}
                  </div>
                  <div className="text-[10px] text-slate-300 leading-relaxed">
                    {selectedCombo ? (
                      <span>{selectedCombo.desc} • <strong className="text-emerald-400">{selectedCombo.bonusText}</strong></span>
                    ) : (
                      <span>Nạp tiền tích lũy thực tế vào tài khoản: Tự động cộng giờ chơi vào máy và nâng hạng thẻ Gamer Pass theo hạn mức!</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-emerald-500/30">
                <span className="text-[10px] text-slate-400 block mb-0.5">Số Dư Hiện Tại:</span>
                <span className="text-lg font-black text-emerald-400">
                  {liveBalance.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 block mb-0.5">Thời Gian Còn Lại:</span>
                <span className="text-lg font-black text-cyan-400">
                  {formatSecondsToHMS(remainingSeconds)}
                </span>
              </div>
            </div>

            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-bold">Chọn Mức Tiền / Combo Nạp:</span>
                <span className="text-emerald-400 text-[10px]">Đơn giá: {(customRate || currentStation.hourlyRate).toLocaleString('vi-VN')}đ/h</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono">
                {['20000', '50000', '100000', '200000', '500000', '1500000'].map((amt) => {
                  const num = parseInt(amt, 10);
                  const isSel = topupAmountInput === amt;
                  const addSecs = Math.floor((num / (customRate || currentStation.hourlyRate)) * 3600);
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setTopupAmountInput(amt);
                        const matchedCombo = COMBO_HOUR_PACKS.find((p) => p.amount === num);
                        if (matchedCombo) {
                          setSelectedCombo(matchedCombo);
                          setTopupContextTitle(`ĐẶT MUA ${matchedCombo.name.toUpperCase()} (+${num.toLocaleString('vi-VN')}Đ)`);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        isSel
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-black text-xs">+{num.toLocaleString('vi-VN')}đ</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">+{formatSecondsToHMS(addSecs)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            
            <div className="space-y-1 font-mono text-xs">
              <label className="text-slate-400 text-[11px] block">Hoặc nhập số tiền khác (VNĐ):</label>
              <input
                type="number"
                step="10000"
                min="10000"
                value={topupAmountInput}
                onChange={(e) => setTopupAmountInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-base font-bold focus:border-amber-400 outline-none"
                placeholder="Nhập số tiền..."
              />
            </div>

            
            {topupErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>{topupErrorMsg}</span>
              </div>
            )}

            
            <div className="space-y-2">
              <span className="text-white font-bold text-xs font-mono block">Hình Thức Thanh Toán:</span>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setTopupPaymentMode('VIETQR')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                    topupPaymentMode === 'VIETQR'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                  <span className="font-bold text-[11px]">Quét Mã VietQR</span>
                  <span className="text-[10px] text-amber-400">Tự động cộng ví &amp; giờ chơi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTopupPaymentMode('CASH')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                    topupPaymentMode === 'CASH'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md ring-1 ring-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">payments</span>
                  <span className="font-bold text-[11px]">Tiền Mặt / Thẻ Tại Máy</span>
                  <span className="text-[10px] text-emerald-400">Nhân viên thu tại bàn</span>
                </button>
              </div>
            </div>

            {topupPaymentMode === 'VIETQR' ? (
              (() => {
                const currentNum = Math.max(10000, parseInt(topupAmountInput || '50000', 10) || 50000);
                const qrUrl = `https://api.vietqr.io/image/970422-0988888888-HjXq5pM.jpg?accountName=CYBER%20ZONE%20GAMING%20LOUNGE&amount=${currentNum}&addInfo=NAP%20${currentStation.id}%20${encodeURIComponent(currentUser?.username || 'khach')}`;
                return (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center gap-3 font-mono text-xs">
                    <img
                      src={qrUrl}
                      alt="VietQR"
                      className="w-20 h-20 rounded-xl object-contain bg-white p-1 shrink-0"
                    />
                    <div className="text-[11px] space-y-0.5 text-slate-300">
                      <div className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                        <span>MB BANK • QUÉT MÃ KÍCH HOẠT GIỜ CHƠI</span>
                      </div>
                      <div>STK: <strong className="text-white">0988888888</strong> (CYBER ZONE)</div>
                      <div className="text-slate-400">
                        Số tiền thanh toán: <strong className="text-emerald-400 font-bold">{currentNum.toLocaleString('vi-VN')}đ</strong>
                      </div>
                      <div className="text-slate-400">
                        Nội dung: <strong className="text-amber-400">NAP {currentStation.id} {currentUser?.username || 'khach'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs font-mono text-slate-300 space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Số dư tài khoản hiện tại:</span>
                  <span className="text-white font-bold">{liveBalance.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Số tiền nạp thêm vào ví:</span>
                  <span className="text-emerald-400 font-bold">+{parseInt(topupAmountInput || '0', 10).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/10 text-cyan-400 font-bold">
                  <span>Số dư mới sau khi nạp:</span>
                  <span>{(liveBalance + parseInt(topupAmountInput || '0', 10)).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-1 font-mono">
              <button
                type="button"
                onClick={() => handleConfirmTopupOnClient(parseInt(topupAmountInput || '0', 10))}
                className={`w-full py-3.5 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer font-gaming flex items-center justify-center gap-2 ${
                  topupPaymentMode === 'CASH'
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 shadow-amber-500/25'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {topupPaymentMode === 'CASH' ? 'payments' : 'qr_code_scanner'}
                </span>
                <span>
                  {selectedCombo && selectedCombo.amount === parseInt(topupAmountInput || '0', 10)
                    ? `XÁC NHẬN NẠP ${selectedCombo.name.toUpperCase()} (+${parseInt(topupAmountInput || '0', 10).toLocaleString('vi-VN')}Đ VÀO MÁY)`
                    : `XÁC NHẬN NẠP +${parseInt(topupAmountInput || '0', 10).toLocaleString('vi-VN')}Đ CỘNG GIỜ CHƠI VÀO MÁY`}
                </span>
              </button>

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                <Link
                  href="/auth"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>🌐 Mở Cổng Ví &amp; Gamer Pass (/auth)</span>
                  <span>&rarr;</span>
                </Link>
                <span>Hỗ trợ: 1900 8888</span>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showSystemSwitcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="font-gaming font-black text-lg text-white">CHUYỂN ĐỔI 5 PHÂN HỆ HỆ THỐNG</h3>
              </div>
              <button
                onClick={() => setShowSystemSwitcher(false)}
                className="text-slate-400 hover:text-white text-lg w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {[
                { href: '/', label: '1. Cổng Khách Hàng (Trang Chủ)', icon: 'public', desc: 'Đặt chỗ trước, bảng giá gói hội viên, showroom gear' },
                { href: '/client-pc', label: `2. Khách Ngồi Tại Máy (${currentStation.id})`, icon: 'desktop_windows', desc: 'Giao diện máy trạm đang sử dụng tại phòng game', isCurrent: true },
                { href: '/server', label: '3. Máy Chủ Phòng Máy (Server Tổng)', icon: 'dns', desc: 'Quản trị 42 máy trạm, đổi giá, khóa máy, nạp tiền' },
                { href: '/kds', label: '4. Màn Hình Bếp (KDS)', icon: 'soup_kitchen', desc: 'Màn hình chế biến món ăn & đồ uống Bếp F&B' },
                { href: '/dashboard', label: '5. Quản Lý Doanh Thu', icon: 'monitoring', desc: 'Báo cáo doanh thu tiền giờ & F&B theo thời gian thực' },
              ].map((sys) => (
                <Link
                  key={sys.href}
                  href={sys.href}
                  onClick={() => setShowSystemSwitcher(false)}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    sys.isCurrent
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-emerald-400">{sys.icon}</span>
                    <div>
                      <div className="font-bold text-white text-sm" suppressHydrationWarning>{sys.label}</div>
                      <div className="text-[10px] text-slate-400">{sys.desc}</div>
                    </div>
                  </div>
                  {sys.isCurrent ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-400 text-black font-black text-[10px]">ĐANG XEM</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">&rarr;</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">GỌI NHÂN VIÊN PHÒNG MÁY</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Gửi tín hiệu từ máy {currentStation.id} tới quầy</span>
                </div>
              </div>
              <button
                onClick={() => setShowCallModal(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <span className="text-slate-400 block text-[11px]">Chọn nhanh yêu cầu hỗ trợ:</span>
              {[
                'Mang thêm 1 ca đá lạnh',
                'Hỗ trợ nạp tiền mặt tại máy',
                'Kiểm tra lại tai nghe / mic thoại',
                'Nhờ nhân viên vệ sinh lại bàn phím',
                'Hỗ trợ kỹ thuật phần mềm / game lag',
              ].map((reason, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCallStaff(reason)}
                  className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 border border-white/5 text-left text-slate-200 hover:text-rose-300 transition flex items-center justify-between cursor-pointer"
                >
                  <span>{reason}</span>
                  <span className="text-[10px] text-rose-400">&rarr;</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <label className="text-[11px] text-slate-300 font-mono font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-rose-400">edit_note</span>
                <span>Hoặc tự nhập yêu cầu riêng của bạn:</span>
              </label>
              <textarea
                rows={2}
                value={customStaffNote}
                onChange={(e) => setCustomStaffNote(e.target.value)}
                placeholder="Ví dụ: Cho mượn củ sạc Type-C, tăng nhiệt độ điều hòa, xin thêm giấy ăn..."
                className="w-full bg-slate-950 border border-rose-500/40 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none resize-none font-sans"
              />
              <button
                type="button"
                disabled={!customStaffNote.trim()}
                onClick={() => {
                  if (customStaffNote.trim()) {
                    handleCallStaff(customStaffNote.trim());
                    setCustomStaffNote('');
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition ${
                  customStaffNote.trim()
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white shadow-lg shadow-rose-500/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>GỬI YÊU CẦU NÀY TỚI LỄ TÂN &rarr;</span>
              </button>
            </div>

            <button
              onClick={() => setShowCallModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono font-bold transition"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {showGamerPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-[#090f20] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-sans text-slate-100 max-h-[92vh] overflow-y-auto">

            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-amber-400 text-black flex items-center justify-center font-black text-xl shadow-lg">
                  CZ
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-gaming tracking-wide">
                    HỆ THỐNG GAMER PASS &amp; ĐẶC QUYỀN HỘI VIÊN
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Tích lũy nạp tiền tự động mở khóa các cấp bậc hội viên và siêu ưu đãi giảm giá
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGamerPassModal(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {(() => {
              const currentTier = getTierByName(currentUser?.userTier || wallet.userTier);
              const cumulative = getCumulativeTopupAmount(wallet);
              const progression = calculateTierProgression(cumulative);
              return (
                <div className="p-4 rounded-2xl bg-[#060a16] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 font-mono shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${currentTier.accentBg} ${currentTier.textColor} border ${currentTier.borderColor} flex items-center justify-center text-2xl`}>
                      <span className="material-symbols-outlined">{currentTier.icon}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Hạng hội viên hiện tại:</span>
                      <h4 className="text-lg font-black text-white flex items-center gap-2">
                        <span>{currentTier.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${currentTier.badgeClass}`}>
                          {currentTier.shortName}
                        </span>
                      </h4>
                      <span className="text-xs text-emerald-400">
                        Số dư khả dụng: {wallet.balance.toLocaleString('vi-VN')}đ • Tích lũy nạp: {cumulative.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        {progression.isMaxTier ? 'Cấp độ hội viên:' : `Lên ${progression.nextTier?.name}:`}
                      </span>
                      <span className="text-white font-bold">
                        {progression.isMaxTier ? 'HẠNG TỐI ĐA (MAX)' : `${progression.progressPercent}%`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400"
                        style={{ width: `${progression.progressPercent}%` }}
                      ></div>
                    </div>
                    {!progression.isMaxTier && (
                      <span className="text-[10px] text-amber-300 block text-right font-bold">
                        Cần nạp thêm +{progression.neededAmount.toLocaleString('vi-VN')}đ để thăng hạng
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {TIERS_ORDER.map((tierKey) => {
                const tier = GAMER_PASS_TIERS[tierKey];
                const activeTier = getTierByName(currentUser?.userTier || wallet.userTier);
                const isCurrent = activeTier.code === tierKey;
                return (
                  <div
                    key={tierKey}
                    className={`rounded-2xl p-4 flex flex-col justify-between border transition-all ${
                      isCurrent
                        ? `bg-slate-800/90 ${tier.borderColor} ring-2 ring-emerald-400/60 shadow-xl shadow-emerald-500/10`
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${tier.badgeClass}`}>
                          {tier.shortName}
                        </span>
                        <span className="material-symbols-outlined text-base text-slate-400">{tier.icon}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mb-1">{tier.name}</h4>
                      <p className="text-[11px] text-slate-400 mb-3 font-mono">{tier.tagline}</p>

                      <div className="space-y-1.5 border-t border-white/10 pt-3 text-xs font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span>Giảm giờ chơi:</span>
                          <span className="font-bold text-emerald-400">
                            {tier.playDiscountPercent > 0 ? `-${tier.playDiscountPercent}%` : 'Chuẩn'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Giảm món ăn Bếp:</span>
                          <span className="font-bold text-cyan-400">
                            {tier.fnbDiscountPercent > 0 ? `-${tier.fnbDiscountPercent}%` : 'Chuẩn'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Giữ máy trước:</span>
                          <span className="font-bold text-amber-400">
                            {tier.reserveDurationMinutes >= 999 ? 'Ưu tiên tối đa' : `${tier.reserveDurationMinutes}p`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-[11px] text-slate-300">
                        {tier.perks.map((p, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      {isCurrent ? (
                        <div className="py-2 text-center text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                          ✓ HẠNG HIỆN TẠI CỦA BẠN
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowGamerPassModal(false);
                            const cumulative = getCumulativeTopupAmount(wallet);
                            const needed = Math.max(20000, tier.minAmount - cumulative);
                            handleOpenRankTopup(needed, tier.name);
                          }}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/30 hover:from-amber-500/30 hover:to-amber-500/40 text-amber-300 border border-amber-500/50 font-bold text-xs font-mono transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[15px]">add_card</span>
                          <span>Nạp Mốc {(tier.minAmount || 50000).toLocaleString('vi-VN')}đ &rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-amber-500/30 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">bolt</span>
                  <span className="text-xs font-bold text-white uppercase">
                    CÁC MỐC NẠP TIỀN ĐẠT CHUẨN GAMER PASS (QUÉT MÃ VIETQR)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Mở cổng nạp &amp; quét mã VietQR tự động cộng giờ</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGamerPassModal(false);
                    handleOpenRankTopup(200000, 'HỘI VIÊN BẠC 🥈');
                  }}
                  className="py-2.5 px-3 bg-slate-700/70 hover:bg-slate-600 text-slate-200 border border-slate-500 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-slate-300">military_tech</span>
                  <span>Nạp Mốc 200k (Lên BẠC)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGamerPassModal(false);
                    handleOpenRankTopup(500000, 'HỘI VIÊN VÀNG ⭐');
                  }}
                  className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-amber-400">star</span>
                  <span>Nạp Mốc 500k (Lên VÀNG)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGamerPassModal(false);
                    handleOpenRankTopup(1500000, 'HỘI VIÊN KIM CƯƠNG 💎');
                  }}
                  className="py-2.5 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-purple-400">diamond</span>
                  <span>Nạp Mốc 1.5M (KIM CƯƠNG)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {showUpgradeSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-gradient-to-b from-[#132347] to-[#070d1e] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
              <span className="material-symbols-outlined text-4xl">military_tech</span>
            </div>

            <div>
              <span className="text-xs font-mono text-amber-400 font-extrabold uppercase tracking-widest">
                🎉 CHÚC MỪNG BẠN ĐÃ THĂNG HẠNG!
              </span>
              <h3 className="text-2xl font-black text-white font-gaming mt-1">
                {newUpgradedTierName}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Hệ thống Cyber Zone đã tự động kích hoạt toàn bộ các quyền lợi ưu đãi mới nhất cho tài khoản của bạn!
            </p>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-left space-y-1.5 text-xs font-mono text-emerald-300">
              {upgradePerks.slice(0, 3).map((perk, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-400">★</span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowUpgradeSuccessModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-extrabold text-xs uppercase font-gaming tracking-wider shadow-lg cursor-pointer"
            >
              TIẾP TỤC TRẢI NGHIỆM MÁY
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#080d19]/95 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-white/10 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-bold">{currentStation.id}</span>
          <span className="text-amber-400 font-mono font-black">{formatSecondsToHMS(remainingSeconds)}</span>
        </div>
        <Link
          href={`/menu?seat=${currentStation.id}`}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
          <span>ĐẶT MÓN F&amp;B</span>
        </Link>
        <Link
          href="/games"
          className={`px-3.5 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
            activePlayingGame
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(244,63,94,0.4)]'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
        >
          <span className={`material-symbols-outlined text-[16px] ${activePlayingGame ? 'text-slate-950' : 'text-cyan-400'}`}>sports_esports</span>
          <span>{activePlayingGame ? `VÀO LẠI: ${activePlayingGame} \u2192` : 'KHO GAME'}</span>
        </Link>
        <button
          onClick={() => setShowCallModal(true)}
          className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">support_agent</span>
          <span className="hidden sm:inline">GỌI NHÂN VIÊN</span>
        </button>
      </div>

      </div>
  );
}