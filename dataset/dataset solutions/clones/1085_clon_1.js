function memoization(f) {
  // This function creates a memoized version of the input function 'f'.
  const cache = {}; // A dictionary/object to store the results of previous computations.

  return (
    ...param // The returned function accepts an arbitrary number of parameters.
  ) => {
    const c = cache[param]; // Attempt to retrieve the result from the cache using parameters as key.

    // If the result is not in the cache (undefined),
    // compute it using the original function 'f', store it in the cache, and then return it.
    // Otherwise, return the cached value directly.
    return typeof c === 'undefined'
      ? (cache[param] = f(...param)) // Call original function, store result, then return.
      : c; // Return the pre-computed cached result.
  };
}

class _Node {
  // Represents a single node within the binary tree.
  constructor(
    id, // The unique identifier for this node.
    parentId, // The ID of this node's parent. -1 indicates no parent (root).
    leftId, // The ID of this node's left child. -1 indicates no left child.
    rightId // The ID of this node's right child. -1 indicates no right child.
  ) {
    this.id = id;
    this.parentId = parentId;
    this.leftId = leftId;
    this.rightId = rightId;
  }

  // A getter property to determine the type of the node.
  get type() {
    return this.parentId === -1 // Check if it's a root node.
      ? 'root' // If parentId is -1, it's the root.
      : this.leftId === -1 && this.rightId === -1 // Otherwise, check if it's a leaf node.
        ? 'leaf' // If both children are -1, it's a leaf.
        : 'internal node'; // If not root and has at least one child, it's an internal node.
  }
}

class BinaryTree {
  // The constructor initializes the tree's properties.
  constructor() {
    this.nodes = []; // An array to hold all _Node objects, indexed by their ID.
    this._nodeInfo = []; // An array to hold supplementary information for each node.

    // Memoize the getDepth and getHeight methods to optimize recursive calls.
    // .bind(this) ensures 'this' context is correctly maintained for memoization.
    this.getDepth = memoization(this.getDepth.bind(this));
    this.getHeight = memoization(this.getHeight.bind(this));
  }

  // A static getter to provide external access to the _Node class.
  static get Node() {
    return _Node;
  }

  /**
   * Adds a new node to the binary tree.
   * @param {number} id - The ID of the node to add.
   * @param {number} leftId - The ID of its left child.
   * @param {number} rightId - The ID of its right child.
   */
  add(id, leftId, rightId) {
    this.nodes[id] = new BinaryTree.Node(id, -1, leftId, rightId); // ParentId is initially -1.
  }

  // Establishes parent-child relationships and calculates basic node metadata.
  connect() {
    // Initialize _nodeInfo array for all potential node IDs.
    for (
      let i = 0;
      i < this.nodes.length;
      i++ // Iterate up to the maximum node ID encountered.
    )
      this._nodeInfo[i] = { node: null, sibling: -1, degree: 0 }; // Default values.

    // First pass: Iterate through existing nodes to set parent and sibling IDs.
    this.nodes.forEach((n) => {
      if (n.leftId !== -1) {
        this.nodes[n.leftId].parentId = n.id; // Set parent of the left child.
        this._nodeInfo[n.leftId].sibling = n.rightId; // Set sibling of the left child.
      }
      if (n.rightId !== -1) {
        this.nodes[n.rightId].parentId = n.id; // Set parent of the right child.
        this._nodeInfo[n.rightId].sibling = n.leftId; // Set sibling of the right child.
      }
    });

    // Second pass: Populate _nodeInfo with actual node references and calculate degree.
    this.nodes.forEach((n) => {
      this._nodeInfo[n.id] = {
        sibling: this._nodeInfo[n.id].sibling, // Retain sibling information from the first pass.
        node: n, // Store a reference to the actual _Node object.
        degree: (n.leftId !== -1) + (n.rightId !== -1), // Degree is the count of its children.
      };
    });
  }

  /**
   * Recursively calculates the depth of a specific node in the tree.
   * This method uses memoization for efficiency.
   * @param {number} id - The ID of the node whose depth is to be found.
   * @param {number} [i=0] - The current depth level during recursion.
   * @returns {number} The depth of the node (0 for root).
   */
  getDepth(id, i = 0) {
    let pid = this.find(id).parentId; // Get the parent ID of the current node.

    // If the node has no parent (it's the root), return the current depth 'i'.
    // Otherwise, recursively call getDepth for the parent, incrementing 'i'.
    return pid === -1 ? i : this.getDepth(pid, i + 1);
  }

  /**
   * Recursively calculates the height of the subtree rooted at a specific node.
   * This method uses memoization for efficiency.
   * @param {number} id - The ID of the node whose height is to be found.
   * @param {number} [i=0] - The current height level during recursion.
   * @returns {number} The height of the node (0 for a leaf node).
   */
  getHeight(id, i = 0) {
    if (id === -1)
      return i - 1; // Base case: If we reach a non-existent child, return (current level - 1).

    let n = this.find(id); // Retrieve the node object.
    let [lid, rid] = [n.leftId, n.rightId]; // Extract left and right child IDs using destructuring.

    // The height of the current node is 1 plus the maximum height of its left or right subtree.
    return Math.max(
      this.getHeight(lid, i + 1), // Calculate height of the left subtree.
      this.getHeight(rid, i + 1) // Calculate height of the right subtree.
    );
  }

  /**
   * Finds and returns a node object by its ID.
   * @param {number} id - The ID of the node to find.
   * @returns {_Node} The node object corresponding to the given ID.
   */
  find(id) {
    return this.nodes[id];
  }

  // Prints a formatted summary of each node's information to the console.
  print() {
    console.log(
      this._nodeInfo
        .map(
          (o) =>
            // Construct a string for each node, including its ID, parent, sibling, degree, depth, height, and type.
            `node ${o.node.id}: parent = ${o.node.parentId}, sibling = ${
              o.sibling
            }, degree = ${o.degree}, depth = ${this.getDepth(
              o.node.id
            )}, height = ${this.getHeight(o.node.id)}, ${o.node.type}`
        )
        .join('\n') // Join all the individual node strings with a newline character.
    );
  }
}

// This is an Immediately Invoked Function Expression (IIFE) that serves as the main entry point.
(function main() {
  // Read input from standard input, decode as UTF-8, remove leading/trailing whitespace, and split into lines.
  const lines = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n');

  const n = Number(lines.shift()); // Parse the first line (number of nodes), though 'n' is not used later.

  let tree = new BinaryTree(); // Create a new instance of our BinaryTree.

  let id, l, r; // Declare variables for potential use in parsing, though not strictly needed here.

  // Process each remaining line of input to add nodes to the tree.
  lines
    .map((l) => l.split(' ').map(Number)) // For each line, split by space and convert parts to numbers.
    .forEach(function (line) {
      tree.add(...line); // Add the node to the tree using the parsed numbers as arguments.
    });

  tree.connect(); // Establish all parent-child and sibling relationships in the tree.
  tree.print(); // Print the detailed information for all nodes in the tree.
})();