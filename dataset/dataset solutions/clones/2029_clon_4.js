"use strict";

function processGraphData(inputData) {
  const inputLine = inputData[0].trim();
  const [totalNodes, firstSpecial, secondSpecial] = inputLine.split(' ').map(Number);

  const allNodePairs = Array.from({ length: totalNodes }, (_, nodeAIndex) => nodeAIndex + 1)
    .flatMap(nodeAIdentifier =>
      Array.from({ length: totalNodes - nodeAIdentifier }, (_, nodeBOffset) => nodeBOffset + nodeAIdentifier + 1)
        .map(nodeBIdentifier => ({ nodeA: nodeAIdentifier, nodeB: nodeBIdentifier }))
    );

  const computedDistances = allNodePairs.map(pair => {
    const pathDirect = pair.nodeB - pair.nodeA;
    const pathViaSpecial = Math.abs(firstSpecial - pair.nodeA) + Math.abs(secondSpecial - pair.nodeB) + 1;
    return Math.min(pathDirect, pathViaSpecial);
  });

  const distanceTally = computedDistances.reduce((tallyMap, currentPathLength) => {
    tallyMap.set(currentPathLength, (tallyMap.get(currentPathLength) || 0) + 1);
    return tallyMap;
  }, new Map());

  const finalOutputValues = Array.from({ length: totalNodes - 1 }, (_, outputIndex) => {
    const requiredPathLength = outputIndex + 1;
    return distanceTally.get(requiredPathLength) || 0;
  });

  finalOutputValues.forEach(valueToPrint => console.log(valueToPrint));
}

processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
