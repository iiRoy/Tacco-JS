'use strict';

const incrementNodeDegrees = (degreeCounts, nodeAIdentifier, nodeBIdentifier) => {
  const firstNodeIndex = parseInt(nodeAIdentifier, 10) - 1;
  const secondNodeIndex = parseInt(nodeBIdentifier, 10) - 1;
  degreeCounts[firstNodeIndex]++;
  degreeCounts[secondNodeIndex]++;
};

const checkExpectedDegreeSequence = (sortedDegreeValues) => {
  const targetPattern = [1, 1, 2, 2];
  if (sortedDegreeValues.length !== targetPattern.length) {
    return false;
  }
  for (let patternIndex = 0; patternIndex < targetPattern.length; patternIndex++) {
    if (sortedDegreeValues[patternIndex] !== targetPattern[patternIndex]) {
      return false;
    }
  }
  return true;
};

const analyzeGraphStructure = (rawInputData) => {
  const allInputLines = rawInputData.split('\n');
  const processedEdges = allInputLines.map(lineSegment => lineSegment.split(' '));

  const nodeConnectionCounts = new Array(4).fill(0); // For nodes 1, 2, 3, 4

  for (let edgeEntryIndex = 0; edgeEntryIndex < processedEdges.length; edgeEntryIndex++) {
    const currentEdgePair = processedEdges[edgeEntryIndex];
    const nodeOneId = currentEdgePair[0];
    const nodeTwoId = currentEdgePair[1];
    incrementNodeDegrees(nodeConnectionCounts, nodeOneId, nodeTwoId);
  }

  nodeConnectionCounts.sort((valueA, valueB) => valueA - valueB);

  if (checkExpectedDegreeSequence(nodeConnectionCounts)) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

analyzeGraphStructure(require('fs').readFileSync('/dev/stdin', 'utf8'));
