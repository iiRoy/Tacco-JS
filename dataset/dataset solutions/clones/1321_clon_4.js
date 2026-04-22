const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const allInputSegments = rawData.split('\n').map(s => s.trim());

const initialPhrase = allInputSegments[0].toLowerCase();
const terminalMarker = 'END_OF_TEXT';

const contentSegments = allInputSegments.slice(1);
const endOfContentIndex = contentSegments.findIndex(seg => seg === terminalMarker);

const searchableContent = endOfContentIndex !== -1 ? contentSegments.slice(0, endOfContentIndex) : contentSegments;

const aggregatedText = searchableContent.join(' ').toLowerCase();

const safePhrase = initialPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = new RegExp(`\\b${safePhrase}\\b`, 'g');

const matches = aggregatedText.match(pattern);

const finalTally = matches ? matches.length : 0;

console.log(finalTally);