// script.js
// Combined: autoplay-resilient + canvas-over-video + pixelation + 35% base darkening
// Also ensures .header appears above the canvas (no HTML/CSS edits required).

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Try to make autoplay work via JS-only (mute + playsinline)
video.muted = true;
video.setAttribute('muted', '');
video.playsInline = true;
video.setAttribute('playsinline', '');
video.playbackRate = 0.75;

// Ensure header is positioned and above canvas
const header = document.querySelector('.header');
if (header) {
  // z-index only works for positioned elements; make it relative if not already
  const cs = window.getComputedStyle(header);
  if (cs.position === 'static') header.style.position = 'relative';
  header.style.zIndex = '10001';            // ensure header above canvas
  header.style.pointerEvents = 'auto';      // allow interactions with header
}

// Configure canvas to match video on-screen and sit below header
function placeCanvasOverVideo(rect) {
  // default to absolute positioning and cover the video's client rect
  canvas.style.position = 'absolute';
  canvas.style.left = `${rect.left + window.scrollX}px`;
  canvas.style.top = `${rect.top + window.scrollY}px`;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  canvas.style.pointerEvents = 'none';      // let clicks go through to video/header
  // Put canvas under the header (header's zIndex is 10001)
  canvas.style.zIndex = '10000';
}

// autoplay attempt + fallback to user interaction
function tryPlayAutoplay() {
  const p = video.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => {
      const startOnInteraction = () => {
        video.play().catch(err => console.warn('Play still blocked:', err));
        window.removeEventListener('click', startOnInteraction);
        window.removeEventListener('touchstart', startOnInteraction);
        window.removeEventListener('keydown', startOnInteraction);
      };
      window.addEventListener('click', startOnInteraction, { once: true });
      window.addEventListener('touchstart', startOnInteraction, { once: true, passive: true });
      window.addEventListener('keydown', startOnInteraction, { once: true });
    });
  }
}
tryPlayAutoplay();

// offscreen canvas for pixelation processing
const off = document.createElement('canvas');
const offCtx = off.getContext('2d');

let pixelate = false;
let videoRect = null;
const BASE_BLACK = 0.35; // persistent 35% overlay

function updateCanvasPositionAndSize() {
  const rect = video.getBoundingClientRect();
  videoRect = rect;
  placeCanvasOverVideo(rect);

  // internal canvas pixel size should respect devicePixelRatio for crispness
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
}

function draw() {
  if (!videoRect) updateCanvasPositionAndSize();

  if (video.readyState >= 2 && videoRect.width > 0 && videoRect.height > 0) {
    if (pixelate) {
      const scale = 0.05;
      const smallW = Math.max(1, Math.floor(videoRect.width * scale));
      const smallH = Math.max(1, Math.floor(videoRect.height * scale));

      off.width = smallW;
      off.height = smallH;

      // draw the video small
      offCtx.drawImage(video, 0, 0, smallW, smallH);

      // get pixels and apply combined base + corner gradient black overlay
      const img = offCtx.getImageData(0, 0, smallW, smallH);
      const data = img.data;

      // corner extras (extra darkness anchored at corners): TL, TR, BR, BL
      const cornerExtras = [0.35, 0.10, 0.10, 0.10];
      const corners = [
        { x: 0,      y: 0      },
        { x: smallW, y: 0      },
        { x: smallW, y: smallH },
        { x: 0,      y: smallH }
      ];

      const eps = 1e-4;
      for (let y = 0; y < smallH; y++) {
        for (let x = 0; x < smallW; x++) {
          const idx = (y * smallW + x) * 4;

          const dx0 = x - corners[0].x, dy0 = y - corners[0].y;
          const dx1 = x - corners[1].x, dy1 = y - corners[1].y;
          const dx2 = x - corners[2].x, dy2 = y - corners[2].y;
          const dx3 = x - corners[3].x, dy3 = y - corners[3].y;

          const d0 = dx0*dx0 + dy0*dy0 + eps;
          const d1 = dx1*dx1 + dy1*dy1 + eps;
          const d2 = dx2*dx2 + dy2*dy2 + eps;
          const d3 = dx3*dx3 + dy3*dy3 + eps;

          const w0 = 1 / d0;
          const w1 = 1 / d1;
          const w2 = 1 / d2;
          const w3 = 1 / d3;

          const sumW = w0 + w1 + w2 + w3;
          const nw0 = w0 / sumW;
          const nw1 = w1 / sumW;
          const nw2 = w2 / sumW;
          const nw3 = w3 / sumW;

          const cornerAlpha = nw0 * cornerExtras[0] +
                              nw1 * cornerExtras[1] +
                              nw2 * cornerExtras[2] +
                              nw3 * cornerExtras[3];

          // combine base and corner multiplicatively
          const mul = (1 - BASE_BLACK) * (1 - cornerAlpha);

          data[idx]     = Math.round(data[idx]     * mul);
          data[idx + 1] = Math.round(data[idx + 1] * mul);
          data[idx + 2] = Math.round(data[idx + 2] * mul);
        }
      }

      offCtx.putImageData(img, 0, 0);

      // scale up to visible canvas
      const prev = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(off, 0, 0, smallW, smallH, 0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = prev;

    } else {
      // normal full-res draw + base 35% overlay
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(0,0,0,${BASE_BLACK})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  requestAnimationFrame(draw);
}

// start drawing on 'play' event
video.addEventListener("play", () => {
  updateCanvasPositionAndSize();
  requestAnimationFrame(draw);
});

// keep canvas aligned when layout changes
if (window.ResizeObserver) {
  const ro = new ResizeObserver(() => updateCanvasPositionAndSize());
  ro.observe(video);
} else {
  window.addEventListener('resize', updateCanvasPositionAndSize);
  window.addEventListener('scroll', updateCanvasPositionAndSize, { passive: true });
}
window.addEventListener('load', updateCanvasPositionAndSize);
video.addEventListener('loadedmetadata', updateCanvasPositionAndSize);

// periodic pixelation toggle (same behavior)
setInterval(() => {
  pixelate = true;
  setTimeout(() => (pixelate = false), 100);
}, 2000);
