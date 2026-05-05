import { generateId } from '../utils.js';

export async function parseEpub(file) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Find container.xml
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Invalid EPUB: missing container.xml');

  const containerDoc = new DOMParser().parseFromString(containerXml, 'application/xml');
  const rootfile = containerDoc.querySelector('rootfile');
  const opfPath = rootfile?.getAttribute('full-path');
  if (!opfPath) throw new Error('Invalid EPUB: missing OPF path');

  // Parse OPF
  const opfContent = await zip.file(opfPath)?.async('text');
  if (!opfContent) throw new Error('Invalid EPUB: missing OPF file');

  const opfDoc = new DOMParser().parseFromString(opfContent, 'application/xml');

  // Get metadata
  const metadata = opfDoc.querySelector('metadata');
  const title = metadata?.querySelector('title')?.textContent || file.name.replace(/\.epub$/i, '');
  const author = metadata?.querySelector('creator')?.textContent || '未知作者';

  // Get manifest (file mapping)
  const manifest = {};
  opfDoc.querySelectorAll('manifest item').forEach(item => {
    manifest[item.getAttribute('id')] = {
      href: item.getAttribute('href'),
      mediaType: item.getAttribute('media-type')
    };
  });

  // Get spine (reading order)
  const spineItems = [];
  opfDoc.querySelectorAll('spine itemref').forEach(ref => {
    const idref = ref.getAttribute('idref');
    if (manifest[idref]) {
      spineItems.push(manifest[idref]);
    }
  });

  // Extract chapters
  const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
  const chapters = [];
  let totalWords = 0;

  for (let i = 0; i < spineItems.length; i++) {
    const item = spineItems[i];
    const filePath = opfDir + item.href;

    try {
      const content = await zip.file(filePath)?.async('text');
      if (!content) continue;

      // Parse HTML content
      const doc = new DOMParser().parseFromString(content, 'text/html');
      const body = doc.body;
      if (!body) continue;

      // Extract text
      const text = body.textContent || '';
      const trimmed = text.trim();
      if (!trimmed) continue;

      // Try to get title from first heading
      const heading = body.querySelector('h1, h2, h3');
      const chapterTitle = heading?.textContent?.trim() || `第 ${chapters.length + 1} 章`;

      totalWords += trimmed.replace(/\s/g, '').length;
      chapters.push({
        title: chapterTitle,
        content: trimmed
      });
    } catch (e) {
      console.warn(`Failed to parse EPUB chapter: ${filePath}`, e);
    }
  }

  // Fallback if no chapters extracted
  if (chapters.length === 0) {
    chapters.push({
      title: '全文',
      content: '无法提取书籍内容'
    });
  }

  return {
    id: generateId(),
    title,
    author,
    format: 'epub',
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
