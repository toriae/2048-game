import { getBookColor, formatWordCount, escapeHTML } from '../utils.js';
import { db } from '../db.js';

export function BookCard(book, onRefresh) {
  const card = document.createElement('div');
  card.className = 'book-card';

  const bgColor = getBookColor(book.title);
  const firstChar = book.title.charAt(0);
  const progress = Math.round((book.progress || 0) * 100);

  card.innerHTML = `
    <div class="book-cover" style="background:${bgColor}">
      <span class="book-cover-text">${escapeHTML(firstChar)}</span>
    </div>
    <div class="book-info">
      <div class="book-title" title="${escapeHTML(book.title)}">${escapeHTML(book.title)}</div>
      <div class="book-author">${escapeHTML(book.author || '未知')}</div>
      <div class="book-meta">
        <span class="badge">${escapeHTML(book.format)}</span>
        <span class="badge">${formatWordCount(book.totalWords)}字</span>
      </div>
      <div class="book-progress">
        <div class="book-progress-bar" style="width:${progress}%"></div>
      </div>
    </div>
    <div class="book-actions">
      <button class="btn btn--primary btn-read">阅读</button>
      <button class="btn btn--sm btn-delete" title="删除"><i class="fas fa-trash"></i></button>
    </div>
  `;

  card.querySelector('.btn-read').addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.hash = `#/library/read/${book.id}`;
  });

  card.querySelector('.btn-delete').addEventListener('click', async (e) => {
    e.stopPropagation();
    if (confirm(`删除「${book.title}」？`)) {
      await db.deleteBook(book.id);
      if (onRefresh) onRefresh();
    }
  });

  return card;
}
