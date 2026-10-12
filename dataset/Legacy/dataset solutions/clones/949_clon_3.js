const appConfig = { input: '/dev/stdin', newline: '\n' };

const rawInputContent = require('fs').readFileSync(appConfig.input, 'ascii').trim();
const processedInputLines = rawInputContent.split(appConfig.newline).map(lineStr => lineStr.split(' ').map(Number));

const numNodes = processedInputLines[0][0];
const numEdges = processedInputLines[0][1];
const numQueries = processedInputLines[numEdges + 1][0];

let parentPointers = new Array(numNodes + 1).fill(null);

const getRoot = (nodeIdentifier) => {
  let currentNode = nodeIdentifier;
  while (parentPointers[currentNode] !== null) {
    currentNode = parentPointers[currentNode];
  }
  return currentNode;
};

for (let loopIndex = 1; loopIndex <= numEdges; loopIndex++) {
  const currentEdgeData = processedInputLines[loopIndex];
  const nodeA = currentEdgeData[0];
  const nodeB = currentEdgeData[1];

  const smallerNode = Math.min(nodeA, nodeB);
  const largerNode = Math.max(nodeA, nodeB);

  const rootOfSmallerNode = getRoot(smallerNode);

  parentPointers[largerNode] = rootOfSmallerNode;
}

for (let loopIndex = numEdges + 2; loopIndex < (numEdges + 2) + numQueries; loopIndex++) {
  const currentQueryData = processedInputLines[loopIndex];
  const queryNodeOne = currentQueryData[0];
  const queryNodeTwo = currentQueryData[1];

  const rootOne = getRoot(queryNodeOne);
  const rootTwo = getRoot(queryNodeTwo);

  console.log((rootOne === rootTwo) ? 'yes' : 'no');
}
