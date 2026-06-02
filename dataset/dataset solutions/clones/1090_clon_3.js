const appConfiguration = { input: '/dev/stdin', newline: '\n' }; // linux
const NO_CHILD_MARKER = '-1';
const FS_MODULE = require('fs');

/**
 * Reads and processes the input file based on the provided configuration.
 * @param {object} configObj - Configuration object with input path and newline character.
 * @returns {string[]} An array of processed input lines.
 */
function retrieveAndPrepareInput(configObj) {
  const fileContent = FS_MODULE.readFileSync(configObj.input, 'ascii');
  const trimmedContent = fileContent.trim();
  const splitLines = trimmedContent.split(configObj.newline);
  
  // Remove the first line as per original logic
  splitLines.shift(); 
  
  return splitLines;
}

const rawInputLines = retrieveAndPrepareInput(appConfiguration);

/**
 * Builds the tree structure from an array of input lines.
 * @param {string[]} lines - Array of strings, each defining a node.
 * @returns {object} An object representing the tree, where keys are node IDs.
 */
function constructNodeStructure(lines) {
  const nodeStructure = {};
  for (const lineEntry of lines) { // Using for...of for iteration
    const nodeDefinitionParts = lineEntry.split(' ');
    const nodeId = nodeDefinitionParts[0];
    const leftChild = nodeDefinitionParts[1];
    const rightChild = nodeDefinitionParts[2];
    
    nodeStructure[nodeId] = { 'left': leftChild, 'right': rightChild, 'isRootCandidate': true };
  }
  return nodeStructure;
}

const nodeStructure = constructNodeStructure(rawInputLines);

/**
 * Determines the actual root node identifier from the constructed tree structure.
 * @param {object} structure - The tree structure object.
 * @param {string} noChildMarker - The string representing a missing child.
 * @returns {string} The identifier of the root node.
 */
function identifyTreeRoot(structure, noChildMarker) {
  // Mark nodes that are children as not root candidates
  for (const nodeId in structure) {
    const currentTreeNode = structure[nodeId];
    if (currentTreeNode.left !== noChildMarker) {
      if (structure[currentTreeNode.left]) { // Ensure child node exists in structure
        structure[currentTreeNode.left].isRootCandidate = false;
      }
    }
    if (currentTreeNode.right !== noChildMarker) {
      if (structure[currentTreeNode.right]) { // Ensure child node exists in structure
        structure[currentTreeNode.right].isRootCandidate = false;
      }
    }
  }

  // Find the node that is still a root candidate
  for (const nodeId in structure) {
    if (structure[nodeId].isRootCandidate) {
      return nodeId;
    }
  }
  // This case should ideally not be reached if a valid tree is provided
  return null; 
}

const mainRootIdentifier = identifyTreeRoot(nodeStructure, NO_CHILD_MARKER);

// Helper to check if a child exists
const hasChild = (childId, marker) => childId !== marker;

/**
 * Performs a preorder traversal of the tree.
 * @param {string} nodeIdentifier - The ID of the current node.
 * @returns {string[]} An array of node IDs in preorder sequence.
 */
function performPreorderTraversal(nodeIdentifier) {
  const currentTreeNode = nodeStructure[nodeIdentifier];
  const leftNodeIdentifier = currentTreeNode.left;
  const rightNodeIdentifier = currentTreeNode.right;
  
  let pathSequence = [nodeIdentifier]; // Start with current node

  if (hasChild(leftNodeIdentifier, NO_CHILD_MARKER)) {
    pathSequence = [...pathSequence, ...performPreorderTraversal(leftNodeIdentifier)]; // Using spread syntax
  }
  if (hasChild(rightNodeIdentifier, NO_CHILD_MARKER)) {
    pathSequence = [...pathSequence, ...performPreorderTraversal(rightNodeIdentifier)]; // Using spread syntax
  }
  return pathSequence;
}

console.log('Preorder');
console.log(' ' + performPreorderTraversal(mainRootIdentifier).join(' '));

/**
 * Performs an inorder traversal of the tree.
 * @param {string} nodeIdentifier - The ID of the current node.
 * @returns {string[]} An array of node IDs in inorder sequence.
 */
function performInorderTraversal(nodeIdentifier) {
  const currentTreeNode = nodeStructure[nodeIdentifier];
  const leftNodeIdentifier = currentTreeNode.left;
  const rightNodeIdentifier = currentTreeNode.right;
  
  let pathSequence = [];

  if (hasChild(leftNodeIdentifier, NO_CHILD_MARKER)) {
    pathSequence = [...pathSequence, ...performInorderTraversal(leftNodeIdentifier)];
  }
  pathSequence.push(nodeIdentifier); // Current node in the middle
  if (hasChild(rightNodeIdentifier, NO_CHILD_MARKER)) {
    pathSequence = [...pathSequence, ...performInorderTraversal(rightNodeIdentifier)];
  }
  return pathSequence;
}

console.log('Inorder');
console.log(' ' + performInorderTraversal(mainRootIdentifier).join(' '));

/**
 * Performs a postorder traversal of the tree.
 * @param {string} nodeIdentifier - The ID of the current node.
 * @returns {string[]} An array of node IDs in postorder sequence.
 */
function performPostorderTraversal(nodeIdentifier) {
  const currentTreeNode = nodeStructure[nodeIdentifier];
  const leftNodeIdentifier = currentTreeNode.left;
  const rightNodeIdentifier = currentTreeNode.right;
  
  let pathSequence = [];

  if (hasChild(leftNodeIdentifier, NO_CHILD_MARKER)) {
    pathSequence = [...pathSequence, ...performPostorderTraversal(leftNodeIdentifier)];
  }
  if (hasChild(rightNodeIdentifier, NO_CHILD_MARKER)) {
    pathSequence = [...pathSequence, ...performPostorderTraversal(rightNodeIdentifier)];
  }
  pathSequence.push(nodeIdentifier); // Current node at the end
  return pathSequence;
}

console.log('Postorder');
console.log(' ' + performPostorderTraversal(mainRootIdentifier).join(' '));
