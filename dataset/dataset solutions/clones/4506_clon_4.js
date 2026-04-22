'use strict'

function processInputPayload(payloadData) {
  const numericSequence = payloadData.split('\n').map(element => parseInt(element, 10));
  const stepBound = numericSequence[0];
  const connectionMap = numericSequence;
  const finalResult = navigateConnections(connectionMap, 1, 1, stepBound);
  console.log(finalResult);
}

function navigateConnections(networkLinks, currentPositionIndex, currentTraversalCount, maxTraversalLimit) {
  if (networkLinks[currentPositionIndex] === 2) {
    return currentTraversalCount;
  }
  if (currentTraversalCount >= maxTraversalLimit) {
    return -1;
  }
  const nextPositionIndex = networkLinks[currentPositionIndex];
  return navigateConnections(networkLinks, nextPositionIndex, currentTraversalCount + 1, maxTraversalLimit);
}

processInputPayload(require('fs').readFileSync('/dev/stdin', 'utf8'));