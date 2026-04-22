function processNetworkData(sourceData) {
  const dataSegments = sourceData.split('\n');
  const entityCount = parseInt(dataSegments.shift(), 10);

  const rawConnections = dataSegments
    .slice(0, dataSegments.length - 1)
    .map(line => line.split(' ').map(Number));

  const valuationSet = dataSegments[dataSegments.length - 1]
    .split(' ')
    .map(Number)
    .sort((a, b) => a - b);

  const connectionMetrics = new Map();
  Array.from({ length: entityCount }, (_, idx) => idx + 1)
    .forEach(nodeIdentifier => connectionMetrics.set(nodeIdentifier, 0));

  rawConnections.forEach(([nodeA, nodeB]) => {
    connectionMetrics.set(nodeA, connectionMetrics.get(nodeA) + 1);
    connectionMetrics.set(nodeB, connectionMetrics.get(nodeB) + 1);
  });

  const degreeList = Array.from(connectionMetrics.entries())
    .map(([nodeIdentifier, currentDegree]) => ({ nodeIdentifier, currentDegree }));

  const sortedDegreeList = degreeList.sort((itemA, itemB) => itemA.currentDegree - itemB.currentDegree);

  const entityValuations = new Map();
  sortedDegreeList.forEach((item, indexPosition) => {
    entityValuations.set(item.nodeIdentifier, valuationSet[indexPosition]);
  });

  const cumulativeValue = rawConnections.reduce((accumulator, [nodeA, nodeB]) => {
    return accumulator + Math.min(entityValuations.get(nodeA), entityValuations.get(nodeB));
  }, 0);

  console.log(String(cumulativeValue));

  const arrangedValuations = Array.from({ length: entityCount }, (_, idx) => idx + 1)
    .map(nodeIdentifier => entityValuations.get(nodeIdentifier));

  console.log(arrangedValuations.join(' '));
}

processNetworkData(require("fs").readFileSync("/dev/stdin", "utf8"));