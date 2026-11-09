'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ALL_SEATS_CONFIG,
  saveBooking,
  getStoredBookings,
  BOOKING_STORAGE_EVENT,
  SeatBooking,
  BaseSeat,
  saveServiceAppointment,
  saveGearBorrowRecord,
  ServiceAppointment,
  GearBorrowRecord,
} from '@/lib/bookingStore';
import { createStaffRequest } from '@/lib/staffRequestStore';
import {
  getLoggedInUser,
  loginUser,
  AUTH_EVENT_NAME,
  AuthUser,
  simulateTierExpiration,
  restoreTier30Days,
} from '@/lib/authStore';
import AuthModal from '@/components/auth/AuthModal';
import {
  subscribeMembershipPlan,
  getStoredWallet,
  WALLET_EVENT_NAME,
  UserWallet,
  INITIAL_WALLET,
  getActiveClientStation,
  ACTIVE_STATION_EVENT,
  getCumulativeTopupAmount,
} from '@/lib/walletStore';
import {
  MEMBERSHIP_PLANS,
  getTierRemainingDays,
  getTierByName,
  GAMER_PASS_TIERS,
  TIERS_ORDER,
  calculateTierProgression,
} from '@/lib/gamerPass';

const GEAR_PRODUCTS = [
  {
    id: 'gear-1',
    name: 'Chuột Zowie EC2-CW Wireless',
    category: 'mouse',
    price: '2.890.000đ',
    tag: 'Chuẩn Thi Đấu CS2',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    desc: 'Cảm biến 3395, receiver độc lập chống nhiễu sóng 2.4GHz, form công thái học huyền thoại dành riêng cho tuyển thủ eSports.',
    testStation: 'Có sẵn trải nghiệm tại dãy máy VIP-01..08',
  },
  {
    id: 'gear-2',
    name: 'Chuột Razer Viper V3 Pro Esports 8000Hz',
    category: 'mouse',
    price: '3.490.000đ',
    tag: '8000Hz Siêu Tốc',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    desc: 'Trọng lượng siêu nhẹ chỉ 54g, Polling rate 8000Hz thực, switch quang Gen-3 90 triệu lần nhấn không bao giờ double-click.',
    testStation: 'Có sẵn tại Sàn Đấu Arena 5vs5 Tầng 1',
  },
  {
    id: 'gear-3',
    name: 'Bàn Phím Cơ Wooting 60HE Hall Effect',
    category: 'keyboard',
    price: '4.290.000đ',
    tag: 'Rapid Trigger 0.1mm',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
    desc: 'Công nghệ switch từ tính Lekker, Rapid Trigger nhận phím tức thì 0.1mm, triệt tiêu hoàn toàn delay trong game đối kháng.',
    testStation: 'Có sẵn tại Trạm Gear Lab Sảnh Chính',
  },
  {
    id: 'gear-4',
    name: 'Lót Chuột Artisan Hayate Otsu FX Soft',
    category: 'mouse',
    price: '1.250.000đ',
    tag: 'Made in Japan 🇯🇵',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    desc: 'Vải dệt kim cương Poron xốp dính chặt mặt bàn, stopping power và tracking cực êm, chuẩn gear tuyển thủ Valorant.',
    testStation: 'Trang bị 100% tại Khu Cyber Pro 540Hz',
  },
  {
    id: 'gear-5',
    name: 'Dịch Vụ Lube Switch & Cân Wire Custom',
    category: 'services',
    price: '150.000đ / phím',
    tag: 'Trạm Mod Phím Lab',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    desc: 'Tra mỡ Krytox 205g0 + mỡ thanh giằng XHT-BDZ, nắn thẳng wire, dán foam đáy Poron chống rỗng, tune âm thocky/creamy.',
    testStation: 'Kỹ thuật viên phục vụ lấy ngay trong 30 phút',
  },
  {
    id: 'gear-6',
    name: 'Dịch Vụ Tra Keo Honeywell PTM7950 & Vệ Sinh PC',
    category: 'services',
    price: '200.000đ / máy',
    tag: 'Giảm 15°C Tức Thì',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80',
    desc: 'Keo tản nhiệt biến tính pha độc quyền Honeywell PTM7950 nhập khẩu Mỹ, vệ sinh quạt tản bụi và bảo dưỡng bo mạch toàn diện.',
    testStation: 'Kỹ thuật viên phục vụ tại sảnh hoặc tại nhà',
  },
];

const SIX_ZONES_HOME = [
  {
    id: 'STANDARD' as const,
    num: '01',
    name: 'Standard Zone Tiêu Chuẩn',
    badge: '10 MÁY • STD-01..10',
    rate: '12.000đ/h',
    themeColor: 'emerald',
    cardBorder: 'hover:border-emerald-500/50',
    activeRing: 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-emerald-500/20',
    tagClass: 'text-emerald-400 border-emerald-500/40',
    accentText: 'text-emerald-400',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80',
    desc: 'Khu máy công cộng tiêu chuẩn (mã máy STD-01..10). Tối ưu thi đấu đối kháng CS2, Valorant, LMHT, FO4. Ghế da đúc công thái học, phím cơ DareU, chuột Logitech G102.',
    cpu: 'i5-13400F 10 Cores',
    gpu: 'RTX 4060Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím DareU EK87',
    chair: 'Ghế da đúc công thái học',
  },
  {
    id: 'PRO' as const,
    num: '02',
    name: 'Cyber Pro 540Hz Try-Hard',
    badge: '4 MÁY • PRO-01..04',
    rate: '18.000đ/h',
    themeColor: 'cyan',
    cardBorder: 'hover:border-cyan-500/50',
    activeRing: 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-500/20',
    tagClass: 'text-cyan-400 border-cyan-500/40',
    accentText: 'text-cyan-400',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80',
    desc: 'Khu vực máy thi đấu FPS cao cấp (mã PRO-01..04). Màn hình Zowie 540Hz phá vỡ mọi giới hạn tốc độ, phím Wooting 60HE Hall Effect Rapid Trigger, ghế Herman Miller Embody.',
    cpu: 'Ryzen 7 7800X3D 3D V-Cache',
    gpu: 'RTX 4080 Super 16GB GDDR6X',
    screen: 'BenQ Zowie XL2566K 540Hz DyAc+',
    gear: 'Wooting 60HE Rapid Trigger + Zowie EC2-CW',
    chair: 'Herman Miller Embody Gaming',
  },
  {
    id: 'VIP' as const,
    num: '03',
    name: 'Phòng Riêng Ultra VIP Tầng 2',
    badge: '8 PHÒNG • VIP-01..08',
    rate: '22.000đ/h',
    themeColor: 'purple',
    cardBorder: 'hover:border-purple-500/50',
    activeRing: 'border-purple-400 ring-2 ring-purple-400/50 shadow-purple-500/20',
    tagClass: 'text-purple-400 border-purple-500/40',
    accentText: 'text-purple-400',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=700&q=80',
    desc: 'Dãy phòng VIP riêng biệt (mã VIP-01..08 bao gồm máy bạn trải nghiệm VIP-08). Cách âm 45dB, ghế bọc da Nappa ngả 160°, chuột Zowie EC2-CW không dây, bàn phím Akko Custom Lube.',
    cpu: 'Core i7-14700K / Core i9 14900K',
    gpu: 'RTX 4070Ti Super / RTX 4090 24GB',
    screen: 'ASUS ROG Swift 27" 240Hz Fast-IPS',
    gear: 'Akko Custom Lube + Zowie EC2-CW Wireless',
    chair: 'Ghế bọc da Nappa ngả lưng 160° gác chân',
  },
  {
    id: 'ARENA' as const,
    num: '04',
    name: 'Đấu Trường 5vs5 Chuẩn IESF',
    badge: '10 MÁY • ARENA-A1..B5',
    rate: '25.000đ/h',
    themeColor: 'amber',
    cardBorder: 'hover:border-amber-500/50',
    activeRing: 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20',
    tagClass: 'text-amber-400 border-amber-500/40',
    accentText: 'text-amber-400',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=700&q=80',
    desc: 'Sàn đấu thi đấu đối kháng chuyên nghiệp (ARENA-A1..A5 Đội Xanh vs ARENA-B1..B5 Đội Đỏ). Đường truyền cáp quang riêng biệt ≤ 1ms, chuẩn bị sẵn sàng cho giải đấu trường học & clan.',
    cpu: 'Core i9-14900KS Flagship 6.2GHz',
    gpu: 'RTX 4090 24GB OC Gaming Edition',
    screen: 'ROG Swift Pro OLED 540Hz Kỷ Lục',
    gear: 'Wooting 60HE + Zowie EC2-CW + Artisan Pad',
    chair: 'Ghế thi đấu IESF World Championship',
  },
  {
    id: 'COUPLE_STREAM' as const,
    num: '05',
    name: 'Couple Suite & Phòng Stream 4K',
    badge: '4 PHÒNG • COUPLE & STREAM',
    rate: '35.000đ - 45.000đ/h',
    themeColor: 'pink',
    cardBorder: 'hover:border-pink-500/50',
    activeRing: 'border-pink-400 ring-2 ring-pink-400/50 shadow-pink-500/20',
    tagClass: 'text-pink-400 border-pink-500/40',
    accentText: 'text-pink-400',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=700&q=80',
    desc: 'Phòng đôi hẹn hò gaming riêng tư cách âm (COUPLE-01..02) và Phòng Stream Studio Soundproof (STREAM-01..02) trang bị camera Sony Alpha 4K, đèn Elgato Key Light và mic Shure SM7B.',
    cpu: 'Dual Core i7-14700K Gaming & Stream',
    gpu: 'Dual RTX 4070Ti Super + Card 4K60 Pro',
    screen: '2x Samsung Odyssey G7 27" Cong 240Hz',
    gear: 'Mic Shure SM7B + Sony A6700 4K Cam + GoXLR',
    chair: 'Sofa đôi da Nappa ngả 180° nệm mút đúc',
  },
  {
    id: 'CONSOLE_BIDA' as const,
    num: '06',
    name: 'Console Lounge PS5 Pro & Bida Club',
    badge: '6 MÁY/BÀN • CONSOLE & BIDA',
    rate: '79.000đ/h',
    themeColor: 'blue',
    cardBorder: 'hover:border-blue-500/50',
    activeRing: 'border-blue-400 ring-2 ring-blue-400/50 shadow-blue-500/20',
    tagClass: 'text-blue-400 border-blue-500/40',
    accentText: 'text-blue-400',
    image: '/images/billiards-lounge.jpg',
    desc: 'Phòng riêng hội bạn chiến FC25, Mortal Kombat, Mario Kart (CONSOLE-01..02) và Billiards Club 10 bàn Aileex King 9020 (BIDA-01..04). TV 75" 4K OLED 120Hz Dolby Vision, 4 tay cầm DualSense Edge.',
    cpu: 'PS5 Pro 2TB Ray-Tracing + Bàn Aileex King 9020',
    gpu: 'Custom RDNA 3 67WGP + Đá tự nhiên 3 tấm Bỉ',
    screen: 'TV LG OLED G3 75" 4K 120Hz Dolby Vision',
    gear: '4 Tay cầm DualSense Edge + Bi Aramith Pro',
    chair: 'Sofa góc bọc nỉ Lounge thể thao sang trọng',
  },
];

function getZoneForSeat(seat: BaseSeat): 'STANDARD' | 'PRO' | 'VIP' | 'ARENA' | 'COUPLE_STREAM' | 'CONSOLE_BIDA' {
  const id = seat.id.toUpperCase();
  if (id.startsWith('STD-') || id.startsWith('REG-')) return 'STANDARD';
  if (id.startsWith('PRO-')) return 'PRO';
  if (id.startsWith('VIP-')) return 'VIP';
  if (id.startsWith('ARENA-')) return 'ARENA';
  if (id.startsWith('COUPLE-') || id.startsWith('STREAM-')) return 'COUPLE_STREAM';
  if (id.startsWith('CONSOLE-') || id.startsWith('BIDA-')) return 'CONSOLE_BIDA';
  return 'STANDARD';
}

const INITIAL_COMMUNITY_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Vũ Minh Hiếu (Kuro)',
    verified: true,
    role: 'Đội trưởng Clan Vinh Esports • Top Radiant Valorant',
    avatar: 'MH',
    avatarBg: 'bg-red-600/20 text-red-400 border-red-500/40',
    cardBorder: 'border-red-500/30 hover:border-red-500/60',
    rating: 5,
    comment: 'Màn hình Zowie 540Hz và ping mạng 1ms ở Cyber Zone cho độ mượt cực đỉnh, cảm giác aim và sấy tâm chuẩn xác từng khung hình. Khu đấu trường Arena cách âm tốt, cả team giao tiếp chiến thuật không bị nhiễu tiếng ồn.',
    timeAgo: 'Tuyển Thủ Bán Chuyên',
  },
  {
    id: 'rev-2',
    author: 'Phùng Thanh Độ (MixiGaming)',
    verified: true,
    role: 'Streamer / Content Creator • Khách Mời Sự Kiện',
    avatar: 'ĐM',
    avatarBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    cardBorder: 'border-amber-500/30 hover:border-amber-500/60',
    rating: 5,
    comment: 'Đợt ghé giao lưu ở Cyber Zone bắn CS2 công nhận dàn máy cấu hình khét thật sự! Phòng Stream Studio thu âm kín đét, còn quả mì trộn Indomie trứng lòng đào của bếp làm ngon xuất sắc anh em ạ!',
    timeAgo: 'Khách Mời Giao Lưu',
  },
  {
    id: 'rev-3',
    author: 'Đặng Quốc Khánh',
    verified: true,
    role: 'Kỹ Sư Hệ Thống Mạng • Hội Viên Kim Cương 💎',
    avatar: 'QK',
    avatarBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    cardBorder: 'border-cyan-500/30 hover:border-cyan-500/60',
    rating: 5,
    comment: 'Ấn tượng nhất là hạ tầng mạng 10Gbps Multi-ISP Trunk và hệ thống bootrom Diskless khởi chạy game trong 3 giây. Ngồi cày rank cả tối nhiệt độ phòng luôn mát lạnh, ghế công thái học không hề mỏi lưng.',
    timeAgo: '1 ngày trước',
  },
  {
    id: 'rev-4',
    author: 'Nguyễn Hoàng Long',
    verified: true,
    role: 'Hội Viên Kim Cương • 320h Chơi',
    avatar: 'NL',
    avatarBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    cardBorder: 'border-purple-500/30 hover:border-purple-500/60',
    rating: 5,
    comment: 'Hệ thống tự động quy đổi giờ chơi khi chuyển từ Standard lên Ultra VIP cực kỳ thông minh và minh bạch! Đổi phòng là đồng hồ nhảy giờ chuẩn đến từng giây, không lo bị tính lố tiền.',
    timeAgo: '2 ngày trước',
  },
  {
    id: 'rev-5',
    author: 'Trần Linh Chi',
    verified: false,
    role: 'Khách Thường Xuyên Couple Zone',
    avatar: 'LC',
    avatarBg: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    cardBorder: 'border-pink-500/20 hover:border-pink-500/50',
    rating: 5,
    comment: 'Phòng đôi Couple Sanctuary ghế sofa bọc da Nappa siêu êm ngả 180°, tai nghe đôi riêng tư không bị lẫn tiếng ồn bên ngoài. Mình và bạn trai tuần nào cũng tới đây hẹn hò chơi game.',
    timeAgo: '3 ngày trước',
  },
  {
    id: 'rev-6',
    author: 'Lê Quốc Tuấn',
    verified: true,
    role: 'Đội Trưởng Clan Hades CS2',
    avatar: 'QT',
    avatarBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cardBorder: 'border-white/10 hover:border-emerald-500/50',
    rating: 5,
    comment: 'Bàn phím cơ Wooting 60HE Rapid Trigger 0.1mm và dịch vụ lube switch tại sảnh làm rất kỹ. Cân wire không còn tiếng lọc xọc, cảm giác nhấn phím mượt mà như bơ.',
    timeAgo: '5 ngày trước',
  },
];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [selectedZone, setSelectedZone] = useState<'ALL' | 'STANDARD' | 'PRO' | 'VIP' | 'ARENA' | 'COUPLE_STREAM' | 'CONSOLE_BIDA'>('STANDARD');
  const [selectedModalSeat, setSelectedModalSeat] = useState<BaseSeat | null>(null);
  const [selectedSeatForBooking, setSelectedSeatForBooking] = useState<string | null>(null);
  const [storedBookings, setStoredBookings] = useState<SeatBooking[]>([]);
  const [customSeatRates, setCustomSeatRates] = useState<Record<string, number>>({});

  const [branch, setBranch] = useState('Zone 01: 182 Lê Duẩn, TP. Vinh (Flagship Complex)');
  const [zoneCategory, setZoneCategory] = useState('Standard Zone Tiêu Chuẩn (STD-01..10) - 12.000đ/h');
  const [quantity, setQuantity] = useState('1');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('Ngay bây giờ (Tức thì)');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState<string | undefined>(undefined);
  const [successBooking, setSuccessBooking] = useState<{
    code: string;
    seatId: string;
    name: string;
    zone: string;
  } | null>(null);

  const [membershipToast, setMembershipToast] = useState<string | null>(null);
  const [membershipErrorToast, setMembershipErrorToast] = useState<{
    message: string;
    neededAmount?: number;
  } | null>(null);
  const [wallet, setWallet] = useState<UserWallet>(INITIAL_WALLET);

  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [selectedGearTab, setSelectedGearTab] = useState<'all' | 'mouse' | 'keyboard' | 'services'>('all');
  const [gearSuccessToast, setGearSuccessToast] = useState<string | null>(null);

  const [borrowModalGear, setBorrowModalGear] = useState<(typeof GEAR_PRODUCTS)[0] | null>(null);
  const [borrowStationId, setBorrowStationId] = useState('VIP-01');
  const [borrowCustomerName, setBorrowCustomerName] = useState('');
  const [borrowPhone, setBorrowPhone] = useState('');
  const [borrowDuration, setBorrowDuration] = useState('45 phút');
  const [borrowNotes, setBorrowNotes] = useState('');
  const [borrowSuccessModal, setBorrowSuccessModal] = useState<GearBorrowRecord | null>(null);

  const [serviceBookingItem, setServiceBookingItem] = useState<(typeof GEAR_PRODUCTS)[0] | null>(null);
  const [serviceCustomerName, setServiceCustomerName] = useState('');
  const [serviceCustomerPhone, setServiceCustomerPhone] = useState('');
  const [serviceDate, setServiceDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [serviceTimeSlot, setServiceTimeSlot] = useState('09:00 - 10:30');
  const [serviceLocationType, setServiceLocationType] = useState<'STORE' | 'HOME'>('STORE');
  const [serviceStoreDetail, setServiceStoreDetail] = useState<'COUNTER' | 'STATION'>('STATION');
  const [serviceStationId, setServiceStationId] = useState('VIP-01');
  const [serviceHomeAddress, setServiceHomeAddress] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceSuccessModal, setServiceSuccessModal] = useState<ServiceAppointment | null>(null);

  const [activeCommunityTab, setActiveCommunityTab] = useState<'tournaments' | 'lfg' | 'reviews'>('tournaments');
  const [tournamentSuccessToast, setTournamentSuccessToast] = useState<string | null>(null);
  const [communityReviews, setCommunityReviews] = useState(INITIAL_COMMUNITY_REVIEWS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRole, setReviewRole] = useState('Hội Viên Kim Cương 💎');
  const [reviewStation, setReviewStation] = useState('Phòng Ultra VIP Suite (VIP-08)');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessToast, setReviewSuccessToast] = useState<string | null>(null);
  const [lfgPosts, setLfgPosts] = useState([
    {
      id: 'lfg-1',
      author: 'Clan Hades (Đội Trưởng Minh)',
      avatar: '🔥',
      station: 'Khu Máy PRO-01..04',
      game: 'CS2 (Counter-Strike 2)',
      rank: 'Faceit Level 8+',
      title: 'Cần tuyển 1 Pro Sniper / Rifler try-hard leo rank tối nay. Có mic discord, bao nước Sting dâu!',
      time: '5 phút trước',
      slotsNeeded: 1,
    },
    {
      id: 'lfg-2',
      author: 'Nguyễn Văn A (Trưởng Nhóm)',
      avatar: '⭐',
      station: 'Máy Trạm VIP-08',
      game: 'Liên Minh Huyền Thoại',
      rank: 'Cao Thủ / Kim Cương I',
      title: 'Tìm 2 anh em leo rank thông đêm phòng Ultra VIP Tầng 2. Máy cực mượt, combat không độ trễ.',
      time: '18 phút trước',
      slotsNeeded: 2,
    },
    {
      id: 'lfg-3',
      author: 'Hoàng Long & Tuấn Anh',
      avatar: '🎯',
      station: 'Bàn Bida BIDA-03',
      game: 'Billiards Pool 9-Ball',
      rank: 'Cơ thủ phong trào',
      title: 'Giao lưu giao hữu kèo Pool 9-ball tính điểm Aileex King. Ai thua mời nước giải khát!',
      time: '35 phút trước',
      slotsNeeded: 2,
    },
    {
      id: 'lfg-4',
      author: 'Team Valkyrie (Linh Chi)',
      avatar: '🌸',
      station: 'Phòng Đôi COUPLE-01',
      game: 'Valorant',
      rank: 'Ascendant / Immortal',
      title: 'Tìm team 5vs5 scrim giao lưu cọ sát trước thềm giải đấu Cyber Zone Championship.',
      time: '1 giờ trước',
      slotsNeeded: 3,
    },
  ]);
  const [newLfgName, setNewLfgName] = useState('');
  const [newLfgGame, setNewLfgGame] = useState('CS2');
  const [newLfgStation, setNewLfgStation] = useState('Khu Standard');
  const [newLfgContent, setNewLfgContent] = useState('');

  const getSeatLiveStatus = (seat: BaseSeat) => {
    if (!isMounted) {
      return {
        status: 'AVAILABLE' as const,
        label: 'MÁY TRỐNG',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dotClass: 'bg-emerald-400',
        occupant: null,
        timeSlot: null,
      };
    }
    const booking = storedBookings.find(
      (b) => b.seatId === seat.id && (b.status === 'RESERVED' || b.status === 'CONFIRMED')
    );
    if (booking) {
      return {
        status: 'RESERVED' as const,
        label: booking.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN GIỮ MÁY' : 'CHỜ DUYỆT GIỮ CHỖ',
        badgeClass: booking.status === 'CONFIRMED' ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 font-bold' : 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dotClass: booking.status === 'CONFIRMED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
        occupant: booking.customerName,
        timeSlot: booking.timeSlot,
      };
    }

    const activeStn = getActiveClientStation();
    const activeStnId = activeStn?.stationId || wallet.pcName || 'ARENA-A1';
    const isOnlineNow = activeStn ? activeStn.isOnline : true;

    if (isOnlineNow && seat.id === activeStnId) {
      return {
        status: 'OCCUPIED' as const,
        label: 'ĐANG HOẠT ĐỘNG',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        dotClass: 'bg-cyan-400 animate-ping',
        occupant: activeStn?.occupantName || wallet.userName || 'Trần Ngọc Thái (Hội Viên)',
        timeSlot: 'Đang chơi tại máy trạm',
      };
    }

    return {
      status: 'AVAILABLE' as const,
      label: 'MÁY TRỐNG',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dotClass: 'bg-emerald-400',
      occupant: null,
      timeSlot: null,
    };
  };

  const getSeatPrice = (seat: BaseSeat) => {
    if (customSeatRates[seat.id]) {
      return `${customSeatRates[seat.id].toLocaleString('vi-VN')}đ/h`;
    }
    return seat.price;
  };

  const handleSelectSeatToBook = (seat: BaseSeat) => {
    if (!currentUser) {
      setAuthModalMessage(`Vui lòng đăng nhập tài khoản Cyber Zone để tiến hành đặt giữ chỗ cho máy ${seat.id} (${seat.zoneName})!`);
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedSeatForBooking(seat.id);
    setSelectedModalSeat(null);

    if (seat.id.startsWith('STD-')) {
      setZoneCategory('Standard Zone Tiêu Chuẩn (STD-01..10) - 12.000đ/h');
    } else if (seat.id.startsWith('PRO-')) {
      setZoneCategory('Cyber Pro 540Hz (PRO-01..04) - 18.000đ/h');
    } else if (seat.id.startsWith('VIP-')) {
      setZoneCategory('Ultra VIP Suite (VIP-01..08) - 22.000đ/h');
    } else if (seat.id.startsWith('ARENA-')) {
      setZoneCategory('Đấu Trường Arena 5vs5 (ARENA-A1..B5) - 25.000đ/h');
    } else if (seat.id.startsWith('STREAM-')) {
      setZoneCategory('Stream Studio Soundproof (STREAM-01..02) - 35.000đ/h');
    } else if (seat.id.startsWith('COUPLE-')) {
      setZoneCategory('Couple Sanctuary (COUPLE-01..02) - 45.000đ/h');
    } else if (seat.id.startsWith('CONSOLE-')) {
      setZoneCategory('Console Lounge & PS5 Pro (CONSOLE-01..02) - 79.000đ/h');
    } else if (seat.id.startsWith('BIDA-')) {
      setZoneCategory('Billiards Club (BIDA-01..10) - 79.000đ/h');
    }

    const formEl = document.getElementById('dat-cho');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const user = getLoggedInUser();
    setCurrentUser(user);
    const initialWallet = getStoredWallet();
    setWallet(initialWallet);
    if (user) {
      setCustomerName(user.fullName);
      setPhone(user.phone);
    }

    const handleWalletSync = () => {
      setWallet(getStoredWallet());
      const u = getLoggedInUser();
      setCurrentUser(u);
    };

    const handleAuthChange = () => {
      const updatedUser = getLoggedInUser();
      setCurrentUser(updatedUser);
      if (updatedUser) {
        setCustomerName(updatedUser.fullName);
        setPhone(updatedUser.phone);
      }
    };

    const activeStation = getActiveClientStation();
    if (activeStation?.stationId) {
      setBorrowStationId(activeStation.stationId);
      setServiceStationId(activeStation.stationId);
    }
    setStoredBookings(getStoredBookings());
    try {
      const savedRev = localStorage.getItem('CYBER_COMMUNITY_REVIEWS');
      if (savedRev) {
        const parsed = JSON.parse(savedRev);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCommunityReviews(parsed);
        }
      }
    } catch {}
    try {
      const savedRates = localStorage.getItem('CYBER_CUSTOM_SEAT_RATES');
      if (savedRates) setCustomSeatRates(JSON.parse(savedRates));
    } catch {}

    const handleBookingSync = () => {
      setStoredBookings(getStoredBookings());
    };

    const handleCustomRatesSync = (e: StorageEvent) => {
      if (e.key === 'CYBER_CUSTOM_SEAT_RATES' && e.newValue) {
        try {
          setCustomSeatRates(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthChange);
    window.addEventListener(WALLET_EVENT_NAME, handleWalletSync);
    window.addEventListener(ACTIVE_STATION_EVENT, handleWalletSync);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('storage', handleWalletSync);
    window.addEventListener(BOOKING_STORAGE_EVENT, handleBookingSync);
    window.addEventListener('storage', handleBookingSync);
    window.addEventListener('storage', handleCustomRatesSync);

    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthChange);
      window.removeEventListener(WALLET_EVENT_NAME, handleWalletSync);
      window.removeEventListener(ACTIVE_STATION_EVENT, handleWalletSync);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('storage', handleWalletSync);
      window.removeEventListener(BOOKING_STORAGE_EVENT, handleBookingSync);
      window.removeEventListener('storage', handleBookingSync);
      window.removeEventListener('storage', handleCustomRatesSync);
    };
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setAuthModalMessage('Bạn cần đăng nhập tài khoản Cyber Zone để xác thực và tiến hành đặt giữ chỗ máy / bàn!');
      setIsAuthModalOpen(true);
      return;
    }

    let targetPrefix = 'STD-';
    let targetSeatId = selectedSeatForBooking || 'STD-01';
    if (!selectedSeatForBooking) {
      if (zoneCategory.includes('Standard')) { targetSeatId = 'STD-01'; targetPrefix = 'STD-'; }
      else if (zoneCategory.includes('Billiards') || zoneCategory.includes('Bida')) { targetSeatId = 'BIDA-01'; targetPrefix = 'BIDA-'; }
      else if (zoneCategory.includes('VIP')) { targetSeatId = 'VIP-01'; targetPrefix = 'VIP-'; }
      else if (zoneCategory.includes('Pro')) { targetSeatId = 'PRO-01'; targetPrefix = 'PRO-'; }
      else if (zoneCategory.includes('Arena')) { targetSeatId = 'ARENA-A1'; targetPrefix = 'ARENA-'; }
      else if (zoneCategory.includes('Stream')) { targetSeatId = 'STREAM-01'; targetPrefix = 'STREAM-'; }
      else if (zoneCategory.includes('Couple')) { targetSeatId = 'COUPLE-01'; targetPrefix = 'COUPLE-'; }
      else if (zoneCategory.includes('Console')) { targetSeatId = 'CONSOLE-01'; targetPrefix = 'CONSOLE-'; }
    } else {
      targetPrefix = selectedSeatForBooking.split('-')[0] + '-';
    }

    const qty = Math.max(1, parseInt(quantity || '1', 10) || 1);
    const primarySeat = ALL_SEATS_CONFIG.find((s) => s.id === targetSeatId) || ALL_SEATS_CONFIG[0];
    const zoneSeats = ALL_SEATS_CONFIG.filter((s) => s.id.startsWith(targetPrefix));
    const seatsToBook = [primarySeat];

    for (const candidate of zoneSeats) {
      if (seatsToBook.length >= qty) break;
      if (candidate.id !== primarySeat.id && candidate.status !== 'MAINTENANCE') {
        seatsToBook.push(candidate);
      }
    }

    let firstBooking = null;
    for (const s of seatsToBook) {
      const b = saveBooking({
        seatId: s.id,
        customerName: customerName.trim() || currentUser.fullName,
        phone: phone.trim() || currentUser.phone || '0988.888.888',
        timeSlot,
        date: bookingDate,
        zone: s.zoneName,
        branch,
        status: 'RESERVED',
        notes: `Đặt trước ${qty} chỗ (${seatsToBook.map((x) => x.id).join(', ')}) - ${zoneCategory}`,
      });
      if (!firstBooking) firstBooking = b;
    }

    setStoredBookings(getStoredBookings());
    if (firstBooking) {
      setSuccessBooking({
        code: firstBooking.bookingCode,
        seatId: seatsToBook.map((s) => s.id).join(', '),
        name: firstBooking.customerName,
        zone: firstBooking.zone,
      });
    }
  };

  const handleSubscribePlan = (planId: string) => {
    setMembershipErrorToast(null);
    setMembershipToast(null);

    if (!currentUser) {
      const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
      setAuthModalMessage(`Vui lòng đăng nhập tài khoản CyberZone để đăng ký ${plan?.name || 'gói hội viên'}!`);
      setIsAuthModalOpen(true);
      return;
    }

    const res = subscribeMembershipPlan(planId);
    if (!res.success) {
      setMembershipErrorToast({
        message: res.error || 'Số dư ví không đủ để đăng ký gói!',
        neededAmount: res.neededAmount,
      });
      return;
    }

    const updatedUser = getLoggedInUser();
    if (updatedUser) setCurrentUser(updatedUser);
    const updatedWallet = getStoredWallet();
    setWallet(updatedWallet);

    const plan = res.plan!;
    const expiryDateStr = res.expiresAt ? new Date(res.expiresAt).toLocaleDateString('vi-VN') : '30 ngày';
    setMembershipToast(
      `🎉 Chúc mừng bạn đã đăng ký thành công ${plan.name} (${plan.badgeName})! ` +
      `Đã trừ ${plan.price.toLocaleString('vi-VN')}đ vào ví. Số dư còn lại: ${res.newBalance?.toLocaleString('vi-VN')}đ. ` +
      `Thời hạn sử dụng: 30 ngày (Hết hạn ngày ${expiryDateStr}).`
    );
    setTimeout(() => setMembershipToast(null), 8000);
  };

  const handleSimulateExpireHome = () => {
    const expired = simulateTierExpiration();
    if (expired) {
      setCurrentUser(expired);
      setWallet(getStoredWallet());
      setMembershipToast('⚠️ [KIỂM THỬ] Đã giả lập hết hạn gói hội viên! Hạng đã tự động tụt về TÂN THỦ (ROOKIE).');
      setTimeout(() => setMembershipToast(null), 7000);
    }
  };

  const handleRestoreTierHome = (tier: string = 'HỘI VIÊN BẠC 🥈') => {
    const renewed = restoreTier30Days(tier);
    if (renewed) {
      setCurrentUser(renewed);
      setWallet(getStoredWallet());
      setMembershipToast(`✅ [KIỂM THỬ] Đã gia hạn thành công ${tier} thêm 30 ngày!`);
      setTimeout(() => setMembershipToast(null), 7000);
    }
  };

  const handlePostLfg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLfgContent.trim()) return;
    const authorName = newLfgName.trim() || currentUser?.fullName || 'Game Thủ Cyber Zone';
    const newPost = {
      id: `lfg-${Date.now()}`,
      author: authorName,
      avatar: '🎮',
      station: newLfgStation,
      game: newLfgGame,
      rank: 'Đang leo Rank',
      title: newLfgContent.trim(),
      time: 'Vừa xong',
      slotsNeeded: 1,
    };
    setLfgPosts([newPost, ...lfgPosts]);
    setNewLfgContent('');
    setNewLfgName('');
  };

  const handleRegisterTournament = (tournamentName: string) => {
    if (!currentUser) {
      setAuthModalMessage(`Vui lòng đăng nhập để đăng ký tham gia giải đấu: ${tournamentName}!`);
      setIsAuthModalOpen(true);
      return;
    }
    setTournamentSuccessToast(`🎉 Đã đăng ký thành công giải đấu "${tournamentName}". Ban tổ chức sẽ liên hệ qua SĐT ${currentUser.phone || 'của bạn'} để xếp lịch thi đấu!`);
    setTimeout(() => setTournamentSuccessToast(null), 6000);
  };

  const handleShowroomAction = (product: (typeof GEAR_PRODUCTS)[0]) => {
    if (!currentUser) {
      setAuthModalMessage(
        product.category === 'services'
          ? `Vui lòng đăng nhập tài khoản Cyber Zone để đặt lịch dịch vụ "${product.name}"!`
          : `Vui lòng đăng nhập tài khoản Cyber Zone để mượn test sản phẩm "${product.name}" tại máy trạm!`
      );
      setIsAuthModalOpen(true);
      return;
    }

    if (product.category === 'services') {
      setServiceBookingItem(product);
      setServiceCustomerName(currentUser.fullName || currentUser.username || '');
      setServiceCustomerPhone(currentUser.phone || '');
      setServiceError(null);
    } else {
      setBorrowModalGear(product);
      setBorrowCustomerName(currentUser.fullName || currentUser.username || '');
      setBorrowPhone(currentUser.phone || '');
      setBorrowNotes('');
      const activeStn = getActiveClientStation();
      if (activeStn?.stationId) setBorrowStationId(activeStn.stationId);
    }
  };

  const handleConfirmBorrowGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowModalGear) return;
    if (!borrowPhone.trim()) {
      alert('Vui lòng nhập số điện thoại để nhân viên kỹ thuật liên hệ bàn giao gear!');
      return;
    }

    const station = borrowStationId || wallet.pcName || 'VIP-01';
    const record = saveGearBorrowRecord({
      gearId: borrowModalGear.id,
      gearName: borrowModalGear.name,
      customerName: borrowCustomerName.trim() || currentUser?.fullName || 'Khách Hội Viên',
      phone: borrowPhone.trim(),
      stationId: station,
      duration: borrowDuration,
      notes: borrowNotes.trim() || undefined,
    });

    createStaffRequest({
      pcName: station,
      type: 'EXTRA_SERVICE',
      title: `MƯỢN GEAR TEST: ${borrowModalGear.name}`,
      details: `Khách ${borrowCustomerName || currentUser?.fullName} (${borrowPhone}) mượn test "${borrowModalGear.name}" trong ${borrowDuration}. Giao tại máy ${station}. Ghi chú: ${borrowNotes || 'Không có'}`,
      target: 'SERVER',
    });

    setBorrowModalGear(null);
    setBorrowSuccessModal(record);
    setGearSuccessToast(`✅ Yêu cầu mượn "${borrowModalGear.name}" tại máy ${station} đã được gửi tới quầy tiếp tân!`);
    setTimeout(() => setGearSuccessToast(null), 6000);
  };

  const handleConfirmServiceBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceBookingItem) return;

    if (!serviceCustomerPhone.trim()) {
      setServiceError('Vui lòng nhập số điện thoại để kỹ thuật viên liên hệ xác nhận lịch hẹn!');
      return;
    }

    if (serviceLocationType === 'HOME' && !serviceHomeAddress.trim()) {
      setServiceError('Vui lòng nhập đầy đủ địa chỉ nhà riêng (Số nhà, tên đường, phường/xã, quận/huyện...) để kỹ thuật viên đến tận nơi!');
      return;
    }

    setServiceError(null);

    const locationDetail =
      serviceLocationType === 'STORE'
        ? serviceStoreDetail === 'STATION'
          ? `Tại máy trạm ${serviceStationId || wallet.pcName || 'VIP-01'}`
          : 'Tại Trạm Kỹ Thuật Lab (Quầy Sảnh Tầng 1)'
        : undefined;

    const appointment = saveServiceAppointment({
      serviceId: serviceBookingItem.id,
      serviceName: serviceBookingItem.name,
      price: serviceBookingItem.price,
      customerName: serviceCustomerName.trim() || currentUser?.fullName || 'Khách Hội Viên',
      phone: serviceCustomerPhone.trim(),
      date: serviceDate,
      timeSlot: serviceTimeSlot,
      locationType: serviceLocationType,
      storeLocationDetail: locationDetail,
      homeAddress: serviceLocationType === 'HOME' ? serviceHomeAddress.trim() : undefined,
      notes: serviceNotes.trim() || undefined,
    });

    const pcTarget =
      serviceLocationType === 'STORE' && serviceStoreDetail === 'STATION'
        ? (serviceStationId || wallet.pcName || 'VIP-01')
        : 'TECH-LAB-COUNTER';

    createStaffRequest({
      pcName: pcTarget,
      type: 'EXTRA_SERVICE',
      title: `ĐẶT LỊCH DỊCH VỤ: ${serviceBookingItem.name}`,
      details: `[${appointment.code}] Khách: ${appointment.customerName} (${appointment.phone}) | Ngày: ${serviceDate} (${serviceTimeSlot}) | Nơi làm: ${serviceLocationType === 'HOME' ? `TẬN NHÀ: ${serviceHomeAddress}` : `TẠI QUÁN: ${locationDetail}`} | Ghi chú: ${serviceNotes || 'Không có'}`,
      target: 'SERVER',
    });

    setServiceBookingItem(null);
    setServiceSuccessModal(appointment);
    setGearSuccessToast(`🎉 Đặt lịch hẹn dịch vụ "${serviceBookingItem.name}" thành công! Mã hẹn: ${appointment.code}`);
    setTimeout(() => setGearSuccessToast(null), 7000);
  };

  const handleOpenReviewModal = () => {
    if (currentUser) {
      setReviewAuthor(currentUser.fullName || currentUser.username || '');
      setReviewRole(currentUser.userTier || 'Hội Viên Kim Cương 💎');
    } else {
      setReviewAuthor('');
      setReviewRole('Hội Viên Trải Nghiệm');
    }
    setReviewComment('');
    setReviewRating(5);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) {
      alert('Vui lòng nhập họ tên và nội dung đánh giá!');
      return;
    }

    const initials = reviewAuthor
      .trim()
      .split(' ')
      .map((w) => w[0])
      .slice(-2)
      .join('')
      .toUpperCase() || 'KH';

    const newRev = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim(),
      verified: Boolean(currentUser),
      role: `${reviewRole} • ${reviewStation}`,
      avatar: initials,
      avatarBg: reviewRating >= 5
        ? 'bg-amber-500/20 text-amber-300 border-amber-400'
        : 'bg-cyan-500/20 text-cyan-300 border-cyan-400',
      cardBorder: reviewRating >= 5
        ? 'border-amber-500/40 hover:border-amber-400'
        : 'border-cyan-500/40 hover:border-cyan-400',
      rating: reviewRating,
      comment: reviewComment.trim(),
      timeAgo: 'Vừa xong',
    };

    const updated = [newRev, ...communityReviews];
    setCommunityReviews(updated);
    try {
      localStorage.setItem('CYBER_COMMUNITY_REVIEWS', JSON.stringify(updated));
    } catch {}

    setIsReviewModalOpen(false);
    setReviewSuccessToast(`🎉 CẢM ƠN BẠN ĐÃ ĐÁNH GIÁ! Nhận xét ${reviewRating} sao của bạn đã được xuất bản lên Bảng vinh danh Cyber Zone.`);
    setTimeout(() => setReviewSuccessToast(null), 6000);
  };

  return (
    <div className="w-full bg-[#030712] text-slate-200 font-sans selection:bg-emerald-400 selection:text-black">

      <div className="relative py-12 md:py-20 border-b border-white/10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-6">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            TIÊU CHUẨN THI ĐẤU QUỐC TẾ IESF • HẠ TẦNG RTX ULTRA
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-white font-gaming tracking-wide uppercase leading-tight">
            NEXT-GEN <span className="text-emerald-400">ESPORTS &amp;</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              ENTERTAINMENT COMPLEX
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            Tổ hợp giải trí đa phương tiện đỉnh cao: 300+ dàn máy RTX 50-Series, Đấu trường Esports chuẩn quốc tế, Billiards Lounge nghệ thuật &amp; Private Console Suite 24/7.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <a
              href="#dat-cho"
              className="px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 font-sans"
            >
              <span className="material-symbols-outlined text-[18px]">sports_esports</span>
              <span>ĐẶT MÁY GIỮ CHỖ NGAY</span>
            </a>
            <a
              href="#phan-khu"
              className="px-8 py-4 bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 font-sans"
            >
              <span>KHÁM PHÁ PHÂN KHU</span>
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-10 font-mono text-center">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">SỨC CHỨA CẤU HÌNH</span>
              <span className="text-xl md:text-2xl font-black text-white font-gaming mt-1 block">300+ Máy</span>
              <span className="text-[10px] text-cyan-400 block mt-0.5">RTX 4090 / 5090 Ready</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">TẦN SỐ QUÉT KỶ LỤC</span>
              <span className="text-xl md:text-2xl font-black text-emerald-400 font-gaming mt-1 block">540Hz</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">ROG Swift Fast-IPS &amp; OLED</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">KHU BILLIARDS</span>
              <span className="text-xl md:text-2xl font-black text-white font-gaming mt-1 block">10 Bàn</span>
              <span className="text-[10px] text-cyan-400 block mt-0.5">Aileex King / Min Import</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">CONSOLE SUITE</span>
              <span className="text-xl md:text-2xl font-black text-white font-gaming mt-1 block">15 Phòng</span>
              <span className="text-[10px] text-purple-400 block mt-0.5">PS5 Pro + Switch OLED</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 col-span-2 md:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase block">BĂNG THÔNG CHUYÊN DỤNG</span>
              <span className="text-xl md:text-2xl font-black text-emerald-400 font-gaming mt-1 block">≤ 1ms</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">10Gbps Multi-ISP Trunk</span>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-28 py-16">

        <div id="khai-niem" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">bolt</span>
              KHÁI NIỆM GIẢI TRÍ MỚI
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white font-gaming leading-tight">
              Không chỉ là Cyber Game.<br />
              Đây là <span className="text-emerald-400">Vương Quốc Cyberpunk</span> của bạn.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Được kiến tạo từ tinh thần thi đấu bất diệt và niềm đam mê công nghệ đỉnh phong. Mọi chi tiết tại Cyber Zone—từ luồng khí lạnh đối lưu tươi lọc ion, ghế bọc da Nappa công thái học cho đến ánh sáng LED Neon đồng bộ âm thanh—đều sinh ra để tối ưu hóa phản xạ và cảm xúc thăng hoa.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-300 pt-2">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10">
                <span className="material-symbols-outlined text-cyan-400 text-[16px]">ac_unit</span>
                Điều hòa âm trần 21°C
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">shield</span>
                Cách âm chuyên biệt 45dB
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group rounded-2xl overflow-hidden border border-white/10 relative h-72">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
                alt="Đấu trường thi đấu"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-bold font-mono uppercase">
                  MAIN ARENA
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Đấu trường 120 chỗ ngồi chuẩn thi đấu
                </h4>
              </div>
            </div>

            <div className="group rounded-2xl overflow-hidden border border-white/10 relative h-72">
              <img
                src="/images/billiards-lounge.jpg"
                alt="Billiards Lounge"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2 py-0.5 rounded bg-cyan-500 text-black text-[9px] font-bold font-mono uppercase">
                  BILLIARDS LOUNGE
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Không gian thư giãn đẳng cấp nghệ thuật
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div id="phan-khu" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                HỆ THỐNG PHÂN KHU CHUYÊN BIỆT
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white font-gaming mt-1">
                6 Phân Khu Đẳng Cấp Thượng Thừa
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Mỗi phân khu được thiết kế riêng biệt về âm học, công thái học và cấu hình phần cứng. Bấm vào bất kỳ phân khu nào để xem danh sách phòng máy, cấu hình chi tiết và đặt chỗ ngay.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedZone('ALL')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                selectedZone === 'ALL'
                  ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/25 ring-1 ring-emerald-300'
                  : 'bg-slate-900 text-slate-300 border border-white/10 hover:border-emerald-400/50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">apps</span>
              <span>TẤT CẢ (42 MÁY/BÀN)</span>
            </button>

            {SIX_ZONES_HOME.map((zone) => {
              const isActive = selectedZone === zone.id;
              const zoneSeats = ALL_SEATS_CONFIG.filter((s) => getZoneForSeat(s) === zone.id);
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    setSelectedZone(zone.id);
                    const el = document.getElementById('danh-sach-may-phan-khu');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-black shadow-lg ring-2 ring-white/50'
                      : 'bg-slate-900 text-slate-300 border border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-black' : 'bg-emerald-400'}`} />
                  <span>{zone.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-slate-400'}`}>
                    {zoneSeats.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SIX_ZONES_HOME.map((zone) => {
              const isActive = selectedZone === zone.id;
              const zoneSeats = ALL_SEATS_CONFIG.filter((s) => getZoneForSeat(s) === zone.id);
              return (
                <div
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone(zone.id);
                    const el = document.getElementById('danh-sach-may-phan-khu');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  className={`rounded-2xl bg-slate-900/80 border transition duration-300 overflow-hidden flex flex-col group cursor-pointer relative ${
                    isActive
                      ? `${zone.activeRing} ring-2 scale-[1.02] bg-slate-900`
                      : `border-white/10 ${zone.cardBorder} hover:scale-[1.01]`
                  }`}
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={zone.image}
                      alt={zone.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md font-mono text-[10px] font-bold border ${zone.tagClass}`}>
                      {zone.num} • {zone.name.toUpperCase()} ({zone.rate})
                    </span>

                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 font-mono text-[10px] text-white/80 border border-white/20">
                      {zoneSeats.length} Máy/Bàn
                    </span>

                    {isActive && (
                      <span className="absolute bottom-3 left-3 right-3 py-1.5 px-3 rounded-lg bg-emerald-400 text-black font-mono font-black text-[11px] text-center shadow-lg animate-pulse flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        ĐANG HIỂN THỊ PHÒNG MÁY PHÂN KHU NÀY 👇
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-bold font-gaming transition ${isActive ? zone.accentText : 'text-white'}`}>
                          {zone.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {zone.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 font-mono text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Cấu hình:</span>
                        <span className={`font-bold ${zone.accentText}`}>{zone.cpu} • {zone.gpu}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Màn hình:</span>
                        <span className="text-white">{zone.screen}</span>
                      </div>
                    </div>

                    <div className={`mt-2 py-2 px-3 rounded-xl font-mono text-xs font-bold text-center border transition flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-300 group-hover:border-white/30 group-hover:text-white'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {isActive ? 'expand_circle_down' : 'touch_app'}
                      </span>
                      <span>
                        {isActive
                          ? `Đang hiển thị ${zoneSeats.length} phòng máy bên dưới`
                          : `Bấm để xem ${zoneSeats.length} phòng máy khu này`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div id="danh-sach-may-phan-khu" className="pt-4 space-y-6 scroll-mt-24">

            {(() => {
              const currentZoneConfig = SIX_ZONES_HOME.find((z) => z.id === selectedZone);
              const zoneTitle = currentZoneConfig ? currentZoneConfig.name : 'Tất Cả 6 Phân Khu Cyber Zone';
              const zoneBadge = currentZoneConfig ? currentZoneConfig.badge : 'TOÀN BỘ 42 MÁY/BÀN';
              const zoneRate = currentZoneConfig ? currentZoneConfig.rate : '12.000đ - 79.000đ/h';
              const zoneSeats = ALL_SEATS_CONFIG.filter((s) => selectedZone === 'ALL' || getZoneForSeat(s) === selectedZone);

              const availableCount = zoneSeats.filter((s) => getSeatLiveStatus(s).status === 'AVAILABLE').length;
              const occupiedCount = zoneSeats.filter((s) => getSeatLiveStatus(s).status === 'OCCUPIED').length;
              const reservedCount = zoneSeats.filter((s) => getSeatLiveStatus(s).status === 'RESERVED').length;

              return (
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0a1622] to-slate-900 border border-white/10 shadow-2xl space-y-6">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-white/10 pb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-400 text-black">
                          {zoneBadge}
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] text-slate-300 bg-white/5 border border-white/10">
                          ĐƠN GIÁ: {zoneRate}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white font-gaming flex items-center gap-3">
                        <span>{zoneTitle}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Bấm vào máy bất kỳ để xem cấu hình phần cứng chi tiết (CPU, GPU, Screen, Gear) và đặt giữ chỗ ngay lập tức.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span><strong>{availableCount}</strong> Trống</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span><strong>{occupiedCount}</strong> Đang Chơi</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span><strong>{reservedCount}</strong> Đã Giữ Chỗ</span>
                      </div>
                    </div>
                  </div>

                  {currentZoneConfig && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-cyan-400">memory</span>
                          VI XỬ LÝ (CPU)
                        </div>
                        <div className="font-bold text-white truncate">{currentZoneConfig.cpu}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-emerald-400">videogame_asset</span>
                          CARD ĐỒ HỌA (GPU)
                        </div>
                        <div className="font-bold text-white truncate">{currentZoneConfig.gpu}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-amber-400">monitor</span>
                          MÀN HÌNH GAMING
                        </div>
                        <div className="font-bold text-white truncate">{currentZoneConfig.screen}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-pink-400">keyboard</span>
                          GEAR &amp; GHẾ ĐI KÈM
                        </div>
                        <div className="font-bold text-white truncate">{currentZoneConfig.gear}</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 pt-2">
                    {zoneSeats.map((seat) => {
                      const live = getSeatLiveStatus(seat);
                      const price = getSeatPrice(seat);
                      const isVipExperience = seat.id === 'VIP-08';
                      const isSelectedForBooking = selectedSeatForBooking === seat.id;

                      return (
                        <div
                          key={seat.id}
                          className={`rounded-2xl p-4 transition duration-200 border flex flex-col justify-between space-y-3 relative group ${
                            isSelectedForBooking
                              ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400 shadow-xl'
                              : live.status === 'AVAILABLE'
                              ? 'bg-slate-900/90 border-white/10 hover:border-emerald-400/60 hover:bg-slate-800/80'
                              : live.status === 'OCCUPIED'
                              ? 'bg-[#180d12]/90 border-rose-500/30 hover:border-rose-500/60'
                              : 'bg-[#18140d]/90 border-amber-500/30 hover:border-amber-500/60'
                          }`}
                        >

                          <div>
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                              <span className="text-base sm:text-lg font-black text-white font-gaming tracking-wider">
                                {seat.id}
                              </span>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 shrink-0 ${live.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${live.dotClass}`} />
                                {live.label}
                              </span>
                            </div>

                            {isVipExperience && (
                              <div className="mb-2 px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-[9px] font-bold text-center">
                                ⭐ MÁY TRẢI NGHIỆM ĐỘC QUYỀN
                              </div>
                            )}

                            {live.occupant && (
                              <div className="text-[10px] font-mono text-slate-300 truncate mb-1">
                                👤 {live.occupant}
                              </div>
                            )}

                            <div className="font-mono text-[10px] text-slate-400 space-y-0.5">
                              <div className="truncate text-slate-300">{seat.cpu}</div>
                              <div className="truncate text-cyan-400">{seat.gpu}</div>
                              <div className="truncate text-slate-400">{seat.screen}</div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 space-y-2">
                            <div className="flex justify-between items-center text-xs font-mono">
                              <span className="text-slate-400 text-[10px]">Đơn giá:</span>
                              <span className="font-bold text-emerald-400">{price}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setSelectedModalSeat(seat)}
                                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white font-mono text-[10px] font-bold border border-white/10 transition text-center flex items-center justify-center gap-1"
                                title="Xem cấu hình chi tiết"
                              >
                                <span className="material-symbols-outlined text-[13px]">info</span>
                                <span>Chi Tiết</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSelectSeatToBook(seat)}
                                className={`px-2 py-1.5 rounded-lg font-mono text-[10px] font-extrabold transition text-center flex items-center justify-center gap-1 ${
                                  isSelectedForBooking
                                    ? 'bg-emerald-400 text-black'
                                    : 'bg-emerald-500/20 hover:bg-emerald-400 hover:text-black text-emerald-300 border border-emerald-500/40'
                                }`}
                                title="Đặt giữ chỗ máy này"
                              >
                                <span className="material-symbols-outlined text-[13px]">bolt</span>
                                <span>{isSelectedForBooking ? 'Đang Chọn' : 'Đặt Máy'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div id="bang-gia" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              HỆ THỐNG GAMER PASS • ĐẶC QUYỀN HỘI VIÊN CHÍNH THỨC
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white font-gaming">
              Bảng Giá &amp; Cấp Bậc Gamer Pass
            </h2>
            <p className="text-xs text-slate-400">
              Tích lũy nạp tiền tự động mở khóa các cấp bậc hội viên và siêu ưu đãi giảm giá giờ chơi lên đến 35%, giảm thực đơn Bếp và giữ chỗ máy trước.
            </p>
          </div>

          {membershipToast && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-2xl animate-bounce">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified</span>
                <span>{membershipToast}</span>
              </span>
              <button
                type="button"
                onClick={() => setMembershipToast(null)}
                className="text-emerald-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          
          {(() => {
            const currentTier = getTierByName(currentUser?.userTier || wallet.userTier);
            const effectiveBalance = typeof currentUser?.balance === 'number' ? currentUser.balance : wallet.balance;
            const cumulative = getCumulativeTopupAmount(wallet);
            const progression = calculateTierProgression(cumulative);
            return (
              <div className="p-4 sm:p-5 rounded-3xl bg-[#060a16] border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4 font-mono shadow-2xl">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl ${currentTier.accentBg} ${currentTier.textColor} border ${currentTier.borderColor} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                    <span className="material-symbols-outlined">{currentTier.icon}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Hạng hội viên hiện tại:</span>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{currentUser ? currentUser.fullName : currentTier.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${currentTier.badgeClass}`}>
                        {currentTier.shortName}
                      </span>
                    </h4>
                    <span className="text-xs text-emerald-400">
                      Số dư khả dụng: {effectiveBalance.toLocaleString('vi-VN')}đ • Tích lũy nạp: {cumulative.toLocaleString('vi-VN')}đ
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
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 transition-all duration-500"
                      style={{ width: `${progression.progressPercent}%` }}
                    ></div>
                  </div>
                  {!progression.isMaxTier ? (
                    <span className="text-[10px] text-amber-300 block text-right font-bold">
                      Cần nạp thêm +{progression.neededAmount.toLocaleString('vi-VN')}đ để thăng hạng
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 block text-right font-bold">
                      ✓ Đã đạt cấp bậc cao nhất
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {TIERS_ORDER.map((tierKey) => {
              const tier = GAMER_PASS_TIERS[tierKey];
              const activeTier = getTierByName(currentUser?.userTier || wallet.userTier);
              const isCurrent = activeTier.code === tierKey;
              return (
                <div
                  key={tierKey}
                  className={`rounded-3xl p-5 flex flex-col justify-between border transition-all ${
                    isCurrent
                      ? `bg-slate-800/95 ${tier.borderColor} ring-2 ring-emerald-400/70 shadow-2xl shadow-emerald-500/20`
                      : 'bg-[#0a1122]/90 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border ${tier.badgeClass}`}>
                        {tier.shortName}
                      </span>
                      <span className={`material-symbols-outlined text-lg ${tier.textColor}`}>{tier.icon}</span>
                    </div>
                    <h4 className="font-bold text-white text-base mb-1 font-gaming">{tier.name}</h4>
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

                    <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-2 text-[11px] text-slate-300">
                      {tier.perks.map((p, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-white/10">
                    {isCurrent ? (
                      <div className="py-2.5 text-center text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                        ✓ HẠNG HIỆN TẠI CỦA BẠN
                      </div>
                    ) : (
                      <Link
                        href="/auth"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/30 hover:from-amber-500/30 hover:to-amber-500/40 text-amber-300 border border-amber-500/50 font-bold text-xs font-mono transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span className="material-symbols-outlined text-[15px]">add_card</span>
                        <span>Nạp Mốc {(tier.minAmount || 50000).toLocaleString('vi-VN')}đ &rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          
          <div className="p-4 md:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shrink-0">
                <span className="material-symbols-outlined text-[24px]">military_tech</span>
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase block font-mono">
                  CHÍNH SÁCH DUY TRÌ HẠNG &amp; TÍCH LŨY GAMER PASS
                </span>
                <span className="text-xs text-slate-400">
                  Hệ thống tự động tích lũy nạp tiền để xét hạng. Hạng duy trì theo chu kỳ 30 ngày và gia hạn tự động khi nạp đủ định mức.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono text-xs">
              <button
                type="button"
                onClick={handleSimulateExpireHome}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[11px] transition cursor-pointer"
                title="Giả lập hết hạn để kiểm thử việc tụt hạng về Tân thủ"
              >
                ⏳ Thử Tụt Hạng
              </button>
              <button
                type="button"
                onClick={() => handleRestoreTierHome('HỘI VIÊN BẠC 🥈')}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] transition cursor-pointer"
                title="Gia hạn lại gói Bạc thêm 30 ngày"
              >
                🔄 Thử Gia Hạn
              </button>
              <Link
                href="/auth"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 text-black text-xs font-extrabold rounded-xl transition font-gaming shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">wallet</span>
                <span>CỔNG VÍ /auth &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <div id="dat-cho" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 md:p-12 rounded-3xl bg-slate-900/60 border border-white/10">

          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              GIỮ CHỖ TRỰC TUYẾN TỨC THÌ
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white font-gaming leading-tight">
              Đặt Máy &amp; Bàn Không Sợ Hết Chỗ Giờ Cao Điểm
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hệ thống đặt giữ máy theo thời gian thực (Real-time Booking). Đảm bảo cấu hình bạn chọn sẽ được khởi động và đăng nhập sẵn sàng khi bạn tới.
            </p>
            <div className="space-y-2.5 text-xs text-slate-400 pt-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-sm">schedule</span>
                <span>Giữ máy trong vòng 30 phút kể từ mốc giờ đã đặt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-sm">sms</span>
                <span>Xác nhận tức thì qua tin nhắn Zalo / SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-sm">sync</span>
                <span>Đổi khu vực hoặc hoàn tiền giờ không mất phí</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 mt-4 text-xs font-mono space-y-2">
              {selectedSeatForBooking && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                    Đang chọn trạm máy: <strong className="text-white">{selectedSeatForBooking}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSeatForBooking(null)}
                    className="text-[10px] text-slate-400 hover:text-white underline"
                  >
                    Bỏ chọn máy
                  </button>
                </div>
              )}
              {currentUser ? (
                <div className="text-emerald-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span>Đã đăng nhập: <strong>{currentUser.fullName}</strong> ({currentUser.userTier})</span>
                </div>
              ) : (
                <div className="text-amber-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Chưa đăng nhập: Cần đăng nhập để hoàn tất giữ chỗ.</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#070d18] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white font-gaming border-b border-white/10 pb-3">
              Biểu Mẫu Giữ Chỗ 24/7
            </h3>

            {successBooking && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
                <div>
                  <div className="font-bold text-sm">🎉 GIỮ CHỖ THÀNH CÔNG CHO: {successBooking.name}</div>
                  <div className="text-[11px] text-slate-300">
                    Vị trí: <strong className="text-white">{successBooking.seatId}</strong> ({successBooking.zone}) • Mã vé: <strong className="text-cyan-400">{successBooking.code}</strong>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href="#phan-khu" className="px-3 py-1.5 rounded-lg bg-emerald-400 text-black font-black text-[11px]">
                    Xem Phòng Máy Vừa Đặt &rarr;
                  </a>
                  <Link href="/server" className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-black text-[11px]">
                    Xem Trên Server &rarr;
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4 font-mono text-xs">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1.5">CHỌN CHI NHÁNH</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                  >
                    <option value="Zone 01: 182 Lê Duẩn, TP. Vinh (Flagship Complex)">
                      Zone 01: 182 Lê Duẩn, TP. Vinh (Flagship Complex)
                    </option>
                    <option value="Zone 02: 128 Nguyễn Trãi, Q.1, TP.HCM">
                      Zone 02: 128 Nguyễn Trãi, Q.1, TP.HCM
                    </option>
                    <option value="Zone 03: 45 Lê Duẩn, Hải Châu, Đà Nẵng">
                      Zone 03: 45 Lê Duẩn, Hải Châu, Đà Nẵng
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1.5">KHU VỰC TRẢI NGHIỆM</label>
                  <select
                    value={zoneCategory}
                    onChange={(e) => setZoneCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                  >
                    <option value="Standard Zone Tiêu Chuẩn (STD-01..10) - 12.000đ/h">Standard Zone Tiêu Chuẩn (STD-01..10) - 12.000đ/h</option>
                    <option value="Cyber Pro 540Hz (PRO-01..04) - 18.000đ/h">Cyber Pro 540Hz (PRO-01..04) - 18.000đ/h</option>
                    <option value="Ultra VIP Suite (VIP-01..08) - 22.000đ/h">Ultra VIP Suite (VIP-01..08) - 22.000đ/h</option>
                    <option value="Đấu Trường Arena 5vs5 (ARENA-A1..B5) - 25.000đ/h">Đấu Trường Arena 5vs5 (ARENA-A1..B5) - 25.000đ/h</option>
                    <option value="Stream Studio Soundproof (STREAM-01..02) - 35.000đ/h">Stream Studio Soundproof (STREAM-01..02) - 35.000đ/h</option>
                    <option value="Couple Sanctuary (COUPLE-01..02) - 45.000đ/h">Couple Sanctuary (COUPLE-01..02) - 45.000đ/h</option>
                    <option value="Console Lounge & PS5 Pro (CONSOLE-01..02) - 79.000đ/h">Console Lounge &amp; PS5 Pro (CONSOLE-01..02) - 79.000đ/h</option>
                    <option value="Billiards Club (BIDA-01..10) - 79.000đ/h">Billiards Club 10 Bàn (BIDA-01..10) - 79.000đ/h</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1.5">SỐ LƯỢNG MÁY / BÀN</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1.5">NGÀY ĐẾN</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1.5">KHUNG GIỜ</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                  >
                    <option value="Ngay bây giờ (Tức thì)">Ngay bây giờ (Tức thì)</option>
                    <option value="13:00 - 17:00">13:00 - 17:00</option>
                    <option value="18:00 - 22:00 (Giờ cao điểm)">18:00 - 22:00 (Giờ cao điểm)</option>
                    <option value="22:00 - 06:00 (Combo cày đêm)">22:00 - 06:00 (Combo cày đêm)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1.5">HỌ TÊN GAME THỦ</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A / Nickname"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1.5">SỐ ĐIỆN THOẠI NHẬN MÃ ĐẶT</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition uppercase font-sans mt-2"
              >
                XÁC NHẬN GIỮ CHỖ TỨC THÌ
              </button>
            </form>
          </div>

        </div>

        <div id="showroom" className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#08151a] to-slate-900 border border-emerald-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-6 space-y-4">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                CYBER ZONE TECH HUB
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-white font-gaming leading-tight">
                Showroom Gaming Gear &amp; Trạm Mod Phím, Độ Tản Nhiệt
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trải nghiệm thực tế trước khi sở hữu. Chúng tôi phân phối ủy quyền chính hãng chuột không dây 8000Hz, lót chuột Artisan Nhật Bản, phím cơ HE Hall Effect Rapid Trigger và dịch vụ vệ sinh tra keo tản nhiệt PTM7950 trực tiếp tại sảnh.
              </p>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">build</span>
                    Mod Phím &amp; Lube Switch
                  </span>
                  <span className="text-slate-400 text-[10px] mt-1 block">
                    Cân wire, foam Poron, tune âm thanh creamy
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">mouse</span>
                    Swap Gear Cấp Tốc
                  </span>
                  <span className="text-slate-400 text-[10px] mt-1 block">
                    Thay switch chuột, dán dot skates PTFE trong 15p
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsGearModalOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer group"
                >
                  <span>Tham quan danh mục sản phẩm Gear • Đặt lịch bảo dưỡng</span>
                  <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=500&q=80"
                alt="Phím cơ custom"
                className="w-full h-44 object-cover rounded-2xl border border-white/10"
              />
              <img
                src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=500&q=80"
                alt="Ráp máy tính RGB"
                className="w-full h-44 object-cover rounded-2xl border border-white/10"
              />
              <img
                src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80"
                alt="Chuột gaming"
                className="w-full h-36 object-cover rounded-2xl border border-white/10 col-span-2"
              />
            </div>

          </div>
        </div>

        <div id="community" className="space-y-8 scroll-mt-24">
          <div id="khach-hang" className="text-center space-y-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              CỘNG ĐỒNG GAME THỦ TOÀN CẦU • COMMUNITY ESPORTS HUB
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white font-gaming">
              Đấu Trường Cộng Đồng &amp; Đánh Giá
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Nơi giao lưu kết nối 15.000+ game thủ, ghép kèo leo rank 5vs5, giải đấu tuần và đánh giá từ những tuyển thủ hàng đầu thế giới.
            </p>
          </div>

          {tournamentSuccessToast && (
            <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono text-xs flex items-center justify-between shadow-2xl animate-bounce">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[20px]">emoji_events</span>
                {tournamentSuccessToast}
              </span>
              <span className="text-[10px] text-slate-400">Ban tổ chức Cyber Zone</span>
            </div>
          )}

          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-white/10 gap-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveCommunityTab('tournaments')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                  activeCommunityTab === 'tournaments'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                <span>🏆 Giải Đấu &amp; Bảng Xếp Hạng</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCommunityTab('lfg')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                  activeCommunityTab === 'lfg'
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">group_add</span>
                <span>🤝 Ghép Kèo Leo Rank (LFG)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">LIVE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCommunityTab('reviews')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                  activeCommunityTab === 'reviews'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">reviews</span>
                <span>⭐ Tuyển Thủ &amp; Hội Viên Đánh Giá</span>
              </button>
            </div>
          </div>

          {activeCommunityTab === 'tournaments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/40 space-y-4 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                        GIẢI ĐẤU THÁNG
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        12/16 Đội
                      </span>
                    </div>
                    <h3 className="font-gaming font-black text-xl text-white">
                      CYBER ZONE CS2 MAJOR 2026
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Giải đấu Counter-Strike 2 lớn nhất khu vực. Đấu trực tiếp tại Sàn Đấu Arena 5vs5 Tầng 1, livestream bình luận chuyên nghiệp từ Caster.
                    </p>
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tổng giải thưởng:</span>
                        <strong className="text-amber-400 text-sm">30.000.000 VNĐ</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thể thức:</span>
                        <span className="text-white">16 Team • BO3 Nhánh Thắng Thua</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thời gian:</span>
                        <span className="text-cyan-300">Chủ Nhật tuần này (08:30)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRegisterTournament('CYBER ZONE CS2 MAJOR 2026 (30 Triệu)')}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer font-mono uppercase"
                  >
                    ĐĂNG KÝ ĐỘI THI ĐẤU &rarr;
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/40 space-y-4 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                        GIẢI TUẦN
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        24/32 Đội
                      </span>
                    </div>
                    <h3 className="font-gaming font-black text-xl text-white">
                      LIÊN MINH HUYỀN THOẠI 5VS5 CUP
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Đại chiến Summoner&apos;s Rift tại Khu Máy Cyber Pro 540Hz. Chuẩn bị tài khoản thi đấu máy chủ Riot Tournament.
                    </p>
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tổng giải thưởng:</span>
                        <strong className="text-cyan-400 text-sm">15.000.000 VNĐ + 100h VIP</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thể thức:</span>
                        <span className="text-white">Tournament Draft Cấm Chọn</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thời gian:</span>
                        <span className="text-cyan-300">Thứ Bảy hàng tuần (13:30)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRegisterTournament('LIÊN MINH HUYỀN THOẠI 5VS5 CUP (15 Triệu)')}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer font-mono uppercase"
                  >
                    ĐĂNG KÝ ĐỘI THI ĐẤU &rarr;
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/40 space-y-4 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        GIẢI BI-A MỞ RỘNG
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Đang mở đơn
                      </span>
                    </div>
                    <h3 className="font-gaming font-black text-xl text-white">
                      AILEEX KING 9-BALL CHAMPIONSHIP
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Giải đấu cơ thủ Pool 9 bóng tại Billiards Lounge 10 bàn Aileex King 9020. Trọng tài chuẩn quốc gia giám sát từng đường cơ.
                    </p>
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tổng giải thưởng:</span>
                        <strong className="text-emerald-400 text-sm">10.000.000 VNĐ + CÚP VÀNG</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thể thức:</span>
                        <span className="text-white">Loại trực tiếp Chạm 7 Ván</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thời gian:</span>
                        <span className="text-cyan-300">Tối Thứ 6 tuần này (19:00)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRegisterTournament('AILEEX KING 9-BALL CHAMPIONSHIP (10 Triệu)')}
                    className="w-full py-3 bg-gradient-to-r from-emerald-400 to-green-500 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer font-mono uppercase"
                  >
                    ĐĂNG KÝ TRANH CÚP &rarr;
                  </button>
                </div>

              </div>

              <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">military_tech</span>
                    <h4 className="font-gaming font-black text-lg text-white">BẢNG XẾP HẠNG CLAN XUẤT SẮC THÁNG NÀY</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Đồng bộ theo tỷ lệ thắng tại phòng máy</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center text-sm">#1</span>
                      <div>
                        <div className="font-bold text-white text-sm">Clan Hades</div>
                        <div className="text-[11px] text-slate-400">18 Thành viên • Thắng 142 Trận</div>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold text-sm">4,850 Elo</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-700 text-white font-black flex items-center justify-center text-sm">#2</span>
                      <div>
                        <div className="font-bold text-white text-sm">Bộ Tộc CyberGaming</div>
                        <div className="text-[11px] text-slate-400">32 Thành viên • Thắng 118 Trận</div>
                      </div>
                    </div>
                    <span className="text-cyan-400 font-bold text-sm">4,210 Elo</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 font-black flex items-center justify-center text-sm">#3</span>
                      <div>
                        <div className="font-bold text-white text-sm">Vinh Esports Squad</div>
                        <div className="text-[11px] text-slate-400">15 Thành viên • Thắng 94 Trận</div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">3,740 Elo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCommunityTab === 'lfg' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              <div className="lg:col-span-5 bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <span className="material-symbols-outlined text-emerald-400 text-xl">person_add</span>
                  <h3 className="font-gaming font-black text-lg text-white">ĐĂNG BÀI TÌM ĐỒNG ĐỘI / RỦ KÈO</h3>
                </div>

                <form onSubmit={handlePostLfg} className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">TÊN GAME THỦ / NICKNAME</label>
                    <input
                      type="text"
                      value={newLfgName}
                      onChange={(e) => setNewLfgName(e.target.value)}
                      placeholder={currentUser?.fullName || "Ví dụ: admin1 hoặc Nguyễn Văn A"}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">CHỌN BỘ MÔN</label>
                      <select
                        value={newLfgGame}
                        onChange={(e) => setNewLfgGame(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-400"
                      >
                        <option value="CS2 (Counter-Strike 2)">CS2</option>
                        <option value="Liên Minh Huyền Thoại">LMHT (LoL)</option>
                        <option value="Valorant">Valorant</option>
                        <option value="FC Online (FO4)">FC Online</option>
                        <option value="Billiards Pool 9-Ball">Bi-a Pool / Carom</option>
                        <option value="Black Myth Wukong">Black Myth Wukong</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">VỊ TRÍ NGỒI / KHU</label>
                      <select
                        value={newLfgStation}
                        onChange={(e) => setNewLfgStation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-400"
                      >
                        <option value="Khu Máy PRO-01..04">Khu Pro 540Hz</option>
                        <option value="Phòng Riêng VIP-08">Ultra VIP Suite</option>
                        <option value="Sàn Đấu Arena Tầng 1">Arena 5vs5</option>
                        <option value="Khu Standard Tầng 1">Standard Zone</option>
                        <option value="Phòng Couple Tầng 2">Couple Suite</option>
                        <option value="Bàn Bida Tầng 1">Billiards Lounge</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">NỘI DUNG TÌM TEAM / GIAO LƯU</label>
                    <textarea
                      required
                      rows={3}
                      value={newLfgContent}
                      onChange={(e) => setNewLfgContent(e.target.value)}
                      placeholder="Ví dụ: Cần 1 bạn Faceit Lv 8+ bắn CS2 tối nay, bao Sting dâu! Hoặc kèo solo bi-a giao lưu vui vẻ..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-400 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg transition font-gaming"
                  >
                    ĐĂNG BÀI LÊN BẢNG TIN NGAY &rarr;
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-1 border-b border-white/10">
                  <span>BẢNG TIN GHÉP KÈO TRỰC TIẾP ({lfgPosts.length} BÀI ĐĂNG)</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Cập nhật thời gian thực
                  </span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {lfgPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition space-y-2.5 font-sans"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-lg border border-white/10">
                            {post.avatar}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{post.author}</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                                {post.rank}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {post.station} • <strong className="text-cyan-400">{post.game}</strong>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{post.time}</span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-sans bg-black/30 p-2.5 rounded-xl border border-white/5">
                        &ldquo;{post.title}&rdquo;
                      </p>

                      <div className="flex justify-between items-center pt-1 font-mono text-xs">
                        <span className="text-amber-400 font-bold text-[11px]">
                          ⚡ Cần tuyển: {post.slotsNeeded} slot
                        </span>
                        <a
                          href="tel:19008888"
                          className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] transition"
                        >
                          Kết Nối Qua Quầy / Zalo &rarr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeCommunityTab === 'reviews' && (
            <div className="space-y-6">
              {reviewSuccessToast && (
                <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-mono text-xs flex items-center gap-2 animate-bounce">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>{reviewSuccessToast}</span>
                </div>
              )}

              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-sm">⭐ 5.0 / 5.0</span>
                    <span className="text-slate-400">({communityReviews.length} Đánh giá từ Tuyển Thủ &amp; Hội Viên)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Đánh giá minh bạch 100% từ tuyển thủ thi đấu và hội viên trải nghiệm thực tế tại phòng máy.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenReviewModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs uppercase font-mono shadow-lg shadow-amber-500/25 flex items-center gap-2 transition cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">rate_review</span>
                  <span>Viết Đánh Giá &amp; Chấm Sao</span>
                </button>
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                {communityReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-6 rounded-2xl bg-slate-900/60 border ${rev.cardBorder || 'border-white/10'} space-y-4 hover:border-amber-400/60 transition flex flex-col justify-between`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-amber-400 text-sm tracking-widest flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span key={idx} className={idx < rev.rating ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-slate-600'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{rev.timeAgo}</span>
                    </div>

                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    <div className="flex items-center gap-3 pt-2 border-t border-white/10 font-mono">
                      <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-xs border ${rev.avatarBg || 'bg-slate-800 text-white'}`}>
                        {rev.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{rev.author}</span>
                          {rev.verified && <span className="text-cyan-400 text-xs">✓</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {rev.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 text-center space-y-6">
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            SẴN SÀNG CHO CUỘC ĐẤU TIẾP THEO?
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white font-gaming max-w-3xl mx-auto leading-tight">
            BƯỚC VÀO THẾ GIỚI CYBER ZONE • NHẬN NGAY ƯU ĐÃI GIỜ CHƠI ĐẦU TIÊN
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Đăng ký tài khoản hội viên trực tiếp hoặc liên hệ Hotline đặt máy nhanh 1900 8888 phục vụ liên tục 24/7.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a
              href="#dat-cho"
              className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition"
            >
              ĐẶT MÁY GIỮ CHỖ NGAY
            </a>
            <a
              href="tel:19008888"
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-white/20 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
            >
              <span className="text-emerald-400">📞</span>
              <span>HOTLINE: 1900 8888</span>
            </a>
          </div>
        </div>

      </div>

      <footer className="border-t border-white/10 bg-black/60 pt-16 pb-8 px-4 text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-black text-lg">
                CZ
              </div>
              <span className="text-xl font-black text-white font-gaming">
                CYBER<span className="text-emerald-400">ZONE</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Tổ hợp giải trí eSports chuẩn thi đấu IESF, Billiards Lounge nghệ thuật và dịch vụ F&amp;B cao cấp 24/7 hàng đầu khu vực.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook Fanpage CyberZone" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-center transition border border-white/10 font-bold">f</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" title="TikTok CyberZone Esports" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 flex items-center justify-center transition border border-white/10 font-bold">TT</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube CyberZone TV" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 flex items-center justify-center transition border border-white/10 font-bold">YT</a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" title="Cộng đồng Discord CyberZone" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-center transition border border-white/10 font-bold">DC</a>
            </div>
          </div>

          <div className="space-y-3 font-mono">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-sans">
              PHÂN KHU TRẢI NGHIỆM
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#phan-khu" className="hover:text-emerald-400 transition">› Đấu Trường Thi Đấu Main Arena</a></li>
              <li><a href="#phan-khu" className="hover:text-emerald-400 transition">› Khu Máy Cyber Pro 540Hz</a></li>
              <li><a href="#phan-khu" className="hover:text-emerald-400 transition">› Billiards Lounge 10 Bàn Aileex</a></li>
              <li><a href="#phan-khu" className="hover:text-emerald-400 transition">› Private Console Suite PS5 Pro</a></li>
              <li><a href="#showroom" className="hover:text-emerald-400 transition">› Showroom Phụ Kiện Gaming Gear</a></li>
            </ul>
          </div>

          <div className="space-y-3 font-mono">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-sans">
              HỖ TRỢ &amp; HỘI VIÊN
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/auth" className="hover:text-emerald-400 transition">› Chính Sách Hạng VIP &amp; Nạp Thẻ</Link></li>
              <li><a href="#bang-gia" className="hover:text-emerald-400 transition">› Biểu Phí Dịch Vụ Giờ Chơi</a></li>
              <li><a href="#dat-cho" className="hover:text-emerald-400 transition">› Đặt Chỗ Nhóm Thi Đấu &amp; Clan</a></li>
              <li><Link href="/auth" className="hover:text-emerald-400 transition">› Đăng Ký Tài Khoản Tân Thủ</Link></li>
              <li><span className="text-amber-400">🎧 CSKH 24/7: 1900 8888</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              HỆ THỐNG CƠ SỞ
            </h4>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-[11px]">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>📍 FLAGSHIP COMPLEX TP. VINH</span>
              </div>
              <div className="text-slate-300">182 Lê Duẩn, P. Bến Thủy, TP. Vinh (Gần Đại học Vinh)</div>
              <div className="text-slate-400 font-mono text-[10px]">Thời gian: Mở cửa 24/7 (Có bãi đỗ ô tô)</div>
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              Đối tác phần cứng chính thức: <span className="text-cyan-400 font-bold">ASUS ROG</span> • <span className="text-emerald-400 font-bold">MSI</span> • <span className="text-purple-400 font-bold">ZOWIE</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500 font-mono">
          <div>
            © 2026 <span className="text-white font-bold">CYBER ZONE COMPLEX</span>. All Rights Reserved.
          </div>
          <div className="text-slate-400">
            Đồ án Web Quản Lý Phòng Net Cyber • <span className="text-emerald-400 font-bold">Nhóm 2 • 5 Thành Viên</span>
          </div>
        </div>
      </footer>

      {isGearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  CYBER ZONE TECH LAB • SHOWROOM GEAR CHÍNH HÃNG
                </span>
                <h3 className="text-2xl font-black text-white font-gaming mt-1">
                  Showroom Gaming Gear &amp; Trạm Mod Phím
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Trải nghiệm trực tiếp tại phòng máy trước khi mua • Dịch vụ kỹ thuật viên phục vụ tận bàn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGearModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {gearSuccessToast && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-bounce">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{gearSuccessToast}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 font-mono text-xs">
              {[
                { id: 'all', label: 'TẤT CẢ SẢN PHẨM & DỊCH VỤ' },
                { id: 'mouse', label: 'CHUỘT & LÓT 8000HZ' },
                { id: 'keyboard', label: 'PHÍM CƠ & SWITCH' },
                { id: 'services', label: 'DỊCH VỤ MOD & TRA KEO' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedGearTab(tab.id as 'all' | 'mouse' | 'keyboard' | 'services')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    selectedGearTab === tab.id
                      ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GEAR_PRODUCTS
                .filter((p) => selectedGearTab === 'all' || p.category === selectedGearTab)
                .map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-emerald-500/50 transition flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="h-40 rounded-xl overflow-hidden relative border border-white/5">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/40">
                          {product.tag}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{product.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                          {product.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        <span>{product.testStation}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-base font-black text-emerald-400 font-mono">{product.price}</span>
                        <button
                          type="button"
                          onClick={() => handleShowroomAction(product)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-[11px] font-mono transition cursor-pointer"
                        >
                          {product.category === 'services' ? 'Đặt Lịch Làm' : 'Mượn Test Tại Máy'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Địa chỉ Showroom: Sảnh Tầng 1, 182 Lê Duẩn, TP. Vinh • Hotline hỗ trợ kỹ thuật: <strong>1900 8888</strong></span>
              <button
                type="button"
                onClick={() => setIsGearModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      
      {borrowModalGear && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-gradient-to-br from-slate-900 via-[#0c1624] to-slate-950 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">devices</span>
                  CYBER ZONE TECH LAB • GEAR TRY-OUT
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-gaming mt-1">
                  Đăng Ký Mượn Test Gear Tại Máy
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kỹ thuật viên giao tận bàn trong 2-3 phút • Hoàn toàn miễn phí trải nghiệm
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBorrowModalGear(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex gap-4 items-center">
              <img
                src={borrowModalGear.image}
                alt={borrowModalGear.name}
                className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  {borrowModalGear.tag}
                </span>
                <h4 className="font-bold text-white text-sm">{borrowModalGear.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">Giá niêm yết: <span className="text-emerald-400 font-bold">{borrowModalGear.price}</span></p>
                <p className="text-[10px] text-cyan-400 font-mono">⚡ Miễn phí 100% trải nghiệm cho Hội viên Cyber Zone</p>
              </div>
            </div>

            <form onSubmit={handleConfirmBorrowGear} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                    Họ &amp; Tên Người Mượn <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={borrowCustomerName}
                    onChange={(e) => setBorrowCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                    Số Điện Thoại Nhận Máy <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={borrowPhone}
                    onChange={(e) => setBorrowPhone(e.target.value)}
                    placeholder="0988 888 888"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                    Máy Trạm Đang Ngồi (Giao Tận Bàn) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={borrowStationId}
                    onChange={(e) => setBorrowStationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-emerald-500/40 text-emerald-300 font-mono text-xs focus:border-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <optgroup label="Ultra VIP Suite (Tầng 2)">
                      {ALL_SEATS_CONFIG.filter((s) => s.id.startsWith('VIP-')).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} • {s.zoneName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Sàn Đấu Arena 5vs5 (Tầng 1)">
                      {ALL_SEATS_CONFIG.filter((s) => s.id.startsWith('ARENA-')).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} • {s.zoneName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Cyber Pro 540Hz (Tầng 2)">
                      {ALL_SEATS_CONFIG.filter((s) => s.id.startsWith('PRO-')).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} • {s.zoneName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Standard Zone Tiêu Chuẩn (Tầng 1)">
                      {ALL_SEATS_CONFIG.filter((s) => s.id.startsWith('STD-')).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} • {s.zoneName}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Phòng Stream & Couple & Giải Trí">
                      {ALL_SEATS_CONFIG.filter((s) => !s.id.startsWith('VIP-') && !s.id.startsWith('ARENA-') && !s.id.startsWith('PRO-') && !s.id.startsWith('STD-')).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} • {s.zoneName}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                    Thời Lượng Mượn Test
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['30 phút', '45 phút', '60 phút'].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setBorrowDuration(dur)}
                        className={`py-2 rounded-xl font-mono text-xs font-bold transition border cursor-pointer ${
                          borrowDuration === dur
                            ? 'bg-emerald-400 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                  Ghi Chú Kỹ Thuật (Tùy Chọn)
                </label>
                <textarea
                  rows={2}
                  value={borrowNotes}
                  onChange={(e) => setBorrowNotes(e.target.value)}
                  placeholder="Ví dụ: Kèm dây cáp Type-C dài, chỉnh sẵn DPI 800 và Polling Rate 4000Hz, xin thêm pad lót..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white font-mono text-xs focus:border-emerald-400 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">verified_user</span>
                <span>Gear được khử khuẩn UV và kiểm tra độ trễ 100% trước khi kỹ thuật viên bàn giao tới máy.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBorrowModalGear(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                  <span>Xác Nhận Mượn Test Tại Máy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {serviceBookingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-[#0c1624] to-slate-950 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">handyman</span>
                  CYBER ZONE TECH LAB • CUSTOM MOD &amp; REPAIR
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-gaming mt-1">
                  Đặt Lịch Làm Dịch Vụ Kỹ Thuật
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Đội ngũ kỹ thuật viên tay nghề cao • Phục vụ trực tiếp tại quán hoặc đến tận nhà
                </p>
              </div>
              <button
                type="button"
                onClick={() => setServiceBookingItem(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 flex gap-4 items-center">
              <img
                src={serviceBookingItem.image}
                alt={serviceBookingItem.name}
                className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/40">
                  {serviceBookingItem.tag}
                </span>
                <h4 className="font-bold text-white text-sm">{serviceBookingItem.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{serviceBookingItem.desc}</p>
                <p className="text-xs font-mono text-emerald-400 font-extrabold">Chi phí dịch vụ: {serviceBookingItem.price}</p>
              </div>
            </div>

            {serviceError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{serviceError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmServiceBooking} className="space-y-5 font-sans text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                    Họ &amp; Tên Khách Hàng <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceCustomerName}
                    onChange={(e) => setServiceCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                    Số Điện Thoại Liên Hệ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={serviceCustomerPhone}
                    onChange={(e) => setServiceCustomerPhone(e.target.value)}
                    placeholder="0988 888 888"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                    Ngày Hẹn Làm Dịch Vụ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                    Khung Giờ Hẹn Kỹ Thuật <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={serviceTimeSlot}
                    onChange={(e) => setServiceTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-cyan-500/40 text-cyan-300 font-mono text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
                  >
                    <option value="09:00 - 10:30">09:00 - 10:30 (Sáng sớm)</option>
                    <option value="10:30 - 12:00">10:30 - 12:00 (Buổi trưa)</option>
                    <option value="14:00 - 15:30">14:00 - 15:30 (Đầu giờ chiều)</option>
                    <option value="16:00 - 17:30">16:00 - 17:30 (Cuối buổi chiều)</option>
                    <option value="19:00 - 20:30">19:00 - 20:30 (Tối cao điểm)</option>
                    <option value="20:30 - 22:00">20:30 - 22:00 (Đêm muộn)</option>
                  </select>
                </div>
              </div>

              
              <div className="space-y-3">
                <label className="block text-[11px] font-mono text-slate-300 font-semibold">
                  Địa Điểm Thực Hiện Dịch Vụ <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setServiceLocationType('STORE')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      serviceLocationType === 'STORE'
                        ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      serviceLocationType === 'STORE' ? 'bg-emerald-400 text-black' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">storefront</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <span>Làm Tại Cyber Zone</span>
                        {serviceLocationType === 'STORE' && (
                          <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        Khách mang gear qua Trạm Lab tại sảnh hoặc kỹ thuật viên mod trực tiếp tại máy trạm đang ngồi.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setServiceLocationType('HOME')}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      serviceLocationType === 'HOME'
                        ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-500/30'
                        : 'bg-slate-950 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      serviceLocationType === 'HOME' ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">home</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <span>Kỹ Thuật Đến Tận Nhà</span>
                        {serviceLocationType === 'HOME' && (
                          <span className="material-symbols-outlined text-cyan-400 text-[14px]">check_circle</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        Kỹ thuật viên mang bộ tool và linh kiện đến tận nhà bạn, hoặc nhận gear về mod và ship trả trong ngày.
                      </p>
                    </div>
                  </div>
                </div>

                
                {serviceLocationType === 'STORE' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-fadeIn">
                    <span className="text-[11px] font-mono text-emerald-300 font-bold block">
                      Vị trí giao nhận tại Cyber Zone:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-white/10 cursor-pointer">
                        <input
                          type="radio"
                          name="storeDetail"
                          checked={serviceStoreDetail === 'COUNTER'}
                          onChange={() => setServiceStoreDetail('COUNTER')}
                          className="accent-emerald-400"
                        />
                        <span className="text-xs text-slate-200">Quầy Trạm Kỹ Thuật Lab (Sảnh Tầng 1)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-white/10 cursor-pointer">
                        <input
                          type="radio"
                          name="storeDetail"
                          checked={serviceStoreDetail === 'STATION'}
                          onChange={() => setServiceStoreDetail('STATION')}
                          className="accent-emerald-400"
                        />
                        <span className="text-xs text-slate-200">Kỹ thuật viên qua bàn máy đang chơi</span>
                      </label>
                    </div>

                    {serviceStoreDetail === 'STATION' && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          Chọn số máy trạm bạn đang ngồi:
                        </label>
                        <select
                          value={serviceStationId}
                          onChange={(e) => setServiceStationId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-emerald-500/40 text-emerald-300 font-mono text-xs focus:outline-none"
                        >
                          {ALL_SEATS_CONFIG.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.id} • {s.zoneName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                
                {serviceLocationType === 'HOME' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3 animate-fadeIn">
                    <label className="block text-[11px] font-mono text-cyan-300 font-bold">
                      Địa Chỉ Nhà Riêng Của Bạn (Bắt buộc) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceHomeAddress}
                      onChange={(e) => setServiceHomeAddress(e.target.value)}
                      placeholder="Ví dụ: Số 28, Ngõ 45 Đường Lê Duẩn, Phường Bến Thủy, TP. Vinh, Nghệ An"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-cyan-500/40 text-white font-mono text-xs focus:border-cyan-300 focus:outline-none"
                    />
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-cyan-400">local_shipping</span>
                      <span>Miễn phí di chuyển &amp; giao nhận nội thành TP. Vinh cho đơn dịch vụ từ 150.000đ. Kỹ thuật viên sẽ gọi xác nhận trước 15 phút.</span>
                    </div>
                  </div>
                )}
              </div>

              
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                  Mô Tả Tình Trạng Thiết Bị &amp; Yêu Cầu Chi Tiết (Tùy Chọn)
                </label>
                <textarea
                  rows={2}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Ví dụ: Bàn phím cơ FL-Esports MK870 bị rít switch, muốn lube Krytox 205g0 âm thocky; hoặc PC Gaming bị nóng 90 độ cần vệ sinh quạt và tra keo Honeywell..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white font-mono text-xs focus:border-cyan-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setServiceBookingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  <span>Xác Nhận Đặt Lịch Dịch Vụ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {borrowSuccessModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-[#0a1622] to-slate-950 border border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <h3 className="text-xl font-black text-white font-gaming">
                Đăng Ký Mượn Test Thành Công!
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Mã phiếu trải nghiệm: <span className="text-emerald-400 font-bold">{borrowSuccessModal.code}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Thiết bị test:</span>
                <span className="text-white font-bold">{borrowSuccessModal.gearName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Vị trí giao bàn:</span>
                <span className="text-emerald-400 font-bold">Máy {borrowSuccessModal.stationId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Người mượn:</span>
                <span className="text-white">{borrowSuccessModal.customerName} ({borrowSuccessModal.phone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Thời lượng test:</span>
                <span className="text-cyan-400 font-bold">{borrowSuccessModal.duration}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                  KỸ THUẬT ĐANG MANG TỚI
                </span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setBorrowSuccessModal(null)}
                className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                Đã Hiểu &amp; Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-[#0a1424] to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">rate_review</span>
                  CYBER ZONE FEEDBACK &amp; REVIEW
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-gaming mt-1">
                  Gửi Đánh Giá &amp; Chấm Sao
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ý kiến của bạn giúp Cyber Zone ngày càng hoàn thiện dịch vụ và nâng tầm trải nghiệm!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-2">
                <span className="text-[11px] font-mono text-slate-300 font-bold block">
                  Bạn chấm Cyber Zone bao nhiêu sao? (Bấm để chọn):
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                      className="text-3xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <span
                        className={
                          star <= (reviewHoverRating || reviewRating)
                            ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'text-slate-700'
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-amber-300 font-bold">
                  {reviewRating === 5 && '⭐⭐⭐⭐⭐ 5/5: Quá tuyệt vời! Máy siêu mượt, đồ ăn ngon, dịch vụ đỉnh cao!'}
                  {reviewRating === 4 && '⭐⭐⭐⭐ 4/5: Rất tốt! Cấu hình khủng, phòng mát, ping thấp.'}
                  {reviewRating === 3 && '⭐⭐⭐ 3/5: Hài lòng! Trải nghiệm ổn định và thoải mái.'}
                  {reviewRating === 2 && '⭐⭐ 2/5: Bình thường, cần cải thiện thêm một số điểm.'}
                  {reviewRating === 1 && '⭐ 1/5: Chưa hài lòng với trải nghiệm.'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Họ &amp; Tên Người Đánh Giá <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="VD: Trần Ngọc Thái"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Hạng Hội Viên / Danh Hiệu
                  </label>
                  <select
                    value={reviewRole}
                    onChange={(e) => setReviewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-amber-300 text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Hội Viên Kim Cương 💎">Hội Viên Kim Cương 💎</option>
                    <option value="Hội Viên Vàng ⭐">Hội Viên Vàng ⭐</option>
                    <option value="Hội Viên Bạc 🥈">Hội Viên Bạc 🥈</option>
                    <option value="Thành Viên Tân Thủ">Thành Viên Tân Thủ</option>
                    <option value="Tuyển Thủ eSports 🏆">Tuyển Thủ eSports 🏆</option>
                    <option value="Khách Trải Nghiệm Couple">Khách Trải Nghiệm Couple</option>
                  </select>
                </div>
              </div>

              <div className="font-mono">
                <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                  Khu Máy Hoặc Dịch Vụ Đã Trải Nghiệm:
                </label>
                <select
                  value={reviewStation}
                  onChange={(e) => setReviewStation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="Phòng Ultra VIP Suite (VIP-08)">Phòng Ultra VIP Suite (VIP-08) • 240Hz Fast-IPS</option>
                  <option value="Sàn Đấu Arena 5vs5 (Tầng 1)">Sàn Đấu Arena 5vs5 (Tầng 1) • OLED 540Hz</option>
                  <option value="Khu Máy FPS Cyber Pro 540Hz">Khu Máy FPS Cyber Pro 540Hz</option>
                  <option value="Phòng Stream Studio Cách Âm">Phòng Stream Studio Cách Âm (Mic Shure SM7B)</option>
                  <option value="Phòng Đôi Couple Sanctuary">Phòng Đôi Couple Sanctuary (Sofa Nappa 180°)</option>
                  <option value="Bếp F&B Đồ Ăn & Nước Uống">Bếp F&B Đồ Ăn &amp; Nước Uống</option>
                  <option value="Showroom & Trạm Mod Phím Lab">Showroom &amp; Trạm Mod Phím Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1 font-semibold">
                  Nội Dung Đánh Giá &amp; Nhận Xét (Bình luận chi tiết) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận chi tiết của bạn về độ mượt của máy, màn hình, tốc độ mạng, món ăn thức uống, hoặc thái độ phục vụ của nhân viên..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:border-amber-400 focus:outline-none resize-none leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10 font-mono">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Gửi Đánh Giá Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {serviceSuccessModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-[#0a1622] to-slate-950 border border-cyan-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-400">
                <span className="material-symbols-outlined text-[32px]">verified</span>
              </div>
              <h3 className="text-xl font-black text-white font-gaming">
                Đặt Lịch Dịch Vụ Thành Công!
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Mã lịch hẹn: <span className="text-cyan-400 font-bold">{serviceSuccessModal.code}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Dịch vụ:</span>
                <span className="text-white font-bold">{serviceSuccessModal.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Chi phí:</span>
                <span className="text-emerald-400 font-bold">{serviceSuccessModal.price}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Khách hàng:</span>
                <span className="text-white">{serviceSuccessModal.customerName} ({serviceSuccessModal.phone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Thời gian hẹn:</span>
                <span className="text-cyan-300 font-bold">{serviceSuccessModal.date} • {serviceSuccessModal.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Địa điểm:</span>
                <span className="text-white font-bold text-right max-w-[240px]">
                  {serviceSuccessModal.locationType === 'HOME'
                    ? `🏠 TẬN NHÀ: ${serviceSuccessModal.homeAddress}`
                    : `🏢 TẠI QUÁN: ${serviceSuccessModal.storeLocationDetail}`}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  CHỜ KỸ THUẬT GỌI XÁC NHẬN
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-mono text-center">
              Hotline hỗ trợ kỹ thuật 24/7: <strong className="text-white">1900 8888</strong> • CSKH sẽ liên hệ trước buổi hẹn 15 phút.
            </p>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setServiceSuccessModal(null)}
                className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                Hoàn Tất &amp; Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedModalSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-[#0a1420] to-slate-950 border border-emerald-500/40 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6">

            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-400 text-black uppercase">
                    {selectedModalSeat.zoneName}
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] text-slate-300 bg-white/5 border border-white/10">
                    TẦNG {selectedModalSeat.floor}
                  </span>
                  {selectedModalSeat.id === 'VIP-08' && (
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-500/30 text-purple-300 border border-purple-500/50">
                      ⭐ MÁY TRẢI NGHIỆM ĐỘC QUYỀN
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-gaming flex items-center gap-3">
                  <span>MÃ TRẠM: {selectedModalSeat.id}</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedModalSeat(null)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/10"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Trạng thái:</span>
                {(() => {
                  const live = getSeatLiveStatus(selectedModalSeat);
                  return (
                    <span className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${live.badgeClass}`}>
                      <span className={`w-2 h-2 rounded-full ${live.dotClass}`} />
                      {live.label}
                      {live.occupant && ` (${live.occupant})`}
                    </span>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Đơn giá giờ chơi:</span>
                <span className="text-emerald-400 font-extrabold text-sm sm:text-base">
                  {getSeatPrice(selectedModalSeat)}
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-emerald-400">tune</span>
                THÔNG SỐ KỸ THUẬT &amp; TIỆN NGHI CAO CẤP
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] text-cyan-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">memory</span>
                    BỘ VI XỬ LÝ (CPU)
                  </div>
                  <div className="font-bold text-white">{selectedModalSeat.cpu}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">videogame_asset</span>
                    CARD ĐỒ HỌA (GPU)
                  </div>
                  <div className="font-bold text-white">{selectedModalSeat.gpu}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] text-amber-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">monitor</span>
                    MÀN HÌNH GAMING
                  </div>
                  <div className="font-bold text-white">{selectedModalSeat.screen}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] text-pink-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">keyboard</span>
                    GAMING GEAR CHÍNH HÃNG
                  </div>
                  <div className="font-bold text-white">{selectedModalSeat.gear}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] text-purple-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">chair</span>
                    GHẾ &amp; CÔNG THÁI HỌC
                  </div>
                  <div className="font-bold text-white">{selectedModalSeat.chair}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] text-sky-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">wifi</span>
                    MẠNG LAN &amp; DỊCH VỤ F&amp;B
                  </div>
                  <div className="font-bold text-white">Đường truyền 10Gbps ping 1ms • Gọi món tận bàn</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSelectedModalSeat(null)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition text-center"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => handleSelectSeatToBook(selectedModalSeat)}
                className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold shadow-lg shadow-emerald-500/25 transition text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>ĐẶT GIỮ CHỖ MÁY NÀY NGAY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        defaultTab="login"
        message={authModalMessage}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setCustomerName(user.fullName);
          setPhone(user.phone);
        }}
      />

    </div>
  );
}