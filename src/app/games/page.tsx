'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getStoredWallet, WALLET_EVENT_NAME, UserWallet, INITIAL_WALLET } from '@/lib/walletStore';
import { createStaffRequest } from '@/lib/staffRequestStore';

interface GameItem {
  id: string;
  name: string;
  platform: 'steam' | 'riot' | 'garena' | 'other';
  platformLabel: string;
  badge?: string;
  image: string;
  categories: string[];
}

const GAMES_LIST: GameItem[] = [
  {
    id: 'game-1',
    name: 'Black Myth: Wukong',
    platform: 'steam',
    platformLabel: 'STEAM',
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80',
    categories: ['rpg', 'aaa'],
  },
  {
    id: 'game-2',
    name: 'LMHT (LoL)',
    platform: 'riot',
    platformLabel: 'RIOT/VNG',
    badge: 'TOP 1',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80',
    categories: ['esports', 'moba'],
  },
  {
    id: 'game-3',
    name: 'Valorant',
    platform: 'riot',
    platformLabel: 'RIOT',
    badge: '240Hz',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80',
    categories: ['esports', 'fps'],
  },
  {
    id: 'game-4',
    name: 'Counter-Strike 2',
    platform: 'steam',
    platformLabel: 'STEAM',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=700&q=80',
    categories: ['esports', 'fps'],
  },
  {
    id: 'game-5',
    name: 'FC Online (FO4)',
    platform: 'garena',
    platformLabel: 'GARENA',
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=80',
    categories: ['esports'],
  },
  {
    id: 'game-6',
    name: 'PUBG: BATTLEGROUNDS',
    platform: 'steam',
    platformLabel: 'STEAM',
    badge: 'ULTRA',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=700&q=80',
    categories: ['esports', 'fps', 'battle-royale'],
  },
  {
    id: 'game-7',
    name: 'GTA V (FiveM)',
    platform: 'other',
    platformLabel: 'FIVEM',
    badge: 'ROLEPLAY',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    categories: ['rpg', 'roleplay'],
  },
  {
    id: 'game-8',
    name: 'Naraka: Bladepoint',
    platform: 'steam',
    platformLabel: 'STEAM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsDYn0smoOe8mf1DYibfNT-kGM4dpBo5Uh5CzoVIaCacjUtEwHrkXy2whZ7ff1_hNl2D9k7aZH8Us-bzcmGSNJd9D8zLFcdxZgY4mUEsL7Yx1hEUzW3gaFHqH972kHTxS4VFv5wiNIhY5q_eT_ivDEG5CBfIeHUkeuiS-22LqSQdhRvTm6swF6MkJR1d3vhNFebYWMCUwh7waAvok2y63hp8Dkf6mqO2MnDOadJlKZUi2riSQprt3r',
    categories: ['battle-royale'],
  },
  {
    id: 'game-9',
    name: 'Genshin Impact',
    platform: 'other',
    platformLabel: 'HOYOVERSE',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF5NVEgwKqofL1rjLsN8xVd1Pz7r5M70gGEZSej2wKArUmWPm0w5lrSP6coKhPsi3mpoXRhpcCmkbOzy1qFtVQGN5y5SlMhSt6SUYv1KU0Tt50migDcAhR762zMdLZN7fr3RdIkxI9RT7vPNmqpVOvbm1Xnhd0SYL5C_Crcq6m5kNN3vUqLBudQJ_LK-f1q7xxG4BCXNrmH5kmAjUwfzBoN1bvUF9InIUFQh5U9airgN3cUsM9-EYM',
    categories: ['rpg'],
  },
  {
    id: 'game-10',
    name: 'Dota 2',
    platform: 'steam',
    platformLabel: 'STEAM',
    badge: 'TI PRO',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2B7pB8BaB6wwIvtqY2x6cMGEhh1fOLIHdbeWJHw1AHPc10_dNDlz6B1Jbq0W2w3JHlpi8E3QCmGMmF-o0fhTQBTOVg5hspeGmeugKlpi_7KI8fIQQ8-5wjCDeHK-pNwvUyHxwocZXb22EFBTHIdBwGfMsUszbwTt5PkIQaW2A_n1EwJDIbvuOG6LObp3d8VuKgKgThJY_aKf6_eE1Core_yhbWz2O6SiVZ7JmAA6umJRHGshK3aXQ',
    categories: ['esports', 'moba'],
  },
  {
    id: 'game-11',
    name: 'Apex Legends',
    platform: 'steam',
    platformLabel: 'STEAM/EA',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5NSqeBIqL6zMcsL4sYFfHjpgvJHcYVhiHqrnA4W0IaylyUe_JXraUGsEs84p8baio9QfXNn4n0ne9NKyGKK_gKxMznIP4ZbsOec13GSl1ad0HFgI1NxFdhLn3NUFdQ-qsYPi1MfbkBjEZFY8HMXVyEbs6hLUESyuM42hMQOUiV4WuVce4WBL9BZQNOzmqruIrR8uMzCyJI5wHfDQAozMRbX3biAI5qbJftse8cHUD9x5NqkXPE_JZ',
    categories: ['fps', 'battle-royale'],
  },
  {
    id: 'game-12',
    name: 'Đấu Trường Chân Lý',
    platform: 'riot',
    platformLabel: 'RIOT',
    badge: 'MÙA MỚI',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh6LZ9Jev80VpQIlCS5ZitMbsets5WKSJc7ox3VEEfxO1wi-vgVN-qwreUoGdkM5tkR8NqqsltXdcadR5c2ed8Tz-27XgP-ygac7MO4IRZVNOimLRZMvDTv6Z2aTilxcv2lvQI1Nr13uC2aVHQUSfK7FsemDfbQfTEJbMqyiI2mchC_if_aMqG6u3hRts8BmkiN6ARW3PR3pPLZU33sF8_R-DQIrPbCbmWrRRdYfUpFl9824-IwKc7',
    categories: ['moba'],
  },
  {
    id: 'game-13',
    name: 'COD: Warzone',
    platform: 'other',
    platformLabel: 'BATTLE.NET',
    badge: 'DLSS 3',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAySgVQBb4592kcYkP0dNA77bWB-eiHZdNs7WcaB0F4Lrg24FNB3qRs_Wp2M5qKV-nUvPiZa52FWRCxJTq3mzIwJZpRYOElgunG3yUfxm9Kb5IEZDRZSV-Mdjf4QFX1Qrp6Eg6p2-1_tincxBPH9yidQUAMKXQ4kBK3RXnUfRkq72RU8F686uaQo9_G3yjARaQxzcB1eTKRJs6X3O_4zm29P0Ua544jDoJIGKxCKlJllYCjyON80dwx',
    categories: ['fps', 'battle-royale'],
  },
  {
    id: 'game-14',
    name: 'Elden Ring',
    platform: 'steam',
    platformLabel: 'STEAM',
    badge: 'DLC OUT',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz9vx5H_6fggvwQ4dchScj7K_Zlr5CV3owN9FDub4sKfnXznBs4dj0TagegXlsGqmizq0gbCa4SCImTY2rtM23DXalfM88ZU1e6FnXoyjH_NL3cLIjyHKuQqlZpPrrp-AAqiXyos5DU9ayaWjI6B8tmW-LuEKILB6N2M69J-wqL00ezvklyLIfVOjiieOcT6uf8MQjOMuTO-qk_4AXR5UqcQDNpaNLK553eKzzCTsK__CZ60OgsQXv',
    categories: ['rpg', 'aaa'],
  },
  {
    id: 'game-15',
    name: 'Honkai: Star Rail',
    platform: 'other',
    platformLabel: 'HOYOVERSE',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBTAwyaok-FQ3cobHnjQQlPP1uuaD_2UB1Xvt_PVPrSiiqK134WFTebxjQl6z610XyxxpmIOfNgfsXpEJvHkX_5VNL8unuFsPqTua1v8eoCwQakTdxxNzUGV2aP1eaeF8p4rc_kiUB7OBfugZAhZAfxJBHwjCBKTZDd2RKImjvDSTHd9T-5KLynUTNCV6pxMtFzXWPe60mGBTRKqZgyW8LAfD9NO9a7rtTs1vwoSVpPgLeLPOa1kwT',
    categories: ['rpg'],
  },
  {
    id: 'game-16',
    name: 'Overwatch 2',
    platform: 'other',
    platformLabel: 'BATTLE.NET',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu4-oMrXKiyYy-uuWtlJ0x7LHzryaxAIcvUELqpNpZ0HcKxYjTIDq6xI2mYN-thddcrHWnVt5id3xsJA0KOdl2WscTPbcl-yhAmMAY8aK34xc4Rv8zCjQn45dp8tJ2GxHXxgd0KOVL-Hlf9b-I9lXpvwNyO6_k_ObI1690lFz3ckEGZpouWRrN0ZkNWhmvFzGYu3OSklK54TBxg3mccNiEDnNBytI-pKQFK7IEE8DySFjWbtbPImvh',
    categories: ['fps', 'esports'],
  },
];

export default function GameMenuPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [launchingGame, setLaunchingGame] = useState<string | null>(null);
  const [activePlayingGame, setActivePlayingGame] = useState<string | null>(null);
  const [inGameSeconds, setInGameSeconds] = useState(0);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchStatus, setLaunchStatus] = useState('ĐANG KẾT NỐI SERVER...');
  const [ramOptimized, setRamOptimized] = useState(false);
  const [ramUsageGb, setRamUsageGb] = useState('14.8GB / 32GB');
  const [wallet, setWallet] = useState<UserWallet>(INITIAL_WALLET);
  const [serviceAlert, setServiceAlert] = useState<string | null>(null);

  useEffect(() => {
    setWallet(getStoredWallet());
    if (typeof window !== 'undefined' && localStorage.getItem('CYBER_RAM_OPTIMIZED') === 'true') {
      setRamUsageGb('8.2GB / 32GB');
    }
    const handleWalletUpdate = () => {
      setWallet(getStoredWallet());
    };
    window.addEventListener(WALLET_EVENT_NAME, handleWalletUpdate);
    window.addEventListener('storage', handleWalletUpdate);
    return () => {
      window.removeEventListener(WALLET_EVENT_NAME, handleWalletUpdate);
      window.removeEventListener('storage', handleWalletUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('CYBER_ACTIVE_PLAYING_GAME');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.gameName) {
            setActivePlayingGame(parsed.gameName);
            const now = Date.now();
            const start = typeof parsed.startTime === 'number' ? parsed.startTime : now;
            const elapsed = Math.max(0, Math.floor((now - start) / 1000));
            setInGameSeconds(elapsed);
          }
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activePlayingGame) {
      interval = setInterval(() => {
        setInGameSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setInGameSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activePlayingGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        const input = document.getElementById('gameSearchInputReal');
        if (input) {
          input.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categoryCounts = useMemo(() => {
    return {
      all: GAMES_LIST.length,
      esports: GAMES_LIST.filter((g) => g.categories.includes('esports')).length,
      fps: GAMES_LIST.filter((g) => g.categories.includes('fps')).length,
      moba: GAMES_LIST.filter((g) => g.categories.includes('moba')).length,
      'battle-royale': GAMES_LIST.filter((g) => g.categories.includes('battle-royale')).length,
      rpg: GAMES_LIST.filter((g) => g.categories.includes('rpg')).length,
    };
  }, []);

  const filteredGames = useMemo(() => {
    return GAMES_LIST.filter((game) => {
      const matchSearch =
        !searchQuery.trim() ||
        game.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchPlatform =
        selectedPlatform === 'all' || game.platform === selectedPlatform;
      const matchCategory =
        selectedCategory === 'all' || game.categories.includes(selectedCategory);
      return matchSearch && matchPlatform && matchCategory;
    });
  }, [searchQuery, selectedPlatform, selectedCategory]);

  const handleLaunchGame = (gameName: string) => {
    setLaunchingGame(gameName);
    setLaunchProgress(20);
    setLaunchStatus('ĐANG TẢI DỮ LIỆU CLOUD...');
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'CYBER_ACTIVE_PLAYING_GAME',
        JSON.stringify({
          gameName,
          startTime: Date.now(),
          elapsedSeconds: 0,
        })
      );
    }

    setTimeout(() => {
      setLaunchProgress(65);
      setLaunchStatus('ĐỒNG BỘ 240Hz & ANTI-CHEAT...');
    }, 500);

    setTimeout(() => {
      setLaunchProgress(100);
      setLaunchStatus('KHỞI CHẠY THÀNH CÔNG!');
    }, 1100);
  };

  const handleEnterGameNow = () => {
    if (launchingGame) {
      setActivePlayingGame(launchingGame);
      setInGameSeconds(0);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'CYBER_ACTIVE_PLAYING_GAME',
          JSON.stringify({
            gameName: launchingGame,
            startTime: Date.now(),
            elapsedSeconds: 0,
          })
        );
      }
      setLaunchingGame(null);
      setLaunchProgress(0);
    }
  };

  const handleCloseActiveGame = () => {
    setActivePlayingGame(null);
    setInGameSeconds(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('CYBER_ACTIVE_PLAYING_GAME');
    }
  };

  const handleCallQuickService = (title: string, details: string) => {
    createStaffRequest({
      pcName: wallet.pcName || 'VIP-08',
      type: 'EXTRA_SERVICE',
      title,
      details,
    });
    setServiceAlert(`Đã gửi yêu cầu "${title}" tới nhân viên trực tầng!`);
    setTimeout(() => setServiceAlert(null), 4000);
  };

  const handleOptimizeRam = () => {
    setRamOptimized(true);
    setRamUsageGb('8.2GB / 32GB');
    if (typeof window !== 'undefined') {
      localStorage.setItem('CYBER_RAM_OPTIMIZED', 'true');
    }
    setServiceAlert('⚡ Đã dọn dẹp Standby List & giải phóng 6.6GB RAM nền! Bộ nhớ hiện tại: 8.2GB / 32GB DDR5.');
    setTimeout(() => setRamOptimized(false), 2000);
    setTimeout(() => setServiceAlert(null), 4000);
  };

  const formatHMS = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans flex flex-col select-none">

      <div className="bg-[#0b101d] border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <Link
            href="/client-pc"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black font-gaming text-xs px-3.5 py-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] transition active:scale-95"
            title="Quay lại giao diện máy trạm"
          >
            <span className="material-symbols-outlined text-[18px]">sports_esports</span>
            <span>VỀ MÁY TRẠM ({wallet.pcName || 'STD-01'}) &rarr;</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ping 1ms • 240Hz G-Sync • RAM: <strong className="text-emerald-400">{ramUsageGb}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/menu?seat=${wallet.pcName || 'VIP-08'}`}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
            <span>ĐẶT MÓN F&amp;B TẬN MÁY</span>
          </Link>

          <button
            onClick={() => handleCallQuickService('Thêm đá & nước lọc', 'Khách đang chơi game gọi thêm đá lạnh')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-cyan-400">local_drink</span>
            <span className="hidden md:inline">Thêm Đá</span>
          </button>

          <button
            onClick={handleOptimizeRam}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2.5 py-1.5 rounded-lg font-bold text-xs border border-emerald-500/30 transition cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[15px] ${ramOptimized ? 'animate-spin' : ''}`}>bolt</span>
            <span>{ramOptimized ? 'Đã giải phóng!' : 'Tối ưu RAM'}</span>
          </button>
        </div>
      </div>

      {serviceAlert && (
        <div className="bg-emerald-950/90 border-b border-emerald-400 text-emerald-200 px-4 py-2 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
            <span>{serviceAlert}</span>
          </div>
          <button onClick={() => setServiceAlert(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {activePlayingGame && (
        <div className="bg-gradient-to-r from-[#17080f] via-[#210c17] to-[#120712] border-b-2 border-rose-500 px-4 py-2.5 shadow-[0_4px_25px_rgba(244,63,94,0.35)] flex flex-wrap items-center justify-between gap-3 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <span className="material-symbols-outlined text-[20px] animate-pulse">sports_esports</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                  ĐANG TRONG TRẬN
                </span>
                <span className="font-gaming font-black text-white text-base">{activePlayingGame}</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                Thời gian trận đấu: <strong className="text-amber-400">{formatHMS(inGameSeconds)}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseActiveGame}
              className="px-3 py-2 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-300 rounded-xl text-xs font-mono font-bold border border-slate-700 transition cursor-pointer"
              title="Thoát phiên game này"
            >
              Thoát Game ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#0b101d]/90 border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-[18px]">
                search
              </span>
              <input
                id="gameSearchInputReal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tựa game (F2)..."
                type="text"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-12 py-2 text-xs focus:border-cyan-400 focus:outline-none placeholder:text-slate-500 font-mono transition"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-cyan-400 rounded border border-slate-700">
                F2
              </kbd>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'riot', label: 'Riot Games' },
                { id: 'steam', label: 'Steam' },
                { id: 'garena', label: 'Garena' },
                { id: 'other', label: 'Khác' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition whitespace-nowrap cursor-pointer ${
                    selectedPlatform === p.id
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800">
            {[
              { id: 'all', label: `TẤT CẢ (${categoryCounts.all})` },
              { id: 'esports', label: `ESPORTS (${categoryCounts.esports})` },
              { id: 'fps', label: `FPS (${categoryCounts.fps})` },
              { id: 'moba', label: `MOBA (${categoryCounts.moba})` },
              { id: 'battle-royale', label: `BATTLE ROYALE (${categoryCounts['battle-royale']})` },
              { id: 'rpg', label: `RPG / AAA (${categoryCounts.rpg})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 pb-24">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-2xl">sports_esports</span>
            <h2 className="text-lg font-black text-white font-gaming tracking-wide uppercase">
              KHO 16 GAME BẢN QUYỀN SẴN SÀNG
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredGames.length} game
          </span>
        </div>

        {filteredGames.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">search_off</span>
            <p className="font-bold text-slate-300">Không tìm thấy game phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                onClick={() => handleLaunchGame(game.name)}
                className="group relative flex flex-col bg-[#0b101d] rounded-xl overflow-hidden border border-slate-800 hover:border-amber-400 transition-all cursor-pointer shadow-lg hover:-translate-y-1 duration-200"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500 ease-out"
                    style={{ backgroundImage: `url('${game.image}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>

                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 font-mono text-[9px] text-cyan-300 font-bold border border-cyan-400/30">
                    {game.platformLabel}
                  </span>

                  {game.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-mono text-[9px] font-bold border border-rose-500/50">
                      {game.badge}
                    </span>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-slate-950/70 backdrop-blur-[2px]">
                    <button className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg font-black text-xs shadow-lg font-mono">
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span> CHƠI
                    </button>
                  </div>
                </div>

                <div className="p-2.5 text-center bg-[#0e1424] border-t border-slate-800">
                  <h3 className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                    {game.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {launchingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0c1220] border-2 border-amber-400/60 p-6 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center text-center gap-4 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse text-amber-400">
              <span className="material-symbols-outlined text-3xl">sports_esports</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white font-gaming uppercase tracking-wide">
                {launchingGame.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{launchStatus}</p>
            </div>

            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${launchProgress}%` }}
              ></div>
            </div>

            {launchProgress >= 100 ? (
              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={handleEnterGameNow}
                  className="w-full py-3 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase shadow-lg transition"
                >
                  VÀO TRẬN ĐẤU NGAY
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400">Diskless 10Gbps</span>
                <span className="text-cyan-400 font-bold">{launchProgress}%</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}