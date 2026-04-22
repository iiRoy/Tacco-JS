const fileSystemModule = require('fs');

const processingSettings = {
  sourcePath: '/dev/stdin',
  lineSeparator: '\n'
};

const NO_CHILD_MARKER = '-1';

let rawContentBuffer;
try {
  rawContentBuffer = fileSystemModule.readFileSync(processingSettings.sourcePath, 'utf8');
} catch (dataReadError) {
  console.error(`Failed to acquire input from ${processingSettings.sourcePath}: ${dataReadError.message}`);
  process.exit(1);
}

const rawInputLineSegments = rawContentBuffer.trim().split(processingSettings.lineSeparator);

const treeNodeInputEntries = rawInputLineSegments.slice(1);

const binaryTreeNodes = new Map();

function extractNodeDataFromLine(inputLineSegment) {
  const componentParts = inputLineSegment.split(' ');
  if (componentParts.length !== 3) {
    throw new Error(`Malformed node descriptor: "${inputLineSegment}". Expected 3 space-separated values.`);
  }
  return {
    nodeKey: componentParts[0],
    leftSubordinateKey: componentParts[1],
    rightSubordinateKey: componentParts[2]
  };
}

treeNodeInputEntries.forEach(entryString => {
  const nodeInfo = extractNodeDataFromLine(entryString);
  binaryTreeNodes.set(nodeInfo.nodeKey, {
    leftSubordinateKey: nodeInfo.leftSubordinateKey,
    rightSubordinateKey: nodeInfo.rightSubordinateKey,
    isCandidateRoot: true
  });
});

const nonRootIdentifiers = new Set();

for (const [nodeId, nodeDetails] of binaryTreeNodes.entries()) {
  if (nodeDetails.leftSubordinateKey !== NO_CHILD_MARKER) {
    nonRootIdentifiers.add(nodeDetails.leftSubordinateKey);
    const leftChildRef = binaryTreeNodes.get(nodeDetails.leftSubordinateKey);
    if (leftChildRef) leftChildRef.isCandidateRoot = false;
  }
  if (nodeDetails.rightSubordinateKey !== NO_CHILD_MARKER) {
    nonRootIdentifiers.add(nodeDetails.rightSubordinateKey);
    const rightChildRef = binaryTreeNodes.get(nodeDetails.rightSubordinateKey);
    if (rightChildRef) rightChildRef.isCandidateRoot = false;
  }
}

let primaryRootNodeIdentifier = null;
for (const [nodeId, nodeDetails] of binaryTreeNodes.entries()) {
  if (!nonRootIdentifiers.has(nodeId)) {
    primaryRootNodeIdentifier = nodeId;
    break;
  }
}

function performPreOrderTraversal(currentKey) {
  if (currentKey === NO_CHILD_MARKER || !binaryTreeNodes.has(currentKey)) {
    return [];
  }

  const currentTreeNode = binaryTreeNodes.get(currentKey);
  let accumulatedTraversalPath = [currentKey];

  const leftTraversalResult = performPreOrderTraversal(currentTreeNode.leftSubordinateKey);
  accumulatedTraversalPath = [...accumulatedTraversalPath, ...leftTraversalResult];

  const rightTraversalResult = performPreOrderTraversal(currentTreeNode.rightSubordinateKey);
  accumulatedTraversalPath = [...accumulatedTraversalPath, ...rightTraversalResult];

  return accumulatedTraversalPath;
}

function performInOrderTraversal(currentKey) {
  if (currentKey === NO_CHILD_MARKER || !binaryTreeNodes.has(currentKey)) {
    return [];
  }

  const currentTreeNode = binaryTreeNodes.get(currentKey);
  let accumulatedTraversalPath = [];

  accumulatedTraversalPath = [...accumulatedTraversalPath, ...performInOrderTraversal(currentTreeNode.leftSubordinateKey)];

  accumulatedTraversalPath.push(currentKey);

  accumulatedTraversalPath = [...accumulatedTraversalPath, ...performInOrderTraversal(currentTreeNode.rightSubordinateKey)];

  return accumulatedTraversalPath;
}

function performPostOrderTraversal(currentKey) {
  if (currentKey === NO_CHILD_MARKER || !binaryTreeNodes.has(currentKey)) {
    return [];
  }

  const currentTreeNode = binaryTreeNodes.get(currentKey);
  let accumulatedTraversalPath = [];

  accumulatedTraversalPath = [...accumulatedTraversalPath, ...performPostOrderTraversal(currentTreeNode.leftSubordinateKey)];

  accumulatedTraversalPath = [...accumulatedTraversalPath, ...performPostOrderTraversal(currentTreeNode.rightSubordinateKey)];

  accumulatedTraversalPath.push(currentKey);

  return accumulatedTraversalPath;
}

console.log('--- Binary Tree Traversal Report ---');

if (primaryRootNodeIdentifier === null) {
  console.error('CRITICAL ERROR: No singular root node could be identified. Traversal cannot proceed.');
  process.exit(1);
}

console.log('Pre-order Sequence:');
console.log(` ${performPreOrderTraversal(primaryRootNodeIdentifier).join(' ')}`);

console.log('In-order Sequence:');
console.log(` ${performInOrderTraversal(primaryRootNodeIdentifier).join(' ')}`);

console.log('Post-order Sequence:');
console.log(` ${performPostOrderTraversal(primaryRootNodeIdentifier).join(' ')}`);

console.log('--- End of Report ---');