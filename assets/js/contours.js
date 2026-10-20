/* Topographic contour background.
   Fractal value noise -> marching squares isolines, drawn once per resize. */
(function () {
  const canvas = document.getElementById("contours");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  // Seeded PRNG so the "terrain" is the same on every visit.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(2026);
  const LATTICE = 64;
  const lattice = new Float32Array(LATTICE * LATTICE).map(() => rand());
  const lat = (x, y) => lattice[((y & (LATTICE - 1)) * LATTICE) + (x & (LATTICE - 1))];
  const smooth = (t) => t * t * (3 - 2 * t);

  function valueNoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const tx = smooth(x - xi), ty = smooth(y - yi);
    const a = lat(xi, yi), b = lat(xi + 1, yi), c = lat(xi, yi + 1), d = lat(xi + 1, yi + 1);
    return (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
  }
  function elevation(x, y) {
    let v = 0, amp = 1, freq = 1 / 260, norm = 0;
    for (let o = 0; o < 4; o++) {
      v += valueNoise(x * freq, y * freq) * amp;
      norm += amp; amp *= 0.5; freq *= 2.03;
    }
    return v / norm;
  }

  function draw() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cell = 9;
    const cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1;
    const grid = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) grid[j * cols + i] = elevation(i * cell + 400, j * cell + 120);

    const LEVELS = 22, lo = 0.22, hi = 0.78;
    for (let l = 0; l < LEVELS; l++) {
      const iso = lo + (hi - lo) * (l / (LEVELS - 1));
      const index = l % 5 === 0;
      ctx.beginPath();
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const a = grid[j * cols + i], b = grid[j * cols + i + 1];
          const c = grid[(j + 1) * cols + i + 1], d = grid[(j + 1) * cols + i];
          const code = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
          if (code === 0 || code === 15) continue;
          const x = i * cell, y = j * cell;
          const top = [x + cell * ((iso - a) / (b - a)), y];
          const right = [x + cell, y + cell * ((iso - b) / (c - b))];
          const bottom = [x + cell * ((iso - d) / (c - d)), y + cell];
          const left = [x, y + cell * ((iso - a) / (d - a))];
          const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
          switch (code) {
            case 1: case 14: seg(left, bottom); break;
            case 2: case 13: seg(bottom, right); break;
            case 3: case 12: seg(left, right); break;
            case 4: case 11: seg(top, right); break;
            case 6: case 9: seg(top, bottom); break;
            case 7: case 8: seg(left, top); break;
            case 5: seg(left, top); seg(bottom, right); break;
            case 10: seg(top, right); seg(left, bottom); break;
          }
        }
      }
      ctx.strokeStyle = index ? "rgba(120, 200, 180, 0.16)" : "rgba(120, 200, 180, 0.075)";
      ctx.lineWidth = index ? 1.1 : 0.8;
      ctx.stroke();
    }
  }

  let t;
  draw();
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(draw, 200); });
})();
