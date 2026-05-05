import { generateId } from '../utils.js';

export async function parseMarkdown(file) {
  const text = await file.text();
  const title = file.name.replace(/\.md$/i, '');

  // Parse markdown to HTML if marked is available
  let htmlContent = text;
  if (typeof marked !== 'undefined') {
    htmlContent = marked.parse(text);
  }

  // Smart split by headings
  const chapters = [];
  const lines = text.split('\n');
  let current = { title: '', content: '' };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      if (current.content.trim()) {
        chapters.push({ ...current });
      }
      current = {
        title: headingMatch[2].trim(),
        content: ''
      };
    } else {
      current.content += line + '\n';
    }
  }

  if (current.content.trim()) {
    chapters.push({ ...current });
  }

  // Fallback: split by fixed length if no headings
  if (chapters.length === 0) {
    const chunkSize = 3000;
    for (let i = 0; i < text.length; i += chunkSize) {
      chapters.push({
        title: `第 ${chapters.length + 1} 部分`,
        content: text.slice(i, i + chunkSize).trim()
      });
    }
  }

  const totalWords = text.replace(/\s/g, '').length;

  return {
    id: generateId(),
    title,
    author: '未知作者',
    format: 'markdown',
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
