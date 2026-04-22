const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const normalizedSource = sourceData.trim();
const allLines = normalizedSource.split('\n');
const [lineCountString, ...contentLines] = allLines;
const targetCount = Number(lineCountString);
const processedPhrases = contentLines.slice(0, targetCount).map(
    (currentPhrase) => currentPhrase.split('Hoshino').join('Hoshina')
);
console.log(processedPhrases.join('\n'));