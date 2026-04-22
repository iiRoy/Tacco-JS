'use strict'

const processInput = (rawData) => {
  const lineSeries = rawData.trim().split('\n');

  const graphSize = Number(lineSeries.shift());
  
  const connectionDetails = lineSeries.slice(0, graphSize - 1).map(line => 
    line.split(' ').map(Number)
  );
  
  const numericValues = lineSeries[graphSize - 1].split(' ').map(Number);
  numericValues.sort((vA, vB) => vB - vA); // Descending order

  const cumulativeValueMinusMax = numericValues.reduce((accumulator, current) => accumulator + current, 0) - numericValues[0];
  console.log(cumulativeValueMinusMax);

  const levelMapping = new Map();
  const nodeStructure = Array.from({ length: graphSize }, (_, idx) => ({
    identifier: idx + 1,
    depth: undefined
  }));

  for (const [origin, destination] of connectionDetails) {
    if (!levelMapping.has(origin)) {
      levelMapping.set(origin, 0);
    }
    levelMapping.set(destination, levelMapping.get(origin) + 1);
  }

  nodeStructure.forEach(item => {
    if (levelMapping.has(item.identifier)) {
      item.depth = levelMapping.get(item.identifier);
    }
  });

  const retrieveDepth = (nodeItem) => (nodeItem.depth === undefined ? Number.MAX_SAFE_INTEGER : nodeItem.depth);
  
  nodeStructure.sort((itemA, itemB) => retrieveDepth(itemA) - retrieveDepth(itemB));

  const finalArrangement = new Array(graphSize);
  for (let i = 0; i < graphSize; i++) {
    finalArrangement[nodeStructure[i].identifier - 1] = numericValues[i];
  }
  
  console.log(finalArrangement.join(' '));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));