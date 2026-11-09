import { NextResponse } from 'next/server';

export async function GET() {
  const stations = [
    { id: 'STD-01', name: 'Standard Zone', zone: 'Standard', rate: 12000, status: 'AVAILABLE' },
    { id: 'PRO-01', name: 'Cyber Pro 540Hz', zone: 'Pro', rate: 18000, status: 'AVAILABLE' },
    { id: 'VIP-08', name: 'Ultra VIP Tầng 2', zone: 'VIP', rate: 22000, status: 'OCCUPIED' },
    { id: 'ARENA-A1', name: 'Đấu Trường 5v5 IESF', zone: 'Arena', rate: 25000, status: 'AVAILABLE' },
    { id: 'STREAM-01', name: 'Phòng Stream 4K', zone: 'Stream', rate: 45000, status: 'AVAILABLE' },
    { id: 'BIDA-01', name: 'Bàn Bida Aileex King', zone: 'Bida', rate: 79000, status: 'AVAILABLE' },
  ];

  return NextResponse.json({
    success: true,
    total: stations.length,
    data: stations,
  });
}
