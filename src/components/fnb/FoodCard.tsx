'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/types/fnb';

interface FoodCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, selectedOption?: string) => void;
}

export default function FoodCard({ item, onAddToCart }: FoodCardProps) {
  const [selectedSpicy, setSelectedSpicy] = useState<number | null>(
    item.spicyLevels && item.spicyLevels.length > 0 ? item.spicyLevels[2] || item.spicyLevels[0] : null
  );
  const [selectedAddon, setSelectedAddon] = useState<string | null>(
    item.options && item.options.length > 0 ? item.options[0] : null
  );

  const handleQuickAdd = () => {
    let optionText = '';
    if (selectedSpicy !== null) {
      optionText = `Cay cấp ${selectedSpicy}`;
    }
    if (selectedAddon) {
      optionText = optionText ? `${optionText}, ${selectedAddon}` : selectedAddon;
    }
    onAddToCart(item, optionText || undefined);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-cyan-400 rounded-xl p-3 flex flex-col justify-between group transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,240,255,0.2)]">
      <div>

        <div className="relative h-36 w-full rounded-lg overflow-hidden bg-black mb-2.5">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {item.isHot && (
            <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded font-mono tracking-wider uppercase shadow-md">
              HOT
            </span>
          )}
          {item.isBestSeller && !item.isHot && (
            <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded font-mono tracking-wider uppercase shadow-md">
              BESTSELLER
            </span>
          )}
          {item.badge && !item.isHot && !item.isBestSeller && (
            <span className="absolute top-1.5 left-1.5 bg-slate-950 text-cyan-400 border border-cyan-400/50 text-[10px] font-bold px-2 py-0.5 rounded font-mono tracking-wider uppercase">
              {item.badge}
            </span>
          )}
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-0.5 backdrop-blur-sm font-mono">
            <span className="material-symbols-outlined text-[12px] text-cyan-400">timer</span> ~{item.prepTime} phút
          </span>
        </div>

        <div className="flex items-start justify-between gap-1 mb-1">
          <h4 className="text-white font-black text-sm group-hover:text-cyan-400 transition-colors leading-tight">
            {item.name}
          </h4>
          <span className="font-mono text-base font-black text-cyan-400 whitespace-nowrap">
            {item.price.toLocaleString('vi-VN')}đ
          </span>
        </div>

        {item.spicyLevels && item.spicyLevels.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-slate-400 font-semibold">Cấp cay:</span>
            <div className="flex items-center gap-1">
              {item.spicyLevels.map((lvl) => {
                const isSelected = selectedSpicy === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedSpicy(lvl)}
                    className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-sm font-black scale-105'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {item.options && item.options.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-2 text-[11px] text-slate-400">
            {item.options.map((opt, i) => (
              <span
                key={i}
                className="bg-slate-800 border border-slate-700/80 px-1.5 py-0.5 rounded text-emerald-400 font-medium"
              >
                {opt}
              </span>
            ))}
          </div>
        )}

        {item.noteDetail && (!item.options || item.options.length === 0) && (!item.spicyLevels || item.spicyLevels.length === 0) && (
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
            <span className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">
              {item.noteDetail}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5">
        <button
          onClick={handleQuickAdd}
          className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95 shadow-[0_0_12px_rgba(0,240,255,0.25)] font-mono"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">add</span> THÊM NHANH
        </button>
      </div>
    </div>
  );
}