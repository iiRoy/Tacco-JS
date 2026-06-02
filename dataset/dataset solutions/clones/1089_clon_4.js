const ioConfig = { input: '/dev/stdin', newline: '\n' };

const fileContent = require('fs').readFileSync(ioConfig.input, 'ascii');
const rawInputLines = fileContent.trim().split(ioConfig.newline);

rawInputLines.shift();

const binaryTreeNodes = new Map();
const allNodeIdentifiers = new Set();
const childNodeIdentifiers = new Set();

for (const nodeLine of rawInputLines) {
  const nodeParts = nodeLine.split(' ');
  const currentIdentifier = nodeParts[0];
  const leftChildIdentifier = nodeParts[1];
  const rightChildIdentifier = nodeParts[2];

  binaryTreeNodes.set(currentIdentifier, {
    left: leftChildIdentifier,
    right: rightChildIdentifier
  });
  allNodeIdentifiers.add(currentIdentifier);

  if (leftChildIdentifier !== '-1') {
    childNodeIdentifiers.add(leftChildIdentifier);
  }
  if (rightChildIdentifier !== '-1') {
    childNodeIdentifiers.add(rightChildIdentifier);
  }
}

let treeRootIdentifier;
for (const identifier of allNodeIdentifiers) {
  if (!childNodeIdentifiers.has(identifier)) {
    treeRootIdentifier = identifier;
    break;
  }
}

function performPreorderTraversal(startNodeIdentifier) {
  const traversalOutput = [];
  if (!startNodeIdentifier || !binaryTreeNodes.has(startNodeIdentifier)) {
    return traversalOutput;
  }

  const processingStack = [startNodeIdentifier];

  while (processingStack.length > 0) {
    const currentIdentifier = processingStack.pop();
    traversalOutput.push(currentIdentifier);

    const currentNode = binaryTreeNodes.get(currentIdentifier);
    if (currentNode.right !== '-1') {
      processingStack.push(currentNode.right);
    }
    if (currentNode.left !== '-1') {
      processingStack.push(currentNode.left);
    }
  }
  return traversalOutput;
}

function performInorderTraversal(startNodeIdentifier) {
  const traversalOutput = [];
  if (!startNodeIdentifier || !binaryTreeNodes.has(startNodeIdentifier)) {
    return traversalOutput;
  }

  const processingStack = [];
  let currentIdentifier = startNodeIdentifier;

  while (currentIdentifier !== '-1' || processingStack.length > 0) {
    while (currentIdentifier !== '-1') {
      processingStack.push(currentIdentifier);
      const currentNode = binaryTreeNodes.get(currentIdentifier);
      currentIdentifier = currentNode.left;
    }

    currentIdentifier = processingStack.pop();
    traversalOutput.push(currentIdentifier);

    const currentNode = binaryTreeNodes.get(currentIdentifier);
    currentIdentifier = currentNode.right;
  }
  return traversalOutput;
}

function performPostorderTraversal(startNodeIdentifier) {
  const traversalOutput = [];
  if (!startNodeIdentifier || !binaryTreeNodes.has(startNodeIdentifier)) {
    return traversalOutput;
  }

  const stackOne = [startNodeIdentifier];
  const stackTwo = [];

  while (stackOne.length > 0) {
    const currentIdentifier = stackOne.pop();
    stackTwo.push(currentIdentifier);

    const currentNode = binaryTreeNodes.get(currentIdentifier);
    if (currentNode.left !== '-1') {
      stackOne.push(currentNode.left);
    }
    if (currentNode.right !== '-1') {
      stackOne.push(currentNode.right);
    }
  }

  while (stackTwo.length > 0) {
    traversalOutput.push(stackTwo.pop());
  }
  return traversalOutput;
}

console.log('Preorder');
console.log(performPreorderTraversal(treeRootIdentifier).join(' '));

console.log('Inorder');
console.log(performInorderTraversal(treeRootIdentifier).join(' '));

console.log('Postorder');
console.log(performPostorderTraversal(treeRootIdentifier).join(' '));
