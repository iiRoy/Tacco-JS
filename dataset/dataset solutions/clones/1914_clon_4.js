function processNumericRange(dataPayload) {
  const linesOfData = dataPayload.split('\n');
  const divisorValue = parseInt(linesOfData[0], 10);
  const rangeBounds = linesOfData[1].split(' ').map(val => parseInt(val, 10));

  const lowerBound = rangeBounds[0];
  const upperBound = rangeBounds[1];

  const smallestMultipleInQuestion = Math.ceil(lowerBound / divisorValue) * divisorValue;

  if (smallestMultipleInQuestion <= upperBound) {
    return 'OK';
  } else {
    return 'NG';
  }
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
console.log(processNumericRange(rawInputContent));