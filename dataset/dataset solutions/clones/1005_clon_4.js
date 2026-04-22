const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = sourceData.trim().split('\n');
const numericalData = processedLines[1].split(' ').map(Number);

let totalOperations = 0;

function locateSmallest(arrRef, currentMinIdx, checkPoint) {
  if (checkPoint >= arrRef.length) {
    return currentMinIdx;
  }
  const nextMinIdx = arrRef[checkPoint] < arrRef[currentMinIdx] ? checkPoint : currentMinIdx;
  return locateSmallest(arrRef, nextMinIdx, checkPoint + 1);
}

function arrangeSequence(sequence, currentBoundary) {
  if (currentBoundary >= sequence.length - 1) {
    return;
  }

  const identifiedSmallestIdx = locateSmallest(sequence, currentBoundary, currentBoundary + 1);

  if (identifiedSmallestIdx !== currentBoundary) {
    const temporaryValue = sequence[identifiedSmallestIdx];
    sequence[identifiedSmallestIdx] = sequence[currentBoundary];
    sequence[currentBoundary] = temporaryValue;
    totalOperations++;
  }

  arrangeSequence(sequence, currentBoundary + 1);
}

arrangeSequence(numericalData, 0);

console.log(numericalData.join(' '));
console.log(totalOperations);