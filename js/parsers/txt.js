import { detectEncoding, generateId, formatWordCount } from '../utils.js';

const CHAPTER_PATTERNS = [
  /^第[一二三四五六七八九十百千零\d]+[章回节]/m,
  /^Chapter\s+\d+/mi,
  /^CHAPTER\s+\d+/m,
  /^第\d+章/m
];

function smartSplit(text) {
  // Try to find chapter headings
  const lines = text.split('\n');
  const chapters = [];
  let current = { title: '', content: '' };

  for (const line of lines) {
    const trimmed = line.trim();
    const isChapter = CHAPTER_PATTERNS.some(p => p.test(trimmed));

    if (isChapter && trimmed.length < 50) {
      if (current.content.trim()) {
        chapters.push({ ...current });
      }
      current = { title: trimmed, content: '' };
    } else {
      current.content += line + '\n';
    }
  }

  if (current.content.trim()) {
    chapters.push({ ...current });
  }

  // If no chapters found, split by fixed length
  if (chapters.length <= 1) {
    const fullText = text.trim();
    const chunkSize = 3000;
    const result = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
      const chunk = fullText.slice(i, i + chunkSize);
      result.push({
        title: `第 ${result.length + 1} 部分`,
        content: chunk
      });
    }
    return result;
  }

  return chapters.map((ch, i) => ({
    title: ch.title || `第 ${i + 1} 章`,
    content: ch.content.trim()
  }));
}

export async function parseTxt(file) {
  const buffer = await file.arrayBuffer();
  const encoding = detectEncoding(buffer);
  const decoder = new TextDecoder(encoding);
  const text = decoder.decode(buffer);

  const chapters = smartSplit(text);
  const totalWords = text.replace(/\s/g, '').length;

  return {
    id: generateId(),
    title: file.name.replace(/\.txt$/i, ''),
    author: '未知作者',
    format: 'txt',
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
