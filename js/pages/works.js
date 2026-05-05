import { works } from '../data/works.js';
import { isSafeURL, escapeHTML } from '../utils.js';

export default async function worksPage() {
  const page = document.createElement('div');
  page.className = 'works-page';

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-header-title">项目</h1>
      <p class="page-header-desc">个人项目与实践</p>
    </div>
    <div class="works-grid" id="works-grid"></div>
  `;

  const grid = page.querySelector('#works-grid');

  if (works.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>暂无项目</p></div>';
  } else {
    works.forEach(work => {
      const safeLink = isSafeURL(work.link) ? work.link : '#';
      const card = document.createElement('div');
      card.className = 'work-card';
      card.innerHTML = `
        <h3 class="work-name">${escapeHTML(work.name)}</h3>
        <p class="work-desc">${escapeHTML(work.description)}</p>
        <div class="work-tags">
          ${work.tags.map(t => `<span class="badge">${escapeHTML(t)}</span>`).join('')}
        </div>
        <a class="work-link" href="${safeLink}" target="_blank" rel="noopener noreferrer">查看 →</a>
      `;
      grid.appendChild(card);
    });
  }

  return page;
}
