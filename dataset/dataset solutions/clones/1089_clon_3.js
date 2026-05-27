const inputSettings = { input: '/dev/stdin', newline: '\n' };
const NO_CHILD_MARKER = '-1';

const fileSystem = require('fs');
let inputLines = fileSystem.readFileSync(inputSettings.input, 'ascii')
  .trim()
  .split(inputSettings.newline);

const numberOfNodesLine = inputLines.shift();

const nodeMap = {};

const processNodeLine = (lineContent) => {
  const nodeParts = lineContent.split(' ');
  const [nodeIdentifier, leftChild, rightChild] = nodeParts;
  nodeMap[nodeIdentifier] = {
    left: leftChild,
    right: rightChild,
    isRoot: true
  };
};

for (const currentLine of inputLines) {
  processNodeLine(currentLine);
}

let treeRootIdentifier = null;

const updateRootStatus = (nodeEntry) => {
  if (nodeEntry.left !== NO_CHILD_MARKER) {
    nodeMap[nodeEntry.left].isRoot = false;
  }
  if (nodeEntry.right !== NO_CHILD_MARKER) {
    nodeMap[nodeEntry.right].isRoot = false;
  }
};

for (const nodeIdKey in nodeMap) {
  updateRootStatus(nodeMap[nodeIdKey]);
}

treeRootIdentifier = Object.keys(nodeMap).find(key => nodeMap[key].isRoot);

function performPreorderTraversal(currentNodeId) {
  const currentNodeData = nodeMap[currentNodeId];
  const leftChildId = currentNodeData.left;
  const rightChildId = currentNodeData.right;
  let traversalResult = [currentNodeId];

  if (leftChildId !== NO_CHILD_MARKER) {
    traversalResult = traversalResult.concat(performPreorderTraversal(leftChildId));
  }
  if (rightChildId !== NO_CHILD_MARKER) {
    traversalResult = traversalResult.concat(performPreorderTraversal(rightChildId));
  }
  return traversalResult;
}

function performInorderTraversal(currentNodeId) {
  const currentNodeData = nodeMap[currentNodeId];
  const leftChildId = currentNodeData.left;
  const rightChildId = currentNodeData.right;
  let traversalResult = [];

  if (leftChildId !== NO_CHILD_MARKER) {
    traversalResult = traversalResult.concat(performInorderTraversal(leftChildId));
  }
  traversalResult.push(currentNodeId);
  if (rightChildId !== NO_CHILD_MARKER) {
    traversalResult = traversalResult.concat(performInorderTraversal(rightChildId));
  }
  return traversalResult;
}

function performPostorderTraversal(currentNodeId) {
  const currentNodeData = nodeMap[currentNodeId];
  const leftChildId = currentNodeData.left;
  const rightChildId = currentNodeData.right;
  let traversalResult = [];

  if (leftChildId !== NO_CHILD_MARKER) {
    traversalResult = traversalResult.concat(performPostorderTraversal(leftChildId));
  }
  if (rightChildId !== NO_CHILD_MARKER) {
    traversalResult = traversalResult.concat(performPostorderTraversal(rightChildId));
  }
  traversalResult.push(currentNodeId);
  return traversalResult;
}

console.log('Preorder');
console.log(performPreorderTraversal(treeRootIdentifier).join(' '));

console.log('Inorder');
console.log(performInorderTraversal(treeRootIdentifier).join(' '));

console.log('Postorder');
console.log(performPostorderTraversal(treeRootIdentifier).join(' '));
