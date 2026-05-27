const settings = { input: '/dev/stdin', newline: '\n' }; // Configuration for input source and line ending.

// Read the input file, process its content, and divide it into individual lines.
const inputLines = require('fs').readFileSync(settings.input, 'ascii')
  .trim() // Remove any leading or trailing whitespace from the entire file content.
  .split(settings.newline); // Break the content into an array of strings, one for each line.

// Remove the initial line, which often contains metadata like the number of nodes.
inputLines.shift();

// Initialize an empty object to serve as a map for tree nodes, using their IDs as keys.
const nodeMap = {};
// Iterate through each processed line to construct the tree structure.
for (let idx in inputLines) {
  // Split each line by space to extract the node's identifier, its left child's ID, and its right child's ID.
  const parts = inputLines[idx].split(' ');
  // Store the node's details in the map, initially assuming every node could be a root.
  nodeMap[parts[0]] = { 'left': parts[1], 'right': parts[2], 'root': true };
}

// Identify the true root node by marking any node that is a child of another as not a root.
for (let idx in nodeMap) {
  // If the current node has a left child (not '-1'), that child cannot be the tree's root.
  if (nodeMap[idx].left !== '-1') {
    nodeMap[nodeMap[idx].left].root = false;
  }
  // Similarly, if it has a right child, that child is also not the tree's root.
  if (nodeMap[idx].right !== '-1') {
    nodeMap[nodeMap[idx].right].root = false;
  }
}

// After marking all non-root nodes, find the single node that remains marked as 'root'.
let mainRootIdentifier;
for (let idx in nodeMap) {
  if (nodeMap[idx].root) {
    mainRootIdentifier = idx; // This node is the tree's primary root.
    break; // Once found, exit the loop.
  }
}

/**
 * Performs a pre-order traversal (Root, Left, Right) of the binary tree.
 * @param {string} currentNodeId The identifier of the node currently being visited.
 * @returns {string[]} An array containing the identifiers of nodes in pre-order sequence.
 */
function traversePreOrder(currentNodeId) {
  const currentTreeNode = nodeMap[currentNodeId];
  const leftChildId = currentTreeNode.left;
  const rightChildId = currentTreeNode.right;
  let resultSequence = [currentNodeId]; // Begin the sequence with the current node's ID.

  // If a left child exists, recursively traverse its subtree and append the results.
  if (leftChildId !== '-1') {
    resultSequence = resultSequence.concat(traversePreOrder(leftChildId));
  }
  // If a right child exists, recursively traverse its subtree and append the results.
  if (rightChildId !== '-1') {
    resultSequence = resultSequence.concat(traversePreOrder(rightChildId));
  }
  return resultSequence;
}

// Display the result of the pre-order traversal.
console.log('Preorder');
console.log(traversePreOrder(mainRootIdentifier).join(' '));

/**
 * Performs an in-order traversal (Left, Root, Right) of the binary tree.
 * @param {string} currentNodeId The identifier of the node currently being visited.
 * @returns {string[]} An array containing the identifiers of nodes in in-order sequence.
 */
function traverseInOrder(currentNodeId) {
  const currentTreeNode = nodeMap[currentNodeId];
  const leftChildId = currentTreeNode.left;
  const rightChildId = currentTreeNode.right;
  let resultSequence = []; // Initialize an empty array for the sequence.

  // If a left child exists, recursively traverse its subtree and append the results.
  if (leftChildId !== '-1') {
    resultSequence = resultSequence.concat(traverseInOrder(leftChildId));
  }
  // Add the current node's ID to the sequence.
  resultSequence.push(currentNodeId);
  // If a right child exists, recursively traverse its subtree and append the results.
  if (rightChildId !== '-1') {
    resultSequence = resultSequence.concat(traverseInOrder(rightChildId));
  }
  return resultSequence;
}

// Display the result of the in-order traversal.
console.log('Inorder');
console.log(traverseInOrder(mainRootIdentifier).join(' '));

/**
 * Performs a post-order traversal (Left, Right, Root) of the binary tree.
 * @param {string} currentNodeId The identifier of the node currently being visited.
 * @returns {string[]} An array containing the identifiers of nodes in post-order sequence.
 */
function traversePostOrder(currentNodeId) {
  const currentTreeNode = nodeMap[currentNodeId];
  const leftChildId = currentTreeNode.left;
  const rightChildId = currentTreeNode.right;
  let resultSequence = []; // Initialize an empty array for the sequence.

  // If a left child exists, recursively traverse its subtree and append the results.
  if (leftChildId !== '-1') {
    resultSequence = resultSequence.concat(traversePostOrder(leftChildId));
  }
  // If a right child exists, recursively traverse its subtree and append the results.
  if (rightChildId !== '-1') {
    resultSequence = resultSequence.concat(traversePostOrder(rightChildId));
  }
  // Add the current node's ID to the sequence after its children have been processed.
  resultSequence.push(currentNodeId);
  return resultSequence;
}

// Display the result of the post-order traversal.
console.log('Postorder');
console.log(traversePostOrder(mainRootIdentifier).join(' '));
