"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";

/* ─── Constants ─── */
const IPHONE_W = 1320;
const IPHONE_H = 2868;

const SIZES = [
  { label: '6.9"', w: 1320, h: 2868 },
  { label: '6.5"', w: 1284, h: 2778 },
  { label: '6.3"', w: 1206, h: 2622 },
  { label: '6.1"', w: 1125, h: 2436 },
] as const;

const MK_W = 1022;
const MK_H = 2082;
const SC_L = (52 / MK_W) * 100;
const SC_T = (46 / MK_H) * 100;
const SC_W = (918 / MK_W) * 100;
const SC_H = (1990 / MK_H) * 100;
const SC_RX = (126 / 918) * 100;
const SC_RY = (126 / 1990) * 100;

/* ─── Locales ─── */
const LOCALES = ["en", "zh"] as const;
type Locale = (typeof LOCALES)[number];

const COPY: Record<Locale, { slides: { label: string; headline: string }[] }> = {
  en: {
    slides: [
      { label: "DAILY TRAINING", headline: "Keep Your\nStreak Alive" },
      { label: "TRAINING PLAN", headline: "Plan Every\nWorkout" },
      { label: "CALENDAR", headline: "See Your\nProgress" },
      { label: "STATS", headline: "Track Your\nGrowth" },
      { label: "NOTES", headline: "Remember\nEvery Session" },
    ],
  },
  zh: {
    slides: [
      { label: "每日训练", headline: "坚持打卡\n保持连续" },
      { label: "训练计划", headline: "计划每次\n训练内容" },
      { label: "训练日历", headline: "一眼看清\n训练轨迹" },
      { label: "数据统计", headline: "追踪你的\n训练成长" },
      { label: "训练笔记", headline: "记录每次\n训练感悟" },
    ],
  },
};

/* ─── Phone Mockup ─── */
function Phone({ src, alt, style, className = "" }: { src: string; alt: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${MK_W}/${MK_H}`, ...style }}>
      <img src="/mockup.png" alt="" className="block w-full h-full" draggable={false} />
      <div
        className="absolute z-10 overflow-hidden"
        style={{
          left: `${SC_L}%`,
          top: `${SC_T}%`,
          width: `${SC_W}%`,
          height: `${SC_H}%`,
          borderRadius: `${SC_RX}% / ${SC_RY}%`,
        }}
      >
        <img src={src} alt={alt} className="block w-full h-full object-cover object-top" draggable={false} />
      </div>
    </div>
  );
}

/* ─── Caption ─── */
function Caption({ label, headline, canvasW }: { label: string; headline: string; canvasW: number }) {
  return (
    <div style={{ textAlign: "center", padding: `0 ${canvasW * 0.08}px` }}>
      <div
        style={{
          fontSize: canvasW * 0.038,
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: "#166534",
          marginBottom: canvasW * 0.025,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: canvasW * 0.095,
          fontWeight: 700,
          lineHeight: 1.05,
          color: "#1a1a1a",
          whiteSpace: "pre-line",
        }}
      >
        {headline}
      </div>
    </div>
  );
}

/* ─── Decorative blob ─── */
function GreenBlob({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(74,222,128,0.35) 0%, rgba(74,222,128,0) 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

/* ─── Slide Components ─── */
function Slide1({ base, copy, W, H }: { base: string; copy: typeof COPY.en.slides[0]; W: number; H: number }) {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 40%, #ffffff 100%)" }}>
      <GreenBlob style={{ width: W * 0.8, height: W * 0.8, top: "-10%", left: "-20%" }} />
      <GreenBlob style={{ width: W * 0.6, height: W * 0.6, bottom: "20%", right: "-15%" }} />
      {/* App icon + name + headline */}
      <div style={{ position: "absolute", top: H * 0.06, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: W * 0.015 }}>
        <img src="/app-icon.png" alt="HoopLog" style={{ width: W * 0.14, height: W * 0.14, borderRadius: W * 0.03 }} />
        <div style={{ fontSize: W * 0.06, fontWeight: 700, color: "#1a1a1a", marginBottom: W * 0.01 }}>
          Hoop<span style={{ color: "#4ADE80" }}>Log</span>
        </div>
        <div style={{ fontSize: W * 0.095, fontWeight: 700, lineHeight: 1.05, color: "#1a1a1a", whiteSpace: "pre-line", textAlign: "center" }}>
          {copy.headline}
        </div>
      </div>
      <Phone
        src={`${base}/home-done.png`}
        alt="Home"
        style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%) translateY(12%)", width: "82%" }}
      />
    </div>
  );
}

function Slide2({ base, copy, W, H }: { base: string; copy: typeof COPY.en.slides[0]; W: number; H: number }) {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #ffffff 0%, #f0fdf4 50%, #dcfce7 100%)" }}>
      <GreenBlob style={{ width: W * 0.7, height: W * 0.7, top: "5%", right: "-20%" }} />
      <div style={{ position: "absolute", top: H * 0.07, left: 0, right: 0 }}>
        <Caption label={copy.label} headline={copy.headline} canvasW={W} />
      </div>
      <Phone
        src={`${base}/home.png`}
        alt="Training Plan"
        style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%) translateY(12%)", width: "82%" }}
      />
    </div>
  );
}

function Slide3({ base, copy, W, H }: { base: string; copy: typeof COPY.en.slides[0]; W: number; H: number }) {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)" }}>
      <GreenBlob style={{ width: W * 0.9, height: W * 0.9, bottom: "10%", left: "-30%" }} />
      <div style={{ position: "absolute", top: H * 0.07, left: 0, right: 0 }}>
        <Caption label={copy.label} headline={copy.headline} canvasW={W} />
      </div>
      <Phone
        src={`${base}/calendar.png`}
        alt="Calendar"
        style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%) translateY(12%)", width: "82%" }}
      />
    </div>
  );
}

function Slide4({ base, copy, W, H }: { base: string; copy: typeof COPY.en.slides[0]; W: number; H: number }) {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 40%, #ecfdf5 100%)" }}>
      <GreenBlob style={{ width: W * 0.6, height: W * 0.6, top: "15%", left: "-10%" }} />
      <GreenBlob style={{ width: W * 0.5, height: W * 0.5, bottom: "25%", right: "-15%" }} />
      <div style={{ position: "absolute", top: H * 0.07, left: 0, right: 0 }}>
        <Caption label={copy.label} headline={copy.headline} canvasW={W} />
      </div>
      <Phone
        src={`${base}/settings.png`}
        alt="Stats"
        style={{ position: "absolute", bottom: 0, left: "48%", transform: "translateX(-50%) translateY(12%)", width: "82%" }}
      />
    </div>
  );
}

function Slide5({ base, copy, W, H }: { base: string; copy: typeof COPY.en.slides[0]; W: number; H: number }) {
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #166534 0%, #15803d 40%, #22c55e 100%)" }}>
      <GreenBlob style={{ width: W * 0.8, height: W * 0.8, top: "-5%", right: "-20%", background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: H * 0.07, left: 0, right: 0 }}>
        <div style={{ textAlign: "center", padding: `0 ${W * 0.08}px` }}>
          <div style={{ fontSize: W * 0.038, fontWeight: 600, letterSpacing: "0.12em", color: "#bbf7d0", marginBottom: W * 0.025, textTransform: "uppercase" }}>
            {copy.label}
          </div>
          <div style={{ fontSize: W * 0.095, fontWeight: 700, lineHeight: 1.05, color: "#ffffff", whiteSpace: "pre-line" }}>
            {copy.headline}
          </div>
        </div>
      </div>
      <Phone
        src={`${base}/notes.png`}
        alt="Notes"
        style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%) translateY(12%)", width: "82%" }}
      />
    </div>
  );
}

const SLIDE_COMPONENTS = [Slide1, Slide2, Slide3, Slide4, Slide5];

/* ─── Preview with scale ─── */
function ScreenshotPreview({ children, index, W, H, onExport }: { children: React.ReactNode; index: number; W: number; H: number; onExport: (index: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width;
      setScale(cw / W);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [W]);

  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer group"
      style={{ aspectRatio: `${W}/${H}`, overflow: "hidden", borderRadius: 12, border: "1px solid #e5e7eb" }}
      onClick={() => onExport(index)}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: W, height: H }}>
        {children}
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full transition-opacity">
          Export
        </span>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ScreenshotsPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const offscreenRefs = useRef<(HTMLDivElement | null)[]>([]);

  const size = SIZES[sizeIdx];
  const W = IPHONE_W;
  const H = IPHONE_H;
  const base = `/screenshots/${locale}`;
  const copy = COPY[locale];

  const exportSlide = useCallback(async (index: number) => {
    const el = offscreenRefs.current[index];
    if (!el) return;
    setExporting(true);

    const exportW = size.w;
    const exportH = size.h;

    el.style.left = "0px";
    el.style.opacity = "1";
    el.style.zIndex = "-1";

    const opts = { width: exportW, height: exportH, pixelRatio: 1, cacheBust: true };

    try {
      await toPng(el, opts); // warm up
      const dataUrl = await toPng(el, opts);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${String(index + 1).padStart(2, "0")}-${locale}-${exportW}x${exportH}.png`;
      a.click();
    } finally {
      el.style.left = "-9999px";
      el.style.opacity = "";
      el.style.zIndex = "";
      setExporting(false);
    }
  }, [size, locale]);

  const exportAll = useCallback(async () => {
    setExporting(true);
    for (let i = 0; i < SLIDE_COMPONENTS.length; i++) {
      await exportSlide(i);
      await new Promise((r) => setTimeout(r, 300));
    }
    setExporting(false);
  }, [exportSlide]);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 24 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: locale === l ? "#4ADE80" : "#fff",
                color: locale === l ? "#fff" : "#374151",
                fontWeight: locale === l ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <select
          value={sizeIdx}
          onChange={(e) => setSizeIdx(Number(e.target.value))}
          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          {SIZES.map((s, i) => (
            <option key={i} value={i}>
              {s.label} ({s.w}x{s.h})
            </option>
          ))}
        </select>

        <button
          onClick={exportAll}
          disabled={exporting}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            background: exporting ? "#9CA3AF" : "#4ADE80",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            cursor: exporting ? "not-allowed" : "pointer",
          }}
        >
          {exporting ? "Exporting..." : "Export All"}
        </button>
      </div>

      {/* Preview Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {SLIDE_COMPONENTS.map((SlideComp, i) => (
          <ScreenshotPreview key={`${locale}-${i}`} index={i} W={W} H={H} onExport={exportSlide}>
            <SlideComp base={base} copy={copy.slides[i]} W={W} H={H} />
          </ScreenshotPreview>
        ))}
      </div>

      {/* Offscreen export containers */}
      {SLIDE_COMPONENTS.map((SlideComp, i) => (
        <div
          key={`off-${locale}-${i}`}
          ref={(el) => { offscreenRefs.current[i] = el; }}
          style={{ position: "absolute", left: "-9999px", width: size.w, height: size.h }}
        >
          <div style={{ width: size.w, height: size.h, transform: `scale(${size.w / W})`, transformOrigin: "top left" }}>
            <SlideComp base={base} copy={copy.slides[i]} W={W} H={H} />
          </div>
        </div>
      ))}
    </div>
  );
}
