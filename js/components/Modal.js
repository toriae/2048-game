import { escapeHTML } from '../utils.js';

export function Modal({ title, message, onConfirm, onCancel }) {
  const root = document.getElementById('modal-root');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'modal-title');
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 id="modal-title">${escapeHTML(title)}</h3>
        <button class="btn-icon modal-close" aria-label="关闭"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <p>${escapeHTML(message)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn--ghost modal-cancel">取消</button>
        <button class="btn btn--primary modal-confirm">确认</button>
      </div>
    </div>
  `;

  function close() {
    overlay.classList.remove('open');
    document.removeEventListener('keydown', handleKeydown);
    if (previousFocus) previousFocus.focus();
    setTimeout(() => overlay.remove(), 200);
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') { close(); if (onCancel) onCancel(); return; }
    if (e.key === 'Tab') {
      const focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  const previousFocus = document.activeElement;

  overlay.querySelector('.modal-close').addEventListener('click', () => {
    close();
    if (onCancel) onCancel();
  });

  overlay.querySelector('.modal-cancel').addEventListener('click', () => {
    close();
    if (onCancel) onCancel();
  });

  overlay.querySelector('.modal-confirm').addEventListener('click', () => {
    close();
    if (onConfirm) onConfirm();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
      if (onCancel) onCancel();
    }
  });

  root.appendChild(overlay);
  document.addEventListener('keydown', handleKeydown);
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    overlay.querySelector('.modal-confirm')?.focus();
  });
}
