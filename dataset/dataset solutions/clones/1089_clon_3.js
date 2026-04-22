const DATA_SOURCE_CONFIG = {
  inputPath: '/dev/stdin', // Specifies the standard input file path for Linux systems
  lineDelimiter: '\n'      // Defines the newline character to split input lines
};

// Represents the identifier for a non-existent child node in the tree structure
const NULL_CHILD_IDENTIFIER = '-1';

/**
 * Reads raw textual data from the specified input source.
 * Handles potential file reading errors and trims trailing whitespace.
 * @param {object} config - Configuration object containing inputPath and lineDelimiter.
 * @returns {Array<string>} An array of strings, where each string is a line from the input.
 */
const acquireRawDataSegments = (config) => {
  try {
    // Attempt to read the file synchronously, decode as ASCII,
    // remove trailing whitespace, and split into individual lines.
    return require('fs').readFileSync(config.inputPath, 'ascii')
      .trimEnd()
      .split(config.lineDelimiter);
  } catch (dataAcquisitionError) {
    // Log an error if file reading fails
    console.error("Error encountered while fetching input data:", dataAcquisitionError.message);
    return []; // Return an empty array to prevent further processing issues
  }
};

// Retrieve the initial set of lines from the configured data source
let rawInputDataSegments = acquireRawDataSegments(DATA_SOURCE_CONFIG);

// Remove the first line, which often contains metadata like the number of nodes
// and is not directly part of the tree definition.
if (rawInputDataSegments.length > 0) {
  rawInputDataSegments.shift();
}

/**
 * Defines the structure for a single node within the binary tree.
 */
class BinaryTreeNode {
  /**
   * Constructs a new BinaryTreeNode.
   * @param {string} id - The unique identifier for this node.
   * @param {string} leftChildId - The identifier of the left child node.
   * @param {string} rightChildId - The identifier of the right child node.
   */
  constructor(id, leftChildId, rightChildId) {
    this.nodeIdentifier = id;
    this.leftChildKey = leftChildId;
    this.rightChildKey = rightChildId;
  }
}

// A Map to store all tree nodes, keyed by their unique identifiers.
// This acts as the central registry for the entire tree structure.
const nodeRegistry = new Map();

// A Set to keep track of all node identifiers that appear as children.
// This helps in efficiently determining the root node later.
const encounteredChildKeys = new Set();

// Process each segment of raw input data to construct the tree nodes
for (const segment of rawInputDataSegments) {
  // Skip any empty or purely whitespace lines
  if (!segment.trim()) {
    continue;
  }

  // Split the line into components: current node ID, left child ID, right child ID
  const nodeParts = segment.split(' ');

  // Basic validation: ensure each line has exactly three components
  if (nodeParts.length !== 3) {
    // console.warn(`Skipping malformed input segment: "${segment}" - Expected 3 parts, got ${nodeParts.length}`);
    continue; // Move to the next segment if malformed
  }

  const [currentNodeID, leftChildRef, rightChildRef] = nodeParts;

  // Create a new BinaryTreeNode instance and add it to the registry
  const newTreeNode = new BinaryTreeNode(currentNodeID, leftChildRef, rightChildRef);
  nodeRegistry.set(currentNodeID, newTreeNode);

  // If the left child is not the NULL_CHILD_IDENTIFIER, add its key to the set of children
  if (leftChildRef !== NULL_CHILD_IDENTIFIER) {
    encounteredChildKeys.add(leftChildRef);
  }
  // Similarly for the right child
  if (rightChildRef !== NULL_CHILD_IDENTIFIER) {
    encounteredChildKeys.add(rightChildRef);
  }
}

let identifiedTreeRootKey = null;

// Determine the actual root of the tree. The root is the node that is present
// in the nodeRegistry but has never been identified as a child of any other node.
for (const [nodeKey, nodeObject] of nodeRegistry.entries()) {
  if (!encounteredChildKeys.has(nodeKey)) {
    identifiedTreeRootKey = nodeKey;
    break; // Assuming a valid binary tree has only one root
  }
}

// Guard clause: If no root is found but nodes exist, it might indicate a cyclic
// graph or disconnected components, or an empty tree.
if (identifiedTreeRootKey === null && nodeRegistry.size > 0) {
  // As a fallback for potentially malformed input or specific problem constraints,
  // we might designate the first node encountered as the root.
  // In a strictly valid binary tree, this scenario should ideally not occur.
  identifiedTreeRootKey = nodeRegistry.keys().next().value;
  // console.warn("No distinct root node identified. Defaulting to the first registered node as root.");
} else if (nodeRegistry.size === 0) {
  // Explicitly handle the case of an empty tree
  identifiedTreeRootKey = null;
}


// If no root could be established (e.g., empty input, or critical error),
// log a message and terminate further traversal attempts.
if (identifiedTreeRootKey === null) {
  console.log("No valid tree structure detected. Cannot perform traversals.");
  // process.exit(0); // Uncomment to exit the process entirely
  return; // Stop script execution for this block
}


/**
 * Helper function to check if a given node identifier refers to an existing, valid node.
 * @param {string} key - The identifier to check.
 * @returns {boolean} True if the key corresponds to a valid node, false otherwise.
 */
const isValidNodeReference = (key) => key !== NULL_CHILD_IDENTIFIER && nodeRegistry.has(key);

/**
 * Performs a Pre-order (Root, Left, Right) traversal of the binary tree.
 * @param {string} currentKey - The identifier of the node to start traversal from.
 * @returns {Array<string>} An array containing the identifiers of nodes in pre-order sequence.
 */
function performPreOrderTraversal(currentKey) {
  const traversalResult = [];
  const activeNode = nodeRegistry.get(currentKey);

  // Base case: if the node doesn't exist, return an empty array
  if (!activeNode) {
    return traversalResult;
  }

  // Visit the current node
  traversalResult.push(activeNode.nodeIdentifier);

  // Recursively traverse the left subtree
  if (isValidNodeReference(activeNode.leftChildKey)) {
    traversalResult.push(...performPreOrderTraversal(activeNode.leftChildKey));
  }

  // Recursively traverse the right subtree
  if (isValidNodeReference(activeNode.rightChildKey)) {
    traversalResult.push(...performPreOrderTraversal(activeNode.rightChildKey));
  }

  return traversalResult;
}

/**
 * Performs an In-order (Left, Root, Right) traversal of the binary tree.
 * @param {string} currentKey - The identifier of the node to start traversal from.
 * @returns {Array<string>} An array containing the identifiers of nodes in in-order sequence.
 */
function conductInOrderTraversal(currentKey) {
  const traversalResult = [];
  const activeNode = nodeRegistry.get(currentKey);

  // Base case: if the node doesn't exist, return an empty array
  if (!activeNode) {
    return traversalResult;
  }

  // Recursively traverse the left subtree
  if (isValidNodeReference(activeNode.leftChildKey)) {
    traversalResult.push(...conductInOrderTraversal(activeNode.leftChildKey));
  }

  // Visit the current node
  traversalResult.push(activeNode.nodeIdentifier);

  // Recursively traverse the right subtree
  if (isValidNodeReference(activeNode.rightChildKey)) {
    traversalResult.push(...conductInOrderTraversal(activeNode.rightChildKey));
  }

  return traversalResult;
}

/**
 * Performs a Post-order (Left, Right, Root) traversal of the binary tree.
 * @param {string} currentKey - The identifier of the node to start traversal from.
 * @returns {Array<string>} An array containing the identifiers of nodes in post-order sequence.
 */
function executePostOrderTraversal(currentKey) {
  const traversalResult = [];
  const activeNode = nodeRegistry.get(currentKey);

  // Base case: if the node doesn't exist, return an empty array
  if (!activeNode) {
    return traversalResult;
  }

  // Recursively traverse the left subtree
  if (isValidNodeReference(activeNode.leftChildKey)) {
    traversalResult.push(...executePostOrderTraversal(activeNode.leftChildKey));
  }

  // Recursively traverse the right subtree
  if (isValidNodeReference(activeNode.rightChildKey)) {
    traversalResult.push(...executePostOrderTraversal(activeNode.rightChildKey));
  }

  // Visit the current node
  traversalResult.push(activeNode.nodeIdentifier);

  return traversalResult;
}

// Display the results of the tree traversals
console.log('--- Binary Tree Traversal Sequences ---');

console.log('Preorder Sequence:');
console.log(performPreOrderTraversal(identifiedTreeRootKey).join(' '));

console.log('\nInorder Sequence:');
console.log(conductInOrderTraversal(identifiedTreeRootKey).join(' '));

console.log('\nPostorder Sequence:');
console.log(executePostOrderTraversal(identifiedTreeRootKey).join(' '));

console.log('--- End of Traversal Operations ---');