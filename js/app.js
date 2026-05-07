import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { initRouter } from './router.js';
import { store } from './store.js';

function init() {
  const theme = store.get('theme');
  document.documentElement.dataset.theme = theme;

  const navbarEl = document.getElementById('navbar');
  navbarEl.appendChild(Navbar());

  const footerEl = document.getElementById('footer');
  footerEl.appendChild(Footer());

  initRouter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
