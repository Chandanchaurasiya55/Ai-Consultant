import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function parseMd() {
  const filePath = path.resolve(__dirname, '../../../Business_Market_Research_Bible_Master_Index.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const lines = content.split('\n');
  const volumes = [];
  let currentVolume = null;
  let currentChapter = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect Volume (e.g. # Volume 1 -- Foundations (≈50 Pages))
    if (line.startsWith('# Volume') || line.startsWith('#Volume')) {
      const match = line.match(/#\s*Volume\s+(\d+)\s*[-_]*\s*(.*)/i);
      const volumeNum = match ? parseInt(match[1]) : (volumes.length + 1);
      let volumeTitle = match ? match[2].trim() : line.replace('#', '').trim();
      
      // Clean up title
      volumeTitle = volumeTitle.replace(/^[-_]+\s*/, '').trim();
      if (!volumeTitle || volumeTitle.startsWith('(')) {
        const fallbackTitles = {
          1: 'Foundations',
          2: 'Strategy & Demand',
          3: 'Location & Marketing',
          4: 'Operations & Risks'
        };
        volumeTitle = fallbackTitles[volumeNum] || `Volume ${volumeNum}`;
      }

      currentVolume = {
        volume: volumeNum,
        key: `volume${volumeNum}`,
        title: `Volume ${volumeNum} — ${volumeTitle}`,
        subtitle: `Strategic chapter analysis for Volume ${volumeNum}`,
        chapters: []
      };
      volumes.push(currentVolume);
      currentChapter = null;
    }
    // Detect Chapter (e.g. ## Chapter 1 --- Business Idea Validation)
    else if (line.startsWith('## Chapter') || line.startsWith('##Chapter')) {
      const match = line.match(/##\s*Chapter\s+(\d+)\s*[-_]*\s*(.*)/i);
      const chapterNum = match ? parseInt(match[1]) : 0;
      const chapterTitle = match ? match[2].trim() : line.replace('##', '').trim();
      
      // Clean up dashes in title
      const cleanTitle = chapterTitle.replace(/^[-_]+\s*/, '').trim();
      
      const key = `chapter${chapterNum}`;
      currentChapter = {
        num: chapterNum,
        key: key,
        title: `Chapter ${chapterNum} — ${cleanTitle}`,
        subtopics: [],
        references: '',
        wantsDiagram: true,
        wantsChart: true
      };
      
      if (!currentVolume) {
        currentVolume = {
          volume: 1,
          key: 'volume1',
          title: 'Volume 1 — Foundations',
          subtitle: 'Foundations of business validation and research',
          chapters: []
        };
        volumes.push(currentVolume);
      }
      currentVolume.chapters.push(currentChapter);
    }
    // Detect subtopic bullet points under a chapter
    else if (currentChapter && (line.startsWith('-') || line.startsWith('*'))) {
      // Exclude separator lines of dashes or stars
      if (line.match(/^[-*]+$/) || line.replace(/^[-*]\s+/, '').trim().match(/^[-*]+$/)) continue;
      
      const bulletText = line.replace(/^[-*]\s+/, '').trim();
      if (bulletText) {
        if (bulletText.includes('Reference Section')) {
          const refMatch = bulletText.match(/\*\*Reference Section\*\*\s*(.*)/i) || bulletText.match(/Reference Section\s*(.*)/i);
          if (refMatch) {
            currentChapter.references = refMatch[1].trim();
          }
        } else {
          currentChapter.subtopics.push(bulletText);
        }
      }
    }
    // Detect Reference Section directly
    else if (currentChapter && line.includes('Reference Section')) {
      const refMatch = line.match(/\*\*Reference Section\*\*\s*(.*)/i) || line.match(/Reference Section\s*(.*)/i);
      if (refMatch) {
        currentChapter.references = refMatch[1].trim();
      }
    }
  }

  // Final cleanup step for subtopics
  volumes.forEach(vol => {
    vol.chapters.forEach(ch => {
      ch.subtopics = ch.subtopics.filter(st => {
        const clean = st.trim();
        return clean.length > 0 && 
               !clean.includes('---') && 
               !clean.includes('Reference Section') &&
               !clean.startsWith('**Reference Section**');
      });
    });
  });

  return volumes;
}

export const REPORT_STRUCTURE = parseMd();
export const ALL_CHAPTER_KEYS = REPORT_STRUCTURE.flatMap(v => v.chapters.map(c => c.key));
