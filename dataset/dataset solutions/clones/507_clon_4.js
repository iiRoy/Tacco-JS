function acquireValue(textData) {
  return Number(textData);
}

function computeSumRecursively(elements, currentPosition, runningAggregate) {
  if (currentPosition >= elements.length) {
    return runningAggregate;
  }
  const elementValue = acquireValue(elements[currentPosition]);
  return computeSumRecursively(elements, currentPosition + 1, runningAggregate + elementValue);
}

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedData = sourceData.replace(/\r/g, '');
const segments = processedData.split('\n');

const finalResult = computeSumRecursively(segments, 0, 0);

console.log(finalResult);