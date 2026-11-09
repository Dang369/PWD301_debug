export interface SeatBooking {
  id: string;
  seatId: string;
  customerName: string;
  phone: string;
  timeSlot: string;
  date: string;
  zone: string;
  branch: string;
  bookingCode: string;
  status: 'RESERVED' | 'CONFIRMED' | 'OCCUPIED' | 'AVAILABLE';
  createdAt: string;
  notes?: string;
}

export interface BaseSeat {
  id: string;
  type: 'ARENA' | 'PRO' | 'REG' | 'STD' | 'VIP' | 'STREAM' | 'COUPLE' | 'BIDA' | 'CONSOLE';
  floor: 1 | 2;
  defaultStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CURRENT';
  price: string;
  cpu: string;
  gpu: string;
  screen: string;
  gear: string;
  chair: string;
  zoneName: string;
}

export const BOOKING_STORAGE_KEY = 'CYBER_ZONE_BOOKINGS';
export const BOOKING_STORAGE_EVENT = 'cyber_booking_sync';

export const INITIAL_BOOKINGS: SeatBooking[] = [];

export const ALL_SEATS_CONFIG: BaseSeat[] = [

  {
    id: 'ARENA-A1',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Zowie EC2-CW',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Xanh)',
  },
  {
    id: 'ARENA-A2',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Zowie EC2-CW',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Xanh)',
  },
  {
    id: 'ARENA-A3',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Zowie EC2-CW',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Xanh)',
  },
  {
    id: 'ARENA-A4',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Zowie EC2-CW',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Xanh)',
  },
  {
    id: 'ARENA-A5',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Zowie EC2-CW',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Xanh)',
  },
  {
    id: 'ARENA-B1',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Razer DeathAdder V3 Pro',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Đỏ)',
  },
  {
    id: 'ARENA-B2',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Razer DeathAdder V3 Pro',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Đỏ)',
  },
  {
    id: 'ARENA-B3',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Razer DeathAdder V3 Pro',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Đỏ)',
  },
  {
    id: 'ARENA-B4',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Razer DeathAdder V3 Pro',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Đỏ)',
  },
  {
    id: 'ARENA-B5',
    type: 'ARENA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '25.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB',
    screen: 'ROG Swift OLED 540Hz',
    gear: 'Wooting 60HE + Razer DeathAdder V3 Pro',
    chair: 'Ghế thi đấu IESF Quốc Tế',
    zoneName: 'Đấu Trường Arena (Đội Đỏ)',
  },

  {
    id: 'BIDA-01',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'Bàn Aileex King 9020 Nhập Khẩu',
    gpu: 'Nỉ Simonis 860 Tournament',
    screen: 'Đèn LED chữ nhật 6 bóng chống lóa',
    gear: 'Bóng Aramith Pro Cup + 4 Cơ carbon Predator',
    chair: 'Sofa da Lounge sang trọng',
    zoneName: 'Billiards Club (Bàn Pool)',
  },
  {
    id: 'BIDA-02',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'Bàn Aileex King 9020 Nhập Khẩu',
    gpu: 'Nỉ Simonis 860 Tournament',
    screen: 'Đèn LED chữ nhật 6 bóng chống lóa',
    gear: 'Bóng Aramith Pro Cup + 4 Cơ carbon Predator',
    chair: 'Sofa da Lounge sang trọng',
    zoneName: 'Billiards Club (Bàn Pool)',
  },
  {
    id: 'BIDA-03',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'Bàn Min Table Hàn Quốc',
    gpu: 'Nỉ Simonis 860 Tournament',
    screen: 'Đèn LED chữ nhật 6 bóng chống lóa',
    gear: 'Bóng Aramith Pro Cup + 4 Cơ carbon Predator',
    chair: 'Sofa da Lounge sang trọng',
    zoneName: 'Billiards Club (Bàn Carom 3 Băng)',
  },
  {
    id: 'BIDA-04',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'Bàn Min Table Hàn Quốc',
    gpu: 'Nỉ Simonis 860 Tournament',
    screen: 'Đèn LED chữ nhật 6 bóng chống lóa',
    gear: 'Bóng Aramith Pro Cup + 4 Cơ carbon Predator',
    chair: 'Sofa da Lounge sang trọng',
    zoneName: 'Billiards Club (Bàn Carom 3 Băng)',
  },
  {
    id: 'BIDA-05',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'Bàn Aileex King 9020 Nhập Khẩu',
    gpu: 'Nỉ Simonis 860 Tournament',
    screen: 'Đèn LED chữ nhật 6 bóng chống lóa',
    gear: 'Bóng Aramith Pro Cup + 4 Cơ carbon Predator',
    chair: 'Sofa da Lounge sang trọng',
    zoneName: 'Billiards Club (Bàn Pool)',
  },
  {
    id: 'BIDA-06',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'Bàn Aileex King 9020 Nhập Khẩu',
    gpu: 'Nỉ Simonis 860 Tournament',
    screen: 'Đèn LED chữ nhật 6 bóng chống lóa',
    gear: 'Bóng Aramith Pro Cup + 4 Cơ carbon Predator',
    chair: 'Sofa da Lounge sang trọng',
    zoneName: 'Billiards Club (Bàn Pool)',
  },
  {
    id: 'BIDA-07',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'Bàn Aileex King 9020 Nhập Khẩu',
    gpu: 'Nỉ Simonis 860 Tournament',
    screen: 'Đèn LED chữ nhật 6 bóng chống lóa',
    gear: 'Bóng Aramith Pro Cup + 4 Cơ carbon Predator',
    chair: 'Sofa da Lounge sang trọng',
    zoneName: 'Billiards Club (Bàn Pool)',
  },
  {
    id: 'BIDA-08',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'Bàn Aileex King 9020 Nhập Khẩu',
    gpu: 'Nỉ Simonis 860 Tournament',
    screen: 'Đèn LED chữ nhật 6 bóng chống lóa',
    gear: 'Bóng Aramith Pro Cup + 4 Cơ carbon Predator',
    chair: 'Sofa da Lounge sang trọng',
    zoneName: 'Billiards Club (Bàn Pool)',
  },
  {
    id: 'BIDA-09',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '89.000đ/h',
    cpu: 'Bàn Rasson Ox Tiêu Chuẩn World Cup',
    gpu: 'Nỉ Simonis 860 Cloth',
    screen: 'Đèn thi đấu quốc tế',
    gear: 'Cơ Revo Predator Carbon cao cấp',
    chair: 'Phòng VIP Billiards riêng tư',
    zoneName: 'Billiards VIP Suite',
  },
  {
    id: 'BIDA-10',
    type: 'BIDA',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '89.000đ/h',
    cpu: 'Bàn Rasson Ox Tiêu Chuẩn World Cup',
    gpu: 'Nỉ Simonis 860 Cloth',
    screen: 'Đèn thi đấu quốc tế',
    gear: 'Cơ Revo Predator Carbon cao cấp',
    chair: 'Phòng VIP Billiards riêng tư',
    zoneName: 'Billiards VIP Suite',
  },

  {
    id: 'STD-01',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-02',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-03',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-04',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-05',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-06',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-07',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-08',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-09',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },
  {
    id: 'STD-10',
    type: 'STD',
    floor: 1,
    defaultStatus: 'AVAILABLE',
    price: '12.000đ/h',
    cpu: 'Intel Core i5 13400F',
    gpu: 'RTX 4060 Ti 8GB OC',
    screen: 'ASUS TUF 24.5" Fast-IPS 280Hz',
    gear: 'Logitech G102 + Phím cơ DareU',
    chair: 'Ghế da đúc công thái học',
    zoneName: 'Standard Zone Tiêu Chuẩn (Tầng 1)',
  },

  {
    id: 'PRO-01',
    type: 'PRO',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '18.000đ/h',
    cpu: 'AMD Ryzen 7 7800X3D (V-Cache)',
    gpu: 'RTX 4080 Super 16GB OC',
    screen: 'ASUS ROG Swift Pro 540Hz Fast-IPS',
    gear: 'Zowie EC2-CW + Wooting 60HE Hall Effect',
    chair: 'Herman Miller Embody Gaming',
    zoneName: 'Khu Máy Cyber Pro 540Hz',
  },
  {
    id: 'PRO-02',
    type: 'PRO',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '18.000đ/h',
    cpu: 'AMD Ryzen 7 7800X3D (V-Cache)',
    gpu: 'RTX 4080 Super 16GB OC',
    screen: 'ASUS ROG Swift Pro 540Hz Fast-IPS',
    gear: 'Zowie EC2-CW + Wooting 60HE Hall Effect',
    chair: 'Herman Miller Embody Gaming',
    zoneName: 'Khu Máy Cyber Pro 540Hz',
  },
  {
    id: 'PRO-03',
    type: 'PRO',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '18.000đ/h',
    cpu: 'AMD Ryzen 7 7800X3D (V-Cache)',
    gpu: 'RTX 4080 Super 16GB OC',
    screen: 'ASUS ROG Swift Pro 540Hz Fast-IPS',
    gear: 'Zowie EC2-CW + Wooting 60HE Hall Effect',
    chair: 'Herman Miller Embody Gaming',
    zoneName: 'Khu Máy Cyber Pro 540Hz',
  },
  {
    id: 'PRO-04',
    type: 'PRO',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '18.000đ/h',
    cpu: 'AMD Ryzen 7 7800X3D (V-Cache)',
    gpu: 'RTX 4080 Super 16GB OC',
    screen: 'ASUS ROG Swift Pro 540Hz Fast-IPS',
    gear: 'Zowie EC2-CW + Wooting 60HE Hall Effect',
    chair: 'Herman Miller Embody Gaming',
    zoneName: 'Khu Máy Cyber Pro 540Hz',
  },

  {
    id: 'VIP-01',
    type: 'VIP',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '22.000đ/h',
    cpu: 'Intel Core i9 14900K',
    gpu: 'RTX 4090 24GB Ultra',
    screen: 'ROG Swift OLED 540Hz 0.03ms',
    gear: 'Wooting 60HE + Pulsar X2V2 Wireless',
    chair: 'Herman Miller Embody Gaming',
    zoneName: 'Ultra VIP Suite',
  },
  {
    id: 'VIP-02',
    type: 'VIP',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '22.000đ/h',
    cpu: 'Intel Core i7 14700K',
    gpu: 'RTX 4090 24GB Ultra',
    screen: 'ROG Swift OLED 540Hz 0.03ms',
    gear: 'Razer Huntsman V3 Pro + DeathAdder V3 Pro',
    chair: 'Herman Miller Embody Gaming',
    zoneName: 'Ultra VIP Suite',
  },
  {
    id: 'VIP-03',
    type: 'VIP',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '22.000đ/h',
    cpu: 'Intel Core i7 14700K',
    gpu: 'RTX 4080 Super 16GB',
    screen: 'BenQ ZOWIE XL2566K 360Hz DyAc+',
    gear: 'Zowie EC2-CW + Phím cơ HE Rapid Trigger',
    chair: 'Noblechairs HERO Real Leather',
    zoneName: 'Ultra VIP Suite',
  },
  {
    id: 'VIP-04',
    type: 'VIP',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '22.000đ/h',
    cpu: 'Intel Core i7 14700K',
    gpu: 'RTX 4080 Super 16GB',
    screen: 'BenQ ZOWIE XL2566K 360Hz',
    gear: 'Logitech G Pro X Superlight + Phím Cơ',
    chair: 'Noblechairs HERO',
    zoneName: 'Ultra VIP Suite',
  },
  {
    id: 'VIP-05',
    type: 'VIP',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '22.000đ/h',
    cpu: 'Intel Core i7 14700K',
    gpu: 'RTX 4080 Super 16GB',
    screen: 'ASUS ROG 27" 240Hz Fast-IPS',
    gear: 'Logitech G Pro X Superlight + Phím Cơ',
    chair: 'Noblechairs HERO',
    zoneName: 'Ultra VIP Suite',
  },
  {
    id: 'VIP-06',
    type: 'VIP',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '22.000đ/h',
    cpu: 'Intel Core i7 14700K',
    gpu: 'RTX 4070 Ti Super 16GB',
    screen: 'ASUS ROG 27" 240Hz Fast-IPS',
    gear: 'Logitech G Pro X Superlight + Phím Cơ',
    chair: 'Noblechairs HERO',
    zoneName: 'Ultra VIP Suite',
  },
  {
    id: 'VIP-07',
    type: 'VIP',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '22.000đ/h',
    cpu: 'Intel Core i7 14700K',
    gpu: 'RTX 4070 Ti Super 16GB',
    screen: 'ASUS ROG 27" 240Hz Fast-IPS',
    gear: 'Logitech G Pro X Superlight + Phím Cơ',
    chair: 'Noblechairs HERO',
    zoneName: 'Ultra VIP Suite',
  },
  {
    id: 'VIP-08',
    type: 'VIP',
    floor: 2,
    defaultStatus: 'CURRENT',
    price: '22.000đ/h',
    cpu: 'Intel Core i7 14700K',
    gpu: 'RTX 4070 Ti Super 16GB',
    screen: 'ASUS ROG 27" 240Hz Fast-IPS',
    gear: 'Zowie EC2-CW + Phím Akko Custom',
    chair: 'Noblechairs HERO Nappa Leather',
    zoneName: 'Khu Thi Đấu VIP (Máy của bạn)',
  },

  {
    id: 'STREAM-01',
    type: 'STREAM',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '35.000đ/h',
    cpu: 'Intel Core i9 14900KS Dual-PC Streaming',
    gpu: 'Dual RTX 4090 24GB + Elgato 4K60 Pro',
    screen: '2x ROG OLED 240Hz + Màn phụ chat',
    gear: 'Shure SM7B + GoXLR + Cam Sony A6400',
    chair: 'Sofa Streamer cách âm 45dB',
    zoneName: 'Phòng Stream Studio Riêng Tư',
  },
  {
    id: 'STREAM-02',
    type: 'STREAM',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '35.000đ/h',
    cpu: 'Intel Core i9 14900K Dual-PC',
    gpu: 'RTX 4090 24GB + Elgato Cam Link',
    screen: '2x ROG Fast-IPS 280Hz',
    gear: 'Mic Røde NT-USB + Phím HE Rapid Trigger',
    chair: 'Sofa Streamer cách âm 45dB',
    zoneName: 'Phòng Stream Studio Riêng Tư',
  },
  {
    id: 'COUPLE-01',
    type: 'COUPLE',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '45.000đ/h',
    cpu: '2x Intel Core i7 13700K',
    gpu: '2x RTX 4070 12GB',
    screen: '2x Màn cong Samsung Odyssey 27" 240Hz',
    gear: 'Bộ gear đôi hồng - đen Akko Matcha',
    chair: 'Ghế Sofa đôi ngả 180° cửa cách âm',
    zoneName: 'Couple Suite (Phòng Đôi)',
  },
  {
    id: 'COUPLE-02',
    type: 'COUPLE',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '45.000đ/h',
    cpu: '2x Intel Core i7 13700K',
    gpu: '2x RTX 4070 12GB',
    screen: '2x Màn cong Samsung Odyssey 27" 240Hz',
    gear: 'Bộ gear đôi hồng - đen Akko Matcha',
    chair: 'Ghế Sofa đôi ngả 180° cửa cách âm',
    zoneName: 'Couple Suite (Phòng Đôi)',
  },
  {
    id: 'CONSOLE-01',
    type: 'CONSOLE',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'PlayStation 5 Pro + Nintendo Switch OLED',
    gpu: 'RDNA 3 Customized 4K 120FPS HDR',
    screen: 'TV LG OLED 75" 120Hz Dolby Vision',
    gear: '4x DualSense Wireless Controller + Game Pass',
    chair: 'Sofa đệm lười Da Nappa 4 chỗ',
    zoneName: 'Console Lounge & PS5 Pro',
  },
  {
    id: 'CONSOLE-02',
    type: 'CONSOLE',
    floor: 2,
    defaultStatus: 'AVAILABLE',
    price: '79.000đ/h',
    cpu: 'PlayStation 5 Pro + Nintendo Switch OLED',
    gpu: 'RDNA 3 Customized 4K 120FPS HDR',
    screen: 'TV LG OLED 75" 120Hz Dolby Vision',
    gear: '4x DualSense Wireless Controller + Game Pass',
    chair: 'Sofa đệm lười Da Nappa 4 chỗ',
    zoneName: 'Console Lounge & PS5 Pro',
  },
];

export function getStoredBookings(): SeatBooking[] {
  if (typeof window === 'undefined') return INITIAL_BOOKINGS;
  try {
    const raw = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (!raw) {
      return INITIAL_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBooking(
  bookingData: Omit<SeatBooking, 'id' | 'createdAt' | 'bookingCode'> & { bookingCode?: string }
): SeatBooking {
  const current = getStoredBookings();
  const code = bookingData.bookingCode || `CZ-2026-X${Math.floor(100 + Math.random() * 900)}`;

  const filtered = current.filter((b) => b.seatId !== bookingData.seatId);

  const newBooking: SeatBooking = {
    ...bookingData,
    id: `bk-${Date.now()}`,
    bookingCode: code,
    status: 'RESERVED',
    createdAt: new Date().toISOString(),
  };

  const updated = [newBooking, ...filtered];
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BOOKING_STORAGE_EVENT, { detail: updated }));
  }
  return newBooking;
}

export function cancelBooking(seatId: string): void {
  const current = getStoredBookings();
  const updated = current.filter((b) => b.seatId !== seatId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BOOKING_STORAGE_EVENT, { detail: updated }));
  }
}

export function clearAllBookings(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent(BOOKING_STORAGE_EVENT, { detail: [] }));
  }
}

export function confirmBooking(seatId: string): SeatBooking | null {
  const current = getStoredBookings();
  let confirmedBooking: SeatBooking | null = null;
  const updated = current.map((b) => {
    if (b.seatId === seatId) {
      confirmedBooking = {
        ...b,
        status: 'CONFIRMED' as const,
      };
      return confirmedBooking;
    }
    return b;
  });

  if (typeof window !== 'undefined' && confirmedBooking) {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BOOKING_STORAGE_EVENT, { detail: updated }));
  }
  return confirmedBooking;
}
export interface ServiceAppointment {
  id: string;
  code: string;
  serviceId: string;
  serviceName: string;
  price: string;
  customerName: string;
  phone: string;
  date: string;
  timeSlot: string;
  locationType: 'STORE' | 'HOME';
  storeLocationDetail?: string;
  homeAddress?: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
  createdAt: string;
}

export const SERVICE_APPOINTMENT_STORAGE_KEY = 'CYBER_SERVICE_APPOINTMENTS';
export const SERVICE_APPOINTMENT_EVENT = 'cyber_service_appointment_sync';

export function getStoredServiceAppointments(): ServiceAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SERVICE_APPOINTMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveServiceAppointment(
  data: Omit<ServiceAppointment, 'id' | 'code' | 'status' | 'createdAt'>
): ServiceAppointment {
  const current = getStoredServiceAppointments();
  const code = 'SRV-' + Math.floor(100000 + Math.random() * 900000);
  const newAppointment: ServiceAppointment = {
    ...data,
    id: 'srv-' + Date.now(),
    code,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  const updated = [newAppointment, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(SERVICE_APPOINTMENT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(SERVICE_APPOINTMENT_EVENT, { detail: updated }));
  }
  return newAppointment;
}

export interface GearBorrowRecord {
  id: string;
  code: string;
  gearId: string;
  gearName: string;
  customerName: string;
  phone: string;
  stationId: string;
  duration: string;
  notes?: string;
  status: 'PENDING' | 'DELIVERED' | 'RETURNED';
  createdAt: string;
}

export const GEAR_BORROW_STORAGE_KEY = 'CYBER_GEAR_BORROWS';
export const GEAR_BORROW_EVENT = 'cyber_gear_borrow_sync';

export function getStoredGearBorrows(): GearBorrowRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GEAR_BORROW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGearBorrowRecord(
  data: Omit<GearBorrowRecord, 'id' | 'code' | 'status' | 'createdAt'>
): GearBorrowRecord {
  const current = getStoredGearBorrows();
  const code = 'GEAR-' + Math.floor(10000 + Math.random() * 90000);
  const newRecord: GearBorrowRecord = {
    ...data,
    id: 'gear-borrow-' + Date.now(),
    code,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  const updated = [newRecord, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(GEAR_BORROW_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(GEAR_BORROW_EVENT, { detail: updated }));
  }
  return newRecord;
}
