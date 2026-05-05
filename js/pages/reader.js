import { db } from '../db.js';
import { store } from '../store.js';
import { throttle, escapeHTML } from '../utils.js';

export default async function readerPage(params) {
  const book = await db.getBook(params.bookId);
  if (!book) {
    const el = document.createElement('div');
    el.className = 'empty-state';
    el.style.minHeight = '100vh';
    el.innerHTML = '<p>书籍不存在</p>';
    return el;
  }

  let currentChapter = book.lastReadChapter || 0;
  let readerSettings = store.get('readerSettings');

  const container = document.createElement('div');
  container.className = 'reader-container';
  container.dataset.theme = readerSettings.theme || 'dark';

  container.innerHTML = `
    <header class="reader-header" id="reader-header">
      <button class="btn-back" id="btn-back">← 返回</button>
      <span class="book-title">${escapeHTML(book.title)}</span>
      <span class="chapter-title" id="chapter-title"></span>
      <div class="header-actions">
        <button id="btn-toc">目录</button>
        <button id="btn-settings">设置</button>
      </div>
    </header>
    <div class="toc-overlay" id="toc-overlay"></div>
    <aside class="reader-toc" id="reader-toc">
      <div class="toc-header">目录</div>
      <ul class="toc-list" id="toc-list"></ul>
    </aside>
    <main class="reader-content" id="reader-content">
      <article class="chapter-content">
        <h2 class="chapter-title-display" id="chapter-display"></h2>
        <div class="chapter-body" id="chapter-body"></div>
      </article>
      <nav class="chapter-nav">
        <button id="btn-prev">← 上一章</button>
        <button id="btn-next">下一章 →</button>
      </nav>
    </main>
    <footer class="reader-footer">
      <div class="progress-track" id="progress-track">
        <div class="progress-bar" id="progress-bar"></div>
      </div>
      <span class="progress-text" id="progress-text"></span>
    </footer>
    <aside class="reader-settings" id="reader-settings">
      <h3>设置</h3>
      <div class="setting-group">
        <label>主题</label>
        <div class="theme-options">
          <button data-theme="dark" class="${readerSettings.theme === 'dark' ? 'active' : ''}">深色</button>
          <button data-theme="light" class="${readerSettings.theme === 'light' ? 'active' : ''}">浅色</button>
          <button data-theme="sepia" class="${readerSettings.theme === 'sepia' ? 'active' : ''}">羊皮纸</button>
        </div>
      </div>
      <div class="setting-group">
        <label>字号 <span class="font-size-value">${readerSettings.fontSize}px</span></label>
        <input type="range" min="14" max="24" step="2" value="${readerSettings.fontSize}" id="font-size-range">
      </div>
      <div class="setting-group">
        <label>行高 <span class="line-height-value">${readerSettings.lineHeight}</span></label>
        <input type="range" min="1.6" max="2.4" step="0.2" value="${readerSettings.lineHeight}" id="line-height-range">
      </div>
    </aside>
  `;

  const readerContent = container.querySelector('#reader-content');
  const chapterDisplay = container.querySelector('#chapter-display');
  const chapterBody = container.querySelector('#chapter-body');
  const chapterTitle = container.querySelector('#chapter-title');
  const tocList = container.querySelector('#toc-list');
  const readerToc = container.querySelector('#reader-toc');
  const tocOverlay = container.querySelector('#toc-overlay');
  const readerSettingsEl = container.querySelector('#reader-settings');
  const progressBar = container.querySelector('#progress-bar');
  const progressText = container.querySelector('#progress-text');

  book.chapters.forEach((ch, i) => {
    const li = document.createElement('li');
    li.textContent = ch.title;
    li.dataset.index = i;
    if (i === currentChapter) li.classList.add('active');
    li.addEventListener('click', () => { goToChapter(i); closeToc(); });
    tocList.appendChild(li);
  });

  function renderChapter() {
    const ch = book.chapters[currentChapter];
    if (!ch) return;
    chapterDisplay.textContent = ch.title;
    chapterTitle.textContent = ch.title;
    const paragraphs = ch.content.split(/\n+/).filter(p => p.trim());
    chapterBody.innerHTML = paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
    tocList.querySelectorAll('li').forEach((li, i) => li.classList.toggle('active', i === currentChapter));
    const progress = Math.round(((currentChapter + 1) / book.totalChapters) * 100);
    progressBar.style.width = progress + '%';
    progressText.textContent = `${progress}% · 第${currentChapter + 1}/${book.totalChapters}章`;
    readerContent.scrollTop = 0;
    db.updateProgress(book.id, {
      lastReadChapter: currentChapter,
      lastReadAt: new Date().toISOString(),
      progress: (currentChapter + 1) / book.totalChapters
    });
  }

  function goToChapter(index) {
    if (index >= 0 && index < book.chapters.length) { currentChapter = index; renderChapter(); }
  }

  function closeToc() {
    readerToc.classList.remove('open');
    tocOverlay.classList.remove('open');
  }

  container.querySelector('#btn-back').addEventListener('click', () => { window.location.hash = '#/library'; });
  container.querySelector('#btn-toc').addEventListener('click', () => { readerToc.classList.add('open'); tocOverlay.classList.add('open'); });
  tocOverlay.addEventListener('click', closeToc);
  container.querySelector('#btn-settings').addEventListener('click', () => readerSettingsEl.classList.toggle('open'));
  container.querySelector('#btn-prev').addEventListener('click', () => goToChapter(currentChapter - 1));
  container.querySelector('#btn-next').addEventListener('click', () => goToChapter(currentChapter + 1));

  container.querySelectorAll('.theme-options button').forEach(btn => {
    btn.addEventListener('click', () => {
      container.dataset.theme = btn.dataset.theme;
      container.querySelector('.theme-options button.active')?.classList.remove('active');
      btn.classList.add('active');
      readerSettings.theme = btn.dataset.theme;
      store.set('readerSettings', readerSettings);
    });
  });

  container.querySelector('#font-size-range').addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    container.querySelector('.font-size-value').textContent = size + 'px';
    readerSettings.fontSize = size;
    store.set('readerSettings', readerSettings);
    chapterBody.style.fontSize = size + 'px';
  });

  container.querySelector('#line-height-range').addEventListener('input', (e) => {
    const lh = parseFloat(e.target.value);
    container.querySelector('.line-height-value').textContent = lh;
    readerSettings.lineHeight = lh;
    store.set('readerSettings', readerSettings);
    chapterBody.style.lineHeight = lh;
  });

  container.querySelector('#progress-track').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    goToChapter(Math.max(0, Math.min(Math.floor(percent * book.totalChapters), book.chapters.length - 1)));
  });

  const onScrollProgress = throttle(() => {
    const scrollHeight = readerContent.scrollHeight - readerContent.clientHeight;
    if (scrollHeight > 0) {
      const chapterProgress = readerContent.scrollTop / scrollHeight;
      const overall = ((currentChapter + chapterProgress) / book.totalChapters) * 100;
      progressBar.style.width = overall + '%';
    }
  }, 500);

  let lastScroll = 0;
  const onScrollHeader = () => {
    const header = container.querySelector('#reader-header');
    const current = readerContent.scrollTop;
    header.classList.toggle('hidden', current > lastScroll && current > 80);
    lastScroll = current;
  };

  readerContent.addEventListener('scroll', onScrollProgress);
  readerContent.addEventListener('scroll', onScrollHeader);

  function handleKeydown(e) {
    if (e.key === 'ArrowLeft') goToChapter(currentChapter - 1);
    else if (e.key === 'ArrowRight') goToChapter(currentChapter + 1);
    else if (e.key === ' ') { e.preventDefault(); readerContent.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' }); }
    else if (e.key === 'Escape') window.location.hash = '#/library';
  }

  document.addEventListener('keydown', handleKeydown);
  chapterBody.style.fontSize = readerSettings.fontSize + 'px';
  chapterBody.style.lineHeight = readerSettings.lineHeight;
  renderChapter();

  container._cleanup = () => {
    document.removeEventListener('keydown', handleKeydown);
    readerContent.removeEventListener('scroll', onScrollProgress);
    readerContent.removeEventListener('scroll', onScrollHeader);
  };
  return container;
}
