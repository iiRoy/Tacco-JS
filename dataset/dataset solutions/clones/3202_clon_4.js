'use strict'

const analyzeGraphInput = (rawGraphDescription) => {
  const edgesAsNumbers = rawGraphDescription
    .trim()
    .split('\n')
    .filter(Boolean)
    .flatMap(line => line.split(' ').map(Number));

  const nodeConnectionCounts = new Map();
  [1, 2, 3, 4].forEach(nodeId => nodeConnectionCounts.set(nodeId, 0));

  edgesAsNumbers.forEach(nodeIdentifier => {
    if (nodeConnectionCounts.has(nodeIdentifier)) {
      nodeConnectionCounts.set(nodeIdentifier, nodeConnectionCounts.get(nodeIdentifier) + 1);
    } else {
      // Handle cases where input might contain node IDs outside 1-4,
      // though the problem implies fixed 4 nodes.
      // For this problem, it will simply be ignored in the final length check.
      // Or, could initialize with all possible input nodes.
      // Given the original had a fixed-size array, we stick to fixed-size nodes 1-4.
    }
  });

  const vertexDegreeSequence = Array.from(nodeConnectionCounts.values());
  vertexDegreeSequence.sort((firstVal, secondVal) => firstVal - secondVal);

  const expectedPattern = [1, 1, 2, 2];

  const validationResult =
    vertexDegreeSequence.length === expectedPattern.length &&
    vertexDegreeSequence.every((val, idx) => val === expectedPattern[idx]);

  if (validationResult) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

const acquireInputAndProcess = (sourceFilePath) => {
  const fileSystemModule = require('fs');
  const rawInputData = fileSystemModule.readFileSync(sourceFilePath, 'utf8');
  analyzeGraphInput(rawInputData);
};

acquireInputAndProcess('/dev/stdin');