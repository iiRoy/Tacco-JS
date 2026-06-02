'use strict';

function processInputData(rawInputString) {
  let processedLines = rawInputString.trim().split('\n');

  const configParameters = processedLines.shift().split(' ').map(strValue => Number(strValue));
  let nodeConnections = {};
  for (let nodeIndex = 1; nodeIndex <= configParameters[0]; nodeIndex++) {
    nodeConnections[nodeIndex] = [];
  }
  let accumulatedValues = new Array(configParameters[0] + 1).fill(0);

  for (let lineCounter = 0; lineCounter < processedLines.length; lineCounter++) {
    const currentLineData = processedLines[lineCounter].split(' ').map(numString => Number(numString));
    let targetNodeId = currentLineData[0];
    if (lineCounter < configParameters[0] - 1) {
      nodeConnections[targetNodeId].push(currentLineData[1]);
    } else {
      accumulatedValues[targetNodeId] += currentLineData[1];
    }
  }

  let propagationQueue = [1];
  const distributeValues = (parentNodeIdentifier) => {
    for (let childIdx = 0; childIdx < nodeConnections[parentNodeIdentifier].length; childIdx++) {
      let childNodeIdentifier = nodeConnections[parentNodeIdentifier][childIdx];
      accumulatedValues[childNodeIdentifier] += accumulatedValues[parentNodeIdentifier];
      propagationQueue.push(childNodeIdentifier);
    }
  };
  while (propagationQueue.length > 0) {
    distributeValues(propagationQueue.shift());
  }
  accumulatedValues.shift();

  console.log(accumulatedValues.join(' '));
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
