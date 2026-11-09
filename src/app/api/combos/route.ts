import { NextResponse } from 'next/server';

export async function GET() {
  const combos = [
    { id: 'combo-1h', name: 'Gói 1 Giờ Chơi', price: 20000, bonus_minutes: 0, tag: 'Trải Nghiệm' },
    { id: 'combo-3h', name: 'Combo 3 Giờ Chiến', price: 50000, bonus_minutes: 15, tag: 'Tiết Kiệm 15%' },
    { id: 'combo-6h', name: 'Combo Cày Rank 6 Giờ', price: 100000, bonus_minutes: 45, tag: 'Hot Combo' },
    { id: 'combo-12h', name: 'Combo Thông Đêm 12 Giờ', price: 200000, bonus_minutes: 90, tag: 'Siêu Combo Đêm' },
  ];

  return NextResponse.json({
    success: true,
    total: combos.length,
    combos,
  });
}
