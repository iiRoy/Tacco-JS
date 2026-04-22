'use strict'

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

const getAbsoluteDelta = (pointOne, pointTwo) => Math.abs(pointOne - pointTwo);

const parsedValues = rawInputData
  .split('\n')
  .at(1)
  .split(' ')
  .map(Number);

const pathNodes = [0]
  .concat(parsedValues)
  .concat([0]);

const totalPathSum = pathNodes.reduce((acc, currentVal, index, arr) => {
  return index === 0 ? 0 : acc + getAbsoluteDelta(arr[index - 1], currentVal);
}, 0);

const computedResults = parsedValues.map((_, elementIndex) => {
  const precedingNode = pathNodes[elementIndex];
  const focalNode = pathNodes[elementIndex + 1];
  const succeedingNode = pathNodes[elementIndex + 2];

  const travelCostIfVisited = getAbsoluteDelta(precedingNode, focalNode) + getAbsoluteDelta(focalNode, succeedingNode);
  const travelCostIfBypassed = getAbsoluteDelta(precedingNode, succeedingNode);

  const netChange = travelCostIfBypassed - travelCostIfVisited;

  return totalPathSum + netChange;
});

console.log(computedResults.join('\n'));