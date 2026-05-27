const _numStr = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split(/\n/);

const numPoints = Number(_numStr[0]);
const _edgeLines = _numStr.slice(1);

let initialSumOfIntervalLengths = 0;
for (let startPoint = 1; startPoint <= numPoints; startPoint++) {
  for (let endPoint = startPoint; endPoint <= numPoints; endPoint++) {
    initialSumOfIntervalLengths += (endPoint - startPoint + 1);
  }
}

const finalOutcome = _edgeLines.reduce((currentTotal, currentEdgeString) => {
  const nodePair = currentEdgeString.split(/ /).map(Number);
  let firstVal = nodePair[0];
  let secondVal = nodePair[1];

  const lesserVal = Math.min(firstVal, secondVal);
  const greaterVal = Math.max(firstVal, secondVal);

  return currentTotal - (lesserVal * (numPoints - greaterVal + 1));
}, initialSumOfIntervalLengths);

console.log(finalOutcome);
