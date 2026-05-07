const routes = {
  '/': { page: 'home', title: '首页' },
  '/writing': { page: 'writing', title: '文章' },
  '/writing/:id': { page: 'article', title: '文章详情' },
  '/works': { page: 'works', title: '作品' },
  '/timeline': { page: 'timeline', title: '年表' },
  '/about': { page: 'about', title: '关于' }
};

const pageModules = {
  home: () => import('./pages/home.js'),
  writing: () => import('./pages/writing.js'),
  article: () => import('./pages/article.js'),
  works: () => import('./pages/works.js'),
  timeline: () => import('./pages/timeline.js'),
  about: () => import('./pages/about.js')
};

let currentRoute = null;
let isTransitioning = false;

function matchRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';

  for (const [pattern, config] of Object.entries(routes)) {
    const paramNames = [];
    const regexStr = pattern.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const match = path.match(new RegExp(`^${regexStr}$`));
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
      return { config, params };
    }
  }
  return null;
}

function getContainer() {
  return document.getElementById('page-container');
}

function getNavbar() {
  return document.getElementById('navbar');
}

function getFooter() {
  return document.getElementById('footer');
}

async function renderPage(hash) {
  if (isTransitioning) return;

  const result = matchRoute(hash);
  if (!result) {
    window.location.hash = '#/';
    return;
  }

  const { config, params } = result;
  const container = getContainer();
  const navbar = getNavbar();
  const footer = getFooter();

  if (config.fullScreen) {
    navbar.style.display = 'none';
    footer.style.display = 'none';
  } else {
    navbar.style.display = '';
    footer.style.display = '';
  }

  isTransitioning = true;

  // Exit current page
  container.classList.add('page-exit');
  container.classList.remove('page-active');

  await new Promise(r => setTimeout(r, 150));
  window.scrollTo(0, 0);

  try {
    // Cleanup previous page listeners
    if (typeof container._cleanup === 'function') container._cleanup();

    const module = await pageModules[config.page]();
    container.innerHTML = '';
    const pageEl = await module.default(params);
    container.appendChild(pageEl);

    document.title = `${config.title} | hoto.dev`;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('data-route');
      const currentPath = (hash || '#/').replace(/^#/, '');
      link.classList.toggle('active', currentPath === href || (href !== '/' && currentPath.startsWith(href)));
    });

    // Enter new page
    container.classList.remove('page-exit');
    container.classList.add('page-enter');
    requestAnimationFrame(() => {
      container.classList.remove('page-enter');
      container.classList.add('page-active');
    });
  } catch (err) {
    console.error('Route render error:', err);
    container.innerHTML = `
      <div class="empty-state" style="min-height: 60vh; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <i class="fas fa-exclamation-circle"></i>
        <p>页面加载失败，请刷新重试</p>
      </div>`;
    container.classList.remove('page-exit');
    container.classList.add('page-active');
  }

  currentRoute = config;
  isTransitioning = false;
}

export function initRouter() {
  window.addEventListener('hashchange', () => renderPage(window.location.hash));
  renderPage(window.location.hash || '#/');
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function getCurrentRoute() {
  return currentRoute;
}
