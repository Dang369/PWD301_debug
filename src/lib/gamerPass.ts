'use client';

export type TierCode = 'ROOKIE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface TierInfo {
  code: TierCode;
  name: string;
  shortName: string;
  minAmount: number;
  badgeClass: string;
  textColor: string;
  borderColor: string;
  accentBg: string;
  icon: string;
  tagline: string;
  playDiscountPercent: number;
  fnbDiscountPercent: number;
  reserveDurationMinutes: number;
  freeVipHours: number;
  perks: string[];
}

export const GAMER_PASS_TIERS: Record<TierCode, TierInfo> = {
  ROOKIE: {
    code: 'ROOKIE',
    name: 'THÀNH VIÊN TÂN THỦ',
    shortName: 'TÂN THỦ',
    minAmount: 0,
    badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-600',
    accentBg: 'bg-slate-500/10',
    icon: 'sports_esports',
    tagline: 'Mức nạp khởi điểm < 200.000đ',
    playDiscountPercent: 0,
    fnbDiscountPercent: 0,
    reserveDurationMinutes: 15,
    freeVipHours: 0,
    perks: [
      'Tặng 100% giá trị nạp đầu tiên (tối đa 50.000đ)',
      'Giá giờ chơi theo niêm yết chuẩn hệ thống',
      'Đặt giữ máy trước tối đa 15 phút',
      'Gọi món F&B bưng tận máy nhanh chóng',
    ],
  },
  SILVER: {
    code: 'SILVER',
    name: 'HỘI VIÊN BẠC 🥈',
    shortName: 'HẠNG BẠC',
    minAmount: 200000,
    badgeClass: 'bg-slate-500/20 text-slate-200 border-slate-400',
    textColor: 'text-slate-200',
    borderColor: 'border-slate-400',
    accentBg: 'bg-slate-400/10',
    icon: 'military_tech',
    tagline: 'Mức nạp tích lũy từ 200.000đ',
    playDiscountPercent: 10,
    fnbDiscountPercent: 5,
    reserveDurationMinutes: 20,
    freeVipHours: 3,
    perks: [
      'Giảm 10% giá giờ chơi toàn bộ hệ thống phòng máy',
      'Tặng ngay 3 Giờ chơi VIP miễn phí khi lên hạng',
      'Giảm 5% toàn bộ menu thực đơn Bếp F&B',
      'Ưu tiên giữ chỗ máy trước tối đa 20 phút',
    ],
  },
  GOLD: {
    code: 'GOLD',
    name: 'HỘI VIÊN VÀNG ⭐',
    shortName: 'HẠNG VÀNG',
    minAmount: 500000,
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500',
    accentBg: 'bg-amber-500/10',
    icon: 'star',
    tagline: 'Mức nạp tích lũy từ 500.000đ',
    playDiscountPercent: 20,
    fnbDiscountPercent: 10,
    reserveDurationMinutes: 45,
    freeVipHours: 8,
    perks: [
      'Giảm 20% giá giờ chơi toàn bộ hệ thống phòng máy',
      'Tặng 8 Giờ chơi VIP / PRO miễn phí',
      'Tặng 1 Combo Đêm (Mì cay + Sting dâu) mỗi tuần',
      'Giảm 10% toàn bộ thực đơn Bếp F&B',
      'Ưu tiên giữ chỗ máy trước tối đa 45 phút',
    ],
  },
  DIAMOND: {
    code: 'DIAMOND',
    name: 'HỘI VIÊN KIM CƯƠNG 💎',
    shortName: 'KIM CƯƠNG',
    minAmount: 1500000,
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-purple-500/40',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500',
    accentBg: 'bg-purple-500/10',
    icon: 'diamond',
    tagline: 'Mức nạp tích lũy từ 1.500.000đ - ĐẲNG CẤP VIP ELITE (Thời hạn 30 ngày)',
    playDiscountPercent: 35,
    fnbDiscountPercent: 20,
    reserveDurationMinutes: 999,
    freeVipHours: 20,
    perks: [
      'Giảm 35% tất cả các loại phòng máy (VIP, Pro, Stream, Couple, Bida, PS5)',
      'Giảm 20% toàn bộ thực đơn Bếp F&B (Mì, Cơm, Nước, Snack)',
      'Tặng 20 Giờ chơi VIP cao cấp mỗi tháng',
      'Free Refill nước ngọt có ga không giới hạn suốt ca chơi',
      'Tặng Áo thi đấu Gaming Jersey Cyber Zone in tên độc quyền',
      'Sở hữu Tủ Locker riêng bảo quản bàn phím, chuột cá nhân tại quán',
      'Thời hạn sử dụng: 30 ngày (hết hạn tự động về Tân thủ)',
    ],
  },
};

export const TIERS_ORDER: TierCode[] = ['ROOKIE', 'SILVER', 'GOLD', 'DIAMOND'];

export interface MembershipPlan {
  id: string;
  code: TierCode;
  name: string;
  badgeName: string;
  price: number;
  durationDays: number;
  description: string;
  perks: string[];
  popular?: boolean;
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plan-silver',
    code: 'SILVER',
    name: 'SILVER MEMBER (Hội Viên Bạc)',
    badgeName: 'HỘI VIÊN BẠC 🥈',
    price: 99000,
    durationDays: 30,
    description: 'Gói khởi đầu tối ưu dành cho game thủ thường xuyên ghé quán.',
    perks: [
      'Giảm 10% tiền giờ chơi toàn bộ hệ thống máy',
      'Tặng ngay 3 giờ chơi VIP miễn phí khi kích hoạt',
      'Giảm 5% đồ ăn nước uống thực đơn Bếp F&B',
      'Free nâng cấp tài khoản game bản quyền tại sảnh',
      'Tích lũy 1 điểm thưởng mỗi 1.000đ chi tiêu đổi quà Gear',
    ],
  },
  {
    id: 'plan-gold',
    code: 'GOLD',
    name: 'GOLD GAMER PASS (Hội Viên Vàng)',
    badgeName: 'HỘI VIÊN VÀNG ⭐',
    price: 249000,
    durationDays: 30,
    popular: true,
    description: 'Dành cho Rank cao thủ, game thủ try-hard và đội nhóm thi đấu.',
    perks: [
      'Giảm 20% tiền giờ chơi (Phòng VIP, Pro 540Hz, Standard)',
      'Tặng ngay 8 giờ chơi Ultra VIP Suite (trị giá 176k)',
      'Tặng 01 Combo Ăn Uống Free mỗi tuần (Mì trộn + Sting)',
      'Giảm 10% menu Bếp & Dịch vụ Mod phím / Lube switch',
      'Ưu tiên giữ máy trước giờ cao điểm 45 phút không lo hết chỗ',
      'Miễn phí vé tham dự toàn bộ Giải đấu Clan hàng tuần',
    ],
  },
  {
    id: 'plan-diamond',
    code: 'DIAMOND',
    name: 'DIAMOND ELITE VIP (Kim Cương)',
    badgeName: 'HỘI VIÊN KIM CƯƠNG 💎',
    price: 599000,
    durationDays: 30,
    description: 'Đẳng cấp thượng lưu: Full đặc quyền, tủ locker và đồ uống free.',
    perks: [
      'Giảm 35% tiền giờ chơi (Cả Arena, Couple, Console & Bida)',
      'Tặng ngay 20 giờ chơi VIP miễn phí trong tháng (trị giá 440k)',
      'Free Refill nước ngọt, cà phê, trà giải khát không giới hạn',
      'Tặng 01 Áo Jersey Thi Đấu Cyber Zone 2026 in Nickname',
      'Ngăn tủ Locker cá nhân cất giữ bàn phím & gear riêng biệt an toàn',
      'Chăm sóc VIP riêng, order món ăn ưu tiên giao trong 3 phút',
    ],
  },
];

export function determineTierByAmount(amount: number): TierInfo {
  if (amount >= GAMER_PASS_TIERS.DIAMOND.minAmount) {
    return GAMER_PASS_TIERS.DIAMOND;
  }
  if (amount >= GAMER_PASS_TIERS.GOLD.minAmount) {
    return GAMER_PASS_TIERS.GOLD;
  }
  if (amount >= GAMER_PASS_TIERS.SILVER.minAmount) {
    return GAMER_PASS_TIERS.SILVER;
  }
  return GAMER_PASS_TIERS.ROOKIE;
}

export function getTierByName(nameOrCode?: string): TierInfo {
  if (!nameOrCode) return GAMER_PASS_TIERS.ROOKIE;
  const upper = nameOrCode.toUpperCase();
  if (upper.includes('KIM CƯƠNG') || upper.includes('DIAMOND')) {
    return GAMER_PASS_TIERS.DIAMOND;
  }
  if (upper.includes('VÀNG') || upper.includes('GOLD')) {
    return GAMER_PASS_TIERS.GOLD;
  }
  if (upper.includes('BẠC') || upper.includes('SILVER')) {
    return GAMER_PASS_TIERS.SILVER;
  }
  return GAMER_PASS_TIERS.ROOKIE;
}

export function getTierRemainingDays(expiresAt?: number): {
  isExpired: boolean;
  daysRemaining: number;
  formattedExpiry: string;
} {
  if (!expiresAt) {
    return { isExpired: false, daysRemaining: 0, formattedExpiry: '' };
  }
  const diff = expiresAt - Date.now();
  if (diff <= 0) {
    return {
      isExpired: true,
      daysRemaining: 0,
      formattedExpiry: new Date(expiresAt).toLocaleDateString('vi-VN'),
    };
  }
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  return {
    isExpired: false,
    daysRemaining: days,
    formattedExpiry: new Date(expiresAt).toLocaleDateString('vi-VN'),
  };
}

export function calculateTierProgression(effectiveAmount: number) {
  const currentTier = determineTierByAmount(effectiveAmount);

  let nextTier: TierInfo | null = null;
  let progressPercent = 100;
  let neededAmount = 0;

  if (currentTier.code === 'ROOKIE') {
    nextTier = GAMER_PASS_TIERS.SILVER;
    neededAmount = Math.max(0, nextTier.minAmount - effectiveAmount);
    progressPercent = Math.min(100, Math.round((effectiveAmount / nextTier.minAmount) * 100));
  } else if (currentTier.code === 'SILVER') {
    nextTier = GAMER_PASS_TIERS.GOLD;
    const range = nextTier.minAmount - GAMER_PASS_TIERS.SILVER.minAmount;
    const currentProgress = effectiveAmount - GAMER_PASS_TIERS.SILVER.minAmount;
    neededAmount = Math.max(0, nextTier.minAmount - effectiveAmount);
    progressPercent = Math.min(100, Math.round((currentProgress / range) * 100));
  } else if (currentTier.code === 'GOLD') {
    nextTier = GAMER_PASS_TIERS.DIAMOND;
    const range = nextTier.minAmount - GAMER_PASS_TIERS.GOLD.minAmount;
    const currentProgress = effectiveAmount - GAMER_PASS_TIERS.GOLD.minAmount;
    neededAmount = Math.max(0, nextTier.minAmount - effectiveAmount);
    progressPercent = Math.min(100, Math.round((currentProgress / range) * 100));
  } else {
    nextTier = null;
    neededAmount = 0;
    progressPercent = 100;
  }

  return {
    currentTier,
    nextTier,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    neededAmount,
    isMaxTier: currentTier.code === 'DIAMOND',
  };
}
