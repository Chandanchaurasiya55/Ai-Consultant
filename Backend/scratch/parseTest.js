import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseMd() {
  const filePath = path.resolve(__dirname, '../../Business_Market_Research_Bible_Master_Index.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const lines = content.split('\n');
  const volumes = [];
  let currentVolume = null;
  let currentChapter = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect Volume (e.g. # Volume 1 -- Foundations (≈50 Pages))
    if (line.startsWith('# Volume')) {
      const match = line.match(/# Volume\s+(\d+)\s*--\s*(.*)/i) || line.match(/# Volume\s+(\d+)\s*(.*)/i);
      const volumeNum = match ? parseInt(match[1]) : (volumes.length + 1);
      const volumeTitle = match ? match[2].trim() : line.replace('#', '').trim();
      currentVolume = {
        volume: volumeNum,
        key: `volume${volumeNum}`,
        title: volumeTitle,
        chapters: []
      };
      volumes.push(currentVolume);
      currentChapter = null;
    }
    // Detect Chapter (e.g. ## Chapter 1 --- Business Idea Validation)
    else if (line.startsWith('## Chapter')) {
      const match = line.match(/## Chapter\s+(\d+)\s*[-_]*\s*(.*)/i);
      const chapterNum = match ? parseInt(match[1]) : 0;
      const chapterTitle = match ? match[2].trim() : line.replace('##', '').trim();
      
      const key = `chapter${chapterNum}`;
      currentChapter = {
        num: chapterNum,
        key: key,
        title: `Chapter ${chapterNum} — ${chapterTitle}`,
        subtopics: [],
        references: ''
      };
      
      if (!currentVolume) {
        // Safe fallback if volume isn't declared yet
        currentVolume = {
          volume: 1,
          key: 'volume1',
          title: 'Foundations',
          chapters: []
        };
        volumes.push(currentVolume);
      }
      currentVolume.chapters.push(currentChapter);
    }
    // Detect subtopic bullet points under a chapter
    else if (currentChapter && (line.startsWith('-') || line.startsWith('*'))) {
      const bulletText = line.replace(/^[-*]\s+/, '').trim();
      if (bulletText) {
        currentChapter.subtopics.push(bulletText);
      }
    }
    // Detect Reference Section
    else if (currentChapter && line.startsWith('**Reference Section**')) {
      currentChapter.references = line.replace(/^\*\*Reference Section\*\*\s*/, '').trim();
    }
  }

  return volumes;
}

try {
  const result = parseMd();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error('Error parsing:', e);
}
