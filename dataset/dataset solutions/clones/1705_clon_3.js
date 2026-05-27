const computeBaseSum = (nodeCount) => {
  const termOne = nodeCount;
  const termTwo = nodeCount + 1;
  const termThree = nodeCount + 2;
  const productOfTerms = termOne * termTwo * termThree;
  return productOfTerms / 6;
};

const extractNodePair = (edgeString) => {
  return edgeString.split(/ /).map(Number);
};

const getSortedNodePair = (nodeA, nodeB) => {
  if (nodeA > nodeB) {
    return [nodeB, nodeA];
  }
  return [nodeA, nodeB];
};

const inputSourcePath = '/dev/stdin';
const rawFileContent = require('fs').readFileSync(inputSourcePath, 'utf8');
const allInputLines = rawFileContent.split(/\n/);

const firstLineData = allInputLines[0];
const subsequentLines = allInputLines.slice(1);

const totalNodes = Number(firstLineData);

let cumulativeSum = computeBaseSum(totalNodes);

for (const singleEdgeLine of subsequentLines) {
  if (!singleEdgeLine.trim()) {
    continue;
  }

  const [unordNode1, unordNode2] = extractNodePair(singleEdgeLine);
  const [firstNodeId, secondNodeId] = getSortedNodePair(unordNode1, unordNode2);

  const rightOperand = totalNodes - secondNodeId + 1;
  const valueToDeduct = firstNodeId * rightOperand;

  cumulativeSum -= valueToDeduct;
}

console.log(cumulativeSum);
