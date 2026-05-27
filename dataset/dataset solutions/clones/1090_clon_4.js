config = { input: '/dev/stdin', newline: '\n' }; // linux

const rawInput = require('fs').readFileSync(config.input, 'ascii');
const inputLines = rawInput
  .trim()
  .split(config.newline);

inputLines.shift();

const nodeData = new Map(); // Maps node ID to an object { left: childId, right: childId }
const childNodeIds = new Set(); // Stores all IDs that appear as a child

for (const lineEntry of inputLines) {
  const parts = lineEntry.split(' ');
  const parentId = parts[0];
  const leftChild = parts[1];
  const rightChild = parts[2];

  nodeData.set(parentId, { left: leftChild, right: rightChild });

  if (leftChild !== '-1') {
    childNodeIds.add(leftChild);
  }
  if (rightChild !== '-1') {
    childNodeIds.add(rightChild);
  }
}

let mainRootIdentifier = null;
for (const nodeId of nodeData.keys()) {
  if (!childNodeIds.has(nodeId)) {
    mainRootIdentifier = nodeId;
    break;
  }
}


function traversePreOrder(startNodeId) {
  const traversalResult = [];
  const processingStack = [startNodeId];

  while (processingStack.length > 0) {
    const currentIdentifier = processingStack.pop();
    traversalResult.push(currentIdentifier);

    const currentChildren = nodeData.get(currentIdentifier);
    if (currentChildren.right !== '-1') {
      processingStack.push(currentChildren.right);
    }
    if (currentChildren.left !== '-1') {
      processingStack.push(currentChildren.left);
    }
  }
  return traversalResult;
}

console.log('Preorder');
console.log(' ' + traversePreOrder(mainRootIdentifier).join(' '));


function traverseInOrder(startNodeId) {
  const traversalResult = [];
  const processingStack = [];
  let currentIdentifier = startNodeId;

  while (currentIdentifier !== '-1' || processingStack.length > 0) {
    while (currentIdentifier !== '-1') {
      processingStack.push(currentIdentifier);
      currentIdentifier = nodeData.get(currentIdentifier).left;
    }
    currentIdentifier = processingStack.pop();
    traversalResult.push(currentIdentifier);
    currentIdentifier = nodeData.get(currentIdentifier).right;
  }
  return traversalResult;
}

console.log('Inorder');
console.log(' ' + traverseInOrder(mainRootIdentifier).join(' '));


function traversePostOrder(startNodeId) {
  const traversalResult = [];
  const stackOne = [startNodeId];
  const stackTwo = [];

  while (stackOne.length > 0) {
    const currentIdentifier = stackOne.pop();
    stackTwo.push(currentIdentifier);

    const currentChildren = nodeData.get(currentIdentifier);
    if (currentChildren.left !== '-1') {
      stackOne.push(currentChildren.left);
    }
    if (currentChildren.right !== '-1') {
      stackOne.push(currentChildren.right);
    }
  }

  while (stackTwo.length > 0) {
    traversalResult.push(stackTwo.pop());
  }
  return traversalResult;
}

console.log('Postorder');
console.log(' ' + traversePostOrder(mainRootIdentifier).join(' '));
