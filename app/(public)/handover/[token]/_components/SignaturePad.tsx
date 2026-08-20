"use client";

import { useRef, useEffect, useState } from "react";

interface Props {
  onCapture: (dataUrl: string) => void;
  hasSignature: boolean;
}

export function SignaturePad({ onCapture, hasSignature }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsEmpty(false);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDraw() {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      onCapture(canvas.toDataURL("image/png"));
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onCapture("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="section-label">Client Signature <span className="text-red-400">*</span></p>
        {!isEmpty && (
          <button type="button" onClick={clear} className="text-xs text-white/40 hover:text-white transition-colors">
            Clear
          </button>
        )}
      </div>
      <div className={`relative rounded-2xl border-2 overflow-hidden ${hasSignature ? "border-green-400/40" : "border-dashed border-white/20"}`}>
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full touch-none bg-white/4 cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {isEmpty && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white/25">
            Sign here
          </p>
        )}
      </div>
      <p className="mt-2 text-xs text-white/30">
        By signing above, the client confirms the vehicle condition documented in this inspection.
      </p>
    </div>
  );
}