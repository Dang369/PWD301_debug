'use client';

import { Order, OrderStatus } from '@/types/fnb';

export const STORAGE_KEY_ORDERS = 'cyber_orders';
export const STORAGE_KEY_BASE_REVENUE = 'cyber_base_revenue';
export const STORAGE_EVENT_NAME = 'cyber_orders_updated';
export const ORDER_EVENT_NAME = STORAGE_EVENT_NAME;

export const INITIAL_ORDERS: Order[] = [];
export const BASELINE_REVENUE = 0;
export const BASELINE_COMPLETED_ORDERS = 0;

const MENU_BASE_PRICES: Record<string, number> = {
  'Mì Cay Hải Sản Kim Chi Cấp 1-7': 59000,
  'Mì Trộn Indomie Double Trứng Lòng Đào': 38000,
  'Mì Trộn Indomie Bò Băm Phô Mai Tan Chảy': 45000,
  'Mì Xào Bò Cải Ngọt Giòn Cay': 45000,
  'Mì Trộn Hàn Quốc Sốt Tương Đen Jajangmyeon': 42000,
  'Mì Udon Bò Mỹ Sốt Cay Nhật Bản': 52000,
  'Mì Trộn Tôm Thịt Sa Tế Siêu Cay': 45000,
  'Mì Gà Cay Samyang Phô Mai Kéo Sợi': 48000,
  'Cơm Bò Lúc Lắc Phô Mai Trứng Ốp La': 55000,
  'Cơm Gà Xối Mỡ Da Giòn (Đùi Góc Tư)': 48000,
  'Bánh Mì Chảo Đặc Biệt Cybernet': 45000,
  'Cơm Chiên Dương Châu Hải Sản Tóp Mỡ': 42000,
  'Cơm Thịt Heo Chiên Xù Tonkatsu Sốt Curry': 50000,
  'Cơm Sườn Non Rim Mặn Ngọt Trứng Chiên': 48000,
  'Cơm Trộn Hàn Quốc Bibimbap Bò Trứng Lòng Đào': 48000,
  'Monster Energy Ultra Lạnh (Kèm Ly Đá)': 35000,
  'Trà Đào Cam Sả Khổng Lồ 1 Lít': 28000,
  'Sting Dâu Lạnh Ly Siêu To Kèm Thạch': 20000,
  'Trà Sữa Cyber Full Topping Trân Châu Phô Mai': 32000,
  'Red Bull Thái Lạnh (Kèm Ly Đá Bạc Hà)': 25000,
  'Cà Phê Muối Kem Béo Cyber Signature': 28000,
  'Soda Việt Quất Chanh Bạc Hà Mát Lạnh': 28000,
  'Khoai Tây Lắc Trứng Muối Phô Mai': 28000,
  'Xúc Xích Đức Nướng Phô Mai Tan Chảy': 25000,
  'Cá Viên Chiên Thập Cẩm Chấm Sốt Me Cay': 30000,
  'Gà Popcorn Chiên Giòn Sốt Cay Phô Mai': 35000,
  'Bánh Tráng Cuộn Bơ Trứng Cút Tép Khô': 25000,
  'Phô Mai Que Chiên Giòn Kéo Sợi (4 Thanh)': 30000,
  'Combo Thức Đêm Chiến Game (-20%)': 69000,
};

export function estimateOrderItemPrices(ord: Order): number[] {
  const baseTotal = ord.originalTotalAmount || ord.totalAmount || 0;
  if (Array.isArray(ord.itemPrices) && ord.itemPrices.length === ord.items.length) {
    return ord.itemPrices;
  }
  if (!ord.items || ord.items.length === 0) return [];

  const rawPrices = ord.items.map((item) => {
    if (typeof item !== 'string' && typeof item.unitPrice === 'number') {
      return item.unitPrice * (item.quantity || 1);
    }
    const str = typeof item === 'string' ? item : item.name || '';
    const m = str.match(/^(\d+)x\s*(.*)$/);
    const qty = m ? parseInt(m[1], 10) : 1;
    const rest = m ? m[2].trim() : str.trim();

    for (const [menuName, unitPrice] of Object.entries(MENU_BASE_PRICES)) {
      if (rest.startsWith(menuName)) {
        return unitPrice * qty;
      }
    }
    const cleanName = rest.split('(')[0].trim();
    if (MENU_BASE_PRICES[cleanName]) {
      return MENU_BASE_PRICES[cleanName] * qty;
    }
    return Math.round(baseTotal / ord.items.length);
  });

  const rawSum = rawPrices.reduce((s, p) => s + p, 0);
  if (rawSum <= 0) {
    const even = Math.round(baseTotal / ord.items.length);
    return ord.items.map((_, i) =>
      i === ord.items.length - 1 ? baseTotal - even * (ord.items.length - 1) : even
    );
  }

  let runningSum = 0;
  return rawPrices.map((p, idx) => {
    if (idx === rawPrices.length - 1) {
      return Math.max(0, baseTotal - runningSum);
    }
    const scaled = Math.round((p / rawSum) * baseTotal);
    runningSum += scaled;
    return scaled;
  });
}

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function broadcastOrdersUpdate(orders: Order[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail: orders }));
  } catch (err) {
    console.error('Failed to broadcast orders update:', err);
  }
}

export function addOrder(newOrder: Order): Order[] {
  const current = getStoredOrders();
  const orderWithTime: Order = {
    ...newOrder,
    createdAt: newOrder.createdAt || new Date().toISOString(),
  };
  const updated = [orderWithTime, ...current];
  broadcastOrdersUpdate(updated);
  return updated;
}

export function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  cancelReason?: string
): Order[] {
  const current = getStoredOrders();
  const nowIso = new Date().toISOString();
  const updated = current.map((ord) => {
    if (ord.id === orderId) {
      const isStartingCooking = nextStatus === 'COOKING' && !ord.cookingStartedAt;
      const isReady = nextStatus === 'READY';
      const isDelivered = nextStatus === 'DELIVERED';
      const isCancelled = nextStatus === 'CANCELLED';
      const allIndices = ord.items.map((_, idx) => idx);
      const prevChecked = Array.isArray(ord.checkedIndices) ? ord.checkedIndices : [];
      const prevCancelled = Array.isArray(ord.cancelledIndices) ? ord.cancelledIndices : [];

      let nextChecked = prevChecked;
      let nextCancelled = prevCancelled;
      let nextTotalAmount = ord.totalAmount;
      let nextOriginalTotal = ord.originalTotalAmount || ord.totalAmount;
      let nextRefundedAmount = ord.refundedAmount || 0;
      const itemPrices = estimateOrderItemPrices(ord);

      if (isReady && ord.status === 'COOKING') {
        if (prevChecked.length > 0 && prevChecked.length < ord.items.length) {
          // Bếp chỉ chọn một phần món (ví dụ 2/3 món), các món không được chọn chuyển sang danh sách báo hết / hủy lẻ
          nextChecked = prevChecked;
          nextCancelled = allIndices.filter((i) => !prevChecked.includes(i));
          const deliveredSum = nextChecked.reduce((sum, idx) => sum + (itemPrices[idx] || 0), 0);
          nextRefundedAmount = Math.max(0, nextOriginalTotal - deliveredSum);
          nextTotalAmount = deliveredSum;
        } else {
          // Đã chọn đủ 100% món
          nextChecked = allIndices;
          nextCancelled = [];
        }
      } else if (isDelivered) {
        // Giữ nguyên các món đã hoàn thành và các món bị hủy lẻ từ bước READY
        nextChecked =
          prevChecked.length > 0
            ? prevChecked
            : allIndices.filter((i) => !prevCancelled.includes(i));
      }

      return {
        ...ord,
        status: nextStatus,
        itemPrices,
        checkedIndices: nextChecked,
        cancelledIndices: nextCancelled,
        totalAmount: nextTotalAmount,
        originalTotalAmount: nextOriginalTotal,
        refundedAmount: nextRefundedAmount,
        cookingStartedAt: isStartingCooking ? nowIso : ord.cookingStartedAt,
        completedAt: isReady || isDelivered ? (ord.completedAt || nowIso) : ord.completedAt,
        deliveredAt: isDelivered ? (ord.deliveredAt || nowIso) : ord.deliveredAt,
        cancelReason: isCancelled ? (cancelReason || 'Hết nguyên liệu / Khách hủy đơn') : ord.cancelReason,
        timeElapsed: isDelivered ? 'DELIVERED' : isReady ? 'READY' : ord.timeElapsed,
        updatedAt: nowIso,
      };
    }
    return ord;
  });

  broadcastOrdersUpdate(updated);
  return updated;
}

export function toggleOrderItemCheck(orderId: string, itemIdx: number): Order[] {
  const current = getStoredOrders();
  const updated = current.map((ord) => {
    if (ord.id === orderId) {
      const prevChecked = Array.isArray(ord.checkedIndices) ? ord.checkedIndices : [];
      const exists = prevChecked.includes(itemIdx);
      const nextChecked = exists
        ? prevChecked.filter((i) => i !== itemIdx)
        : [...prevChecked, itemIdx];
      return {
        ...ord,
        checkedIndices: nextChecked,
        updatedAt: new Date().toISOString(),
      };
    }
    return ord;
  });

  broadcastOrdersUpdate(updated);
  return updated;
}

export function resetOrdersToDefault(): Order[] {
  broadcastOrdersUpdate([]);
  return [];
}

export function deleteOrder(orderId: string): Order[] {
  const current = getStoredOrders();
  const updated = current.filter((o) => o.id !== orderId);
  broadcastOrdersUpdate(updated);
  return updated;
}

export function clearCompletedOrders(): Order[] {
  const current = getStoredOrders();
  // Chỉ dọn dẹp các đơn ĐÃ GIAO TẬN BÀN (DELIVERED) hoặc ĐÃ HỦY (CANCELLED)
  // Tuyệt đối giữ lại các đơn READY (mới nấu xong, đang chờ Runner mang ra bàn cho khách)
  const updated = current.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  broadcastOrdersUpdate(updated);
  return updated;
}

export function getBaseRevenue(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BASE_REVENUE);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function setBaseRevenue(amount: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BASE_REVENUE, String(amount));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail: getStoredOrders() }));
  } catch (err) {
    console.error('Failed to set base revenue:', err);
  }
}

export function calculateLiveDashboardStats(
  orders: Order[],
  dateFilter: 'today' | 'week' | 'month' = 'today'
) {
  const now = Date.now();
  const maxAgeMs =
    dateFilter === 'today'
      ? 24 * 3600 * 1000
      : dateFilter === 'week'
      ? 7 * 24 * 3600 * 1000
      : 30 * 24 * 3600 * 1000;

  const filteredOrders = orders.filter((o) => {
    if (!o.createdAt) return true;
    const t = new Date(o.createdAt).getTime();
    if (isNaN(t)) return true;
    return now - t <= maxAgeMs;
  });

  // Đơn hàng chỉ được ghi nhận doanh thu thực tế khi ĐÃ GIAO TẬN BÀN (DELIVERED),
  // hoặc đã nấu xong (READY) và khách đã trả trước qua Ví Tài Khoản (ACCOUNT_BALANCE)
  const completedOrders = filteredOrders.filter(
    (o) =>
      o.status === 'DELIVERED' ||
      (o.status === 'READY' && o.paymentMethod === 'ACCOUNT_BALANCE')
  );

  const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING');
  const cookingOrders = filteredOrders.filter((o) => o.status === 'COOKING');
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY');
  const deliveredOrders = filteredOrders.filter((o) => o.status === 'DELIVERED');

  const periodBaseRevenue =
    dateFilter === 'week' ? 4850000 : dateFilter === 'month' ? 19400000 : BASELINE_REVENUE;
  const periodBaseCompletedCount =
    dateFilter === 'week' ? 68 : dateFilter === 'month' ? 275 : BASELINE_COMPLETED_ORDERS;

  const liveCompletedRevenue = completedOrders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const totalRevenue = periodBaseRevenue + liveCompletedRevenue;

  const itemMap: { [name: string]: { count: number; revenue: number } } = {};

  if (dateFilter !== 'today') {
    const mult = dateFilter === 'month' ? 4 : 1;
    itemMap['Mì Trộn Indomie Double Trứng Lòng Đào'] = { count: 24 * mult, revenue: 912000 * mult };
    itemMap['Cơm Bò Lúc Lắc Phô Mai Trứng Ốp La'] = { count: 18 * mult, revenue: 990000 * mult };
    itemMap['Sting Dâu Lạnh Ly Siêu To Kèm Thạch'] = { count: 31 * mult, revenue: 620000 * mult };
    itemMap['Trà Đào Cam Sả Khổng Lồ 1 Lít'] = { count: 15 * mult, revenue: 420000 * mult };
    itemMap['Gà Popcorn Chiên Giòn Sốt Cay Phô Mai'] = { count: 12 * mult, revenue: 420000 * mult };
  }

  completedOrders.forEach((ord) => {
    const cancelledSet = new Set(Array.isArray(ord.cancelledIndices) ? ord.cancelledIndices : []);
    const itemPrices = estimateOrderItemPrices(ord);
    ord.items.forEach((item, idx) => {
      if (cancelledSet.has(idx)) return;
      const itemStr = typeof item === 'string' ? item : (item as any).name || '';
      const match = itemStr.match(/^(\d+)x\s*(.*)$/);
      const qty = match ? parseInt(match[1], 10) : 1;
      const cleanName = (match ? match[2] : itemStr).split('(')[0].trim();

      if (cleanName) {
        if (!itemMap[cleanName]) {
          itemMap[cleanName] = { count: 0, revenue: 0 };
        }
        itemMap[cleanName].count += qty;
        itemMap[cleanName].revenue +=
          itemPrices[idx] || Math.round(ord.totalAmount / (ord.items.length || 1));
      }
    });
  });

  const bestSellers = Object.entries(itemMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item, idx) => ({
      rank: idx + 1,
      name: item.name,
      count: item.count,
      revenue: `${item.revenue.toLocaleString('vi-VN')}đ`,
      rate: `${Math.min(95, Math.max(30, Math.round((item.count / 35) * 100)))}%`,
    }));

  return {
    totalRevenue,
    formattedRevenue: `${totalRevenue.toLocaleString('vi-VN')}đ`,
    liveCompletedRevenue,
    formattedLiveCompleted: `${liveCompletedRevenue.toLocaleString('vi-VN')}đ`,
    totalOrdersCount:
      periodBaseCompletedCount +
      deliveredOrders.length +
      readyOrders.length +
      pendingOrders.length +
      cookingOrders.length,
    completedCount: periodBaseCompletedCount + deliveredOrders.length + readyOrders.length,
    pendingCount: pendingOrders.length,
    cookingCount: cookingOrders.length,
    readyCount: readyOrders.length,
    deliveredCount: deliveredOrders.length,
    recentCompletedOrders: completedOrders,
    bestSellers,
  };
}