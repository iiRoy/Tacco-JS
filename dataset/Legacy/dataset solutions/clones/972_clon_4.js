function obtainEscapedPattern(inputString) {
  return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const processingParameters = { sourcePath: '/dev/stdin', lineDelimiter: '\n' };

const rawInputLines = require('fs').readFileSync(processingParameters.sourcePath, 'ascii')
  .split(processingParameters.lineDelimiter);

const primaryText = rawInputLines[0];
const targetSequence = rawInputLines[1];

const literalTargetRegex = new RegExp(obtainEscapedPattern(targetSequence), 'g');
let currentMatchResult;

while ((currentMatchResult = literalTargetRegex.exec(primaryText)) !== null) {
  console.log(currentMatchResult.index);
}
