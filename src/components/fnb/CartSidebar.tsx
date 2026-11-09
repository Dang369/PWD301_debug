'use client';

import React, { useState } from 'react';
import { CartItem, PaymentMethod } from '@/types/fnb';

interface CartSidebarProps {
  cart: CartItem[];
  pcName?: string;
  vipDiscountRate?: number;
  tierName?: string;
  tierDiscountPercent?: number;
  accountBalance?: number;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: (note: string, paymentMethod: PaymentMethod, total: number) => void;
}

export default function CartSidebar({
  cart,
  pcName = 'MÁY VIP-08',
  vipDiscountRate = 0.05,
  tierName,
  tierDiscountPercent,
  accountBalance = 250000,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartSidebarProps) {
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ACCOUNT_BALANCE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const vipDiscount = Math.round(subTotal * vipDiscountRate);
  const total = Math.max(0, subTotal - vipDiscount);

  const handleOrderSubmit = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'ACCOUNT_BALANCE' && accountBalance < total) {
      alert(`Số dư tài khoản (${accountBalance.toLocaleString()}đ) không đủ thanh toán (${total.toLocaleString()}đ). Vui lòng nạp thêm hoặc chọn Tiền mặt / Quét QR!`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onCheckout(note, paymentMethod, total);
      setIsSubmitting(false);
      setNote('');
    }, 600);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-2xl sticky top-20">

      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm uppercase tracking-wide">
                GIỎ GỌI MÓN
              </span>
              <span className="px-1.5 py-0.2 bg-cyan-500 text-black font-mono text-[10px] font-black rounded">
                {totalItemsCount} MÓN
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span> GIAO ĐẾN: {pcName}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-slate-400 hover:text-rose-500 p-1.5 rounded transition-colors"
            title="Xóa toàn bộ giỏ hàng"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="py-8 px-4 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">fastfood</span>
          <p className="text-xs font-bold text-slate-400">Giỏ hàng của bạn đang trống</p>
          <p className="text-[11px] text-slate-500 mt-1">Bấm "+ THÊM NHANH" trên các món để bắt đầu đặt!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex flex-col gap-1.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-white leading-snug">{item.name}</h5>
                  {item.selectedOption && (
                    <span className="text-[10px] text-emerald-400 font-medium block">
                      + {item.selectedOption}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-cyan-400 whitespace-nowrap">
                  {(item.price * item.qty).toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                  {item.note || 'Món chuẩn vị cyber'}
                </span>
                <div className="flex items-center gap-1.5 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
                  <button
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="text-slate-400 hover:text-white px-1 leading-none font-bold"
                    type="button"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold text-white px-1">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="text-slate-400 hover:text-white px-1 leading-none font-bold"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="text-slate-400 text-xs block mb-1 font-semibold">Lời nhắn bếp / nhân viên:</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: Làm cay nhiều, lấy thêm muỗng nĩa..."
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-cyan-400 focus:outline-none w-full text-xs"
          type="text"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Hình thức thanh toán:</span>
        <label
          onClick={() => setPaymentMethod('ACCOUNT_BALANCE')}
          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors border ${
            paymentMethod === 'ACCOUNT_BALANCE'
              ? 'bg-slate-800 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              checked={paymentMethod === 'ACCOUNT_BALANCE'}
              onChange={() => setPaymentMethod('ACCOUNT_BALANCE')}
              className="accent-cyan-400 w-3.5 h-3.5"
              name="payment_mode"
              type="radio"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-white">Trừ ví tài khoản máy</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Khả dụng: {accountBalance.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">account_balance_wallet</span>
        </label>

        <label
          onClick={() => setPaymentMethod('CASH_OR_QR')}
          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors border ${
            paymentMethod === 'CASH_OR_QR'
              ? 'bg-slate-800 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              checked={paymentMethod === 'CASH_OR_QR'}
              onChange={() => setPaymentMethod('CASH_OR_QR')}
              className="accent-cyan-400 w-3.5 h-3.5"
              name="payment_mode"
              type="radio"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-300">Tiền mặt tại bàn / Quét QR</span>
              <span className="text-[10px] text-slate-500">Thu khi nhân viên bưng món</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">qr_code_2</span>
        </label>
      </div>

      <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-lg flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Tiền món ({totalItemsCount} món):</span>
          <span className="text-white font-mono">{subTotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Phục vụ tận máy:</span>
          <span className="text-emerald-400 font-bold font-mono">MIỄN PHÍ</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>
            {typeof tierDiscountPercent === 'number'
              ? (tierDiscountPercent > 0
                  ? `Ưu đãi ${tierName || 'Hội viên'} (-${tierDiscountPercent}%):`
                  : 'Ưu đãi Thành viên Tân thủ (0%):')
              : (vipDiscountRate > 0
                  ? `Ưu đãi ${tierName || 'VIP'} (-${Math.round(vipDiscountRate * 100)}%):`
                  : 'Ưu đãi Hội viên (0%):')}
          </span>
          <span className={vipDiscount > 0 ? "text-emerald-400 font-mono font-bold" : "text-slate-500 font-mono"}>
            {vipDiscount > 0 ? `-${vipDiscount.toLocaleString('vi-VN')}đ` : '0đ'}
          </span>
        </div>
        <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between">
          <span className="text-white font-black text-xs uppercase">Tổng thanh toán:</span>
          <span className="font-mono text-xl font-black text-cyan-400">
            {total.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      <button
        onClick={handleOrderSubmit}
        disabled={cart.length === 0 || isSubmitting}
        className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-mono font-black text-sm uppercase tracking-wide transition-all ${
          cart.length === 0
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-[0.98]'
        }`}
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isSubmitting ? 'sync' : 'bolt'}
        </span>
        <span>{isSubmitting ? 'ĐANG GỬI BẾP...' : '⚡ ĐẶT MÓN - GIAO TẬN BÀN'}</span>
      </button>

      <span className="text-center text-[10px] text-slate-500 font-medium">
        Bếp trạm KDS nhận thông báo ngay lập tức • Phục vụ trong 5-10 phút
      </span>
    </div>
  );
}