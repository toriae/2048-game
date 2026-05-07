export default async function aboutPage() {
  const page = document.createElement('div');
  page.className = 'about-page';

  const skills = [
    { name: 'Python', level: 85 },
    { name: 'RAG', level: 70 },
    { name: 'Neo4j', level: 60 },
    { name: 'MySQL', level: 75 },
    { name: 'LanceDB', level: 55 },
    { name: 'FastAPI', level: 70 },
    { name: 'PyTorch', level: 65 },
    { name: 'JavaScript', level: 60 }
  ];

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-header-title">关于</h1>
    </div>
    <div class="about-bio">
      <p>一个正在学习 AI 和后端开发的普通本科生。</p>
      <p>对 RAG、知识图谱、计算机视觉、数据库感兴趣，偶尔折腾全栈项目。</p>
    </div>

    <div class="about-section">
      <h2 class="about-section-title">教育背景</h2>
      <div class="about-card">
        <div class="about-card-header">
          <strong>郑州航空工业管理学院</strong>
          <span class="about-card-meta">人工智能 · 本科 · 2022.09 - 2026.06</span>
        </div>
        <ul class="about-card-list">
          <li>GPA：3.42/4（年级前10%）</li>
          <li>主修课程：计算机网络、数据结构、操作系统、计算机组成原理、机器学习</li>
        </ul>
      </div>
    </div>

    <div class="about-section">
      <h2 class="about-section-title">技术技能</h2>
      <div class="about-skill-tags">
        <span class="about-tag">Python</span>
        <span class="about-tag">RAG</span>
        <span class="about-tag">Neo4j</span>
        <span class="about-tag">MySQL</span>
        <span class="about-tag">LanceDB</span>
        <span class="about-tag">FastAPI</span>
        <span class="about-tag">SSE</span>
        <span class="about-tag">PyTorch</span>
        <span class="about-tag">YOLO</span>
        <span class="about-tag">ResNet</span>
        <span class="about-tag">ARIMA</span>
        <span class="about-tag">HTML/CSS/JS</span>
        <span class="about-tag">Git</span>
        <span class="about-tag">PyCharm</span>
        <span class="about-tag">Jupyter</span>
      </div>
      <div class="about-skill-desc">
        <div class="about-skill-item">
          <strong>数据分析：</strong>熟练使用 Pandas, NumPy, Scikit-learn 进行数据清洗、特征工程与建模
        </div>
        <div class="about-skill-item">
          <strong>机器学习：</strong>熟悉回归、时间序列（ARIMA）、计算机视觉（YOLO, ResNet）等模型
        </div>
        <div class="about-skill-item">
          <strong>大模型应用：</strong>具备 RAG、知识图谱与大模型协同开发经验，熟悉智能问答系统构建
        </div>
      </div>
    </div>

    <div class="about-section">
      <h2 class="about-section-title">技能</h2>
      <div class="skills-grid" id="skills-grid"></div>
    </div>

    <div class="about-section">
      <h2 class="about-section-title">荣誉</h2>
      <ul class="about-card-list">
        <li>全国大学生数学建模竞赛 二等奖（2024）</li>
        <li>蓝桥杯软件和信息技术人才大赛 省级二等奖（2024）</li>
        <li>校二级奖学金（2023, 2024, 2025）</li>
      </ul>
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
