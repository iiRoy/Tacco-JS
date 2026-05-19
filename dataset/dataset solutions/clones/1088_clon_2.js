function cacheFunction(operation) {
  // This object stores previously computed results to avoid redundant calculations.
  const memoStore = {};

  // Returns a new function that wraps the original operation.
  return (...inputArgs) => {
    // Check if the result for the current arguments is already in the cache.
    const cachedResult = memoStore[inputArgs];

    // If the result is not found (undefined), compute it and store it.
    if (typeof cachedResult === 'undefined') {
      const computedValue = operation(...inputArgs);
      memoStore[inputArgs] = computedValue;
      return computedValue;
    } else {
      // Otherwise, return the cached result directly.
      return cachedResult;
    }
  };
}

// Represents a single node within the binary tree structure.
class TreeNode {
  constructor(nodeIdentifier, parentIdentifier, leftChildIdentifier, rightChildIdentifier) {
    this.nodeIdentifier = nodeIdentifier;
    this.parentIdentifier = parentIdentifier;
    this.leftChildIdentifier = leftChildIdentifier;
    this.rightChildIdentifier = rightChildIdentifier;
  }

  // A getter to determine the type of the node based on its connections.
  get type() {
    if (this.parentIdentifier === -1) {
      return 'root'; // Node has no parent, so it's the root.
    } else if (this.leftChildIdentifier === -1 && this.rightChildIdentifier === -1) {
      return 'leaf'; // Node has no children, so it's a leaf.
    } else {
      return 'internal node'; // Node has a parent and at least one child.
    }
  }
}

// Manages the collection of nodes and their relationships in a binary tree.
class TreeStructure {
  constructor() {
    this.nodeCollection = []; // Stores TreeNode objects indexed by their identifier.
    this.nodeDetails = [];    // Stores additional computed information about each node.

    // Memoize the calculateDepth method for performance.
    this.calculateDepth = cacheFunction(this.calculateDepth.bind(this));
  }

  // Static getter to expose the TreeNode class.
  static get NodeElement() {
    return TreeNode;
  }

  // Adds a new node to the tree structure.
  addNode(nodeId, leftNodeId, rightNodeId) {
    this.nodeCollection[nodeId] = new TreeStructure.NodeElement(nodeId, -1, leftNodeId, rightNodeId);
  }

  // Establishes parent-child and sibling relationships between nodes.
  establishConnections() {
    // Initialize node details for all potential nodes.
    for (let idx = 0; idx < this.nodeCollection.length; idx++) {
      this.nodeDetails[idx] = { element: null, siblingNode: -1, nodeDegree: 0 };
    }

    // First pass: set parent IDs and initial sibling IDs.
    this.nodeCollection.forEach(currentNode => {
      if (currentNode.leftChildIdentifier !== -1) {
        this.nodeCollection[currentNode.leftChildIdentifier].parentIdentifier = currentNode.nodeIdentifier;
        this.nodeDetails[currentNode.leftChildIdentifier].siblingNode = currentNode.rightChildIdentifier;
      }
      if (currentNode.rightChildIdentifier !== -1) {
        this.nodeCollection[currentNode.rightChildIdentifier].parentIdentifier = currentNode.nodeIdentifier;
        this.nodeDetails[currentNode.rightChildIdentifier].siblingNode = currentNode.leftChildIdentifier;
      }
    });

    // Second pass: populate full node details including degree.
    this.nodeCollection.forEach(currentNode => {
      this.nodeDetails[currentNode.nodeIdentifier] = {
        siblingNode: this.nodeDetails[currentNode.nodeIdentifier].siblingNode,
        element: currentNode,
        nodeDegree: (currentNode.leftChildIdentifier !== -1) + (currentNode.rightChildIdentifier !== -1)
      };
    });
  }

  // Recursively calculates the depth of a given node.
  calculateDepth(targetId, currentDepth = 0) {
    const parentNodeId = this.locateNode(targetId).parentIdentifier;
    if (parentNodeId === -1) {
      return currentDepth; // If no parent, it's the root, return current depth.
    } else {
      return this.calculateDepth(parentNodeId, currentDepth + 1); // Recurse for parent.
    }
  }

  // Recursively determines the height of the subtree rooted at a given node.
  determineHeight(targetId, currentHeight = 0) {
    if (targetId === -1) {
      return currentHeight - 1; // Base case: reached a null child, return height of parent.
    }
    const foundNode = this.locateNode(targetId);
    const [leftIdentifier, rightIdentifier] = [foundNode.leftChildIdentifier, foundNode.rightChildIdentifier];

    // Recursively find the maximum height of left and right subtrees.
    return Math.max(this.determineHeight(leftIdentifier, currentHeight + 1), this.determineHeight(rightIdentifier, currentHeight + 1));
  }

  // Retrieves a node by its identifier.
  locateNode(searchId) {
    return this.nodeCollection[searchId];
  }

  // Prints detailed information for each node in the tree.
  displayInfo() {
    const outputLines = this.nodeDetails.map(nodeObject =>
      `node: ${nodeObject.element.nodeIdentifier}: parent = ${nodeObject.element.parentIdentifier}, sibling = ${nodeObject.siblingNode}, degree = ${nodeObject.nodeDegree}, depth = ${this.calculateDepth(nodeObject.element.nodeIdentifier)}, height = ${this.determineHeight(nodeObject.element.nodeIdentifier)}, ${nodeObject.element.type}`
    );
    console.log(outputLines.join('\n'));
  }
}

// Main execution block for the program.
(function executeProgram() {
  // Read input from stdin, trim whitespace, and split into lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the total number of nodes.
  const nodeCount = Number(inputLines.shift());

  // Create a new instance of the tree structure.
  let binaryStructure = new TreeStructure();

  // Process each subsequent line to add nodes to the tree.
  inputLines.map(lineData => lineData.split(' ').map(Number)).forEach(function(nodeDataArray) {
    binaryStructure.addNode(...nodeDataArray);
  });

  // After all nodes are added, establish their connections.
  binaryStructure.establishConnections();

  // Finally, display the computed information for all nodes.
  binaryStructure.displayInfo();
})();
