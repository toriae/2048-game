import { db } from '../db.js';
import { BookCard } from '../components/BookCard.js';
import { parseFile } from '../parsers/index.js';
import { autoImportPromise } from '../app.js';

export default async function libraryPage() {
  const page = document.createElement('div');
  page.className = 'library-page';

  let books = [];
  let uploading = [];

  async function loadBooks() {
    books = await db.getAllBooks();
    renderBooks();
  }

  function renderBooks() {
    const shelf = page.querySelector('#bookshelf');
    shelf.innerHTML = '';

    if (books.length === 0 && uploading.length === 0) {
      shelf.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><p>书架空空如也</p></div>';
      return;
    }

    books.forEach(book => {
      shelf.appendChild(BookCard(book, loadBooks));
    });
  }

  function renderUploading() {
    const container = page.querySelector('#uploading-list');
    container.innerHTML = '';
    uploading.forEach(u => {
      const el = document.createElement('div');
      el.className = 'uploading-card';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.innerHTML = `
        <div class="uploading-spinner"></div>
        <div class="uploading-info">
          <span class="uploading-filename">${u.name}</span>
          <span> ${u.status}</span>
        </div>
      `;
      container.appendChild(el);
    });
  }

  async function handleFiles(files) {
    for (const file of files) {
      const item = { name: file.name, status: '解析中...' };
      uploading.push(item);
      renderUploading();

      try {
        if (file.size > 10 * 1024 * 1024) {
          item.status = '文件较大，可能需要时间';
          renderUploading();
        }
        const book = await parseFile(file);
        await db.addBook(book);
        item.status = '完成';
        renderUploading();
        setTimeout(() => {
          uploading = uploading.filter(u => u !== item);
          renderUploading();
          loadBooks();
        }, 800);
      } catch (err) {
        console.error('Parse error:', err);
        item.status = '解析失败';
        renderUploading();
        setTimeout(() => {
          uploading = uploading.filter(u => u !== item);
          renderUploading();
        }, 2500);
      }
    }
  }

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-header-title">书库</h1>
      <p class="page-header-desc">上传文件，在浏览器中阅读</p>
    </div>
    <div class="upload-zone" id="upload-zone">
      <div class="upload-icon"><i class="fas fa-cloud-arrow-up"></i></div>
      <div class="upload-text">拖拽文件至此，或点击选择</div>
      <div class="upload-formats">
        <span class="badge">TXT</span>
        <span class="badge">EPUB</span>
        <span class="badge">HTML</span>
        <span class="badge">MD</span>
        <span class="badge">PDF</span>
      </div>
      <input type="file" class="upload-input" id="upload-input" accept=".txt,.epub,.html,.md,.markdown,.pdf" multiple>
    </div>
    <div id="uploading-list"></div>
    <div class="bookshelf" id="bookshelf"></div>
  `;

  const uploadZone = page.querySelector('#upload-zone');
  const uploadInput = page.querySelector('#upload-input');

  uploadZone.setAttribute('tabindex', '0');
  uploadZone.setAttribute('role', 'button');
  uploadZone.setAttribute('aria-label', '上传文件区域，支持 TXT、EPUB、HTML、Markdown、PDF 格式');

  uploadZone.addEventListener('click', () => uploadInput.click());
  uploadZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); uploadInput.click(); }
  });
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  uploadInput.addEventListener('change', (e) => {
    const files = [...e.target.files];
    uploadInput.value = '';
    handleFiles(files);
  });

  // Show loading state while auto-import runs
  const shelf = page.querySelector('#bookshelf');
  shelf.innerHTML = '<div class="library-loading" id="library-loading" role="status" aria-live="polite"><div class="uploading-spinner"></div><span>加载中...</span></div>';

  // Wait for auto-import to finish before loading books
  if (autoImportPromise) {
    await autoImportPromise;
  }
  await loadBooks();

  return page;
}
