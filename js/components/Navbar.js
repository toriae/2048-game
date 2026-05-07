import { store } from '../store.js';

const navLinks = [
  { label: '文章', route: '/writing' },
  { label: '项目', route: '/works' },
  { label: '时间线', route: '/timeline' },
  { label: '关于', route: '/about' }
];

export function Navbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="navbar-inner">
      <a class="navbar-brand" href="#/">hoto<span>.dev</span></a>
      <div class="navbar-links">
        ${navLinks.map(link => `
          <a class="nav-link" href="#${link.route}" data-route="${link.route}">${link.label}</a>
        `).join('')}
      </div>
      <div class="navbar-actions">
        <button class="theme-toggle" aria-label="切换主题">
          <i class="fas fa-circle-half-stroke"></i>
        </button>
        <button class="hamburger" aria-label="打开菜单" aria-expanded="false">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
    <div class="mobile-menu" role="navigation" aria-label="移动端导航" aria-hidden="true">
      <div class="mobile-menu-links">
        <a class="mobile-nav-link" href="#/" data-route="/">首页</a>
        ${navLinks.map(link => `
          <a class="mobile-nav-link" href="#${link.route}" data-route="${link.route}">${link.label}</a>
        `).join('')}
      </div>
    </div>
  `;

  // Theme toggle
  const themeToggle = nav.querySelector('.theme-toggle');
  const themeIcon = themeToggle.querySelector('i');

  function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-circle-half-stroke';
  }

  updateThemeIcon(store.get('theme'));
  store.subscribe('theme', updateThemeIcon);

  themeToggle.addEventListener('click', () => {
    const current = store.get('theme');
    const next = current === 'light' ? 'dark' : 'light';
    store.set('theme', next);
    document.documentElement.dataset.theme = next;
  });

  // Mobile menu
  const hamburger = nav.querySelector('.hamburger');
  const mobileMenu = nav.querySelector('.mobile-menu');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? '关闭菜单' : '打开菜单');
    mobileMenu.setAttribute('aria-hidden', !isOpen);
  });

  nav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', '打开菜单');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', '打开菜单');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.focus();
    }
  });

  return nav;
}
