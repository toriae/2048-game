import { formatDate, escapeHTML } from '../utils.js';

const STORAGE_KEY = 'guestbook_messages';
const moods = [
  { value: 'calm', label: '平静' },
  { value: 'think', label: '思考' },
  { value: 'happy', label: '开心' },
  { value: 'tired', label: '累了' }
];

function getMessages() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveMessages(msgs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

export default async function guestbookPage() {
  const page = document.createElement('div');
  page.className = 'guestbook-page';
  let selectedMood = 'calm';

  function render() {
    const messages = getMessages();
    const listEl = page.querySelector('#guestbook-list');
    listEl.innerHTML = '';

    if (messages.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><p>暂无留言</p></div>';
      return;
    }

    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(msg => {
      const mood = moods.find(m => m.value === msg.mood) || moods[0];
      const el = document.createElement('div');
      el.className = 'guestbook-message';
      el.innerHTML = `
        <div class="message-header">
          <span class="message-author">${escapeHTML(msg.nickname)}</span>
          <span class="message-date">${formatDate(msg.createdAt)}</span>
          <span class="message-mood">${escapeHTML(mood.label)}</span>
        </div>
        <div class="message-body">${escapeHTML(msg.content)}</div>
      `;
      listEl.appendChild(el);
    });
  }

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-header-title">留言</h1>
      <p class="page-header-desc">留下你的足迹</p>
    </div>
    <form class="guestbook-form" id="guestbook-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">昵称 *</label>
          <input type="text" class="form-input" id="gb-nickname" placeholder="你的名字" required>
        </div>
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input type="email" class="form-input" id="gb-email" placeholder="选填">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">内容 *</label>
        <textarea class="form-textarea" id="gb-content" placeholder="想说些什么..." required></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">心情</label>
        <div class="mood-options">
          ${moods.map(m => `
            <label class="mood-option${m.value === selectedMood ? ' active' : ''}" data-mood="${m.value}">
              <input type="radio" name="mood" value="${m.value}" ${m.value === selectedMood ? 'checked' : ''}>
              ${m.label}
            </label>
          `).join('')}
        </div>
      </div>
      <button type="submit" class="btn btn--primary">提交</button>
    </form>
    <div class="guestbook-list" id="guestbook-list"></div>
  `;

  page.querySelectorAll('.mood-option').forEach(el => {
    el.addEventListener('click', () => {
      selectedMood = el.dataset.mood;
      page.querySelectorAll('.mood-option').forEach(m => m.classList.remove('active'));
      el.classList.add('active');
    });
  });

  page.querySelector('#guestbook-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nickname = page.querySelector('#gb-nickname').value.trim();
    const content = page.querySelector('#gb-content').value.trim();
    if (!nickname || !content) return;

    const messages = getMessages();
    messages.push({
      id: Date.now().toString(36),
      nickname, content, mood: selectedMood,
      createdAt: new Date().toISOString()
    });
    saveMessages(messages);

    page.querySelector('#gb-nickname').value = '';
    page.querySelector('#gb-content').value = '';
    render();
  });

  render();
  return page;
}
