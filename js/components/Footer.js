export function Footer() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-links">
        <a href="#/">首页</a>
        <a href="#/writing">文章</a>
        <a href="#/about">关于</a>
      </div>
      <div class="footer-social">
        <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
      </div>
      <div class="footer-copy">&copy; ${new Date().getFullYear()} hoto.dev</div>
    </div>
  `;
  return footer;
}
