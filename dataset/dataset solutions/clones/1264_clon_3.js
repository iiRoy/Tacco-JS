const HASH_CHAR = '#';
const DOT_CHAR = '.';
const NEWLINE_CHAR = '\n';

const fileContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const inputLines = fileContent.split(NEWLINE_CHAR);

let outputBuffer = '';
let isFirstOutputBlock = true;

for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
  const currentLineParts = inputLines[lineIndex].split(' ').map(Number);
  const heightVal = currentLineParts[0];
  const widthVal = currentLineParts[1];

  if (widthVal === 0 && heightVal === 0) {
    break;
  }

  if (!isFirstOutputBlock) {
    outputBuffer += NEWLINE_CHAR;
  }
  isFirstOutputBlock = false;

  const topBottomRowLength = widthVal + 1;
  const topBottomRowContent = new Array(topBottomRowLength).join(HASH_CHAR);
  const fullRowPattern = topBottomRowContent + NEWLINE_CHAR;

  outputBuffer += fullRowPattern;

  const innerDotCount = widthVal - 1;
  const middleFiller = new Array(innerDotCount).join(DOT_CHAR);
  const middleRowTemplate = HASH_CHAR + middleFiller + HASH_CHAR + NEWLINE_CHAR;

  const middleRowsLoopLimit = heightVal - 1;
  for (let rowIndex = 1; rowIndex < middleRowsLoopLimit; ++rowIndex) {
    outputBuffer += middleRowTemplate;
  }

  outputBuffer += fullRowPattern;
}

console.log(outputBuffer);
