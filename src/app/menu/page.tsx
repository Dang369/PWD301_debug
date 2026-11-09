'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientHeader from '@/components/fnb/ClientHeader';
import FoodCard from '@/components/fnb/FoodCard';
import CartSidebar from '@/components/fnb/CartSidebar';
import { MenuItem, CartItem, PaymentMethod, Order } from '@/types/fnb';
import { addOrder, getStoredOrders, ORDER_EVENT_NAME } from '@/lib/orderStore';
import { getLoggedInUser, getClientPcSession, AUTH_EVENT_NAME, CLIENT_PC_EVENT_NAME } from '@/lib/authStore';
import {
  getStoredWallet,
  deductWallet,
  calculateRemainingPlayTime,
  WALLET_EVENT_NAME,
  getActiveClientStation,
  ACTIVE_STATION_EVENT,
} from '@/lib/walletStore';
import { getTierByName } from '@/lib/gamerPass';

const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'food-1',
    categoryId: 'mi-tron',
    name: 'Mì Cay Hải Sản Kim Chi Cấp 1-7',
    price: 59000,
    prepTime: 7,
    isAvailable: true,
    isHot: true,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    spicyLevels: [1, 2, 3, 5, 7],
    noteDetail: 'Tôm sú, mực tươi, chả cá Hàn Quốc, nấm kim châm',
  },
  {
    id: 'food-2',
    categoryId: 'mi-tron',
    name: 'Mì Trộn Indomie Double Trứng Lòng Đào',
    price: 38000,
    prepTime: 5,
    isAvailable: true,
    isHot: true,
    isBestSeller: true,
    badge: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    options: ['Trứng lòng đào béo ngậy', 'Trứng ốp chín kỹ'],
    noteDetail: 'Hành phi giòn rụm, kèm dưa leo, xúc xích và sốt đặc chế',
  },
  {
    id: 'food-3',
    categoryId: 'mi-tron',
    name: 'Mì Trộn Indomie Bò Băm Phô Mai Tan Chảy',
    price: 45000,
    prepTime: 6,
    isAvailable: true,
    isHot: false,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    options: ['Thêm phô mai lát (+5k)', 'Kèm nước súp thanh ngọt'],
    noteDetail: 'Bò băm xào sốt tiêu, xúc xích nướng, phô mai lát béo ngậy',
  },
  {
    id: 'food-4',
    categoryId: 'mi-tron',
    name: 'Mì Xào Bò Cải Ngọt Giòn Cay',
    price: 45000,
    prepTime: 6,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Bò mềm xào hành tây, cải ngọt tươi và sốt dầu hào thơm lừng',
  },
  {
    id: 'food-5',
    categoryId: 'mi-tron',
    name: 'Mì Trộn Hàn Quốc Sốt Tương Đen Jajangmyeon',
    price: 42000,
    prepTime: 5,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Sốt tương đen đậm đà thịt heo băm, kèm củ cải muối vàng giòn',
  },
  {
    id: 'food-6',
    categoryId: 'mi-tron',
    name: 'Mì Udon Bò Mỹ Sốt Cay Nhật Bản',
    price: 52000,
    prepTime: 7,
    isAvailable: true,
    isHot: true,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Sợi udon dai mềm, ba chỉ bò Mỹ cuộn nấm sốt cay tê',
  },
  {
    id: 'food-7',
    categoryId: 'mi-tron',
    name: 'Mì Trộn Tôm Thịt Sa Tế Siêu Cay',
    price: 45000,
    prepTime: 6,
    isAvailable: true,
    isHot: true,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Tôm luộc bóc nõn, thịt xá xíu, tóp mỡ giòn rụm cay nồng',
  },
  {
    id: 'food-8',
    categoryId: 'mi-tron',
    name: 'Mì Gà Cay Samyang Phô Mai Kéo Sợi',
    price: 48000,
    prepTime: 6,
    isAvailable: true,
    isHot: true,
    isBestSeller: true,
    badge: 'CAY ĐỈNH',
    image: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Mì gà cay Samyang chính hãng ngập tràn phô mai mozzarella kéo sợi',
  },
  {
    id: 'food-9',
    categoryId: 'com-dia',
    name: 'Cơm Bò Lúc Lắc Phô Mai Trứng Ốp La',
    price: 55000,
    prepTime: 7,
    isAvailable: true,
    isHot: false,
    isBestSeller: true,
    badge: 'CHÁY HÀNG',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    options: ['+ Trứng ốp la lòng đào (+8k)', 'Kèm canh rong biển nóng'],
    noteDetail: 'Bò mềm xào sốt tiêu đen kèm phô mai kéo sợi và trứng ốp la',
  },
  {
    id: 'food-10',
    categoryId: 'com-dia',
    name: 'Cơm Gà Xối Mỡ Da Giòn (Đùi Góc Tư)',
    price: 48000,
    prepTime: 6,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    badge: 'CÒN 8 SUẤT',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Đùi góc tư da giòn rụm, cơm chiên tỏi thơm, kèm canh rong biển nóng',
  },
  {
    id: 'food-11',
    categoryId: 'com-dia',
    name: 'Bánh Mì Chảo Đặc Biệt Cybernet',
    price: 45000,
    prepTime: 5,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    noteDetail: '2 trứng ốp la, pate Cột Đèn béo ngậy, bò mềm, xíu mại sốt cà',
  },
  {
    id: 'food-12',
    categoryId: 'com-dia',
    name: 'Cơm Chiên Dương Châu Hải Sản Tóp Mỡ',
    price: 42000,
    prepTime: 6,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Cơm hạt tơi vàng óng, lạp xưởng, tôm, đậu Hà Lan, tóp mỡ giòn',
  },
  {
    id: 'food-13',
    categoryId: 'com-dia',
    name: 'Cơm Thịt Heo Chiên Xù Tonkatsu Sốt Curry',
    price: 50000,
    prepTime: 7,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Cốt lết heo chiên xù kiểu Nhật ngập sốt cà ri thơm béo',
  },
  {
    id: 'food-14',
    categoryId: 'com-dia',
    name: 'Cơm Sườn Non Rim Mặn Ngọt Trứng Chiên',
    price: 48000,
    prepTime: 6,
    isAvailable: true,
    isHot: false,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Sườn non rim óng ả đậm đà, nước sốt chan cơm cực đỉnh',
  },
  {
    id: 'food-15',
    categoryId: 'com-dia',
    name: 'Cơm Trộn Hàn Quốc Bibimbap Bò Trứng Lòng Đào',
    price: 48000,
    prepTime: 6,
    isAvailable: true,
    isHot: true,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Cơm nóng, các loại rau củ xào, thịt bò và tương ớt Gochujang',
  },
  {
    id: 'food-16',
    categoryId: 'nuoc-uong',
    name: 'Monster Energy Ultra Lạnh (Kèm Ly Đá)',
    price: 35000,
    prepTime: 1,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    badge: 'LẠNH SÂU',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    options: ['Kèm 01 ly đá riêng'],
    noteDetail: 'Ướp lạnh 0°C sảng khoái chiến game xuyên đêm',
  },
  {
    id: 'food-17',
    categoryId: 'nuoc-uong',
    name: 'Trà Đào Cam Sả Khổng Lồ 1 Lít',
    price: 28000,
    prepTime: 3,
    isAvailable: true,
    isHot: false,
    isBestSeller: true,
    badge: 'SIZE 1L',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Ly khổng lồ 1000ml, 3 miếng đào giòn ngâm thơm mát',
  },
  {
    id: 'food-18',
    categoryId: 'nuoc-uong',
    name: 'Sting Dâu Lạnh Ly Siêu To Kèm Thạch',
    price: 20000,
    prepTime: 1,
    isAvailable: true,
    isHot: false,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Sting đỏ truyền thống ướp lạnh kèm thạch giòn bùng nổ năng lượng',
  },
  {
    id: 'food-19',
    categoryId: 'nuoc-uong',
    name: 'Trà Sữa Cyber Full Topping Trân Châu Phô Mai',
    price: 32000,
    prepTime: 3,
    isAvailable: true,
    isHot: false,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Trà đen thơm đậm đà, trân châu đen dẻo và viên phô mai tươi',
  },
  {
    id: 'food-20',
    categoryId: 'nuoc-uong',
    name: 'Red Bull Thái Lạnh (Kèm Ly Đá Bạc Hà)',
    price: 25000,
    prepTime: 1,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Bò húc Thái nắp vàng ngọt thanh, hồi phục năng lượng tức thì',
  },
  {
    id: 'food-21',
    categoryId: 'nuoc-uong',
    name: 'Cà Phê Muối Kem Béo Cyber Signature',
    price: 28000,
    prepTime: 3,
    isAvailable: true,
    isHot: false,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Cà phê Robusta đậm đặc kết hợp lớp kem muối béo ngậy',
  },
  {
    id: 'food-22',
    categoryId: 'nuoc-uong',
    name: 'Soda Việt Quất Chanh Bạc Hà Mát Lạnh',
    price: 28000,
    prepTime: 2,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Soda sủi bọt mát lạnh kết hợp siro việt quất và chanh tươi',
  },
  {
    id: 'food-23',
    categoryId: 'an-vat',
    name: 'Khoai Tây Lắc Trứng Muối Phô Mai',
    price: 28000,
    prepTime: 4,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Khoai sợi chiên giòn rụm phủ bột trứng muối béo mặn',
  },
  {
    id: 'food-24',
    categoryId: 'an-vat',
    name: 'Xúc Xích Đức Nướng Phô Mai Tan Chảy',
    price: 25000,
    prepTime: 4,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
    noteDetail: '2 cây xúc xích Đức nướng xém cạnh kèm sốt mù tạt mật ong',
  },
  {
    id: 'food-25',
    categoryId: 'an-vat',
    name: 'Cá Viên Chiên Thập Cẩm Chấm Sốt Me Cay',
    price: 30000,
    prepTime: 4,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Đĩa cá viên, tôm viên, bò viên chiên phồng chấm sốt me đậu phộng',
  },
  {
    id: 'food-26',
    categoryId: 'an-vat',
    name: 'Gà Popcorn Chiên Giòn Sốt Cay Phô Mai',
    price: 35000,
    prepTime: 5,
    isAvailable: true,
    isHot: true,
    isBestSeller: true,
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Gà phi lê viên lăn bột giòn tan phủ sốt cay ngọt Hàn Quốc',
  },
  {
    id: 'food-27',
    categoryId: 'an-vat',
    name: 'Bánh Tráng Cuộn Bơ Trứng Cút Tép Khô',
    price: 25000,
    prepTime: 3,
    isAvailable: true,
    isHot: false,
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Bánh tráng dẻo cuộn tép khô, hành phi, sốt bơ trứng béo ngậy',
  },
  {
    id: 'food-28',
    categoryId: 'an-vat',
    name: 'Phô Mai Que Chiên Giòn Kéo Sợi (4 Thanh)',
    price: 30000,
    prepTime: 4,
    isAvailable: true,
    isHot: false,
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=600&q=80',
    noteDetail: 'Phô mai mozzarella bọc bột xù kéo sợi chấm tương cà',
  },
];

function CyberMenuClientContent() {
  const searchParams = useSearchParams();
  const seatParam = searchParams.get('seat');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHotOnly, setFilterHotOnly] = useState(false);
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);

  const [accountBalance, setAccountBalance] = useState(200000);
  const [walletPcName, setWalletPcName] = useState(seatParam || 'STD-01');
  const [stationZone, setStationZone] = useState('Khu Tiêu Chuẩn • Tầng 1');
  const [stationHourlyRate, setStationHourlyRate] = useState(12000);
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    const user = getLoggedInUser() || getClientPcSession();
    setActiveUser(user);

    const handleUserUpdate = (e: any) => {
      setActiveUser(e?.detail || getLoggedInUser() || getClientPcSession());
    };

    window.addEventListener(AUTH_EVENT_NAME, handleUserUpdate);
    window.addEventListener(CLIENT_PC_EVENT_NAME, handleUserUpdate);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleUserUpdate);
      window.removeEventListener(CLIENT_PC_EVENT_NAME, handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    if (seatParam) {
      setWalletPcName(seatParam);
    }
  }, [seatParam]);

  useEffect(() => {
    const updateWalletAndStation = () => {
      try {
        const w = getStoredWallet();
        const st = getActiveClientStation();
        setAccountBalance(w.balance);
        setStationHourlyRate(st?.hourlyRate || w.hourlyRate || 12000);
        if (st?.zone || w.zoneName) {
          setStationZone(st?.zone || w.zoneName);
        }
        if (!seatParam) {
          setWalletPcName(st?.stationId || w.pcName);
        }
      } catch {}
    };
    updateWalletAndStation();
    window.addEventListener(WALLET_EVENT_NAME, updateWalletAndStation);
    window.addEventListener(ACTIVE_STATION_EVENT, updateWalletAndStation);
    window.addEventListener('storage', updateWalletAndStation);
    return () => {
      window.removeEventListener(WALLET_EVENT_NAME, updateWalletAndStation);
      window.removeEventListener(ACTIVE_STATION_EVENT, updateWalletAndStation);
      window.removeEventListener('storage', updateWalletAndStation);
    };
  }, [seatParam]);

  const [activePlayingGame, setActivePlayingGame] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('CYBER_ACTIVE_PLAYING_GAME');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.gameName) {
            setActivePlayingGame(parsed.gameName);
          }
        } catch (e) {}
      }
    }
  }, []);

  const [orderSuccessModal, setOrderSuccessModal] = useState<{
    orderNumber: number;
    total: number;
    method: PaymentMethod;
    itemsCount: number;
  } | null>(null);

  const [currentTicker, setCurrentTicker] = useState<{
    orderCode: string;
    description: string;
    eta: string;
    progressPercent: number;
  } | null>(null);

  useEffect(() => {
    const syncTickerFromOrders = () => {
      try {
        const allOrders = getStoredOrders();
        const activeOrder = allOrders.find(
          (o) =>
            o.pcName === walletPcName &&
            (o.status === 'PENDING' || o.status === 'COOKING' || o.status === 'READY')
        );
        if (activeOrder) {
          const cancelledSet = new Set(
            Array.isArray(activeOrder.cancelledIndices) ? activeOrder.cancelledIndices : []
          );
          const activeItems = activeOrder.items.filter((_, idx) => !cancelledSet.has(idx));
          setCurrentTicker({
            orderCode: `#KDS-${activeOrder.orderNumber}`,
            description:
              cancelledSet.size > 0
                ? `${activeItems.join(' + ')} (Đã hủy ${cancelledSet.size} món hết)`
                : activeItems.join(' + '),
            eta:
              activeOrder.status === 'READY'
                ? 'Đang bưng ra máy!'
                : activeOrder.status === 'COOKING'
                  ? '03:30'
                  : '07:00',
            progressPercent:
              activeOrder.status === 'READY'
                ? 90
                : activeOrder.status === 'COOKING'
                  ? 65
                  : 25,
          });
        } else {
          setCurrentTicker(null);
        }
      } catch {}
    };
    syncTickerFromOrders();
    window.addEventListener(ORDER_EVENT_NAME, syncTickerFromOrders);
    window.addEventListener('storage', syncTickerFromOrders);
    return () => {
      window.removeEventListener(ORDER_EVENT_NAME, syncTickerFromOrders);
      window.removeEventListener('storage', syncTickerFromOrders);
    };
  }, [walletPcName]);

  const [cart, setCart] = useState<CartItem[]>([]);

  const categories = [
    { id: 'all', name: 'TẤT CẢ', count: 28, icon: 'grid_view' },
    { id: 'mi-tron', name: 'Mì Trộn / Nước', count: 8, icon: 'ramen_dining' },
    { id: 'com-dia', name: 'Cơm Đĩa', count: 7, icon: 'dinner_dining' },
    { id: 'nuoc-uong', name: 'Nước Tăng Lực & Soda', count: 7, icon: 'bolt' },
    { id: 'an-vat', name: 'Đồ Ăn Vặt', count: 6, icon: 'cookie' },
    { id: 'combo', name: 'Combo Cày Đêm', count: 'HOT', icon: 'military_tech' },
  ];

  const filteredItems = useMemo(() => {
    return INITIAL_MENU_ITEMS.filter((item) => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'combo') {
          if (!item.isHot && !item.isBestSeller) return false;
        } else if (item.categoryId !== selectedCategory) {
          return false;
        }
      }

      if (filterHotOnly && !item.isHot) return false;
      if (filterAvailableOnly && !item.isAvailable) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesNote = item.noteDetail?.toLowerCase().includes(q);
        if (!matchesName && !matchesNote) return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, filterHotOnly, filterAvailableOnly]);

  const handleAddToCart = (item: MenuItem, selectedOption?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.menuItemId === item.id && c.selectedOption === selectedOption
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          selectedOption,
          note: item.noteDetail,
          categoryId: item.categoryId,
        },
      ];
    });
  };

  const handleAddNightCombo = () => {
    const comboItem: CartItem = {
      id: `cart-combo-${Date.now()}`,
      menuItemId: 'combo-special',
      name: 'Combo Thức Đêm Chiến Game (-20%)',
      price: 69000,
      qty: 1,
      selectedOption: '1x Cơm Gà + 1x Sting Dâu + 1x Snack',
      note: 'Ưu đãi cày đêm',
    };
    setCart((prev) => [...prev, comboItem]);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      setCart([]);
    }
  };

  const handleCheckout = (note: string, paymentMethod: PaymentMethod, total: number) => {
    const newOrderNumber = Math.floor(1000 + Math.random() * 9000);

    if (paymentMethod === 'ACCOUNT_BALANCE') {
      const deductRes = deductWallet(total, `Thanh toán F&B đơn #${newOrderNumber}`);
      if (!deductRes.success) {
        alert(
          `Số dư tài khoản ví (${accountBalance.toLocaleString('vi-VN')}đ) không đủ để thanh toán ${total.toLocaleString('vi-VN')}đ! Vui lòng nạp thêm tiền vào ví tại thanh menu trên cùng.`
        );
        return;
      }
      setAccountBalance(deductRes.wallet.balance);
    }

    const isAllDrinkOrder =
      cart.length > 0 && cart.every((c) => c.categoryId === 'nuoc-uong');

    const rawCartSub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    let runningPriceSum = 0;
    const itemPrices = cart.map((c, idx) => {
      if (idx === cart.length - 1) {
        return Math.max(0, total - runningPriceSum);
      }
      const p = rawCartSub > 0 ? Math.round(((c.price * c.qty) / rawCartSub) * total) : 0;
      runningPriceSum += p;
      return p;
    });

    const newKdsOrder = {
      id: `ord-${newOrderNumber}`,
      orderNumber: newOrderNumber,
      pcName: walletPcName || 'STD-01',
      zoneName: stationZone.toUpperCase(),
      status: 'PENDING' as const,
      paymentMethod,
      totalAmount: total,
      originalTotalAmount: total,
      itemPrices,
      timeElapsed: '00:01',
      note: note || undefined,
      station: isAllDrinkOrder ? ('BAR' as const) : ('HOT_KITCHEN' as const),
      items: cart.map(
        (c) => `${c.qty}x ${c.name}${c.selectedOption ? ` (${c.selectedOption})` : ''}`
      ),
    };

    addOrder(newKdsOrder);

    const firstItem = cart[0];
    setCurrentTicker({
      orderCode: `#KDS-${newOrderNumber}`,
      description: `${cart.length} món • ${firstItem?.name || 'Món ăn Gaming'}`,
      eta: '07:00',
      progressPercent: 25,
    });

    setOrderSuccessModal({
      orderNumber: newOrderNumber,
      total,
      method: paymentMethod,
      itemsCount: cart.length,
    });

    setCart([]);
  };

  const formattedRemainingTime = calculateRemainingPlayTime(accountBalance, stationHourlyRate);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans flex flex-col">
      <ClientHeader
        pcName={walletPcName}
        zoneName={stationZone}
        balance={accountBalance}
        remainingTime={formattedRemainingTime}
        userName={activeUser?.fullName || 'Tài khoản Hội viên'}
        userTier={activeUser?.userTier || 'Hội viên Cyber'}
        onTopup={() => (window.location.href = '/auth')}
        currentOrderTicker={currentTicker}
      />

      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>BẠN ĐANG ĐẶT MÓN CHO MÁY: <strong>{walletPcName || 'VIP-08'}</strong></span>
          {activePlayingGame && (
            <span className="hidden md:inline-flex items-center gap-1 text-rose-300 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded ml-2">
              <span className="material-symbols-outlined text-[14px] text-rose-400 animate-pulse">sports_esports</span>
              <span>Đang trong trận: <strong className="text-white">{activePlayingGame}</strong></span>
            </span>
          )}
        </div>
        <a
          href="/games"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-gaming tracking-wide transition shadow shadow-emerald-500/30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">sports_esports</span>
          <span>{activePlayingGame ? `QUAY LẠI TRẬN GAME ${activePlayingGame.toUpperCase()} \u2192` : 'QUAY LẠI KHO GAME \u2192'}</span>
        </a>
      </div>

      <main className="flex-1 w-full p-3 lg:p-4 grid grid-cols-12 gap-3 max-w-[1920px] mx-auto">
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-16 py-2 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Tìm tên món ăn, thức uống, combo cày game..."
                type="text"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                F3 /
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setFilterHotOnly(!filterHotOnly)}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  filterHotOnly
                    ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span> Món HOT
              </button>

              <button
                type="button"
                onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  filterAvailableOnly
                    ? 'bg-emerald-400 text-black border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Sẵn Hàng
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-lg tracking-wider flex-shrink-0 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-black/30 text-white font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700 bg-black">
                <img
                  className="w-full h-full object-cover"
                  alt="Combo bữa ăn đêm game thủ"
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80"
                />
                <span className="absolute top-0 left-0 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 uppercase tracking-wider font-mono">
                  -20%
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded uppercase font-mono">
                    COMBO CÀY ĐÊM
                  </span>
                  <span className="text-xs text-slate-400">1x Cơm Đùi Gà + 1x Sting Dâu + 1x Snack</span>
                </div>
                <h3 className="text-white font-black text-lg uppercase tracking-wide mt-1">
                  COMBO THỨC ĐÊM CHIẾN GAME
                </h3>
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="font-mono text-2xl font-black text-emerald-400 leading-none">
                    69.000đ
                  </span>
                  <span className="text-xs line-through text-slate-500 font-mono">85.000đ</span>
                  <span className="text-xs text-cyan-400 font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">bolt</span> Tiết kiệm 16k
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddNightCombo}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95 transition-all flex-shrink-0 font-mono"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              <span>CHỌN COMBO NÀY</span>
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-[#0c1424] rounded border border-[#26354f]">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-600">search_off</span>
              <p className="font-bold text-slate-400">Không tìm thấy món phù hợp</p>
              <p className="text-xs text-slate-500 mt-1">Thử đổi từ khóa hoặc chọn danh mục "TẤT CẢ"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredItems.map((item) => (
                <FoodCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          {(() => {
            const currentTier = getTierByName(activeUser?.userTier || 'ROOKIE');
            const fnbDiscountRate = (currentTier.fnbDiscountPercent || 0) / 100;
            return (
              <CartSidebar
                cart={cart}
                pcName={`MÁY ${walletPcName}`}
                accountBalance={accountBalance}
                vipDiscountRate={fnbDiscountRate}
                tierName={currentTier.name}
                tierDiscountPercent={currentTier.fnbDiscountPercent}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onCheckout={handleCheckout}
              />
            );
          })()}
        </div>
      </main>

      <footer className="w-full bg-[#050912] border-t border-[#26354f]/60 py-2 px-4 mt-auto">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-gaming font-bold text-primary tracking-wider">
              CYBERNET F&amp;B ENGINE v3.2
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Khu máy: Zone VIP A (Gaming Monitor 240Hz)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-secondary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span> Máy chủ F&amp;B Online (Ping: 1ms)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Hỗ trợ kỹ thuật: Ext 101</span>
          </div>
        </div>
      </footer>

      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1424] border-2 border-primary rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(0,240,255,0.3)] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <h3 className="font-gaming text-xl font-black text-white uppercase tracking-wider mb-1">
              ĐẶT MÓN THÀNH CÔNG!
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Đơn hàng của bạn đã được chuyển thẳng tới trạm bếp KDS.
            </p>

            <div className="w-full bg-[#070b14] border border-[#26354f] rounded-lg p-3 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Mã đơn:</span>
                <span className="font-mono font-bold text-primary">#{orderSuccessModal.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vị trí giao:</span>
                <span className="font-mono font-bold text-slate-200">{walletPcName} (Tầng 2)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phương thức:</span>
                <span className="font-bold text-secondary">
                  {orderSuccessModal.method === 'ACCOUNT_BALANCE' ? 'Trừ ví tài khoản máy' : 'Tiền mặt / Quét QR tại máy'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                <span className="text-white">Tổng thanh toán:</span>
                <span className="font-mono text-primary text-base">
                  {orderSuccessModal.total.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('CYBER_CLIENT_PC_EXPLICITLY_LOCKED');
                  localStorage.setItem('CYBER_CLIENT_PC_UNLOCKED', 'true');
                }
                setOrderSuccessModal(null);
                window.location.href = '/games';
              }}
              className="w-full bg-primary hover:bg-[#38f8ff] text-black font-gaming font-black py-3 rounded-lg uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined">sports_esports</span>
              <span>{activePlayingGame ? `QUAY LẠI TRẬN GAME ${activePlayingGame.toUpperCase()} NGAY \u2192` : 'QUAY LẠI KHO GAME NGAY \u2192'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CyberMenuClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] text-white flex items-center justify-center font-mono">Đang tải Menu...</div>}>
      <CyberMenuClientContent />
    </Suspense>
  );
}