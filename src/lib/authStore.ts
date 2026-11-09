'use client';

import { determineTierByAmount, getTierByName, GAMER_PASS_TIERS } from './gamerPass';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email?: string;
  userTier: string;
  tierExpiresAt?: number;
  balance: number;
}

export interface RegisteredAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  phone: string;
  email?: string;
  userTier: string;
  tierExpiresAt?: number;
  balance: number;
  createdAt: string;
}

export const AUTH_STORAGE_KEY = 'cyber_auth_current_user';
export const AUTH_EVENT_NAME = 'cyber_auth_updated';
export const REGISTERED_ACCOUNTS_STORAGE_KEY = 'cyber_registered_accounts';

export const CLIENT_PC_STORAGE_KEY = 'cyber_client_pc_session';
export const CLIENT_PC_EVENT_NAME = 'cyber_client_pc_updated';

export function isValidVietnamesePhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s.-]/g, '');
  const standard10 = /^0(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  const international = /^(\+?84)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  return standard10.test(clean) || international.test(clean);
}

export const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-admin1',
    username: 'admin1',
    password: '123',
    fullName: 'Nguyễn Văn A',
    phone: '0988888888',
    email: 'admin1@cyberzone.vn',
    userTier: 'HỘI VIÊN BẠC 🥈',
    tierExpiresAt: Date.now() + 30 * 24 * 3600 * 1000,
    balance: 200000,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'usr-admin2',
    username: 'admin2',
    password: '123',
    fullName: 'Nguyễn Văn B',
    phone: '0912888999',
    email: 'admin2@cyberzone.vn',
    userTier: 'HỘI VIÊN VÀNG ⭐',
    tierExpiresAt: Date.now() + 30 * 24 * 3600 * 1000,
    balance: 500000,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'usr-gamer',
    username: 'gamer01',
    password: '123',
    fullName: 'Trần Văn C',
    phone: '0905123456',
    email: 'gamer01@cyberzone.vn',
    userTier: 'TÂN THỦ (ROOKIE)',
    balance: 50000,
    createdAt: '2026-10-15T00:00:00.000Z',
  },
];

export function getRegisteredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    let accounts: RegisteredAccount[] = JSON.parse(raw);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      localStorage.setItem(REGISTERED_ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }

    let migrated = false;
    accounts = accounts.map((acc) => {
      let changed = false;
      let newUname = acc.username;
      let newName = acc.fullName;

      if (acc.username.toLowerCase() === 'thaibboi') {
        newUname = 'admin1';
        changed = true;
      }
      const normName = (acc.fullName || '').replace(/\s+/g, ' ');
      if (
        normName.includes('Trần Ngọc Nguyễn Văn A') ||
        (acc.fullName && acc.fullName.includes('Trần Ngọc') && acc.fullName.includes('Nguyễn Văn A')) ||
        (acc.username && acc.username.toLowerCase() === 'thai1' && acc.fullName && acc.fullName.includes('Nguyễn Văn A'))
      ) {
        newName = 'Trần Ngọc Thái';
        changed = true;
      }
      // Khởi tạo số dư hợp lệ và đồng bộ đúng cấp bậc Gamer Pass theo số dư thực tế
      let newBal = typeof acc.balance === 'number' && !isNaN(acc.balance) ? acc.balance : 0;
      let newTier = acc.userTier || determineTierByAmount(newBal).name;
      if (newUname.toLowerCase() === 'admin2' && newBal < 1500000 && newTier.includes('KIM CƯƠNG')) {
        newTier = determineTierByAmount(newBal).name;
        changed = true;
      }

      if (changed) {
        migrated = true;
        return { ...acc, username: newUname, fullName: newName, balance: newBal, userTier: newTier };
      }
      return acc;
    });

    if (!accounts.some((a) => a.username.toLowerCase() === 'admin1')) {
      accounts.unshift(DEFAULT_ACCOUNTS[0]);
      migrated = true;
    }
    if (!accounts.some((a) => a.username.toLowerCase() === 'admin2')) {
      accounts.splice(1, 0, DEFAULT_ACCOUNTS[1]);
      migrated = true;
    }

    if (migrated) {
      localStorage.setItem(REGISTERED_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    }
    return accounts;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTERED_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Lỗi lưu danh sách tài khoản:', err);
  }
}

export function findAccountByUsername(username: string): RegisteredAccount | null {
  const accounts = getRegisteredAccounts();
  const cleanUsername = username.trim().toLowerCase();
  return accounts.find((acc) => acc.username.trim().toLowerCase() === cleanUsername) || null;
}

export function registerAccount(data: {
  username: string;
  password: string;
  fullName?: string;
  phone: string;
  email?: string;
  initialBalance?: number;
}): { success: boolean; error?: string; user?: AuthUser } {
  const cleanUsername = data.username.trim();
  const cleanPassword = data.password.trim();
  const cleanFullName = (data.fullName || '').trim();
  const cleanPhone = data.phone.trim();

  if (!cleanUsername) {
    return { success: false, error: 'Vui lòng nhập tên đăng nhập!' };
  }
  if (cleanUsername.length < 3) {
    return { success: false, error: 'Tên đăng nhập phải có ít nhất 3 ký tự!' };
  }
  if (!cleanFullName) {
    return { success: false, error: 'Vui lòng nhập đầy đủ họ và tên!' };
  }
  if (cleanFullName.length < 2) {
    return { success: false, error: 'Họ và tên quá ngắn! Vui lòng nhập họ và tên hợp lệ.' };
  }
  if (!cleanPhone) {
    return { success: false, error: 'Vui lòng nhập số điện thoại liên hệ!' };
  }
  if (!isValidVietnamesePhone(cleanPhone)) {
    return {
      success: false,
      error: 'Số điện thoại không hợp lệ! Vui lòng nhập đúng số điện thoại di động Việt Nam gồm 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09).',
    };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Vui lòng nhập mật khẩu bảo mật!' };
  }
  if (cleanPassword.length < 3) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 3 ký tự!' };
  }

  const existing = findAccountByUsername(cleanUsername);
  if (existing) {
    return {
      success: false,
      error: `Tài khoản "${cleanUsername}" đã tồn tại trên hệ thống! Vui lòng chọn tên khác hoặc chuyển sang Đăng nhập.`,
    };
  }

  const initialBal = typeof data.initialBalance === 'number' ? data.initialBalance : 50000;
  const initialTier = determineTierByAmount(initialBal);

  const newAccount: RegisteredAccount = {
    id: `usr-${Date.now()}`,
    username: cleanUsername,
    password: cleanPassword,
    fullName: cleanFullName,
    phone: cleanPhone,
    email: data.email?.trim() || '',
    userTier: initialTier.name,
    balance: initialBal,
    createdAt: new Date().toISOString(),
  };

  const currentAccounts = getRegisteredAccounts();
  const updatedAccounts = [newAccount, ...currentAccounts];
  saveRegisteredAccounts(updatedAccounts);

  const authUser: AuthUser = {
    id: newAccount.id,
    username: newAccount.username,
    fullName: newAccount.fullName,
    phone: newAccount.phone,
    email: newAccount.email,
    userTier: newAccount.userTier,
    balance: newAccount.balance,
  };

  return { success: true, user: authUser };
}

export function authenticateUser(
  username: string,
  password: string
): { success: boolean; error?: string; user?: AuthUser } {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!' };
  }

  const account = findAccountByUsername(cleanUsername);
  if (!account) {
    return {
      success: false,
      error: `Tài khoản "${cleanUsername}" không tồn tại trên hệ thống! Vui lòng kiểm tra lại hoặc Đăng ký tài khoản mới.`,
    };
  }

  if (account.password !== cleanPassword) {
    return {
      success: false,
      error: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại.',
    };
  }

  let currentTierName = account.userTier;
  let currentExpiry = account.tierExpiresAt;
  if (currentExpiry && Date.now() > currentExpiry) {
    currentTierName = 'TÂN THỦ (ROOKIE)';
    currentExpiry = undefined;
    account.userTier = currentTierName;
    delete account.tierExpiresAt;
    const accounts = getRegisteredAccounts();
    const idx = accounts.findIndex((a) => a.username.toLowerCase() === account.username.toLowerCase());
    if (idx !== -1) {
      accounts[idx].userTier = currentTierName;
      delete accounts[idx].tierExpiresAt;
      saveRegisteredAccounts(accounts);
    }
  }

  const authUser: AuthUser = {
    id: account.id,
    username: account.username,
    fullName: account.fullName,
    phone: account.phone,
    email: account.email,
    userTier: currentTierName,
    tierExpiresAt: currentExpiry,
    balance: account.balance,
  };

  return { success: true, user: authUser };
}

export function getLoggedInUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const user: AuthUser = JSON.parse(raw);

    if (user.username === 'thaibboi') {
      user.username = 'admin1';
      user.fullName = 'Nguyễn Văn A';
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }

    if (user.username.toLowerCase() === 'admin2' && user.balance < 1500000 && user.userTier?.includes('KIM CƯƠNG')) {
      user.userTier = determineTierByAmount(user.balance).name;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }

    const normUser = (user.fullName || '').replace(/\s+/g, ' ');
    if (
      normUser.includes('Trần Ngọc Nguyễn Văn A') ||
      (user.fullName && user.fullName.includes('Trần Ngọc') && user.fullName.includes('Nguyễn Văn A')) ||
      (user.username && user.username.toLowerCase() === 'thai1' && user.fullName && user.fullName.includes('Nguyễn Văn A'))
    ) {
      user.fullName = 'Trần Ngọc Thái';
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }

    if (user.tierExpiresAt && Date.now() > user.tierExpiresAt) {
      user.userTier = 'TÂN THỦ (ROOKIE)';
      delete user.tierExpiresAt;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      const accounts = getRegisteredAccounts();
      const idx = accounts.findIndex((a) => a.username.toLowerCase() === user.username.toLowerCase());
      if (idx !== -1) {
        accounts[idx].userTier = 'TÂN THỦ (ROOKIE)';
        delete accounts[idx].tierExpiresAt;
        saveRegisteredAccounts(accounts);
      }
    }

    return user;
  } catch {
    return null;
  }
}

export function loginUser(userData: AuthUser) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(CLIENT_PC_STORAGE_KEY, JSON.stringify(userData));
    localStorage.removeItem('CYBER_CLIENT_PC_EXPLICITLY_LOCKED');
    localStorage.setItem('CYBER_CLIENT_PC_UNLOCKED', 'true');
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: userData }));
    window.dispatchEvent(new CustomEvent(CLIENT_PC_EVENT_NAME, { detail: userData }));

    const accounts = getRegisteredAccounts();
    const idx = accounts.findIndex((a) => a.username.toLowerCase() === userData.username.toLowerCase());
    if (idx !== -1) {
      accounts[idx].balance = userData.balance;
      accounts[idx].userTier = userData.userTier;
      if (userData.tierExpiresAt) {
        accounts[idx].tierExpiresAt = userData.tierExpiresAt;
      } else {
        delete accounts[idx].tierExpiresAt;
      }
      if (userData.fullName) accounts[idx].fullName = userData.fullName;
      if (userData.phone) accounts[idx].phone = userData.phone;
      saveRegisteredAccounts(accounts);
    }

    let w: any = null;
    const walletRaw = localStorage.getItem('cyber_user_wallet');
    if (walletRaw) {
      try {
        w = JSON.parse(walletRaw);
      } catch {}
    }
    if (!w) {
      w = {
        userName: userData.fullName || userData.username,
        pcName: 'VIP-08',
        zoneName: 'PHÒNG RIÊNG VIP TẦNG 2',
        userTier: userData.userTier,
        balance: userData.balance,
        hourlyRate: 22000,
        transactions: [],
      };
    } else {
      w.userName = userData.fullName || userData.username;
      w.userTier = userData.userTier;
      w.balance = userData.balance;
      if (userData.tierExpiresAt) {
        w.tierExpiresAt = userData.tierExpiresAt;
      } else {
        delete w.tierExpiresAt;
      }
    }
    localStorage.setItem('cyber_user_wallet', JSON.stringify(w));
    window.dispatchEvent(new CustomEvent('cyber_wallet_updated', { detail: w }));
  } catch (err) {
    console.error('Failed to save auth state:', err);
  }
}

export function simulateTierExpiration(): AuthUser | null {
  const current = getLoggedInUser();
  if (!current) return null;
  const expiredUser: AuthUser = {
    ...current,
    userTier: 'TÂN THỦ (ROOKIE)',
    tierExpiresAt: undefined,
  };
  loginUser(expiredUser);

  if (typeof window !== 'undefined') {
    try {
      const rawAccs = localStorage.getItem(REGISTERED_ACCOUNTS_STORAGE_KEY);
      if (rawAccs) {
        const accs = JSON.parse(rawAccs);
        const idx = accs.findIndex((a: any) => a.username.toLowerCase() === current.username.toLowerCase());
        if (idx !== -1) {
          accs[idx].userTier = 'TÂN THỦ (ROOKIE)';
          delete accs[idx].tierExpiresAt;
          localStorage.setItem(REGISTERED_ACCOUNTS_STORAGE_KEY, JSON.stringify(accs));
        }
      }

      const walletRaw = localStorage.getItem('cyber_user_wallet');
      if (walletRaw) {
        const w = JSON.parse(walletRaw);
        w.userTier = 'TÂN THỦ (ROOKIE)';
        delete w.tierExpiresAt;
        localStorage.setItem('cyber_user_wallet', JSON.stringify(w));
        window.dispatchEvent(new CustomEvent('cyber_wallet_updated', { detail: w }));
      }
    } catch {}
  }

  return expiredUser;
}

export function restoreTier30Days(tierName: string = 'HỘI VIÊN BẠC 🥈'): AuthUser | null {
  const current = getLoggedInUser();
  if (!current) return null;
  const expiresAt = Date.now() + 30 * 24 * 3600 * 1000;
  const renewedUser: AuthUser = {
    ...current,
    userTier: tierName,
    tierExpiresAt: expiresAt,
  };
  loginUser(renewedUser);

  if (typeof window !== 'undefined') {
    try {
      const rawAccs = localStorage.getItem(REGISTERED_ACCOUNTS_STORAGE_KEY);
      if (rawAccs) {
        const accs = JSON.parse(rawAccs);
        const idx = accs.findIndex((a: any) => a.username.toLowerCase() === current.username.toLowerCase());
        if (idx !== -1) {
          accs[idx].userTier = tierName;
          accs[idx].tierExpiresAt = expiresAt;
          localStorage.setItem(REGISTERED_ACCOUNTS_STORAGE_KEY, JSON.stringify(accs));
        }
      }

      const walletRaw = localStorage.getItem('cyber_user_wallet');
      if (walletRaw) {
        const w = JSON.parse(walletRaw);
        w.userTier = tierName;
        w.tierExpiresAt = expiresAt;
        localStorage.setItem('cyber_user_wallet', JSON.stringify(w));
        window.dispatchEvent(new CustomEvent('cyber_wallet_updated', { detail: w }));
      }
    } catch {}
  }

  return renewedUser;
}

export function updateCurrentUserBalanceAndTier(newBalance: number): AuthUser | null {
  const current = getLoggedInUser();
  if (!current) return null;
  const newTier = determineTierByAmount(newBalance);
  const updatedUser: AuthUser = {
    ...current,
    balance: newBalance,
    userTier: newTier.name,
  };
  loginUser(updatedUser);
  return updatedUser;
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(CLIENT_PC_STORAGE_KEY);
    localStorage.setItem('CYBER_CLIENT_PC_EXPLICITLY_LOCKED', 'true');
    localStorage.setItem('CYBER_CLIENT_PC_UNLOCKED', 'false');
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: null }));
    window.dispatchEvent(new CustomEvent(CLIENT_PC_EVENT_NAME, { detail: null }));

    const walletRaw = localStorage.getItem('cyber_user_wallet');
    if (walletRaw) {
      try {
        const w = JSON.parse(walletRaw);
        w.userName = 'Tài khoản Hội viên';
        w.balance = 0;
        w.userTier = 'TÂN THỦ (ROOKIE)';
        delete w.tierExpiresAt;
        localStorage.setItem('cyber_user_wallet', JSON.stringify(w));
        window.dispatchEvent(new CustomEvent('cyber_wallet_updated', { detail: w }));
      } catch {}
    }
  } catch (err) {
    console.error('Failed to logout:', err);
  }
}

export function getClientPcSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const isExplicitlyLocked = localStorage.getItem('CYBER_CLIENT_PC_EXPLICITLY_LOCKED') === 'true' ||
      localStorage.getItem('CYBER_CLIENT_PC_UNLOCKED') === 'false';
    if (isExplicitlyLocked) {
      return null;
    }
    const logged = getLoggedInUser();
    if (logged) {
      return logged;
    }
    const raw = localStorage.getItem(CLIENT_PC_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthUser = JSON.parse(raw);
    return session;
  } catch {
    return null;
  }
}

export function saveClientPcSession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLIENT_PC_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent(CLIENT_PC_EVENT_NAME, { detail: user }));
  } catch (err) {
    console.error('Failed to save client pc session:', err);
  }
}

export function clearClientPcSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CLIENT_PC_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.setItem('CYBER_CLIENT_PC_EXPLICITLY_LOCKED', 'true');
    localStorage.setItem('CYBER_CLIENT_PC_UNLOCKED', 'false');
    window.dispatchEvent(new CustomEvent(CLIENT_PC_EVENT_NAME, { detail: null }));
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: null }));
  } catch (err) {
    console.error('Failed to clear client pc session:', err);
  }
}


export function updateUserFullName(newFullName: string): { success: boolean; error?: string; user?: AuthUser } {
  const cleanName = newFullName.trim();
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Họ và tên quá ngắn! Vui lòng nhập tối thiểu 2 ký tự.' };
  }
  const current = getLoggedInUser();
  if (!current) {
    return { success: false, error: 'Vui lòng đăng nhập để đổi tên!' };
  }

  current.fullName = cleanName;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(current));

      const accounts = getRegisteredAccounts();
      const idx = accounts.findIndex((a) => a.username.toLowerCase() === current.username.toLowerCase());
      if (idx !== -1) {
        accounts[idx].fullName = cleanName;
        saveRegisteredAccounts(accounts);
      }

      const walletRaw = localStorage.getItem('cyber_user_wallet');
      if (walletRaw) {
        const w = JSON.parse(walletRaw);
        w.userName = cleanName;
        localStorage.setItem('cyber_user_wallet', JSON.stringify(w));
        window.dispatchEvent(new CustomEvent('cyber_wallet_updated', { detail: w }));
      }

      const stnRaw = localStorage.getItem('cyber_active_station');
      if (stnRaw) {
        const stn = JSON.parse(stnRaw);
        stn.occupantName = cleanName;
        localStorage.setItem('cyber_active_station', JSON.stringify(stn));
        window.dispatchEvent(new CustomEvent('cyber_active_station_updated', { detail: stn }));
      }

      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: current }));
    } catch (e) {
      console.error('Error updating full name:', e);
    }
  }

  return { success: true, user: current };
}

export function changeUserPassword(currentPassword: string, newPassword: string, confirmPassword: string): { success: boolean; error?: string } {
  const cleanCurrent = currentPassword.trim();
  const cleanNew = newPassword.trim();
  const cleanConfirm = confirmPassword.trim();

  if (!cleanCurrent) {
    return { success: false, error: 'Vui lòng nhập mật khẩu hiện tại!' };
  }
  if (!cleanNew) {
    return { success: false, error: 'Vui lòng nhập mật khẩu mới!' };
  }
  if (cleanNew.length < 3) {
    return { success: false, error: 'Mật khẩu mới phải có ít nhất 3 ký tự!' };
  }
  if (cleanNew !== cleanConfirm) {
    return { success: false, error: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp! Vui lòng kiểm tra lại.' };
  }

  const current = getLoggedInUser();
  if (!current) {
    return { success: false, error: 'Vui lòng đăng nhập để đổi mật khẩu!' };
  }

  const accounts = getRegisteredAccounts();
  const idx = accounts.findIndex((a) => a.username.toLowerCase() === current.username.toLowerCase());
  if (idx === -1) {
    return { success: false, error: 'Không tìm thấy tài khoản của bạn trong hệ thống!' };
  }

  if (accounts[idx].password !== cleanCurrent) {
    return { success: false, error: 'Mật khẩu hiện tại không chính xác! Vui lòng thử lại.' };
  }

  accounts[idx].password = cleanNew;
  saveRegisteredAccounts(accounts);

  return { success: true };
}
