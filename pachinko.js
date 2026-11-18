/**
 * Little Arcade — Pachinko (Game 03)
 * Simulasi bola jatuh beruntun dengan pasak defleksi, slot poin, dan efek suara sintetis Web Audio API.
 */

const canvas = $('game');
const ctx = canvas.getContext('2d');
const values = [10, 25, 50, 25, 10];

let pegs = [];
let balls = [];
let queue = 0;
let nextSpawn = 0;
let total = 0;
let count = 0;
let best = readBest('little-pachinko-best');
let sound = false;
let audio = null;
let highlights = Array(5).fill(0);
let last = 0;
let accumulator = 0;

if ($('best')) $('best').textContent = best;

/**
 * Membangun susunan pasak berdasarkan tingkat kesulitan / level
 */
function board() {
  pegs = [];
  const levelValue = Number($('level').value) || 1;
  const rows = 5 + levelValue;

  for (let r = 0; r < rows; r++) {
    const cols = r % 2 ? 8 : 7;
    const startX = r % 2 ? 48 : 74;
    for (let col = 0; col < cols; col++) {
      pegs.push({
        x: startX + col * 52,
        y: 100 + r * (290 / (rows - 1))
      });
    }
  }

  const names = ['SANTAI', 'RAMAI', 'PENUH KEJUTAN'];
  if ($('boardLevel')) {
    $('boardLevel').textContent = `LEVEL 0${levelValue} / ${names[levelValue - 1]}`;
  }
}

/**
 * Menghasilkan nada audio sintetis (Web Audio API)
 */
function tone(freq) {
  if (!sound || !audio) return;
  try {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.connect(g);
    g.connect(audio.destination);

    o.frequency.value = freq;
    g.gain.setValueAtTime(0.035, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12);

    o.start();
    o.stop(audio.currentTime + 0.12);
  } catch {}
}

// Toggle Suara
$('sound').onclick = async () => {
  sound = !sound;
  if (sound) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      await audio.resume();
    } catch {
      sound = false;
    }
  }
  $('sound').textContent = `Suara: ${sound ? 'aktif' : 'mati'}`;
  $('sound').setAttribute('aria-pressed', sound);
};

/**
 * Mengunci / membuka interaksi tombol saat bola sedang aktif meluncur
 */
function lock(value) {
  $('drop').disabled = value;
  $('level').disabled = value;
  $('reset').disabled = value;
  $('drop').textContent = value ? 'Bola sedang turun…' : 'Jatuhkan 3 bola ↓';
}

// Mulai putaran drop
$('drop').onclick = () => {
  if (queue || balls.length) return;
  queue = 3;
  nextSpawn = 0;
  lock(true);
  say('Bola sedang menuju slot. Semoga mendarat di 50!');
};

$('level').onchange = () => {
  board();
  say('Rintangan diperbarui. Siap untuk putaran berikutnya?');
};

$('reset').onclick = () => {
  if (queue || balls.length) return;
  total = 0;
  count = 0;
  $('score').textContent = 0;
  $('drops').textContent = 0;
  $('history').innerHTML = '';
  $('empty').hidden = false;
  highlights.fill(0);
  say('Sesi direset. Rekor tetap tersimpan.');
};

/**
 * Tangani bola yang mendarat di salah satu slot bawah
 */
function finish(ball) {
  const slot = Math.min(4, Math.max(0, Math.floor((ball.x - 20) / 84)));
  const score = values[slot];

  total += score;
  count++;
  best = Math.max(best, total);
  saveBest('little-pachinko-best', best);

  $('score').textContent = total;
  $('drops').textContent = count;
  $('best').textContent = best;
  $('empty').hidden = true;

  const li = document.createElement('li');
  li.innerHTML = `<span><span style="color:var(--accent)">●</span> &nbsp; Bola ${String(count).padStart(2, '0')}</span><strong>+${score} poin</strong>`;
  $('history').prepend(li);

  while ($('history').children.length > 30) {
    $('history').lastChild.remove();
  }

  highlights[slot] = 45;
  tone(350 + score * 9);
}

/**
 * Update simulasi fisika bola & deteksi tumbukan pasak
 */
function update() {
  // Spawn antrean bola
  if (queue) {
    if (nextSpawn <= 0) {
      balls.push({
        x: 215 + Math.random() * 30,
        y: 35,
        vx: (Math.random() - 0.5) * 2,
        vy: 0
      });
      queue--;
      nextSpawn = 25;
    } else {
      nextSpawn--;
    }
  }

  // Update posisi dan tabrakan tiap bola
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.vy = Math.min(b.vy + 0.15, 5); // Gravitasi dengan terminal velocity
    b.x += b.vx;
    b.y += b.vy;

    // Pantulan dinding kiri-kanan
    if (b.x < 29 || b.x > 431) {
      b.x = Math.max(29, Math.min(431, b.x));
      b.vx *= -0.8;
    }

    // Tabrakan dengan pasak (Peg collision)
    for (const p of pegs) {
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const d = Math.hypot(dx, dy);

      if (d < 12) {
        const nx = d ? dx / d : 0;
        const ny = d ? dy / d : -1;
        b.x = p.x + nx * 12;
        b.y = p.y + ny * 12;

        const v = b.vx * nx + b.vy * ny;
        if (v < 0) {
          b.vx -= 1.65 * v * nx;
          b.vy -= 1.65 * v * ny;
          b.vx += (Math.random() - 0.5) * 1.4; // Defleksi acak kecil
          tone(700);
        }
      }
    }

    b.vx = Math.max(-4, Math.min(4, b.vx));

    // Bola mencapai slot bawah
    if (b.y > 439) {
      finish(b);
      balls.splice(i, 1);
    }
  }

  // Fade out highlight slot
  highlights = highlights.map((v) => Math.max(0, v - 1));

  // Selesai seluruh bola dalam putaran
  if (!queue && !balls.length && $('drop').disabled) {
    lock(false);
    say(`Putaran selesai! Total ${total} poin dari ${count} bola.`);
  }
}

/**
 * Gambar seluruh elemen papan Pachinko
 */
function draw() {
  ctx.clearRect(0, 0, 460, 490);

  // Garis vertikal latar belakang
  ctx.strokeStyle = '#233528';
  ctx.lineWidth = 1;
  for (let x = 20; x < 460; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 430);
    ctx.stroke();
  }

  // Label Drop Zone
  ctx.fillStyle = '#a7b99a';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DROP ZONE', 230, 25);

  // Panah penunjuk drop
  ctx.fillStyle = '#d1f478';
  ctx.beginPath();
  ctx.moveTo(224, 39);
  ctx.lineTo(236, 39);
  ctx.lineTo(230, 46);
  ctx.fill();

  // Render pasak (Pegs)
  for (const p of pegs) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#92a184';
    ctx.fill();

    // Titik kilau pasak
    ctx.beginPath();
    ctx.arc(p.x - 1, p.y - 1, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#d9e5cc';
    ctx.fill();
  }

  // Slot Skor di bawah
  values.forEach((v, i) => {
    ctx.fillStyle = highlights[i]
      ? '#d1f478'
      : i === 2
      ? '#526239'
      : i % 2
      ? '#303f2a'
      : '#243427';
    ctx.beginPath();
    ctx.roundRect(23 + i * 84, 435, 78, 42, 7);
    ctx.fill();

    ctx.fillStyle = highlights[i]
      ? '#182013'
      : i === 2
      ? '#e5f5b9'
      : '#b3c5a6';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText(v, 62 + i * 84, 462);
  });

  // Render bola dengan efek glowing
  for (const b of balls) {
    ctx.shadowColor = '#e5ef9e';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#e8f5b4';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/**
 * Main Loop Pachinko
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
board();
requestAnimationFrame(frame);
