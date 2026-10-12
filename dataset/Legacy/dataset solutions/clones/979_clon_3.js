const inputConfig = { sourcePath: '/dev/stdin', lineSeparator: '\n' };

const parseNumbers = (str) => str.split(' ').map(Number);

const fileContent = require('fs').readFileSync(inputConfig.sourcePath, 'ascii');
const rawInputLines = fileContent.split(inputConfig.lineSeparator);

const [fieldHeight, fieldWidth] = parseNumbers(rawInputLines[0]);

const gridData = rawInputLines.slice(1, 1 + fieldHeight);

const patternDimensionsLineIndex = 1 + fieldHeight;
const [patternHeight, patternWidth] = parseNumbers(rawInputLines[patternDimensionsLineIndex]);

const patternStartIndex = patternDimensionsLineIndex + 1;
const patternData = rawInputLines.slice(patternStartIndex, patternStartIndex + patternHeight);

const matchCache = Array.from({ length: fieldHeight }, (_, fieldRowIdx) => {
  return Array.from({ length: patternHeight }, (_, patternRowIdx) => {
    const rowMatches = new Array(fieldWidth - patternWidth + 1).fill(false);
    const currentPatternRow = patternData[patternRowIdx];
    const currentFieldRow = gridData[fieldRowIdx];

    let searchOffset = 0;
    let foundIndex;
    while ((foundIndex = currentFieldRow.indexOf(currentPatternRow, searchOffset)) !== -1) {
      rowMatches[foundIndex] = true;
      searchOffset = foundIndex + 1;
    }
    return rowMatches;
  });
});

const checkFullPatternMatch = (startFieldRow, startFieldCol) => {
  for (let patRowIdx = 0; patRowIdx < patternHeight; patRowIdx++) {
    const currentFieldRowToCheck = startFieldRow + patRowIdx;
    if (!matchCache[currentFieldRowToCheck][patRowIdx][startFieldCol]) {
      return false;
    }
  }
  return true;
};

for (let startFieldRow = 0; startFieldRow <= fieldHeight - patternHeight; startFieldRow++) {
  for (let startFieldCol = 0; startFieldCol <= fieldWidth - patternWidth; startFieldCol++) {
    if (checkFullPatternMatch(startFieldRow, startFieldCol)) {
      console.log('%d %d', startFieldRow, startFieldCol);
    }
  }
}
