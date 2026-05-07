import { articles } from '../data/articles.js';
import { works } from '../data/works.js';

export default async function homePage() {
  const page = document.createElement('div');
  page.className = 'home-page';

  const recentArticles = articles.slice(0, 5);
  const recentWorks = works.slice(0, 3);

  page.innerHTML = `
    <section class="hero">
      <div class="hero-greeting">who am i</div>
      <h1 class="hero-name">hoto</h1>
      <p class="hero-desc">AI 方向 / RAG / 知识图谱 / 偶尔写全栈</p>
      <div class="hero-tags">
        <span class="tag">Python</span>
        <span class="tag tag--green">RAG</span>
        <span class="tag tag--orange">FastAPI</span>
        <span class="badge">Neo4j</span>
        <span class="badge">LanceDB</span>
      </div>
      <div class="hero-links">
        <a class="btn" href="#/writing">文章</a>
        <a class="btn btn--ghost" href="#/about">关于</a>
      </div>
    </section>

    <div class="status-bar">
      <div class="status-item">
        <span class="status-dot"></span>
        <span>正在学习 RAG 和知识图谱</span>
      </div>
      <div class="status-item">
        <span>最近在折腾：FastAPI + Neo4j</span>
      </div>
    </div>

    <div class="quick-nav">
      <div class="quick-nav-grid">
        <a class="quick-nav-item" href="#/writing">
          <span class="quick-nav-icon"><i class="fas fa-pen-nib"></i></span>
          <span class="quick-nav-label">文章</span>
          <span class="quick-nav-desc">学习笔记与技术记录</span>
        </a>
        <a class="quick-nav-item" href="#/works">
          <span class="quick-nav-icon"><i class="fas fa-code"></i></span>
          <span class="quick-nav-label">项目</span>
          <span class="quick-nav-desc">个人项目与实践</span>
        </a>
        <a class="quick-nav-item" href="#/timeline">
          <span class="quick-nav-icon"><i class="fas fa-stream"></i></span>
          <span class="quick-nav-label">时间线</span>
          <span class="quick-nav-desc">成长与学习轨迹</span>
        </a>
      </div>
    </div>

    ${recentArticles.length > 0 ? `
      <section class="home-section">
        <div class="section-header">
          <h2 class="section-title">最新文章</h2>
          <a href="#/writing" class="section-more">查看全部 →</a>
        </div>
        <div class="home-articles" id="home-articles"></div>
      </section>
    ` : ''}

    <section class="home-section">
      <div class="section-header">
        <h2 class="section-title">关于我</h2>
      </div>
      <div class="terminal-card">
        <div class="terminal-header">
          <div class="terminal-dots" aria-hidden="true"><span></span><span></span><span></span></div>
          <span>~/hoto/intro</span>
        </div>
        <div class="terminal-body">
          <div class="terminal-line">
            <span class="terminal-prompt">$</span>
            <span class="terminal-text">cat about.txt</span>
          </div>
          <div class="terminal-line">
            <span class="terminal-text">普通本科生，研究方向是 RAG 和知识图谱。</span>
          </div>
          <div class="terminal-line">
            <span class="terminal-text">技术栈：Python / FastAPI / Neo4j / LanceDB</span>
          </div>
          <div class="terminal-line">
            <span class="terminal-text">偶尔写点学习笔记，记录踩过的坑。</span>
          </div>
          <div class="terminal-line" style="margin-top: 0.5rem;">
            <span class="terminal-prompt">$</span>
            <span class="terminal-text">echo $STATUS</span>
          </div>
          <div class="terminal-line">
            <span class="terminal-text">持续学习中...<span class="terminal-cursor"></span></span>
          </div>
        </div>
      </div>
    </section>

    ${recentWorks.length > 0 ? `
      <section class="home-section">
        <div class="section-header">
          <h2 class="section-title">最近项目</h2>
          <a href="#/works" class="section-more">查看全部 →</a>
        </div>
        <div class="works-grid" id="home-works"></div>
      </section>
    ` : ''}
  `;

  const articlesEl = page.querySelector('#home-articles');
  if (articlesEl && recentArticles.length > 0) {
    recentArticles.forEach(article => {
      const item = document.createElement('a');
      item.className = 'home-article-item';
      item.href = `#/writing/${article.id}`;
      item.innerHTML = `
        <span class="home-article-date">${article.date}</span>
        <span class="home-article-title">${article.title}</span>
        <span class="home-article-tag tag">${article.category}</span>
      `;
      articlesEl.appendChild(item);
    });
  }

  const worksEl = page.querySelector('#home-works');
  if (worksEl && recentWorks.length > 0) {
    recentWorks.forEach(work => {
      const card = document.createElement('div');
      card.className = 'work-card';
      card.innerHTML = `
        <h3 class="work-name">${work.name}</h3>
        <p class="work-desc">${work.description}</p>
        <div class="work-tags">
          ${work.tags.map(t => `<span class="badge">${t}</span>`).join('')}
        </div>
      `;
      worksEl.appendChild(card);
    });
  }

  return page;
}
