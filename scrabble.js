/**
 * Little Arcade — Scrabble (Game 01)
 * Mode Latihan / Solo Practice kata 10x10 dengan kamus offline lokal.
 */

const points = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const bag = 'AAAAAAAABCDEEEEEEEEEFGHIIIIIIJKLMNNOOOOOPRRRRSSSSTTTTTUUUVWY';

let rack = [];
let cells = Array(100).fill(null);
let pending = new Map();
let selected = null;
let total = 0;
let wordCount = 0;
let busy = false;
let best = readBest('little-scrabble-best');

if ($('best')) $('best').textContent = best;

/**
 * Mengisi rak huruf hingga mencapai 7 huruf
 */
function refill() {
  while (rack.length < 7) {
    const randomChar = bag[Math.floor(Math.random() * bag.length)];
    rack.push(randomChar);
  }
}

/**
 * Render ulang seluruh tampilan papan, rak, dan kontrol
 */
function render() {
  if ($('rackCount')) $('rackCount').textContent = rack.length;
  if ($('visibleScore')) $('visibleScore').textContent = `Total: ${total} poin`;
  if ($('check')) $('check').textContent = busy ? 'Memeriksa kamus…' : 'Cek kata →';

  // Render Papan (10x10)
  const boardEl = $('board');
  if (boardEl) {
    boardEl.innerHTML = '';
    cells.forEach((letter, i) => {
      const tile = pending.get(i) || letter;
      const b = document.createElement('button');
      b.className = 'cell' + (tile ? ' filled' : '') + (pending.has(i) ? ' pending' : '');
      b.innerHTML = tile ? `${tile}<small>${points[tile]}</small>` : (i === 44 ? '✦' : '');
      b.setAttribute('aria-label', `Baris ${Math.floor(i / 10) + 1}, kolom ${(i % 10) + 1}${tile ? ', ' + tile : ''}`);
      b.disabled = busy;

      b.onclick = () => place(i);
      b.ondragover = (e) => e.preventDefault();
      b.ondrop = (e) => {
        e.preventDefault();
        const value = e.dataTransfer.getData('text/plain');
        if (value !== '' && /^\d+$/.test(value)) {
          selected = Number(value);
          place(i);
        }
      };

      boardEl.append(b);
    });
  }

  // Render Rak Huruf
  const rackEl = $('rack');
  if (rackEl) {
    rackEl.innerHTML = '';
    rack.forEach((letter, i) => {
      const b = document.createElement('button');
      b.className = 'tile' + (selected === i ? ' selected' : '');
      b.innerHTML = `${letter}<small>${points[letter]}</small>`;
      b.setAttribute('aria-label', `${letter}, ${points[letter]} poin`);
      b.setAttribute('aria-pressed', selected === i);
      b.disabled = busy;
      b.draggable = !busy;

      b.onclick = () => {
        selected = selected === i ? null : i;
        render();
      };

      b.ondragstart = (e) => {
        selected = i;
        e.dataTransfer.setData('text/plain', String(i));
      };

      rackEl.append(b);
    });
  }

  // Update status tombol
  ['check', 'shuffle', 'undo', 'new', 'restart'].forEach((id) => {
    const el = $(id);
    if (el) el.disabled = busy;
  });

  if ($('score')) $('score').textContent = total;
  if ($('words')) $('words').textContent = wordCount;
  if ($('best')) $('best').textContent = best;
}

/**
 * Meletakkan huruf dari rak ke petak papan, atau mengembalikan huruf pending ke rak
 */
function place(i) {
  if (busy) return;
  if (pending.has(i)) {
    rack.push(pending.get(i));
    pending.delete(i);
    selected = null;
  } else if (!cells[i] && selected !== null && rack[selected]) {
    pending.set(i, rack.splice(selected, 1)[0]);
    selected = null;
  }
  render();
}

/**
 * Kembalikan semua huruf pending ke rak
 */
function undo() {
  for (const letter of pending.values()) {
    rack.push(letter);
  }
  pending.clear();
  selected = null;
}

$('undo').onclick = () => {
  undo();
  render();
  say('Huruf dikembalikan ke rak.');
};

$('shuffle').onclick = () => {
  for (let i = rack.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rack[i], rack[j]] = [rack[j], rack[i]];
  }
  selected = null;
  render();
};

$('new').onclick = () => {
  undo();
  rack = [];
  refill();
  render();
  say('Huruf baru, kemungkinan baru.');
};

$('restart').onclick = () => {
  cells = Array(100).fill(null);
  pending.clear();
  rack = [];
  selected = null;
  total = 0;
  wordCount = 0;
  $('wordHistory').replaceChildren();
  $('wordEmpty').hidden = false;
  result('Susun kata, lalu tekan Cek kata.');
  refill();
  render();
  say('Papan baru siap dimainkan. Rekormu tetap tersimpan.');
};

function result(message, state = '') {
  const el = $('wordResult');
  if (el) {
    el.className = 'word-result ' + state;
    if (el.firstElementChild) el.firstElementChild.textContent = message;
  }
}

/**
 * Validasi dan perhitungan kata baru yang diletakkan
 */
$('check').onclick = async () => {
  if (busy) return;
  const positions = [...pending.keys()].sort((a, b) => a - b);

  if (positions.length < 2) {
    say('Letakkan minimal 2 huruf baru untuk membentuk kata.');
    result('Letakkan minimal 2 huruf baru.', 'error');
    return;
  }

  const row = Math.floor(positions[0] / 10);
  const col = positions[0] % 10;
  const horizontal = positions.every((i) => Math.floor(i / 10) === row);
  const vertical = positions.every((i) => i % 10 === col);

  if (!horizontal && !vertical) {
    say('Susun huruf dalam satu baris atau satu kolom.');
    result('Susun kata dalam satu baris atau kolom.', 'error');
    return;
  }

  const step = horizontal ? 1 : 10;
  if (positions.some((v, i) => i && v - positions[i - 1] !== step)) {
    say('Kata tidak boleh memiliki celah. Susun huruf baru berdampingan.');
    result('Masih ada celah di antara huruf.', 'error');
    return;
  }

  const word = positions.map((i) => pending.get(i)).join('');
  busy = true;
  render();
  say(`Memeriksa “${word}” di kamus…`);
  result(`Memeriksa “${word}” di daftar kata Inggris lokal…`);

  try {
    if (!(window.ENGLISH_WORDS instanceof Set) || window.ENGLISH_WORDS.size < 1000) {
      throw new Error('Missing local dictionary');
    }

    if (!window.ENGLISH_WORDS.has(word.toLowerCase())) {
      say(`“${word}” tidak ada di daftar kata Inggris lokal.`);
      result(`“${word}” tidak ditemukan. Skor tidak berubah.`, 'error');
      return;
    }

    const gained = [...pending.values()].reduce((n, l) => n + points[l], 0);
    const added = 7 - rack.length;

    for (const [i, l] of pending) {
      cells[i] = l;
    }
    pending.clear();
    total += gained;
    wordCount++;
    best = Math.max(best, total);
    saveBest('little-scrabble-best', best);
    refill();

    result(`${word} benar! +${gained} poin · ${added} huruf baru ditambahkan.`, 'success');

    const item = document.createElement('li');
    const detail = document.createElement('div');
    const label = document.createElement('b');
    const meaning = document.createElement('p');
    const score = document.createElement('strong');

    label.textContent = word;
    meaning.textContent = 'Terdaftar dalam daftar kata Inggris lokal.';
    score.textContent = `+${gained}`;

    detail.append(label, meaning);
    item.append(detail, score);
    $('wordHistory').prepend(item);
    $('wordEmpty').hidden = true;

    void loadDefinition(word, meaning);
    say(`“${word}” ada di daftar kata Inggris lokal. +${gained} poin; rak kembali berisi 7 huruf.`);
  } catch {
    say('File kamus lokal belum termuat. Refresh halaman dan pastikan folder data tersedia.');
    result('Kamus lokal belum termuat; skor dan huruf tetap aman.', 'error');
  } finally {
    busy = false;
    render();
  }
};

// Pengambilan definisi kata online secara non-blocking
async function loadDefinition(word, element) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`, {
      signal: controller.signal
    });
    if (!response.ok) return;
    const data = await response.json();
    const entry = Array.isArray(data) && data.find((e) => typeof e.word === 'string' && e.word.toLowerCase() === word.toLowerCase());
    const definition = entry?.meanings?.flatMap((m) => m.definitions || []).find((d) => typeof d.definition === 'string')?.definition;
    if (definition && element.isConnected) {
      element.textContent = definition;
      element.lang = 'en';
    }
  } catch {
    // Abaikan jika offline / gagal — pesan lokal tetap tampil
  } finally {
    clearTimeout(timer);
  }
}

// Inisialisasi awal
refill();
render();
