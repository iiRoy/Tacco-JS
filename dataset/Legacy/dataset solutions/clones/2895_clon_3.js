'use strict'

function parseAndSortNumericString(numericString) {
  const parsedNumbers = numericString.split(" ").map(Number);
  parsedNumbers.sort((valA, valB) => valB - valA);
  return parsedNumbers;
}

function processGraphData(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const numNodes = Number(inputLines[0]);

  const edgeConnections = inputLines.slice(1, numNodes).map(line => line.split(" "));

  const initialValues = parseAndSortNumericString(inputLines[numNodes]);

  const maxValue = initialValues[0];
  const totalSum = initialValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  const totalSumMinusMax = totalSum - maxValue;
  console.log(totalSumMinusMax);

  const graphNodes = Array.from({ length: numNodes }, (_, nodeIdx) => ({ originalIndex: nodeIdx + 1 }));

  for (let edgeIdx = 0; edgeIdx < numNodes - 1; edgeIdx++) {
    const sourceNodeId = Number(edgeConnections[edgeIdx][0]) - 1;
    const targetNodeId = Number(edgeConnections[edgeIdx][1]) - 1;

    if (graphNodes[sourceNodeId].depthLevel === undefined) {
      graphNodes[sourceNodeId].depthLevel = 0;
    }
    graphNodes[targetNodeId].depthLevel = graphNodes[sourceNodeId].depthLevel + 1;
  }

  graphNodes.sort((nodeA, nodeB) => nodeA.depthLevel - nodeB.depthLevel);

  const resultOrder = new Array(numNodes);
  for (let sortedIdx = 0; sortedIdx < numNodes; sortedIdx++) {
    const originalPosition = graphNodes[sortedIdx].originalIndex - 1;
    resultOrder[originalPosition] = initialValues[sortedIdx];
  }

  console.log(resultOrder.join(" "));
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
