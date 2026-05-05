export default async function aboutPage() {
  const page = document.createElement('div');
  page.className = 'about-page';

  const skills = [
    { name: 'Python', level: 80 },
    { name: 'RAG', level: 65 },
    { name: 'Neo4j', level: 55 },
    { name: 'MySQL', level: 70 },
    { name: 'LanceDB', level: 50 },
    { name: 'FastAPI', level: 65 }
  ];

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-header-title">关于</h1>
    </div>
    <div class="about-bio">
      <p>hoto，一个正在学习 AI 和后端开发的普通本科生。</p>
      <p>对 RAG、知识图谱、数据库感兴趣，偶尔折腾全栈项目。</p>
    </div>
    <div class="about-section">
      <h2 class="about-section-title">联系方式</h2>
      <div class="contact-list">
        <a class="contact-item" href="mailto:hoto_oyama@163.com">
          <span class="contact-icon"><i class="far fa-envelope"></i></span>
          <span class="contact-text">hoto_oyama@163.com</span>
        </a>
        <a class="contact-item" href="https://github.com" target="_blank" rel="noopener">
          <span class="contact-icon"><i class="fab fa-github"></i></span>
          <span class="contact-text">GitHub</span>
        </a>
      </div>
    </div>
    <div class="about-section">
      <h2 class="about-section-title">技能</h2>
      <div class="skills-grid" id="skills-grid"></div>
    </div>
  `;

  const skillsGrid = page.querySelector('#skills-grid');
  skills.forEach(skill => {
    const deg = (skill.level / 100) * 360;
    const el = document.createElement('div');
    el.className = 'skill-item';
    el.innerHTML = `
      <div class="skill-ring">
        <div class="skill-ring-bg"></div>
        <div class="skill-ring-fill" style="--skill-deg: 0deg" data-deg="${deg}"></div>
        <div class="skill-ring-center">${skill.level}%</div>
      </div>
      <span class="skill-name">${skill.name}</span>
    `;
    skillsGrid.appendChild(el);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-ring-fill').forEach(fill => {
          fill.style.setProperty('--skill-deg', fill.dataset.deg + 'deg');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(skillsGrid);

  page._cleanup = () => observer.disconnect();

  return page;
}
