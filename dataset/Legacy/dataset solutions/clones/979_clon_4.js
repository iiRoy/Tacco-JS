const inputSourceConfig = { path: '/dev/stdin', terminator: '\n' };

const rawContent = require('fs').readFileSync(inputSourceConfig.path, 'ascii');
const contentLines = rawContent.split(inputSourceConfig.terminator);

let lineCursor = 0;

const extractDimensions = () => {
  const [val1, val2] = contentLines[lineCursor++].split(' ').map(Number);
  return { val1, val2 };
};

const extractGrid = (height) => {
  const gridSegment = contentLines.slice(lineCursor, lineCursor + height);
  lineCursor += height;
  return gridSegment;
};

const { val1: fieldHeight, val2: fieldWidth } = extractDimensions();
const fieldMatrix = extractGrid(fieldHeight);

const { val1: patternHeight, val2: patternWidth } = extractDimensions();
const patternMatrix = extractGrid(patternHeight);

const rowMatchRegistry = new Set();

for (let fRowIdx = 0; fRowIdx < fieldHeight; fRowIdx++) {
  for (let pRowIdx = 0; pRowIdx < patternHeight; pRowIdx++) {
    const safePatternRow = patternMatrix[pRowIdx].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rowMatcher = new RegExp(safePatternRow, 'g');

    for (const matchResult of fieldMatrix[fRowIdx].matchAll(rowMatcher)) {
      rowMatchRegistry.add(`${fRowIdx}-${pRowIdx}-${matchResult.index}`);
    }
  }
}

const potentialStarts = Array.from({ length: fieldHeight - patternHeight + 1 }, (_, r) => r)
  .flatMap(r =>
    Array.from({ length: fieldWidth - patternWidth + 1 }, (_, c) => ({ r, c }))
  );

potentialStarts
  .filter(startCoord => {
    return Array.from({ length: patternHeight }, (_, k) => k)
      .every(k => rowMatchRegistry.has(`${startCoord.r + k}-${k}-${startCoord.c}`));
  })
  .forEach(matchCoord => console.log(`${matchCoord.r} ${matchCoord.c}`));
