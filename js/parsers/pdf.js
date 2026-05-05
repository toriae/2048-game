import { generateId } from '../utils.js';

export async function parsePdf(file) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.js 未加载，请刷新页面后重试');
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const chapters = [];
  let totalWords = 0;
  let currentText = '';
  let currentPage = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');

    if (pageText.trim()) {
      currentText += pageText + '\n';
      totalWords += pageText.replace(/\s/g, '').length;
    }

    // Split every 5 pages or at 3000 chars
    if (i % 5 === 0 || currentText.length > 3000) {
      if (currentText.trim()) {
        chapters.push({
          title: `第 ${chapters.length + 1} 章（第 ${currentPage + 1}-${i} 页）`,
          content: currentText.trim()
        });
        currentText = '';
        currentPage = i;
      }
    }
  }

  // Remaining text
  if (currentText.trim()) {
    chapters.push({
      title: `第 ${chapters.length + 1} 章（第 ${currentPage + 1}-${pdf.numPages} 页）`,
      content: currentText.trim()
    });
  }

  // Check if text extraction failed
  if (totalWords === 0) {
    throw new Error('该 PDF 为扫描版，暂无法提取文字');
  }

  // Fallback
  if (chapters.length === 0) {
    chapters.push({
      title: '全文',
      content: '无法提取文本内容'
    });
  }

  return {
    id: generateId(),
    title: file.name.replace(/\.pdf$/i, ''),
    author: '未知作者',
    format: 'pdf',
    cover: null,
    totalChapters: chapters.length,
    totalWords,
    addedAt: new Date().toISOString().slice(0, 10),
    lastReadAt: new Date().toISOString().slice(0, 10),
    lastReadChapter: 0,
    lastReadScroll: 0,
    progress: 0,
    chapters
  };
}
