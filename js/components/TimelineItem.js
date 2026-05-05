export function TimelineItem(item) {
  const el = document.createElement('div');
  el.className = 'timeline-item';
  el.innerHTML = `
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <div class="timeline-date">${item.year}</div>
      <div class="timeline-event">${item.event}</div>
      <div class="timeline-desc-text">${item.description}</div>
    </div>
  `;
  return el;
}
