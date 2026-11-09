'use client';

import React, { useState } from 'react';
import {
  loginUser,
  AuthUser,
  authenticateUser,
  registerAccount,
  isValidVietnamesePhone,
} from '@/lib/authStore';
import { getStoredWallet, broadcastWalletUpdate } from '@/lib/walletStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  message?: string;
  onSuccess?: (user: AuthUser) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'login',
  message,
  onSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!');
      return;
    }

    const authRes = authenticateUser(cleanUsername, cleanPassword);
    if (!authRes.success) {
      setError(authRes.error || 'Đăng nhập không thành công! Vui lòng kiểm tra lại.');
      return;
    }

    const loggedUser = authRes.user!;
    loginUser(loggedUser);

    const currentWallet = getStoredWallet();
    broadcastWalletUpdate({
      ...currentWallet,
      userName: loggedUser.fullName,
      userTier: loggedUser.userTier,
      balance: loggedUser.balance,
    });

    if (onSuccess) onSuccess(loggedUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanUsername || !cleanPassword || !cleanPhone || !cleanFullName) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    if (!isValidVietnamesePhone(cleanPhone)) {
      setError('Số điện thoại không hợp lệ! Vui lòng nhập đúng số điện thoại di động Việt Nam gồm 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    const regRes = registerAccount({
      username: cleanUsername,
      password: cleanPassword,
      fullName: cleanFullName,
      phone: cleanPhone,
      initialBalance: 50000,
    });

    if (!regRes.success) {
      setError(regRes.error || 'Đăng ký tài khoản thất bại! Vui lòng thử lại.');
      return;
    }

    const newUser = regRes.user!;
    loginUser(newUser);

    const currentWallet = getStoredWallet();
    broadcastWalletUpdate({
      ...currentWallet,
      userName: newUser.fullName,
      userTier: newUser.userTier,
      balance: newUser.balance,
    });

    setSuccessMsg(`Đăng ký thành công tài khoản "${newUser.username}"! Đang đăng nhập...`);
    setTimeout(() => {
      if (onSuccess) onSuccess(newUser);
      onClose();
    }, 800);
  };

  const handleQuickDemoLogin = (uname: string, pass: string) => {
    setError(null);
    setSuccessMsg(null);

    const authRes = authenticateUser(uname, pass);
    if (!authRes.success) {
      setError(authRes.error || 'Đăng nhập thất bại!');
      return;
    }

    const loggedUser = { ...authRes.user! };
    if (uname === 'admin1') {
      loggedUser.balance = 200000;
      loggedUser.userTier = 'HỘI VIÊN BẠC 🥈';
    } else if (uname === 'admin2') {
      loggedUser.balance = 500000;
      loggedUser.userTier = 'HỘI VIÊN KIM CƯƠNG 💎';
    } else if (uname === 'gamer01') {
      loggedUser.balance = 50000;
      loggedUser.userTier = 'TÂN THỦ (ROOKIE)';
    }
    loginUser(loggedUser);

    const currentWallet = getStoredWallet();
    broadcastWalletUpdate({
      ...currentWallet,
      userName: loggedUser.fullName,
      userTier: loggedUser.userTier,
      balance: loggedUser.balance,
    });

    if (onSuccess) onSuccess(loggedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1329] border border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative font-sans text-slate-100">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center text-black font-black text-2xl mx-auto shadow-lg shadow-emerald-500/25">
            CZ
          </div>
          <h3 className="text-2xl font-black text-white font-gaming mt-3 tracking-wide">
            CYBER<span className="text-emerald-400">ZONE</span> PASSPORT
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {message || 'Hệ thống tài khoản thành viên Cyber Zone Gaming & eSports'}
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-sm">lock</span>
            <span>{message}</span>
          </div>
        )}

        <div className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-5 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer ${
              tab === 'login'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer ${
              tab === 'register'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono leading-relaxed">
            ✅ {successMsg}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">TÊN ĐĂNG NHẬP HỘI VIÊN (*)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: admin1 hoặc admin2"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">MẬT KHẨU (*)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 transition font-gaming cursor-pointer"
            >
              ĐĂNG NHẬP VÀO HỆ THỐNG
            </button>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="uppercase tracking-wider">🔑 TÀI KHOẢN MẪU KHẢO SÁT:</span>
                <span className="text-emerald-400">Mật khẩu: 123</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin1', '123')}
                  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold rounded-lg transition text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  title="Tài khoản Hội viên admin1 (200.000đ • Bạc)"
                >
                  <span>🥈 admin1 (200k)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin2', '123')}
                  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold rounded-lg transition text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                  title="Tài khoản Quản trị viên admin2 (500.000đ • Kim Cương)"
                >
                  <span>💎 admin2 (500k)</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('gamer01', '123')}
                className="w-full py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-lg transition text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                title="Tài khoản Tân Thủ (50.000đ • Rookie)"
              >
                <span>🎮 gamer01 (Tân Thủ 50k • MK: 123)</span>
              </button>
            </div>
          </form>
        ) : (

          <form onSubmit={handleRegisterSubmit} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">TÊN ĐĂNG NHẬP (*)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: gamer_pro2026 (tối thiểu 3 ký tự)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">HỌ VÀ TÊN (*)</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">SỐ ĐIỆN THOẠI LIÊN HỆ (*)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0988 888 888 (10 số di động)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400 outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Chấp nhận số di động 10 chữ số (đầu số 03, 05, 07, 08, 09).
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">MẬT KHẨU BẢO MẬT (*)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (tối thiểu 3 ký tự)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-400 outline-none"
              />
            </div>

            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">
              🎁 <strong>Quà tặng tân thủ:</strong> Tặng ngay 50.000đ vào số dư tài khoản khi đăng ký thành công!
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 transition font-gaming mt-2 cursor-pointer"
            >
              TẠO TÀI KHOẢN MỚI &amp; NHẬN 50.000Đ
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
