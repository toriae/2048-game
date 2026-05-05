export function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 200) {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= limit) {
      lastTime = now;
      fn(...args);
    }
  };
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getBookColor(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#1f6feb', '#238636', '#8957e5', '#d29922', '#f85149', '#3fb950'];
  return colors[Math.abs(hash) % colors.length];
}

export function formatWordCount(text) {
  if (!text) return '0';
  const count = text.replace(/\s/g, '').length;
  if (count > 10000) return (count / 10000).toFixed(1) + '万';
  return count.toString();
}

export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

export function isSafeURL(url) {
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function createBook({ title, author = '未知作者', format, chapters, totalWords }) {
  return {
    id: generateId(),
    title,
    author,
    format,
    cover: null,
    totalChapters: chapters.length,
    totalWords,
    addedAt: new Date().toISOString().slice(0, 10),
    lastReadAt: new Date().toISOString().slice(0, 10),
    lastReadChapter: 0,
    lastReadScroll: 0,
    progress: 0,
    chapters
  };
}

export function detectEncoding(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return 'utf-8';
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) return 'utf-16le';
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) return 'utf-16be';
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes.slice(0, 1024));
    return 'utf-8';
  } catch {
    return 'gbk';
  }
}
