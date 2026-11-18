/**
 * Little Arcade — Karambol / Carrom (Game 02)
 * Simulasi fisika 2D di Canvas dengan sub-stepping, tabrakan elastis, dan kontrol presisi.
 */

const canvas = $('game');
const ctx = canvas.getContext('2d');
const pockets = [
  [43, 43],
  [557, 43],
  [43, 557],
  [557, 557]
];

let pieces = [];
let striker;
let shots = 0;
let captured = 0;
let drag = null;
let active = false;
let angle = -Math.PI / 2;
let power = 40;
let last = 0;
let accumulator = 0;

/**
 * Factory untuk membuat keping koin atau striker
 */
const piece = (x, y, r, color) => ({
  x,
  y,
  r,
  color,
  vx: 0,
  vy: 0,
  sunk: false
});

/**
 * Reset papan dan atur susunan koin awal
 */
function reset() {
  // 1 Koin merah tengah (Queen)
  pieces = [piece(300, 300, 12, '#bb6555')];

  // 8 Koin melingkar (pion putih & hitam selang-seling)
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    pieces.push(
      piece(
        300 + Math.cos(a) * 30,
        300 + Math.sin(a) * 30,
        12,
        i % 2 ? '#e8dbb4' : '#343d31'
      )
    );
  }

  // Striker hijau pemain di garis bawah
  striker = piece(300, 480, 16, '#d1f478');
  shots = 0;
  captured = 0;
  active = false;
  drag = null;
  angle = -Math.PI / 2;
  power = 40;

  stats();
  say('Tarik striker hijau ke belakang, lalu lepaskan untuk menembak.');
}

function stats() {
  if ($('score')) $('score').textContent = captured;
  if ($('shots')) $('shots').textContent = shots;
  if ($('remaining')) $('remaining').textContent = pieces.length;
  if ($('power')) $('power').textContent = `Kekuatan ${Math.round(power)}%`;
}

/**
 * Tembakkan striker berdasarkan sudut dan kekuatan
 */
function shoot() {
  if (active || captured === 9) return;
  const speed = power * 0.19;
  striker.vx = Math.cos(angle) * speed;
  striker.vy = Math.sin(angle) * speed;
  active = true;
  shots++;
  stats();
  say('Tembakan meluncur…');
}

/**
 * Konversi koordinat event mouse/touch ke ruang koordinat Canvas (600x600)
 */
function point(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) * 600) / r.width,
    y: ((e.clientY - r.top) * 600) / r.height
  };
}

// Kontrol Pointer (Mouse & Touch)
canvas.onpointerdown = (e) => {
  if (active || captured === 9) return;
  const p = point(e);
  if (Math.hypot(p.x - striker.x, p.y - striker.y) < 36) {
    canvas.setPointerCapture(e.pointerId);
    drag = p;
    canvas.focus();
    e.preventDefault();
  }
};

canvas.onpointermove = (e) => {
  if (!drag) return;
  drag = point(e);
  // Sudut berlawanan arah tarikan (slingshot)
  angle = Math.atan2(striker.y - drag.y, striker.x - drag.x);
  power = Math.min(100, Math.hypot(striker.x - drag.x, striker.y - drag.y) / 1.5);
  stats();
};

canvas.onpointerup = () => {
  if (!drag) return;
  drag = null;
  if (power > 3) shoot();
};

canvas.onpointercancel = () => {
  drag = null;
};

// Kontrol Keyboard
canvas.onkeydown = (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) return;
  e.preventDefault();
  if (active || captured === 9) return;

  if (e.key === 'ArrowLeft') angle -= 0.07;
  if (e.key === 'ArrowRight') angle += 0.07;
  if (e.key === 'ArrowUp') power = Math.min(100, power + 5);
  if (e.key === 'ArrowDown') power = Math.max(5, power - 5);
  if (e.key === ' ') shoot();

  stats();
};

if ($('restart')) $('restart').onclick = reset;

/**
 * Siklus update fisika dengan 3 sub-langkah untuk stabilitas collision
 */
function update() {
  if (!active) return;
  const all = [...pieces, striker].filter((p) => !p.sunk);

  for (let sub = 0; sub < 3; sub++) {
    // 1. Integrasi posisi, gesekan, lubang, dan dinding
    for (const p of all) {
      if (p.sunk) continue;
      p.x += p.vx / 3;
      p.y += p.vy / 3;
      p.vx *= 0.993;
      p.vy *= 0.993;

      // Cek apakah masuk lubang sudut
      if (pockets.some(([x, y]) => Math.hypot(p.x - x, p.y - y) < 24)) {
        p.sunk = true;
        p.vx = 0;
        p.vy = 0;
        continue;
      }

      // Pantulan dinding tepi papan
      for (const axis of ['x', 'y']) {
        if (p[axis] < 27 + p.r || p[axis] > 573 - p.r) {
          p[axis] = Math.max(27 + p.r, Math.min(573 - p.r, p[axis]));
          p[axis === 'x' ? 'vx' : 'vy'] *= -0.83;
        }
      }
    }

    // 2. Tabrakan antar keping (Circle vs Circle Elastic Collision)
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        if (a.sunk || b.sunk) continue;

        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);

        if (d < a.r + b.r) {
          const nx = d ? dx / d : 1;
          const ny = d ? dy / d : 0;
          const overlap = (a.r + b.r - d) / 2;

          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          const v = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (v > 0) {
            a.vx -= v * nx * 0.95;
            a.vy -= v * ny * 0.95;
            b.vx += v * nx * 0.95;
            b.vy += v * ny * 0.95;
          }
        }
      }
    }
  }

  pieces = pieces.filter((p) => !p.sunk);
  captured = 9 - pieces.length;
  stats();

  // Cek apakah semua keping sudah berhenti bergerak
  if (all.every((p) => p.sunk || Math.hypot(p.vx, p.vy) < 0.12)) {
    active = false;
    pieces.forEach((p) => {
      p.vx = 0;
      p.vy = 0;
    });

    // Reset posisi striker ke garis bawah tanpa menindih koin lain
    striker = piece(300, 480, 16, '#d1f478');
    for (let x = 60; x <= 540; x += 36) {
      if (!pieces.some((p) => Math.hypot(p.x - striker.x, p.y - striker.y) < p.r + striker.r + 2)) {
        break;
      }
      striker.x = x;
    }

    say(
      captured === 9
        ? `Selesai! Semua koin masuk dalam ${shots} tembakan. Main lagi?`
        : 'Siap untuk bidikan berikutnya. Tarik striker atau gunakan keyboard.'
    );
  }
}

function circle(x, y, r, fill, stroke) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

/**
 * Gambar seluruh papan karambol dan elemennya
 */
function draw() {
  ctx.clearRect(0, 0, 600, 600);

  // Bingkai kayu luar
  ctx.fillStyle = '#685239';
  ctx.fillRect(0, 0, 600, 600);
  ctx.strokeStyle = '#90744d';
  ctx.lineWidth = 1;
  for (let n = 6; n < 27; n += 6) {
    ctx.strokeRect(n, n, 600 - n * 2, 600 - n * 2);
  }

  // Lapangan kayu bermain
  ctx.fillStyle = '#dbc99e';
  ctx.fillRect(27, 27, 546, 546);
  ctx.strokeStyle = '#b19b70';
  ctx.strokeRect(57, 57, 486, 486);

  // Garis baseline dan ornamen 4 sisi
  ctx.save();
  ctx.translate(300, 300);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.strokeStyle = '#816b4c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-172, 170, 344, 28, 14);
    ctx.stroke();
    circle(-158, 184, 10, '#af7156');
    circle(158, 184, 10, '#af7156');
    ctx.beginPath();
    ctx.moveTo(-213, 213);
    ctx.lineTo(-155, 155);
    ctx.stroke();
    circle(-150, 150, 5, null, '#816b4c');
  }
  ctx.restore();

  // Lingkaran pusat
  ctx.lineWidth = 1.5;
  circle(300, 300, 68, null, '#ad8c60');
  circle(300, 300, 58, null, '#ad8c60');
  circle(300, 300, 19, null, '#ad8c60');

  // 4 Lubang sudut
  pockets.forEach(([x, y]) => {
    circle(x, y, 24, '#64513a');
    circle(x, y, 20, '#151b16');
    circle(x, y, 15, '#101510');
  });

  // Garis bidik (Aiming Line)
  if (!active && captured < 9) {
    ctx.save();
    ctx.setLineDash([5, 7]);
    ctx.strokeStyle = '#53663b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(striker.x, striker.y);
    ctx.lineTo(
      striker.x + Math.cos(angle) * (55 + power),
      striker.y + Math.sin(angle) * (55 + power)
    );
    ctx.stroke();
    ctx.restore();

    // Garis tarikan drag
    if (drag) {
      ctx.strokeStyle = '#617842';
      ctx.beginPath();
      ctx.moveTo(striker.x, striker.y);
      ctx.lineTo(drag.x, drag.y);
      ctx.stroke();
    }
  }

  // Render keping koin dan striker
  for (const p of [...pieces, striker]) {
    if (p.sunk) continue;
    ctx.shadowColor = '#0004';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;
    circle(p.x, p.y, p.r, p.color);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 1;
    circle(
      p.x,
      p.y,
      p.r - 4,
      null,
      p === striker ? '#789542' : p.color === '#343d31' ? '#67715c' : '#b19a72'
    );
  }
}

/**
 * Main Game Loop dengan akumulator 60 FPS
 */
function frame(time) {
  accumulator += Math.min(time - last, 50);
  last = time;
  while (accumulator >= 1000 / 60) {
    update();
    accumulator -= 1000 / 60;
  }
  draw();
  requestAnimationFrame(frame);
}

// Inisialisasi awal
reset();
requestAnimationFrame(frame);
