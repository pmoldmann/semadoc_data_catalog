import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { toUrlSlug, extractModelTitle, extractWorkspace } from '../utils/slug';

const FILE_LABELS: Record<string, { de: string; en: string }> = {
  'model_documentation.md': { de: 'Modell-Übersicht', en: 'Model Overview' },
  'table_documentation.md': { de: 'Tabellen & Spalten', en: 'Tables & Columns' },
  'measure_documentation.md': { de: 'Measures', en: 'Measures' },
  'import_logic_documentation.md': { de: 'Import-Logik', en: 'Import Logic' },
  'calculation_item_documentation.md': { de: 'Calculation Items', en: 'Calculation Items' },
  'udf_documentation.md': { de: 'UDFs', en: 'UDFs' },
  'security_documentation.md': { de: 'Zugriffsbeschränkungen', en: 'Security' },
};

function fileToSlug(file: string): string {
  return file.replace('_documentation.md', '').replace('import_logic', 'import');
}

/** Strip code blocks and mermaid diagrams to reduce index size, keep all other text */
function stripCodeBlocks(md: string): string {
  return md.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
}

export const GET: APIRoute = () => {
  const docsDir = path.resolve('src/data/markdown');
  const modelDirs = fs.readdirSync(docsDir).filter(d =>
    fs.statSync(path.join(docsDir, d)).isDirectory()
  );

  const index: Array<{
    model: string;
    modelTitle: string;
    workspace: string;
    workspaceSlug: string;
    modelSlug: string;
    file: string;
    fileSlug: string;
    fileLabelDe: string;
    fileLabelEn: string;
    sections: Array<{ heading: string; text: string }>;
  }> = [];

  for (const dir of modelDirs) {
    const modelPath = path.join(docsDir, dir);
    const modelMd = fs.readFileSync(path.join(modelPath, 'model_documentation.md'), 'utf-8');
    const modelTitle = extractModelTitle(modelMd, dir.replace(/_/g, ' '));
    const workspace = extractWorkspace(modelMd);
    const workspaceSlug = toUrlSlug(workspace || 'default');
    const modelSlug = toUrlSlug(dir);

    const files = fs.readdirSync(modelPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(modelPath, file), 'utf-8');
      const stripped = stripCodeBlocks(raw);

      // Split into sections by headings
      const sections: Array<{ heading: string; text: string; headingOccurrence: number }> = [];
      const parts = stripped.split(/^(#{1,4}\s+.+)$/m);
      const headingCounts: Record<string, number> = {};

      let currentHeading = '';
      let currentOccurrence = 0;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;
        if (/^#{1,4}\s+/.test(part)) {
          currentHeading = part.replace(/^#+\s+/, '');
          headingCounts[currentHeading] = (headingCounts[currentHeading] || 0);
          currentOccurrence = headingCounts[currentHeading];
          headingCounts[currentHeading]++;
        } else {
          // Collapse whitespace and skip very short fragments
          const text = part.replace(/\s+/g, ' ').trim();
          if (text.length > 10) {
            sections.push({ heading: currentHeading, text, headingOccurrence: currentOccurrence });
          }
        }
      }

      const labels = FILE_LABELS[file] || { de: file, en: file };
      index.push({
        model: dir,
        modelTitle,
        workspace,
        workspaceSlug,
        modelSlug,
        file,
        fileSlug: fileToSlug(file),
        fileLabelDe: labels.de,
        fileLabelEn: labels.en,
        sections,
      });
    }
  }

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
