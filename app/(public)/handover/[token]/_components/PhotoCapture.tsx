"use client";

import { useRef, useState } from "react";

export type PhotoSlot = "front" | "rear" | "leftSide" | "rightSide" | "interior";

const SLOT_LABELS: Record<PhotoSlot, string> = {
  front: "Front",
  rear: "Rear",
  leftSide: "Left Side",
  rightSide: "Right Side",
  interior: "Interior",
};

const SLOT_ICONS: Record<PhotoSlot, string> = {
  front: "⬆️", rear: "⬇️", leftSide: "⬅️", rightSide: "➡️", interior: "🪑",
};

interface Props {
  photos: Partial<Record<PhotoSlot, string>>; // preview URL per slot
  onCapture: (slot: PhotoSlot, file: File) => void;
  uploading: PhotoSlot | null;
}

export function PhotoCapture({ photos, onCapture, uploading }: Props) {
  const inputRefs = useRef<Partial<Record<PhotoSlot, HTMLInputElement>>>({});
  const slots: PhotoSlot[] = ["front", "rear", "leftSide", "rightSide", "interior"];

  return (
    <div>
      <p className="section-label mb-3">Vehicle Photos <span className="text-red-400">*</span></p>
      <p className="text-xs text-white/40 mb-4">All 5 photos are mandatory before submission</p>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot) => {
          const hasPhoto = !!photos[slot];
          const isUploading = uploading === slot;
          return (
            <div key={slot}>
              <input
                ref={(el) => { if (el) inputRefs.current[slot] = el; }}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onCapture(slot, file);
                }}
              />
              <button
                type="button"
                onClick={() => inputRefs.current[slot]?.click()}
                className={`relative w-full aspect-square rounded border-2 overflow-hidden flex flex-col items-center justify-center gap-1 transition-all duration-150
                  ${hasPhoto ? "border-green-400/50 bg-green-400/5" : "border-dashed border-white/20 bg-white/5 hover:border-amber-400/40 hover:bg-amber-400/5"}`}
              >
                {isUploading ? (
                  <span className="h-5 w-5 animate-spin rounded border-2 border-white/20 border-t-amber-400" />
                ) : hasPhoto ? (
                  <>
                    <img src={photos[slot]} alt={slot} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-2">
                      <span className="text-xs font-semibold text-green-400">✓ {SLOT_LABELS[slot]}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">{SLOT_ICONS[slot]}</span>
                    <span className="text-xs text-white/40">{SLOT_LABELS[slot]}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}