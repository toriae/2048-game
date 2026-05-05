import { articles } from '../data/articles.js';
import { debounce } from '../utils.js';

const ITEMS_PER_PAGE = 10;
const categories = ['全部', ...new Set(articles.map(a => a.category))];

export default async function writingPage() {
  const page = document.createElement('div');
  page.className = 'writing-page';

  let currentCategory = '全部';
  let currentSort = 'date';
  let searchQuery = '';
  let currentPage = 1;

  function getFiltered() {
    let list = [...articles];
    if (currentCategory !== '全部') {
      list = list.filter(a => a.category === currentCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.abstract.toLowerCase().includes(q)
      );
    }
    if (currentSort === 'date') {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (currentSort === 'readTime') {
      list.sort((a, b) => b.readTime - a.readTime);
    } else {
      list.sort((a, b) => a.title.localeCompare(b.title, 'zh'));
    }
    return list;
  }

  function render() {
    const filtered = getFiltered();
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = 1;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paged = filtered.slice(start, start + ITEMS_PER_PAGE);

    const listEl = page.querySelector('#writing-list');
    listEl.innerHTML = '';

    if (paged.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><p>暂无文章</p></div>';
    } else {
      paged.forEach(article => {
        const card = document.createElement('a');
        card.className = 'article-card-horizontal';
        card.href = `#/writing/${article.id}`;
        card.innerHTML = `
          <div class="article-card-body">
            <div class="article-card-meta">
              <span>${article.date}</span>
              <span>·</span>
              <span>${article.readTime} min</span>
            </div>
            <h3 class="article-card-title">${article.title}</h3>
            <p class="article-card-abstract">${article.abstract}</p>
            <div class="article-card-tags">
              <span class="tag">${article.category}</span>
            </div>
          </div>
        `;
        listEl.appendChild(card);
      });
    }

    const pagEl = page.querySelector('#pagination');
    pagEl.innerHTML = '';
    if (totalPages > 1) {
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn${i === currentPage ? ' active' : ''}`;
        btn.textContent = i;
        if (i === currentPage) btn.setAttribute('aria-current', 'page');
        btn.addEventListener('click', () => { currentPage = i; render(); });
        pagEl.appendChild(btn);
      }
    }
  }

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-header-title">文章</h1>
      <p class="page-header-desc">学习笔记与技术记录</p>
    </div>
    <div class="writing-filters">
      <div class="filter-tags" role="group" aria-label="文章分类筛选">
        ${categories.map(c => `
          <button class="filter-tag${c === currentCategory ? ' active' : ''}" data-cat="${c}" aria-pressed="${c === currentCategory}">${c}</button>
        `).join('')}
      </div>
      <div class="search-box">
        <input type="text" class="search-input" placeholder="搜索..." aria-label="搜索文章">
      </div>
      <select class="sort-select" aria-label="排序方式">
        <option value="date">最新</option>
        <option value="readTime">时长</option>
        <option value="title">标题</option>
      </select>
    </div>
    <div class="writing-list" id="writing-list"></div>
    <nav class="pagination" id="pagination" aria-label="文章分页"></nav>
  `;

  page.querySelectorAll('.filter-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.cat;
      currentPage = 1;
      page.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  page.querySelector('.search-input').addEventListener('input', debounce((e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    render();
  }, 250));

  page.querySelector('.sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    render();
  });

  render();
  return page;
}
