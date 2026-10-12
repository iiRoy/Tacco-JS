function cacheFunction(originalFunc) {
  // This object stores computed results to avoid redundant calculations.
  const memoStorage = {};

  // Return a new function that wraps the original function.
  return (...inputArgs) => {
    // Check if the result for these arguments is already in the cache.
    const cachedResult = memoStorage[inputArgs];

    // If the result is not found (or is explicitly undefined),
    // compute it using the original function and store it.
    if (typeof cachedResult === 'undefined') {
      const computedValue = originalFunc(...inputArgs);
      memoStorage[inputArgs] = computedValue;
      return computedValue;
    } else {
      // Otherwise, return the cached result directly.
      return cachedResult;
    }
  };
}

// Represents a single node within the tree structure.
class TreeNode {
  /**
   * Constructs a new tree node.
   * @param {number} nodeId - The unique identifier for this node.
   * @param {number} parentRef - The identifier of the parent node, or -1 if root.
   * @param {number} leftChildRef - The identifier of the left child, or -1 if none.
   * @param {number} rightChildRef - The identifier of the right child, or -1 if none.
   */
  constructor(nodeId, parentRef, leftChildRef, rightChildRef) {
    this.nodeId = nodeId;
    this.parentRef = parentRef;
    this.leftChildRef = leftChildRef;
    this.rightChildRef = rightChildRef;
  }

  // A getter to determine the type of the node based on its connections.
  get getNodeType() {
    if (this.parentRef === -1) {
      return 'root'; // Node has no parent.
    } else if (this.leftChildRef === -1 && this.rightChildRef === -1) {
      return 'leaf'; // Node has no children.
    } else {
      return 'internal node'; // Node has a parent and at least one child.
    }
  }
}

// Manages the collection of tree nodes and provides tree-specific operations.
class TreeStructure {
  constructor() {
    // An array to store TreeNode instances, indexed by their ID.
    this.nodeCollection = [];
    // An array to store additional computed information about each node.
    this.nodeDetails = [];

    // Memoize the depth and height calculation methods for performance.
    // Binding 'this' ensures the methods operate on the correct instance.
    this.calculateDepth = cacheFunction(this.calculateDepth.bind(this));
    this.determineHeight = cacheFunction(this.determineHeight.bind(this));
  }

  // Static getter to provide access to the TreeNode class.
  static get NodeElement() {
    return TreeNode;
  }

  /**
   * Adds a new node to the tree structure.
   * @param {number} nodeIdentifier - The ID of the node to add.
   * @param {number} leftIdentifier - The ID of its left child.
   * @param {number} rightIdentifier - The ID of its right child.
   */
  insertNode(nodeIdentifier, leftIdentifier, rightIdentifier) {
    // Create a new TreeNode and store it at its ID index.
    this.nodeCollection[nodeIdentifier] = new TreeStructure.NodeElement(nodeIdentifier, -1, leftIdentifier, rightIdentifier);
  }

  // Establishes parent-child and sibling relationships between nodes.
  establishConnections() {
    // Initialize node details for all potential nodes.
    for (let idx = 0; idx < this.nodeCollection.length; ++idx) {
      this.nodeDetails[idx] = {
        nodeElement: null,
        siblingRef: -1,
        nodeDegree: 0
      };
    }

    // First pass: Set parent IDs and initial sibling references.
    this.nodeCollection.forEach(currentNode => {
      if (currentNode.leftChildRef !== -1) {
        this.nodeCollection[currentNode.leftChildRef].parentRef = currentNode.nodeId;
        this.nodeDetails[currentNode.leftChildRef].siblingRef = currentNode.rightChildRef;
      }
      if (currentNode.rightChildRef !== -1) {
        this.nodeCollection[currentNode.rightChildRef].parentRef = currentNode.nodeId;
        this.nodeDetails[currentNode.rightChildRef].siblingRef = currentNode.leftChildRef;
      }
    });

    // Second pass: Populate full node details including degree.
    this.nodeCollection.forEach(currentNode => {
      // Calculate degree: 1 if left child exists, 1 if right child exists.
      const currentDegree = (currentNode.leftChildRef !== -1 ? 1 : 0) + (currentNode.rightChildRef !== -1 ? 1 : 0);
      this.nodeDetails[currentNode.nodeId] = {
        siblingRef: this.nodeDetails[currentNode.nodeId].siblingRef, // Keep sibling from first pass
        nodeElement: currentNode,
        nodeDegree: currentDegree
      };
    });
  }

  /**
   * Recursively calculates the depth of a given node.
   * @param {number} nodeId - The ID of the node.
   * @param {number} currentDepth - The current depth level (starts at 0 for the initial call).
   * @returns {number} The depth of the node.
   */
  calculateDepth(nodeId, currentDepth = 0) {
    const parentIdentifier = this.retrieveNode(nodeId).parentRef;
    // If parent is -1, it's the root, so return current depth.
    // Otherwise, recurse with parent and incremented depth.
    return parentIdentifier === -1 ? currentDepth : this.calculateDepth(parentIdentifier, currentDepth + 1);
  }

  /**
   * Recursively determines the height of a subtree rooted at a given node.
   * @param {number} nodeId - The ID of the node.
   * @param {number} currentHeight - The current height level (starts at 0 for the initial call).
   * @returns {number} The height of the subtree.
   */
  determineHeight(nodeId, currentHeight = 0) {
    // Base case: If node ID is -1 (null child), return height - 1.
    if (nodeId === -1) {
      return currentHeight - 1;
    }
    const targetNode = this.retrieveNode(nodeId);
    const [leftNodeId, rightNodeId] = [targetNode.leftChildRef, targetNode.rightChildRef];

    // Recursively find the height of left and right subtrees, then take the maximum.
    return Math.max(this.determineHeight(leftNodeId, currentHeight + 1), this.determineHeight(rightNodeId, currentHeight + 1));
  }

  /**
   * Retrieves a node by its ID.
   * @param {number} nodeId - The ID of the node to find.
   * @returns {TreeNode} The found TreeNode instance.
   */
  retrieveNode(nodeId) {
    return this.nodeCollection[nodeId];
  }

  // Prints detailed information for each node in the tree.
  displayTreeInfo() {
    const formattedOutput = this.nodeDetails.map(nodeObject =>
      // Construct a string for each node with its properties.
      `node ${nodeObject.nodeElement.nodeId}: parent = ${nodeObject.nodeElement.parentRef}, sibling = ${nodeObject.siblingRef}, degree = ${nodeObject.nodeDegree}, depth = ${this.calculateDepth(nodeObject.nodeElement.nodeId)}, height = ${this.determineHeight(nodeObject.nodeElement.nodeId)}, ${nodeObject.nodeElement.getNodeType}`
    ).join('\n'); // Join all node strings with newlines.
    console.log(formattedOutput);
  }
}

// Immediately Invoked Function Expression (IIFE) to run the main logic.
(function initializeTreeProcessing() {
  // Read input from stdin, trim whitespace, and split into lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  // The first line contains the total number of nodes.
  const nodeCount = Number(inputLines.shift());

  // Create a new instance of our tree structure.
  let binaryTreeInstance = new TreeStructure();

  // Variables for node ID and child IDs (unused after parsing).
  let nodeIdVal, leftIdVal, rightIdVal;

  // Process each remaining line to add nodes to the tree.
  inputLines.map(lineData => lineData.split(' ').map(Number)).forEach(function(lineData) {
    // Use spread operator to pass the array elements as arguments to insertNode.
    binaryTreeInstance.insertNode(...lineData);
  });

  // After all nodes are added, establish their connections.
  binaryTreeInstance.establishConnections();
  // Finally, print the detailed information for all nodes.
  binaryTreeInstance.displayTreeInfo();
})();
