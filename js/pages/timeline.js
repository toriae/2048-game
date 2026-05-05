import { timeline } from '../data/timeline.js';

export default async function timelinePage() {
  const page = document.createElement('div');
  page.className = 'timeline-page';

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-header-title">时间线</h1>
      <p class="page-header-desc">成长与学习的轨迹</p>
    </div>
    <div class="timeline" id="timeline"></div>
  `;

  const timelineEl = page.querySelector('#timeline');

  if (timeline.length === 0) {
    timelineEl.innerHTML = '<div class="empty-state"><p>暂无记录</p></div>';
  } else {
    timeline.forEach(item => {
      const el = document.createElement('div');
      el.className = 'timeline-item';
      el.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-date">${item.year}</div>
        <div class="timeline-event">${item.event}</div>
        <div class="timeline-desc-text">${item.description}</div>
      `;
      timelineEl.appendChild(el);
    });
  }

  return page;
}
