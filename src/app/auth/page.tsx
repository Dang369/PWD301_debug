'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getStoredWallet,
  topupWallet,
  resetWalletToDefault,
  calculateRemainingPlayTime,
  getCumulativeTopupAmount,
  WALLET_EVENT_NAME,
  UserWallet,
  INITIAL_WALLET,
} from '@/lib/walletStore';
import {
  getTierByName,
  calculateTierProgression,
  GAMER_PASS_TIERS,
  TIERS_ORDER,
} from '@/lib/gamerPass';
import {
  getLoggedInUser,
  loginUser,
  logoutUser,
  AUTH_EVENT_NAME,
  AuthUser,
  authenticateUser,
  registerAccount,
  isValidVietnamesePhone,
  updateUserFullName,
  changeUserPassword,
} from '@/lib/authStore';

export default function AuthAndWallet() {
  const [activeTab, setActiveTab] = useState<'topup' | 'gamerpass' | 'login'>('topup');
  const [amount, setAmount] = useState('200000');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'atm' | 'cash'>('qr');
  const [authTopupError, setAuthTopupError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<{
    added: number;
    newBalance: number;
  } | null>(null);
  const [upgradeToast, setUpgradeToast] = useState<{
    oldTier: string;
    newTier: string;
    perks: string[];
  } | null>(null);

  const [wallet, setWallet] = useState<UserWallet>(INITIAL_WALLET);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [switchUsername, setSwitchUsername] = useState('');
  const [switchPassword, setSwitchPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState<string | null>(null);
  const [authSubMode, setAuthSubMode] = useState<'login' | 'register'>('login');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [editFullName, setEditFullName] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [profileNotice, setProfileNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  useEffect(() => {
    const syncAll = () => {
      const u = getLoggedInUser();
      const w = getStoredWallet();
      setCurrentUser(u);
      setWallet(w);
      if (u) {
        setEditFullName(u.fullName || '');
      } else {
        setActiveTab('login');
      }
    };

    syncAll();

    window.addEventListener(WALLET_EVENT_NAME, syncAll);
    window.addEventListener(AUTH_EVENT_NAME, syncAll);
    window.addEventListener('storage', syncAll);

    return () => {
      window.removeEventListener(WALLET_EVENT_NAME, syncAll);
      window.removeEventListener(AUTH_EVENT_NAME, syncAll);
      window.removeEventListener('storage', syncAll);
    };
  }, []);

  const quickAmounts = ['50000', '100000', '200000', '500000', '1000000', '1500000'];

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 10000) {
      setAuthTopupError('Vui lòng nhập số tiền nạp tối thiểu từ 10.000đ!');
      return;
    }

    setAuthTopupError(null);
    setIsProcessing(true);

    setTimeout(() => {
      const prevTier = getTierByName(currentUser?.userTier || wallet.userTier);

      const updated = topupWallet(numAmount, paymentMethod);
      setWallet(updated);
      const latestUser = getLoggedInUser();
      if (latestUser) setCurrentUser(latestUser);
      setIsProcessing(false);

      const newTier = getTierByName(updated.userTier);

      if (newTier.minAmount > prevTier.minAmount) {
        setUpgradeToast({
          oldTier: prevTier.name,
          newTier: newTier.name,
          perks: newTier.perks,
        });
      }

      setSuccessToast({
        added: numAmount,
        newBalance: updated.balance,
      });

      setTimeout(() => {
        setSuccessToast(null);
      }, 5000);
    }, 500);
  };

  const handleResetWallet = () => {
    if (confirm('Khôi phục số dư ví tài khoản về mức khởi tạo mặc định?')) {
      const reset = resetWalletToDefault();
      setWallet(reset);
      const u = getLoggedInUser();
      if (u) setCurrentUser(u);
    }
  };

  const handleSwitchLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg(null);
    if (!switchUsername.trim() || !switchPassword.trim()) {
      setLoginMsg('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!');
      return;
    }

    const res = authenticateUser(switchUsername, switchPassword);
    if (!res.success) {
      setLoginMsg(res.error || 'Đăng nhập không thành công!');
      return;
    }

    const user = res.user!;
    loginUser(user);
    setCurrentUser(user);
    setSwitchUsername('');
    setSwitchPassword('');
    setLoginMsg(null);
    setIsSwitchingAccount(false);
    setActiveTab('topup');
    setSuccessToast({
      added: 0,
      newBalance: user.balance,
    });
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleRegisterOnAuthPage = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg(null);
    const cleanUname = regUsername.trim();
    const cleanPass = regPassword.trim();
    const cleanName = regFullName.trim();
    const cleanPhone = regPhone.trim();

    if (!cleanUname || !cleanPass || !cleanPhone || !cleanName) {
      setLoginMsg('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    if (!isValidVietnamesePhone(cleanPhone)) {
      setLoginMsg('Số điện thoại không hợp lệ! Vui lòng nhập đúng số điện thoại di động Việt Nam gồm 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    const res = registerAccount({
      username: cleanUname,
      password: cleanPass,
      fullName: cleanName,
      phone: cleanPhone,
      initialBalance: 50000,
    });

    if (!res.success) {
      setLoginMsg(res.error || 'Đăng ký tài khoản thất bại!');
      return;
    }

    const user = res.user!;
    loginUser(user);
    setCurrentUser(user);
    setRegUsername('');
    setRegPassword('');
    setRegFullName('');
    setRegPhone('');
    setLoginMsg(null);
    setIsSwitchingAccount(false);
    setActiveTab('topup');
    setSuccessToast({
      added: 50000,
      newBalance: user.balance,
    });
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleQuickDemoLogin = (uname: string, pass: string) => {
    setLoginMsg(null);
    const res = authenticateUser(uname, pass);
    if (!res.success) {
      setLoginMsg(res.error || 'Đăng nhập thất bại!');
      return;
    }
    const user = { ...res.user! };
    if (user.balance <= 0) {
      if (uname === 'admin1') {
        user.balance = 200000;
        user.userTier = 'HỘI VIÊN BẠC 🥈';
      } else if (uname === 'admin2') {
        user.balance = 500000;
        user.userTier = 'HỘI VIÊN VÀNG ⭐';
      } else if (uname === 'gamer01') {
        user.balance = 50000;
        user.userTier = 'TÂN THỦ (ROOKIE)';
      }
    }
    loginUser(user);
    setCurrentUser(user);
    setIsSwitchingAccount(false);
    setActiveTab('topup');
    setSuccessToast({
      added: 0,
      newBalance: user.balance,
    });
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản này?')) {
      logoutUser();
      setCurrentUser(null);
      setIsSwitchingAccount(false);
      setActiveTab('login');
    }
  };

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);
    const res = updateUserFullName(editFullName);
    if (!res.success) {
      setProfileNotice({ type: 'error', message: res.error || 'Cập nhật họ tên thất bại!' });
      return;
    }
    const updated = res.user!;
    setCurrentUser(updated);
    setProfileNotice({
      type: 'success',
      message: `✅ Cập nhật họ tên thành "${updated.fullName}" thành công! Tên đã được đồng bộ toàn hệ thống.`,
    });
    setTimeout(() => setProfileNotice(null), 6000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);
    const res = changeUserPassword(currentPass, newPass, confirmPass);
    if (!res.success) {
      setPasswordNotice({ type: 'error', message: res.error || 'Đổi mật khẩu thất bại!' });
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPasswordNotice({
      type: 'success',
      message: '🎉 Đổi mật khẩu thành công! Mật khẩu mới của bạn đã có hiệu lực ngay lập tức.',
    });
    setTimeout(() => setPasswordNotice(null), 6000);
  };

  const currentTier = getTierByName(currentUser?.userTier || wallet.userTier);
  const cumulativeAmount = getCumulativeTopupAmount(wallet);
  const progression = calculateTierProgression(cumulativeAmount);
  const displayName = currentUser?.fullName || currentUser?.username || wallet.userName || 'Tài khoản Hội viên';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 flex flex-col items-center justify-center font-sans select-none">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <span className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-purple-600 text-black font-mono text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            HỆ THỐNG GAMER PASS & CỔNG NẠP TIỀN ĐỒNG BỘ
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 font-gaming tracking-wide">
            CỔNG TÀI KHOẢN & GAMER PASS
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Nạp tiền tích lũy để tự động thăng hạng hội viên, giảm giá giờ chơi và nhận siêu ưu đãi ẩm thực.
          </p>
        </div>

        {upgradeToast && (
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-purple-500/20 border-2 border-amber-400 text-amber-200 px-5 py-4 rounded-2xl mb-6 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-amber-400">military_tech</span>
              <div>
                <div className="font-gaming font-black text-base text-white">
                  🎉 CHÚC MỪNG BẠN ĐÃ THĂNG HẠNG: {upgradeToast.newTier}!
                </div>
                <div className="text-xs text-amber-300 font-mono mt-0.5">
                  Đã kích hoạt ưu đãi: {upgradeToast.perks[0]}
                </div>
              </div>
            </div>
            <button
              onClick={() => setUpgradeToast(null)}
              className="bg-amber-400 text-black font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase font-mono cursor-pointer hover:bg-amber-300"
            >
              TUYỆT VỜI
            </button>
          </div>
        )}

        {successToast && (
          <div className="bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 px-4 py-3.5 rounded-xl mb-6 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
              <div>
                <div className="font-bold text-sm text-white">
                  {successToast.added > 0 ? `NẠP THÀNH CÔNG +${successToast.added.toLocaleString('vi-VN')}đ!` : 'ĐÃ ĐỒNG BỘ TÀI KHOẢN!'}
                </div>
                <div className="text-xs text-emerald-300 font-mono">
                  Số dư ví: <strong className="text-white font-mono">{successToast.newBalance.toLocaleString('vi-VN')}đ</strong> (Đang kết nối trạm {wallet.pcName})
                </div>
              </div>
            </div>
            <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded font-mono uppercase">
              {successToast.added > 0 ? 'ĐÃ CỘNG TIỀN' : 'ONLINE'}
            </span>
          </div>
        )}

        
        {!currentUser ? (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 mb-6 shadow-2xl relative overflow-hidden">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-3xl">
                <span className="material-symbols-outlined text-3xl">no_accounts</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-gaming">
                  BẠN CHƯA ĐĂNG NHẬP TÀI KHOẢN
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed font-mono">
                  Vui lòng đăng nhập hoặc đăng ký tài khoản mới bên dưới để nạp tiền trực tuyến, theo dõi thời hạn gói Gamer Pass và hưởng chiết khấu tiền giờ.
                </p>
              </div>
            </div>
          </div>
        ) : (
          (() => {
            const effectiveBalance = typeof currentUser.balance === 'number' ? currentUser.balance : wallet.balance;

            return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${currentTier.accentBg} ${currentTier.textColor} border ${currentTier.borderColor} p-0.5 flex items-center justify-center shadow-lg`}>
                      <span className="material-symbols-outlined text-2xl">{currentTier.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-black text-base">{currentUser.fullName}</h3>
                        <span className="text-xs text-slate-400 font-mono">(@{currentUser.username})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono border ${currentTier.badgeClass}`}>
                          {currentUser.userTier}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          📞 {currentUser.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      <div className="font-bold flex items-center justify-end gap-1">
                        <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
                        <span>Hạng Tích Lũy Vĩnh Viễn</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        Ưu đãi: -{currentTier.playDiscountPercent}% giờ chơi • -{currentTier.fnbDiscountPercent}% F&amp;B
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-emerald-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-slate-400">Số Dư Khả Dụng:</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                    </div>
                    <span className="font-mono text-2xl font-black text-emerald-400 tracking-tight">
                      {effectiveBalance.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-cyan-500/30 shadow-[inset_0_0_15px_rgba(0,240,255,0.1)]">
                    <span className="text-slate-400 block mb-0.5">Thời Gian Chơi Quy Đổi:</span>
                    <span className="font-mono text-2xl font-black text-cyan-400 tracking-tight">
                      {calculateRemainingPlayTime(effectiveBalance, wallet.hourlyRate || 12000)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      Tiến trình thăng hạng: <strong className="text-white">{currentTier.shortName} &rarr; {progression.nextTier ? progression.nextTier.shortName : 'MAX'}</strong>
                    </span>
                    <span className="text-amber-400 font-bold">
                      {progression.isMaxTier ? '100% (ĐỈNH CAO)' : `${progression.progressPercent}%`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${progression.progressPercent}%` }}
                    ></div>
                  </div>
                  {!progression.isMaxTier && (
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Tích lũy nạp: {cumulativeAmount.toLocaleString('vi-VN')}đ</span>
                      <span className="text-amber-300 font-bold">
                        Cần nạp thêm +{progression.neededAmount.toLocaleString('vi-VN')}đ để lên {progression.nextTier?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl font-mono text-xs shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`w-full py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'topup'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add_card</span>
            <span>Nạp Tiền Trực Tuyến</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gamerpass')}
            className={`w-full py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'gamerpass'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">military_tech</span>
            <span>Đặc Quyền Hạng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setIsSwitchingAccount(false);
            }}
            className={`w-full py-3 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            <span>{currentUser ? 'Hồ Sơ & Bảo Mật' : 'Tài Khoản'}</span>
          </button>
        </div>

        {activeTab === 'topup' && (
          <form onSubmit={handleTopup} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            {authTopupError && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>{authTopupError}</span>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white font-black text-sm">
                  Chọn Mức Tiền Cần Nạp Vào Ví &amp; Cộng Giờ Chơi:
                </label>
                <span className="text-[11px] font-mono text-cyan-400">100% tự động cộng số dư &amp; giờ chơi</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`py-3 rounded-xl border text-xs font-mono font-black transition cursor-pointer ${
                      amount === q
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    +{parseInt(q, 10).toLocaleString('vi-VN')}đ
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1 font-mono">Hoặc nhập số tiền tùy chọn:</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="10000"
                  min="10000"
                  className="bg-slate-800 border border-slate-700 text-white font-mono text-lg font-bold rounded-xl px-4 py-3 focus:border-cyan-400 focus:outline-none w-full"
                  placeholder="Nhập số tiền..."
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">VNĐ</span>
              </div>
            </div>

            <div>
              <label className="text-white font-black text-sm block mb-2">Hình Thức Thanh Toán:</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'qr'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                  <span className="font-bold">VietQR Pro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('atm')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'atm'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">credit_card</span>
                  <span className="font-bold">ATM / Thẻ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">payments</span>
                  <span className="font-bold">Tiền Mặt Quầy</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'qr' && (
              <div className="p-4 bg-slate-950/60 rounded-xl border border-dashed border-emerald-500/40 flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CYBERZONE_TOPUP_${amount}_PC_${wallet.pcName}`}
                    alt="VietQR Topup"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    QUÉT VIETQR CHUYỂN KHOẢN TỰ ĐỘNG
                  </div>
                  <div className="text-slate-300">
                    Ngân hàng: <strong className="text-white">MB Bank (Quân Đội)</strong>
                  </div>
                  <div className="text-slate-300">
                    Số TK: <strong className="text-cyan-400">0988888888</strong>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Nội dung: <strong className="text-amber-400">NAP {wallet.pcName} {displayName}</strong>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full text-black font-black py-3.5 rounded-xl text-sm font-gaming uppercase tracking-wider shadow-lg transition cursor-pointer disabled:opacity-50 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:brightness-110 shadow-emerald-500/30"
            >
              {isProcessing
                ? 'ĐANG XÁC THỰC GIAO DỊCH...'
                : `XÁC NHẬN NẠP +${parseInt(amount || '0', 10).toLocaleString('vi-VN')}Đ VÀO VÍ & CỘNG GIỜ`}
            </button>

            <div className="flex justify-between items-center pt-2 text-[11px] font-mono text-slate-500">
              <button
                type="button"
                onClick={handleResetWallet}
                className="hover:text-slate-300 underline cursor-pointer"
              >
                Khôi phục số dư ví ban đầu
              </button>
              <span>Hỗ trợ 24/7: 1900 8888</span>
            </div>
          </form>
        )}

        {activeTab === 'gamerpass' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-black text-sm">Hệ Thống Phân Hạng Hội Viên Gamer Pass</h3>
              <span className="text-xs text-amber-400 font-mono">Tự động xét hạng vĩnh viễn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TIERS_ORDER.map((tierKey) => {
                const tier = GAMER_PASS_TIERS[tierKey];
                const isCurrent = currentTier.code === tier.code;

                return (
                  <div
                    key={tierKey}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      isCurrent
                        ? `${tier.accentBg} ${tier.borderColor} shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400`
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-2xl ${tier.textColor}`}>
                            {tier.icon}
                          </span>
                          <div>
                            <span className="text-white font-bold text-sm block">{tier.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {tier.minAmount === 0 ? 'Mặc định khi đăng ký' : `Tích lũy từ ${tier.minAmount.toLocaleString('vi-VN')}đ`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 rounded-lg p-2.5 space-y-1 mb-2 font-mono text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span>Giảm giá giờ chơi:</span>
                          <span className="text-emerald-400 font-bold">
                            {tier.playDiscountPercent > 0 ? `-${tier.playDiscountPercent}%` : 'Chuẩn'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Giảm menu Bếp:</span>
                          <span className="text-cyan-400 font-bold">
                            {tier.fnbDiscountPercent > 0 ? `-${tier.fnbDiscountPercent}%` : 'Chuẩn'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-300">
                        {tier.perks.map((p, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-emerald-400">✓</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10">
                      {isCurrent ? (
                        <div className="py-1.5 text-center text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                          ✓ HẠNG CỦA BẠN
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAmount(String(tier.minAmount || 50000));
                            setActiveTab('topup');
                          }}
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/10 font-bold text-xs font-mono transition text-center cursor-pointer"
                        >
                          Chọn Nạp Mốc Này &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'login' && (
          currentUser && !isSwitchingAccount ? (
            <div className="space-y-6 font-mono text-xs">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-black font-black flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                    <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-wide">
                      Hồ Sơ &amp; Cài Đặt Bảo Mật
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Tài khoản: <strong className="text-cyan-400">@{currentUser.username}</strong> • Số điện thoại: <strong className="text-white">{currentUser.phone}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSwitchingAccount(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                    title="Đăng nhập tài khoản khác"
                  >
                    <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                    <span>Đổi Tài Khoản Khác</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                    title="Đăng xuất khỏi tài khoản"
                  >
                    <span className="material-symbols-outlined text-[14px]">logout</span>
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">CẬP NHẬT HỌ VÀ TÊN</h4>
                        <p className="text-[10px] text-slate-400">
                          Bạn đặt tên gì hệ thống sẽ lưu và hiển thị đúng tên đó 100%
                        </p>
                      </div>
                    </div>

                    {profileNotice && (
                      <div className={`p-3 rounded-xl mb-3 text-xs leading-relaxed border ${
                        profileNotice.type === 'success'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      }`}>
                        {profileNotice.message}
                      </div>
                    )}

                    <form onSubmit={handleUpdateName} className="space-y-4">
                      <div>
                        <label className="text-slate-400 block mb-1">TÊN ĐĂNG NHẬP (CỐ ĐỊNH):</label>
                        <input
                          type="text"
                          disabled
                          value={`@${currentUser.username}`}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1">HỌ VÀ TÊN CỦA BẠN (*):</label>
                        <input
                          type="text"
                          required
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          placeholder="Ví dụ: Trần Ngọc Thái"
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:outline-none text-sm font-sans"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Tên này sẽ xuất hiện trên thẻ Gamer Pass, màn hình máy trạm và toàn bộ hệ thống
                        </span>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">SỐ ĐIỆN THOẠI HỘI VIÊN:</label>
                        <input
                          type="text"
                          disabled
                          value={currentUser.phone}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed font-mono text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer font-gaming"
                      >
                        💾 LƯU THAY ĐỔI HỌ VÀ TÊN
                      </button>
                    </form>
                  </div>
                </div>

                
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">ĐỔI MẬT KHẨU BẢO MẬT</h4>
                        <p className="text-[10px] text-slate-400">
                          Nhập mật khẩu hiện tại và xác nhận mật khẩu mới 2 lần
                        </p>
                      </div>
                    </div>

                    {passwordNotice && (
                      <div className={`p-3 rounded-xl mb-3 text-xs leading-relaxed border ${
                        passwordNotice.type === 'success'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      }`}>
                        {passwordNotice.message}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-3.5">
                      <div>
                        <label className="text-slate-300 block mb-1">MẬT KHẨU HIỆN TẠI (*):</label>
                        <input
                          type="password"
                          required
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-cyan-400 focus:outline-none text-sm font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1">MẬT KHẨU MỚI (*):</label>
                        <input
                          type="password"
                          required
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="•••••••• (tối thiểu 3 ký tự)"
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-cyan-400 focus:outline-none text-sm font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1">XÁC NHẬN MẬT KHẨU MỚI (*):</label>
                        <input
                          type="password"
                          required
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="Nhập lại chính xác mật khẩu mới"
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-cyan-400 focus:outline-none text-sm font-sans"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Bắt buộc xác nhận mật khẩu 2 lần để tránh gõ nhầm
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer font-gaming"
                      >
                        🔐 XÁC NHẬN ĐỔI MẬT KHẨU
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-black text-sm">Quản Lý Tài Khoản Thành Viên</h3>
                  {currentUser && isSwitchingAccount && (
                    <button
                      type="button"
                      onClick={() => setIsSwitchingAccount(false)}
                      className="text-cyan-400 hover:underline text-[11px] font-bold block mt-0.5 cursor-pointer"
                    >
                      &larr; Quay lại hồ sơ tài khoản ({currentUser.fullName})
                    </button>
                  )}
                </div>
                {currentUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold hover:bg-rose-500/30 transition cursor-pointer"
                  >
                    Đăng xuất ({currentUser.fullName})
                  </button>
                )}
              </div>

              <div className="flex gap-2 p-1 bg-slate-950 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthSubMode('login');
                    setLoginMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer ${
                    authSubMode === 'login'
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthSubMode('register');
                    setLoginMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer ${
                    authSubMode === 'register'
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Đăng Ký Mới
                </button>
              </div>

              {loginMsg && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 leading-relaxed">
                  ⚠️ {loginMsg}
                </div>
              )}

              {authSubMode === 'login' ? (
                <form onSubmit={handleSwitchLogin} className="space-y-4">
                  <div>
                    <label className="text-slate-400 block mb-1">TÊN TÀI KHOẢN HỘI VIÊN (*):</label>
                    <input
                      type="text"
                      required
                      value={switchUsername}
                      onChange={(e) => setSwitchUsername(e.target.value)}
                      placeholder="Ví dụ: admin1 hoặc admin2"
                      className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-cyan-400 focus:outline-none w-full text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">MẬT KHẨU (*):</label>
                    <input
                      type="password"
                      required
                      value={switchPassword}
                      onChange={(e) => setSwitchPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-cyan-400 focus:outline-none w-full text-sm font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold py-3 rounded-xl text-xs shadow-[0_0_12px_rgba(0,240,255,0.3)] transition cursor-pointer"
                  >
                    XÁC NHẬN ĐĂNG NHẬP VÀO MÁY
                  </button>

                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>TÀI KHOẢN MẪU KHẢO SÁT / CHẤM ĐIỂM:</span>
                      <span className="text-emerald-400">MK: 123</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('admin1', '123')}
                        className="p-2 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold text-[10px] cursor-pointer"
                      >
                        🥈 admin1 (200k)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('admin2', '123')}
                        className="p-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg font-bold text-[10px] cursor-pointer"
                      >
                        ⭐ admin2 (500k)
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterOnAuthPage} className="space-y-3">
                  <div>
                    <label className="text-slate-400 block mb-1">TÊN ĐĂNG NHẬP (*):</label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Ví dụ: gamer_pro2026 (tối thiểu 3 ký tự)"
                      className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:outline-none w-full text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">HỌ VÀ TÊN (*):</label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Ví dụ: Trần Ngọc Thái"
                      className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:outline-none w-full text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">SỐ ĐIỆN THOẠI (*):</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Ví dụ: 0988 888 888 (10 số di động)"
                      className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:outline-none w-full text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">MẬT KHẨU (*):</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="•••••••• (tối thiểu 3 ký tự)"
                      className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:outline-none w-full text-sm font-sans"
                    />
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">
                    🎁 <strong>Quà tặng tân thủ:</strong> Tặng ngay 50.000đ khi đăng ký thành công!
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 text-black font-extrabold py-3 rounded-xl text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)] transition cursor-pointer"
                  >
                    TẠO TÀI KHOẢN MỚI (+50.000Đ)
                  </button>
                </form>
              )}
            </div>
          )
        )}

        <div className="text-center mt-6">
          <Link href="/client-pc" className="text-xs text-cyan-400 hover:underline font-mono">
            &larr; Quay lại màn hình điều khiển máy trạm {wallet.pcName}
          </Link>
        </div>
      </div>
    </div>
  );
}