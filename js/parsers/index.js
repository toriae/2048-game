import { parseTxt } from './txt.js';
import { parseEpub } from './epub.js';
import { parseHtml } from './html.js';
import { parseMarkdown } from './markdown.js';
import { parsePdf } from './pdf.js';

const parsers = {
  txt: parseTxt,
  epub: parseEpub,
  html: parseHtml,
  htm: parseHtml,
  md: parseMarkdown,
  markdown: parseMarkdown,
  pdf: parsePdf
};

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const parser = parsers[ext];

  if (!parser) {
    throw new Error(`不支持的文件格式: .${ext}`);
  }

  return parser(file);
}
