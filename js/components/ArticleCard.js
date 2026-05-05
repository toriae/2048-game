import { formatDate } from '../utils.js';

export function ArticleCard(article) {
  const card = document.createElement('article');
  card.className = 'article-card';
  card.innerHTML = `
    <div class="article-card-body">
      <div class="article-card-meta">
        <span class="article-card-date">${formatDate(article.date)}</span>
        <span class="article-card-readtime">${article.readTime} 分钟</span>
      </div>
      <h3 class="article-card-title">${article.title}</h3>
      <p class="article-card-abstract">${article.abstract}</p>
      <div class="article-card-tags">
        <span class="tag">${article.category}</span>
        ${article.tags.slice(0, 2).map(tag => `<span class="badge">${tag}</span>`).join('')}
      </div>
    </div>
  `;
  card.addEventListener('click', () => {
    window.location.hash = `#/writing/${article.id}`;
  });
  return card;
}
