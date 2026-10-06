"use client";

/* eslint-disable @next/next/no-img-element -- local object URLs, not optimisable */
import { useEffect, useRef, useState, type PointerEvent } from "react";

const OUT = 1200; // output size (square), px

type Props = {
  /** Object URL or public URL of the photo to crop. */
  src: string;
  /** Called with the result; null = keep the original file as it is. */
  onDone: (result: Blob | null) => void;
  onCancel: () => void;
};

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not export the photo"))), "image/webp", 0.88),
  );
}

/**
 * Square photo cropper for the admin panel: drag to move, slider to zoom.
 * Product photos are shown as squares in the shop, so a square crop looks best.
 */
export function ImageCropper({ src, onDone, onCancel }: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [view, setView] = useState(320);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const el = viewRef.current;
    if (el) setView(el.clientWidth);
  }, []);

  // "Cover" scale: at zoom 1 the photo just fills the square.
  const base = natural ? Math.max(view / natural.w, view / natural.h) : 1;
  const scale = base * zoom;
  const dw = natural ? natural.w * scale : view;
  const dh = natural ? natural.h * scale : view;

  function clamp(x: number, y: number, w = dw, h = dh) {
    return { x: Math.min(0, Math.max(view - w, x)), y: Math.min(0, Math.max(view - h, y)) };
  }

  function onLoad() {
    const img = imgRef.current!;
    const n = { w: img.naturalWidth, h: img.naturalHeight };
    setNatural(n);
    const s = Math.max(view / n.w, view / n.h);
    setOffset({ x: (view - n.w * s) / 2, y: (view - n.h * s) / 2 }); // centred
  }

  function changeZoom(next: number) {
    if (!natural) return;
    // Zoom around the centre of the square.
    const c = view / 2;
    const ratio = next / zoom;
    const w = natural.w * base * next;
    const h = natural.h * base * next;
    setOffset(clamp(c - (c - offset.x) * ratio, c - (c - offset.y) * ratio, w, h));
    setZoom(next);
  }

  function onPointerDown(e: PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: PointerEvent) {
    const d = drag.current;
    if (d) setOffset(clamp(d.ox + e.clientX - d.x, d.oy + e.clientY - d.y));
  }

  async function exportCrop(mode: "crop" | "fit") {
    const img = imgRef.current;
    if (!img || !natural) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUT, OUT);
      if (mode === "crop") {
        ctx.drawImage(img, -offset.x / scale, -offset.y / scale, view / scale, view / scale, 0, 0, OUT, OUT);
      } else {
        const s = Math.min(OUT / natural.w, OUT / natural.h);
        const w = natural.w * s;
        const h = natural.h * s;
        ctx.drawImage(img, (OUT - w) / 2, (OUT - h) / 2, w, h);
      }
      onDone(await toBlob(canvas));
    } catch (err) {
      console.error(err);
      setError("This photo can't be edited here. Use “Keep original” instead.");
      setBusy(false);
    }
  }

  const btn = "h-11 cursor-pointer rounded-full px-4 text-sm font-extrabold disabled:opacity-60";

  return (
    <div role="dialog" aria-modal="true" aria-label="Crop photo" className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/70 p-4">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-5">
        <h2 className="text-lg font-extrabold">Crop photo</h2>
        <p className="-mt-2 text-sm text-muted">Drag the photo to move it, use the slider to zoom.</p>

        <div
          ref={viewRef}
          className="relative aspect-square w-full touch-none overflow-hidden rounded-2xl bg-surface select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <img
            ref={imgRef}
            src={src}
            crossOrigin="anonymous"
            alt=""
            onLoad={onLoad}
            draggable={false}
            className="absolute max-w-none cursor-grab active:cursor-grabbing"
            style={{ width: dw, height: dh, left: offset.x, top: offset.y }}
          />
          {/* Rule-of-thirds guide */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="border border-white/40" />
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm font-bold">
          Zoom
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="flex-1 accent-navy"
          />
        </label>

        {error && <p className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">{error}</p>}

        <div className="flex flex-col gap-2">
          <button type="button" disabled={busy || !natural} onClick={() => exportCrop("crop")} className={`${btn} bg-accent text-white`}>
            {busy ? "Saving…" : "Use this crop"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={busy || !natural} onClick={() => exportCrop("fit")} className={`${btn} bg-surface`}>
              Fit whole photo
            </button>
            <button type="button" disabled={busy} onClick={() => onDone(null)} className={`${btn} bg-surface`}>
              Keep original
            </button>
          </div>
          <button type="button" disabled={busy} onClick={onCancel} className="min-h-10 cursor-pointer text-sm font-bold text-muted underline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
