const cfg = { input: '/dev/stdin', newline: '\n' };

const inputLines = require('fs').readFileSync(cfg.input, 'ascii').split(cfg.newline);

const [gridHeight, gridWidth] = inputLines[0].split(' ').map(val => parseInt(val, 10));
const gridRows = inputLines.slice(1, 1 + gridHeight);

const [patternHeight, patternWidth] = inputLines[1 + gridHeight].split(' ').map(val => parseInt(val, 10));
const patternRows = inputLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternHeight);

if (gridHeight < patternHeight || gridWidth < patternWidth) {
  process.exit();
}

Array.from({ length: gridHeight - patternHeight + 1 }, (_, rowOffset) => {
  Array.from({ length: gridWidth - patternWidth + 1 }, (_, colOffset) => {
    const currentPositionMatches = Array.from({ length: patternHeight }, (_, patternRowIdx) => {
      const gridSlice = gridRows[rowOffset + patternRowIdx].substring(colOffset, colOffset + patternWidth);
      return gridSlice === patternRows[patternRowIdx];
    }).every(Boolean);

    if (currentPositionMatches) {
      console.log(rowOffset, colOffset);
    }
  });
});
