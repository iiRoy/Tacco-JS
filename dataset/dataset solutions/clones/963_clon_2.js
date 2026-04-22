const systemOptions = { dataSource: '/dev/stdin', lineSeparator: '\n' }; // Settings for POSIX-compliant systems.

 const rawInputLines = require('node:fs').readFileSync(systemOptions.dataSource, 'ascii')
  .trim()
  .split(systemOptions.lineSeparator);

 let numVertices = Number(rawInputLines.shift());

 const graphNodes = {};
 const linkWeights = {};

 function incorporateConnection(collectionMap, sourceKey, targetKey, connectionCost) {
  if (!collectionMap.hasOwnProperty(sourceKey)) {
   collectionMap[sourceKey] = {};
  }
  collectionMap[sourceKey][targetKey] = connectionCost;
 }

 for (let currentLineIndex in rawInputLines) {
  const currentSegmentData = rawInputLines[currentLineIndex].split(' ').map(Number);
  const currentSourceNodeIdentifier = currentSegmentData[0];
  graphNodes[currentSourceNodeIdentifier] = { 'nodeId': currentSourceNodeIdentifier, 'distanceEstimate': Infinity, 'pathPredecessor': null };
  for (let dataOffset = 2; dataOffset < currentSegmentData.length; dataOffset += 2) {
   incorporateConnection(linkWeights, currentSourceNodeIdentifier, currentSegmentData[dataOffset], currentSegmentData[dataOffset+1]);
  }
 }

 for (let nodeIdIter in graphNodes) {
  if (graphNodes[nodeIdIter].nodeId === 0) {
   graphNodes[nodeIdIter].distanceEstimate = 0;
   break;
  }
 }


 function updatePathEstimate(currentNodeObject, neighborNodeObject, allWeights) {
  if (neighborNodeObject.distanceEstimate > currentNodeObject.distanceEstimate + allWeights[currentNodeObject.nodeId][neighborNodeObject.nodeId]) {
   neighborNodeObject.distanceEstimate = currentNodeObject.distanceEstimate + allWeights[currentNodeObject.nodeId][neighborNodeObject.nodeId];
   neighborNodeObject.pathPredecessor = currentNodeObject;
  }
 }

 function computeShortestPaths(weightMapping) {
  let finalizedNodes = [], nodeIterator, priorityQueue, currentOptimalNode;
  priorityQueue = [];
  for (nodeIterator in graphNodes) {
   priorityQueue.push(graphNodes[nodeIterator]);
  }
  while (priorityQueue.length !== 0) {
   priorityQueue.sort(function (nodeAlpha, nodeBeta) { return nodeBeta.distanceEstimate - nodeAlpha.distanceEstimate; });
   currentOptimalNode = priorityQueue.pop();
   finalizedNodes.push(currentOptimalNode);
   for (let adjacentNodeIdentifier in weightMapping[currentOptimalNode.nodeId]) {
    let adjacentNodeObject = graphNodes[adjacentNodeIdentifier];
    updatePathEstimate(currentOptimalNode, adjacentNodeObject, weightMapping);
   }
  }
 }

 computeShortestPaths(linkWeights);

 for (let finalNodeId in graphNodes) {
  console.log("%s %d", finalNodeId, graphNodes[finalNodeId].distanceEstimate);
 }