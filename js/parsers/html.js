import { generateId } from '../utils.js';

export async function parseHtml(file) {
  const text = await file.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const body = doc.body;
  if (!body) throw new Error('无法解析 HTML 文件');

  // Try to find title
  const titleEl = doc.querySelector('title') || doc.querySelector('h1');
  const title = titleEl?.textContent?.trim() || file.name.replace(/\.html?$/i, '');

  // Smart split by headings
  const chapters = [];
  const headings = body.querySelectorAll('h1, h2, h3');

  if (headings.length > 1) {
    headings.forEach((heading, i) => {
      const chapterTitle = heading.textContent.trim();
      let content = '';

      // Collect content until next heading
      let node = heading.nextSibling;
      while (node) {
        if (node.nodeType === 1 && /^H[1-3]$/.test(node.tagName)) break;
        if (node.textContent?.trim()) {
          content += node.textContent.trim() + '\n';
        }
        node = node.nextSibling;
      }

      if (content.trim()) {
        chapters.push({
          title: chapterTitle || `第 ${chapters.length + 1} 章`,
          content: content.trim()
        });
      }
    });
  }

  // Fallback: split by fixed length
  if (chapters.length === 0) {
    const fullText = body.textContent || '';
    const chunkSize = 3000;
    for (let i = 0; i < fullText.length; i += chunkSize) {
      chapters.push({
        title: `第 ${chapters.length + 1} 部分`,
        content: fullText.slice(i, i + chunkSize).trim()
      });
    }
  }

  const totalWords = chapters.reduce((sum, ch) => sum + ch.content.replace(/\s/g, '').length, 0);

  return {
    id: generateId(),
    title,
    author: '未知作者',
    format: 'html',
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
