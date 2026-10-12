const fileSystem = require('fs');

const appConfig = { input: '/dev/stdin', newline: '\n' };

const rawInputContent = fileSystem.readFileSync(appConfig.input, 'ascii');
const inputLines = rawInputContent.split(appConfig.newline);

const parseDimensions = (lineString) => {
  return lineString.split(' ').map(Number);
};

const firstLineDimensions = parseDimensions(inputLines[0]);
const gridHeight = firstLineDimensions[0];
const gridWidth = firstLineDimensions[1];

const mainGrid = inputLines.slice(1, 1 + gridHeight);

const patternDimensionsLine = parseDimensions(inputLines[1 + gridHeight]);
const patternRows = patternDimensionsLine[0];
const patternCols = patternDimensionsLine[1];

const searchPattern = inputLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternRows);

if (gridHeight < patternRows || gridWidth < patternCols) {
  process.exit();
}

const generateRowSubstrings = (gridRowString, segmentLength, totalWidth) => {
  const rowSubstrings = [];
  const maxColStart = totalWidth - segmentLength;
  for (let colStartIdx = 0; colStartIdx <= maxColStart; colStartIdx++) {
    const segment = gridRowString.slice(colStartIdx, colStartIdx + segmentLength);
    rowSubstrings.push(segment);
  }
  return rowSubstrings;
};

const subgridCandidates = mainGrid.map(gridRowString =>
  generateRowSubstrings(gridRowString, patternCols, gridWidth)
);

const checkSubgridMatch = (startRowOffset, startColOffset) => {
  for (let patternRowIndex = 0; patternRowIndex < patternRows; patternRowIndex++) {
    const currentMainGridSegment = subgridCandidates[startRowOffset + patternRowIndex][startColOffset];
    const currentPatternSegment = searchPattern[patternRowIndex];

    if (currentMainGridSegment !== currentPatternSegment) {
      return false;
    }
  }
  return true;
};

const maxRowOffset = gridHeight - patternRows;
const maxColOffset = gridWidth - patternCols;

for (let mainRowOffset = 0; mainRowOffset <= maxRowOffset; mainRowOffset++) {
  for (let mainColOffset = 0; mainColOffset <= maxColOffset; mainColOffset++) {
    if (checkSubgridMatch(mainRowOffset, mainColOffset)) {
      console.log(mainRowOffset, mainColOffset);
    }
  }
}
