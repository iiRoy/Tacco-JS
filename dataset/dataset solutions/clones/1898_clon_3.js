'use strict';

const parseSpaceSeparatedIntegers = (inputString, valueOffset = 0) => {
  return inputString.split(' ').map(strVal => parseInt(strVal, 10) + valueOffset);
};

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

inputLines.shift();

const mountainHeights = parseSpaceSeparatedIntegers(inputLines.shift());

const adjacencyList = Array.from({ length: mountainHeights.length }, () => []);

for (const connectionEntry of inputLines) {
  const [firstNodeIndex, secondNodeIndex] = parseSpaceSeparatedIntegers(connectionEntry, -1);

  adjacencyList[firstNodeIndex].push(secondNodeIndex);
  adjacencyList[secondNodeIndex].push(firstNodeIndex);
}

let totalPeakCount = 0;

for (let currentMountainIdx = 0; currentMountainIdx < mountainHeights.length; currentMountainIdx++) {
  const heightOfCurrentMountain = mountainHeights[currentMountainIdx];
  const neighborsOfCurrentMountain = adjacencyList[currentMountainIdx];

  const isCurrentMountainAPeak = neighborsOfCurrentMountain.every(neighborIdx => {
    const heightOfNeighbor = mountainHeights[neighborIdx];
    return heightOfCurrentMountain > heightOfNeighbor;
  });

  if (isCurrentMountainAPeak) {
    totalPeakCount++;
  }
}

console.log(totalPeakCount);
