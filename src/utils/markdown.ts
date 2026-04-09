/**
 * Shared utilities for markdown rendering in the Data Catalog model detail pages.
 * Extracted from [model].astro to avoid duplication between DE and EN pages.
 */

import { Marked } from 'marked';
import { toUrlSlug, extractModelTitle, extractWorkspace } from './slug';
import fs from 'node:fs';
import path from 'node:path';
import type { Locale } from '../i18n';
import { t } from '../i18n';

export function slugify(text: string): string {
  return text.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/** Map a documentation filename to its tab slug */
export function fileToTabSlug(href: string): string {
  return href.replace('_documentation.md', '').replace('import_logic', 'import').replace('calculation_item', 'calculation');
}

/** Detect whether an SVG string contains animations (CSS or SMIL) */
export function isSvgAnimated(svg: string): boolean {
  return /@keyframes|animation\s*:|animation-name\s*:|<animate[\s>]|<animateTransform[\s>]|<animateMotion[\s>]|<set[\s>]/.test(svg);
}

/** Strip <script> tags from SVG content */
export function sanitizeSvg(svg: string): string {
  return svg.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
}

/** Escape raw style/script tags that marked passes through from markdown text.
 *  Preserves <style> inside <div class="svg-source"> blocks (already sanitised by the SVG renderer). */
export function sanitizeHtml(html: string): string {
  const svgBlocks: string[] = [];
  const safe = html.replace(/<div class="svg-source"[^>]*>[\s\S]*?<\/div>/gi, m => {
    svgBlocks.push(m);
    return `<!--SVG_PLACEHOLDER_${svgBlocks.length - 1}-->`;
  });
  const sanitized = safe
    .replace(/<(\/?)(style)(\s|>)/gi, '&lt;$1$2$3')
    .replace(/<(\/?)(script)(\s|>)/gi, '&lt;$1$2$3')
    .replace(/<abbr\s+title="([^"]*)">\s*ℹ️?\s*<\/abbr>/gi,
      (_, tip) => `<span class="info-tooltip" tabindex="0" title="${tip}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.25v2.25a.75.75 0 0 0 1.5 0V10a.75.75 0 0 0-.75-.75H9Z" clip-rule="evenodd"/></svg></span>`);
  return sanitized.replace(/<!--SVG_PLACEHOLDER_(\d+)-->/g, (_, i) => svgBlocks[Number(i)]);
}

/** Wrap standalone <table> elements in a scroll container div for responsive display */
export function wrapTablesInScrollContainer(html: string): string {
  return html.replace(/<table(\s|>)/g, '<div class="table-scroll-wrapper"><table$1').replace(/<\/table>/g, '</table></div>');
}

/** Create a configured Marked instance with the custom renderer for model documentation */
export function createMarkedInstance(modelDir: string, errorStrings: { invalidSvg: string; svgNotFound: string }): Marked {
  const marked = new Marked();

  marked.use({
    renderer: {
      heading({ text, depth }: { text: string; depth: number }) {
        const id = slugify(text);
        return `<h${depth} id="${id}">${text}</h${depth}>`;
      },
      code({ text, lang }: { text: string; lang?: string }) {
        if (lang === 'mermaid') {
          return `<pre class="mermaid-source">${text}</pre>`;
        }
        if (lang === 'svg') {
          let svgContent = '';
          if (text.trimStart().startsWith('<')) {
            svgContent = sanitizeSvg(text);
          } else {
            const fileName = text.trim();
            if (!/^[\w.\-]+\.svg$/i.test(fileName)) {
              return `<div class="text-sm text-red-500 italic py-4">${errorStrings.invalidSvg}: ${fileName.replace(/</g, '&lt;')}</div>`;
            }
            const svgPath = path.join(modelDir, fileName);
            if (!fs.existsSync(svgPath)) {
              return `<div class="text-sm text-red-500 italic py-4">${errorStrings.svgNotFound}: ${fileName}</div>`;
            }
            svgContent = sanitizeSvg(fs.readFileSync(svgPath, 'utf-8'));
          }
          const animated = isSvgAnimated(svgContent);
          return `<div class="svg-source" data-animated="${animated}">${svgContent}</div>`;
        }
        const langClass = lang ? ` class="language-${lang}"` : '';
        const escaped = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<pre><code${langClass}>${escaped}</code></pre>`;
      },
      link({ href, text }: { href: string; text: string }) {
        if (href) {
          const hashIdx = href.indexOf('#');
          const filePart = hashIdx >= 0 ? href.substring(0, hashIdx) : href;
          const fragment = hashIdx >= 0 ? href.substring(hashIdx + 1) : '';

          if (filePart.endsWith('.md')) {
            const tabSlug = fileToTabSlug(filePart);
            const anchor = fragment || tabSlug;
            return `<a href="#${anchor}" class="text-accent-600 hover:text-accent-500 underline doc-tab-link" data-tab="${tabSlug}" data-anchor="${fragment}">${text}</a>`;
          }
          if (href.startsWith('#')) {
            return `<a href="${href}" class="text-accent-600 hover:text-accent-500 underline">${text}</a>`;
          }
        }
        return `<a href="${href}" class="text-accent-600 hover:text-accent-500 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
      },
    },
  });

  return marked;
}

/** Shared getStaticPaths logic for model detail pages */
export function getModelStaticPaths() {
  const docsDir = path.resolve('src/data/markdown');
  const dirs = fs.readdirSync(docsDir).filter(d =>
    fs.statSync(path.join(docsDir, d)).isDirectory()
  );
  return dirs.map(folderName => {
    const modelMd = fs.readFileSync(path.join(docsDir, folderName, 'model_documentation.md'), 'utf-8');
    const workspace = extractWorkspace(modelMd) || 'default';
    return {
      params: {
        workspace: toUrlSlug(workspace),
        model: toUrlSlug(folderName),
      },
      props: { folderName },
    };
  });
}

/** Load all doc files for a model, parse markdown to HTML, and return rendered docs + metadata */
export function loadModelData(folderName: string, locale: Locale) {
  const strings = t(locale);
  const modelDir = path.resolve('src/data/markdown', folderName);

  const modelMdRaw = fs.readFileSync(path.join(modelDir, 'model_documentation.md'), 'utf-8');
  const modelTitle = extractModelTitle(modelMdRaw, folderName);

  const docFiles = [
    { slug: 'model', file: 'model_documentation.md', label: strings.doc_tabs.model },
    { slug: 'table', file: 'table_documentation.md', label: strings.doc_tabs.table },
    { slug: 'measure', file: 'measure_documentation.md', label: strings.doc_tabs.measure },
    { slug: 'import', file: 'import_logic_documentation.md', label: strings.doc_tabs.import },
    { slug: 'calculation', file: 'calculation_item_documentation.md', label: strings.doc_tabs.calculation },
    { slug: 'udf', file: 'udf_documentation.md', label: strings.doc_tabs.udf },
    { slug: 'security', file: 'security_documentation.md', label: strings.doc_tabs.security },
  ].filter(({ file }) => fs.existsSync(path.join(modelDir, file)));

  const marked = createMarkedInstance(modelDir, {
    invalidSvg: strings.doc_labels.invalid_svg_filename,
    svgNotFound: strings.doc_labels.svg_not_found,
  });

  const docs = docFiles.map(({ slug, file, label }) => {
    const content = fs.readFileSync(path.join(modelDir, file), 'utf-8');
    const html = wrapTablesInScrollContainer(sanitizeHtml(marked.parse(content) as string));
    return { slug, label, html };
  });

  const helpFileName = 'doc_help_detail_en.md';
  const helpMdPath = path.resolve('src/data/help', helpFileName);
  const helpHtml = fs.existsSync(helpMdPath)
    ? wrapTablesInScrollContainer(sanitizeHtml(marked.parse(fs.readFileSync(helpMdPath, 'utf-8')) as string))
    : '';

  return { modelTitle, docs, helpHtml, strings };
}
