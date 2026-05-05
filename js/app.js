import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { initRouter } from './router.js';
import { store } from './store.js';
import { db } from './db.js';

const AUTO_BOOKS = [
  { path: '%E3%80%8A%E8%8B%B1%E8%AF%AD%E8%AF%AD%E6%B3%95%E5%A4%A7%E5%85%A8%E3%80%8B.pdf', name: '英语语法大全.pdf' }
];

function waitForPdfjs(timeout = 5000) {
  return new Promise((resolve) => {
    if (typeof pdfjsLib !== 'undefined') return resolve(true);
    const start = Date.now();
    const check = setInterval(() => {
      if (typeof pdfjsLib !== 'undefined' || Date.now() - start > timeout) {
        clearInterval(check);
        resolve(typeof pdfjsLib !== 'undefined');
      }
    }, 100);
  });
}

export let autoImportPromise = null;

async function autoImportBooks() {
  try {
    const existing = await db.getAllBooks();
    const existingNames = new Set(existing.map(b => b.title));

    for (const book of AUTO_BOOKS) {
      if (existingNames.has(book.name.replace(/\.pdf$/i, ''))) continue;

      const pdfReady = await waitForPdfjs();
      if (!pdfReady) {
        console.warn('PDF.js not loaded, skipping auto-import');
        return;
      }

      try {
        const resp = await fetch(book.path);
        if (!resp.ok) {
          console.warn('Auto-import: fetch failed', resp.status, book.path);
          continue;
        }

        const blob = await resp.blob();
        const file = new File([blob], book.name, { type: 'application/pdf' });

        const { parseFile } = await import('./parsers/index.js');
        const parsed = await parseFile(file);
        await db.addBook(parsed);
        console.log('Auto-imported:', parsed.title);
      } catch (e) {
        console.warn('Auto-import failed for', book.name, e);
      }
    }
  } catch (e) {
    console.warn('Auto-import error:', e);
  }
}

function init() {
  const theme = store.get('theme');
  document.documentElement.dataset.theme = theme;

  const navbarEl = document.getElementById('navbar');
  navbarEl.appendChild(Navbar());

  const footerEl = document.getElementById('footer');
  footerEl.appendChild(Footer());

  initRouter();
  autoImportPromise = autoImportBooks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
