'use client';

import { motion } from 'framer-motion';
import { CHIP_VALUES, getChipColor } from '@/lib/roulette';

interface ChipSelectorProps {
  selectedChip: number;
  onSelectChip: (value: number) => void;
  disabled: boolean;
}

// Format chip display value
function formatChipValue(value: number): string {
  if (value >= 100) return `${value / 100}c`;
  return value.toString();
}

export default function ChipSelector({ selectedChip, onSelectChip, disabled }: ChipSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <h3 className="text-white font-semibold text-[10px] sm:text-xs">Jetons</h3>
      <div className="flex gap-1 sm:gap-2 justify-center">
        {CHIP_VALUES.map((value) => (
          <motion.button
            key={value}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => !disabled && onSelectChip(value)}
            disabled={disabled}
            className={`
              relative w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
              font-bold text-[9px] sm:text-xs border-2 sm:border-4 shadow-lg transition-all
              ${getChipColor(value)}
              ${selectedChip === value ? 'ring-2 sm:ring-3 ring-amber-400 ring-offset-1 sm:ring-offset-2 ring-offset-gray-900' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
            `}
          >
            {formatChipValue(value)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
