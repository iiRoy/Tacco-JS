let receivedInputLines = [];
const inputOutputInterface = require('readline');

const streamHandler = inputOutputInterface.createInterface({
  input: process.stdin,
  output: process.stdout,
});

streamHandler.on('line', function (singleRecord) {
  receivedInputLines.push(singleRecord);
});

streamHandler.on('close', function () {
  const nodeQuantity = Number(receivedInputLines[0]);
  receivedInputLines.shift();

  const graphEdges = receivedInputLines.map(lineData => lineData.split(" ").map(value => Number(value)));
  let pathCosts = Array(nodeQuantity).fill(Number.POSITIVE_INFINITY).map(() => Array(nodeQuantity).fill(Number.POSITIVE_INFINITY));

  for (let edgeIndex = 0; edgeIndex < nodeQuantity - 1; edgeIndex++) {
    const fromNode = graphEdges[edgeIndex][0];
    const toNode = graphEdges[edgeIndex][1];
    const edgeVal = graphEdges[edgeIndex][2];

    pathCosts[edgeIndex][edgeIndex] = 0;
    pathCosts[fromNode - 1][toNode - 1] = edgeVal;
    pathCosts[toNode - 1][fromNode - 1] = edgeVal;
  }
  pathCosts[nodeQuantity - 1][nodeQuantity - 1] = 0;

  let assignedLabels = Array(nodeQuantity).fill("");
  const initialVertex = 0;

  assignedLabels[initialVertex] = "0";
  let processingQueue = [[initialVertex, assignedLabels[initialVertex]]];

  while (processingQueue.length > 0) {
    const currentProcessingItem = processingQueue.pop();
    const currentVertex = currentProcessingItem[0];
    const currentVertexLabel = currentProcessingItem[1];

    for (let neighborIndex = 0; neighborIndex < nodeQuantity; neighborIndex++) {
      if (assignedLabels[neighborIndex] !== "" || pathCosts[currentVertex][neighborIndex] === Number.POSITIVE_INFINITY) {
        continue;
      }
      if (pathCosts[currentVertex][neighborIndex] % 2 === 0) {
        assignedLabels[neighborIndex] = currentVertexLabel;
        processingQueue.push([neighborIndex, assignedLabels[neighborIndex]]);
      }
      if (pathCosts[currentVertex][neighborIndex] % 2 === 1) {
        assignedLabels[neighborIndex] = (currentVertexLabel === "0" ? "1" : "0");
        processingQueue.push([neighborIndex, assignedLabels[neighborIndex]]);
      }
    }
  }
  for (let outputIndex = 0; outputIndex < assignedLabels.length; outputIndex++) {
    console.log(assignedLabels[outputIndex]);
  }
});