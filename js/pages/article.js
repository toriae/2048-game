import { articles } from '../data/articles.js';
import { store } from '../store.js';

export default async function articlePage(params) {
  const article = articles.find(a => a.id === params.id);
  if (!article) {
    const el = document.createElement('div');
    el.className = 'empty-state';
    el.style.minHeight = '60vh';
    el.innerHTML = '<p>文章不存在</p>';
    return el;
  }

  const page = document.createElement('div');
  page.className = 'article-page';

  const currentIndex = articles.findIndex(a => a.id === params.id);
  const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  let htmlContent = '';
  if (typeof marked !== 'undefined') {
    htmlContent = marked.parse(article.content);
  } else {
    htmlContent = article.content.replace(/\n/g, '<br>');
  }

  page.innerHTML = `
    <div class="reading-progress" id="reading-progress" role="progressbar" aria-label="阅读进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
    <div class="article-font-controls">
      <button class="btn btn--sm" id="font-decrease" aria-label="减小字体">A-</button>
      <button class="btn btn--sm" id="font-increase" aria-label="增大字体">A+</button>
    </div>
    <header class="article-header">
      <h1 class="article-title">${article.title}</h1>
      <div class="article-meta">
        <span class="article-category">${article.category}</span>
        <span>${article.date}</span>
        <span>·</span>
        <span>${article.readTime} min</span>
      </div>
    </header>
    <div class="article-content" id="article-content">${htmlContent}</div>
    <div class="article-nav">
      ${prev ? `<a class="article-nav-btn" href="#/writing/${prev.id}"><div class="article-nav-label">← 上一篇</div><div class="article-nav-title">${prev.title}</div></a>` : '<div></div>'}
      ${next ? `<a class="article-nav-btn article-nav-btn--next" href="#/writing/${next.id}"><div class="article-nav-label">下一篇 →</div><div class="article-nav-title">${next.title}</div></a>` : '<div></div>'}
    </div>
    <a href="#/writing" class="article-back">← 返回文章列表</a>
  `;

  const contentEl = page.querySelector('#article-content');
  let fontSize = store.get('fontSize');
  contentEl.style.fontSize = fontSize + 'px';

  page.querySelector('#font-decrease').addEventListener('click', () => {
    if (fontSize > 14) { fontSize -= 1; contentEl.style.fontSize = fontSize + 'px'; store.set('fontSize', fontSize); }
  });
  page.querySelector('#font-increase').addEventListener('click', () => {
    if (fontSize < 20) { fontSize += 1; contentEl.style.fontSize = fontSize + 'px'; store.set('fontSize', fontSize); }
  });

  const progressBar = page.querySelector('#reading-progress');
  function updateProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.round(window.scrollY / docHeight * 100) : 0;
    progressBar.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', percent);
  }
  window.addEventListener('scroll', updateProgress);
  updateProgress();

  page._cleanup = () => window.removeEventListener('scroll', updateProgress);

  return page;
}
