function cacheFunction(originalFunc) {
  // A storage for memoized results
  const memoStore = {};

  // Return a new function that wraps the original
  return (...args) => {
    // Convert arguments to a string key for the cache
    const cacheKey = JSON.stringify(args); // Using JSON.stringify for key generation

    // Check if the result is already in the cache
    const cachedResult = memoStore[cacheKey];

    // If not cached, compute and store the result
    if (cachedResult === undefined) {
      const computedValue = originalFunc(...args);
      memoStore[cacheKey] = computedValue;
      return computedValue;
    } else {
      // If cached, return the stored result
      return cachedResult;
    }
  };
}

// Represents a single node within the tree structure
class TreeNode {
  /**
   * Constructs a new TreeNode.
   * @param {number} nodeId - The unique identifier for this node.
   * @param {number} parentRef - The identifier of the parent node, -1 if root.
   * @param {number} leftRef - The identifier of the left child node, -1 if none.
   * @param {number} rightRef - The identifier of the right child node, -1 if none.
   */
  constructor(nodeId, parentRef, leftRef, rightRef) {
    this.nodeId = nodeId;
    this.parentRef = parentRef;
    this.leftRef = leftRef;
    this.rightRef = rightRef;
  }

  // Getter to determine the type of the node (root, leaf, or internal)
  get type() {
    if (this.parentRef === -1) {
      return 'root'; // Node has no parent
    } else if (this.leftRef === -1 && this.rightRef === -1) {
      return 'leaf'; // Node has no children
    } else {
      return 'internal node'; // Node has a parent and at least one child
    }
  }
}

// Manages the overall binary tree structure
class TreeStructure {
  constructor() {
    // Array to store TreeNode objects, indexed by their ID
    this.nodeRegistry = [];
    // Auxiliary data for each node, like sibling and degree
    this.auxiliaryNodeData = [];

    // Memoize the calculateDepth method for performance
    this.calculateDepth = cacheFunction(this.calculateDepth.bind(this));
  }

  // Static getter to expose the TreeNode class
  static get NodeClass() {
    return TreeNode;
  }

  /**
   * Adds a new node to the tree.
   * Initially, parentRef is set to -1, it will be updated during connection.
   * @param {number} nodeIdentifier - The ID of the node to add.
   * @param {number} leftIdentifier - The ID of its left child.
   * @param {number} rightIdentifier - The ID of its right child.
   */
  add(nodeIdentifier, leftIdentifier, rightIdentifier) {
    this.nodeRegistry[nodeIdentifier] = new TreeStructure.NodeClass(nodeIdentifier, -1, leftIdentifier, rightIdentifier);
  }

  // Establishes parent-child and sibling relationships after all nodes are added
  connect() {
    // Initialize auxiliary data for all potential nodes
    for (let idx = 0; idx < this.nodeRegistry.length; idx++) {
      this.auxiliaryNodeData[idx] = {
        associatedNode: null,
        siblingId: -1,
        childCount: 0
      };
    }

    // First pass: set parent references and initial sibling IDs
    this.nodeRegistry.forEach(currentNode => {
      if (currentNode.leftRef !== -1) {
        this.nodeRegistry[currentNode.leftRef].parentRef = currentNode.nodeId;
        this.auxiliaryNodeData[currentNode.leftRef].siblingId = currentNode.rightRef;
      }
      if (currentNode.rightRef !== -1) {
        this.nodeRegistry[currentNode.rightRef].parentRef = currentNode.nodeId;
        this.auxiliaryNodeData[currentNode.rightRef].siblingId = currentNode.leftRef;
      }
    });

    // Second pass: populate remaining auxiliary data (node reference and child count)
    this.nodeRegistry.forEach(currentNode => {
      this.auxiliaryNodeData[currentNode.nodeId] = {
        siblingId: this.auxiliaryNodeData[currentNode.nodeId].siblingId,
        associatedNode: currentNode,
        childCount: (currentNode.leftRef !== -1) + (currentNode.rightRef !== -1) // Converts boolean to 0 or 1
      };
    });
  }

  /**
   * Recursively calculates the depth of a given node.
   * @param {number} targetId - The ID of the node.
   * @param {number} currentDepth - The current depth level (starts at 0 for the initial call).
   * @returns {number} The depth of the node.
   */
  calculateDepth(targetId, currentDepth = 0) {
    const parentIdentifier = this.retrieveNode(targetId).parentRef;
    if (parentIdentifier === -1) {
      return currentDepth; // Root node
    } else {
      return this.calculateDepth(parentIdentifier, currentDepth + 1);
    }
  }

  /**
   * Recursively calculates the height of a given node.
   * @param {number} currentIdentifier - The ID of the node.
   * @param {number} currentHeight - The current height level (starts at 0 for the initial call).
   * @returns {number} The height of the node.
   */
  getHeight(currentIdentifier, currentHeight = 0) {
    if (currentIdentifier === -1) {
      return currentHeight - 1; // Base case: child of a leaf or non-existent child
    }
    const nodeObj = this.retrieveNode(currentIdentifier);
    const [leftNodeId, rightNodeId] = [nodeObj.leftRef, nodeObj.rightRef];

    // Recursively find height of left and right subtrees and take the maximum
    return Math.max(this.getHeight(leftNodeId, currentHeight + 1), this.getHeight(rightNodeId, currentHeight + 1));
  }

  /**
   * Retrieves a node object by its ID.
   * @param {number} searchId - The ID of the node to find.
   * @returns {TreeNode} The TreeNode object.
   */
  retrieveNode(searchId) {
    return this.nodeRegistry[searchId];
  }

  // Prints detailed information for each node in the tree
  print() {
    const outputLines = this.auxiliaryNodeData.map(dataEntry => {
      const node = dataEntry.associatedNode;
      return `node: ${node.nodeId}: parent = ${node.parentRef}, sibling = ${dataEntry.siblingId}, degree = ${dataEntry.childCount}, depth = ${this.calculateDepth(node.nodeId)}, height = ${this.getHeight(node.nodeId)}, ${node.type}`;
    });
    console.log(outputLines.join('\n'));
  }
}

// Main execution block
(function executeTreeProcessing() {
  // Read input from stdin
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the number of nodes (not strictly used after reading)
  const nodeCount = Number(inputLines.shift());

  // Create a new tree instance
  let binaryTreeInstance = new TreeStructure();

  // Process each subsequent line to add nodes to the tree
  inputLines.map(lineStr => lineStr.split(' ').map(Number)).forEach(function(parsedLine) {
    binaryTreeInstance.add(...parsedLine);
  });

  // Connect the nodes to establish relationships
  binaryTreeInstance.connect();

  // Print the final tree information
  binaryTreeInstance.print();
})();
