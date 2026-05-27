// Configuration for input source and line endings.
const settings = { input: '/dev/stdin', newline: '\n' }; // Standard Unix-like newline

// Read the entire input file, decode as ASCII, remove leading/trailing whitespace,
// and then split it into an array of individual lines based on the configured newline character.
const inputLines = require('fs').readFileSync(settings.input, 'ascii')
  .trim()
  .split(settings.newline);

// Discard the very first line of the input, as it's typically a count or header.
inputLines.shift();

// Initialize an empty object to store our tree structure.
// Each key will be a node's identifier, and its value will be an object
// containing its children and a flag indicating if it's a potential root.
const nodeMap = {};

// Iterate over each remaining line to parse node relationships.
for (let idx in inputLines) {
  // Split the current line by spaces to get node ID, left child, and right child.
  const parts = inputLines[idx].split(' ');
  // Store the node's children and initially mark it as a potential root.
  nodeMap[parts[0]] = { 'left': parts[1], 'right': parts[2], 'root': true };
}

// Second pass: Identify which nodes are NOT roots.
// If a node is referenced as a child of another node, it cannot be the overall root.
for (let idx in nodeMap) {
  // Check if the current node has a left child that is not a placeholder.
  if (nodeMap[idx].left !== '-1') {
    // If it does, mark that left child as not being a root.
    nodeMap[nodeMap[idx].left].root = false;
  }
  // Check if the current node has a right child that is not a placeholder.
  if (nodeMap[idx].right !== '-1') {
    // If it does, mark that right child as not being a root.
    nodeMap[nodeMap[idx].right].root = false;
  }
}

// Third pass: Find the single true root node.
// The root is the only node that remains marked as 'root: true' after the second pass.
let mainRootIdentifier;
for (let idx in nodeMap) {
  if (nodeMap[idx].root) {
    mainRootIdentifier = idx;
    break; // Found the root, no need to continue searching.
  }
}

/**
 * Performs a pre-order traversal of the tree.
 * (Root, Left, Right)
 * @param {string} nodeIdentifier The identifier of the current node.
 * @returns {string[]} An array of node identifiers in pre-order sequence.
 */
function traversePreOrder(nodeIdentifier) {
  const currentNode = nodeMap[nodeIdentifier];
  const leftChildIdentifier = currentNode.left;
  const rightChildIdentifier = currentNode.right;
  let resultSequence = [nodeIdentifier]; // Start with the current node (Root)

  // If there's a left child, recursively traverse it and append its sequence.
  if (leftChildIdentifier !== '-1') {
    resultSequence = resultSequence.concat(traversePreOrder(leftChildIdentifier));
  }
  // If there's a right child, recursively traverse it and append its sequence.
  if (rightChildIdentifier !== '-1') {
    resultSequence = resultSequence.concat(traversePreOrder(rightChildIdentifier));
  }
  return resultSequence;
}

// Output the pre-order traversal results.
console.log('Preorder');
console.log(' ' + traversePreOrder(mainRootIdentifier).join(' '));

/**
 * Performs an in-order traversal of the tree.
 * (Left, Root, Right)
 * @param {string} nodeIdentifier The identifier of the current node.
 * @returns {string[]} An array of node identifiers in in-order sequence.
 */
function traverseInOrder(nodeIdentifier) {
  const currentNode = nodeMap[nodeIdentifier];
  const leftChildIdentifier = currentNode.left;
  const rightChildIdentifier = currentNode.right;
  let resultSequence = [];

  // If there's a left child, recursively traverse it and append its sequence.
  if (leftChildIdentifier !== '-1') {
    resultSequence = resultSequence.concat(traverseInOrder(leftChildIdentifier));
  }
  // Add the current node after the left subtree (Root).
  resultSequence.push(nodeIdentifier);
  // If there's a right child, recursively traverse it and append its sequence.
  if (rightChildIdentifier !== '-1') {
    resultSequence = resultSequence.concat(traverseInOrder(rightChildIdentifier));
  }
  return resultSequence;
}

// Output the in-order traversal results.
console.log('Inorder');
console.log(' ' + traverseInOrder(mainRootIdentifier).join(' '));

/**
 * Performs a post-order traversal of the tree.
 * (Left, Right, Root)
 * @param {string} nodeIdentifier The identifier of the current node.
 * @returns {string[]} An array of node identifiers in post-order sequence.
 */
function traversePostOrder(nodeIdentifier) {
  const currentNode = nodeMap[nodeIdentifier];
  const leftChildIdentifier = currentNode.left;
  const rightChildIdentifier = currentNode.right;
  let resultSequence = [];

  // If there's a left child, recursively traverse it and append its sequence.
  if (leftChildIdentifier !== '-1') {
    resultSequence = resultSequence.concat(traversePostOrder(leftChildIdentifier));
  }
  // If there's a right child, recursively traverse it and append its sequence.
  if (rightChildIdentifier !== '-1') {
    resultSequence = resultSequence.concat(traversePostOrder(rightChildIdentifier));
  }
  // Add the current node after both subtrees (Root).
  resultSequence.push(nodeIdentifier);
  return resultSequence;
}

// Output the post-order traversal results.
console.log('Postorder');
console.log(' ' + traversePostOrder(mainRootIdentifier).join(' '));
