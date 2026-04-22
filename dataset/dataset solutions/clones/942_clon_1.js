const input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input synchronously from standard input

// --- Global variables and initial parsing ---

const inputs = input.trim().split('\n'); // Trim whitespace and split by newlines to get an array of input lines
const n = Number(inputs.shift()); // The first line is 'n', the number of nodes. Remove it from the array and convert to a number.
const adj = inputs.map((s) => s.split(' ').map(Number)); // Parse remaining lines into an adjacency list representation

// --- Node Class Definition ---

/**
 * Represents a node in the tree structure.
 * Each node has an ID, measurement properties (start/end times for DFS),
 * and references to its parents and children.
 */
class Node {
  // Constructor for the Node class
  constructor(id) {
    this.id = id; // Unique identifier for this node
    this.measure = {}; // Object to store DFS start and end times
    this.parents = []; // Array to store parent nodes
    this.children = []; // Array to store child nodes
  }

  /**
   * Adds a child node to the current node.
   * Also establishes the parent-child relationship in both directions.
   * @param {Node} node - The node to be added as a child.
   */
  add(node) {
    node.parents.push(this); // Add current node as parent to the given node
    this.children.push(node); // Add given node as child to current node
  }

  /**
   * Checks if the node has already been visited/measured (i.e., has a start time).
   * @returns {boolean} True if the node has been measured, false otherwise.
   */
  isMeasured() {
    return !!this.measure.start; // Returns true if 'start' property exists and is truthy
  }

  /**
   * Performs a depth-first search (DFS) like measurement on the node and its unvisited neighbors.
   * Assigns start and end times to the node based on the traversal.
   * @param {number} time - The current time counter for the DFS traversal.
   * @returns {number} The updated time counter after visiting this node and its descendants.
   */
  setMeasure(time) {
    this.measure.start = time; // Set the start time for the current node

    // If 'adj' (adjacency list for DFS) is not yet initialized, create it.
    // It includes both parents and children, sorted by ID for consistent traversal.
    if (!this.adj) {
      this.adj = this.parents.concat(this.children).sort((a, b) => a.id > b.id);
    }

    // Iterate over adjacent nodes (parents and children)
    this.adj.forEach(node => {
      // If an adjacent node has not been measured yet, visit it recursively
      if (!node.isMeasured()) {
        time = node.setMeasure(++time); // Increment time and recursively call setMeasure
      }
    });

    return this.measure.end = ++time; // Increment time and set the end time for the current node, then return the new time
  }

  /**
   * Returns a string representation of the node's ID, start time, and end time.
   * @returns {string} A space-separated string of ID, start time, and end time.
   */
  toString() {
    return [this.id, this.measure.start, this.measure.end].join(' '); // Format output as required
  }
}

// --- Tree Class Definition ---

/**
 * Manages a collection of Node objects, effectively representing the entire graph/tree.
 * Provides methods to get nodes and print their measurement results.
 */
class Tree {
  constructor() {
    this.map = new Map(); // Stores nodes, mapping their IDs to Node objects
  }

  /**
   * Retrieves a node by its ID. If the node doesn't exist, it creates a new one.
   * @param {number} id - The ID of the node to retrieve or create.
   * @returns {Node} The Node object corresponding to the given ID.
   */
  getNode(id) {
    if (!this.map.has(id)) {
      this.map.set(id, new Node(id)); // Create and store a new Node if not found
    }
    return this.map.get(id); // Return the existing or newly created node
  }

  /**
   * Prints the ID, start time, and end time for each node in the tree,
   * ordered by their numerical ID.
   */
  print() {
    // Iterate from ID 1 up to the total number of nodes
    for (let i = 1; i <= this.map.size; i++) {
      const node = this.map.get(i); // Get the node by its ID
      console.log(node.toString()); // Print its string representation
    }
  }
}

// --- Main Program Execution ---

const tree = new Tree(); // Create a new Tree instance

// Process the adjacency list to build the tree structure
adj.forEach(([u, k, ...vk]) => {
  // 'u' is the parent node ID, 'k' is the count of children (not used here),
  // 'vk' is an array of child node IDs.
  const parent = tree.getNode(u); // Get or create the parent node

  vk.forEach(v => {
    // For each child ID 'v'
    const node = tree.getNode(v); // Get or create the child node
    parent.add(node); // Establish the parent-child relationship
  });
});

// Start the DFS measurement from node 1 (assuming it's the root for this problem)
const root = tree.getNode(1); // Get the node with ID 1
root.setMeasure(1); // Initiate the measurement process starting with time = 1

tree.print(); // Print the results for all nodes