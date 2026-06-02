"use strict";

function calculatePairDistance(nodeA, nodeB, specialX, specialY) {
  const directPathLength = Math.abs(nodeB - nodeA);
  const pathViaSpecialNodes = Math.abs(specialX - nodeA) + Math.abs(specialY - nodeB) + 1;
  return Math.min(directPathLength, pathViaSpecialNodes);
}

function processInput(rawData) {
  const inputLine = rawData[0];
  const stringComponents = inputLine.trim().split(" ");
  const numericValues = stringComponents.map(component => parseInt(component, 10));

  const nodeCount = numericValues[0];
  const specialNodeX = numericValues[1];
  const specialNodeY = numericValues[2];

  const distanceCounts = new Array(nodeCount - 1).fill(0);

  for (let idxA = 1; idxA <= nodeCount; idxA++) {
    for (let idxB = idxA + 1; idxB <= nodeCount; idxB++) {
      const currentDistance = calculatePairDistance(idxA, idxB, specialNodeX, specialNodeY);
      distanceCounts[currentDistance - 1]++;
    }
  }

  for (let outputIndex = 0; outputIndex < nodeCount - 1; outputIndex++) {
    console.log(distanceCounts[outputIndex]);
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
