/*
 * This file processes graph data from standard input.
 * It builds a tree structure and calculates start/end times for nodes
 * based on a depth-first traversal simulation.
 */


// Require the 'fs' module to read from the file system.
const input =
  require('fs')
    .readFileSync('/dev/stdin', 'utf8');

/*
 * Parse the input string:
 * - Trim leading/trailing whitespace.
 * - Split into an array of lines.
 */
const inputs = input.trim()
  .split('\n');

// The first line contains the number of nodes, 'n'.
const n = Number(inputs.shift());

// The remaining lines represent adjacency lists.
// Each line 's' is split by space, then converted to numbers.
const adj = inputs.map(
  (s) => s.split(' ')
    .map(Number)
);


/**
 * Represents a global time counter for tracking entry/exit times
 * during graph traversal.
 */
class Time {

  /**
   * Initializes the time counter.
   * @param {number} [now=0] - The initial time value.
   */
  constructor(now = 0) {
    this.now = now;
  }

  /**
   * Increments the time and returns the new value.
   * This effectively provides a unique timestamp for events.
   * @returns {number} The incremented time.
   */
  getNow() {
    return ++this.now;
  }
} // End of Time class


// Create a global instance of the Time counter.
const time = new Time();


/**
 * Represents a node in the graph/tree.
 * Stores its ID, children, and traversal start/end times.
 */
class Node {

  /**
   * Constructs a new Node.
   * @param {number} id - The unique identifier of the node.
   */
  constructor(id) {
    this.id = id;
    this.children = []; // List of child nodes.
  }

  /**
   * Adds a child node to this node's children list.
   * @param {Node} node - The child node to add.
   */
  add(node) {
    this.children.push(node);
  }

  /**
   * Checks if this node has already been visited (i.e., its 'start' time is set).
   * @returns {boolean} True if visited, false otherwise.
   */
  isVisited() {
    // The '!!' converts a truthy/falsy value to a boolean.
    return !!this.start;
  }

  /**
   * Recursively calculates the start and end times for this node
   * and its unvisited children using a depth-first approach.
   */
  calc() {
    // Record the entry time for this node.
    this.start = time.getNow();

    // Sort children by ID to ensure a consistent traversal order.
    this.children.sort((a, b) => a.id > b.id);

    // Recursively call calc() on unvisited children.
    this.children.forEach(
      child => child.isVisited() || child.calc()
    );

    // Record the exit time for this node after all its children are processed.
    this.end = time.getNow();
  }

  /**
   * Returns a string representation of the node's ID, start time, and end time.
   * @returns {string} Formatted string "id start end".
   */
  toString() {
    return [this.id, this.start, this.end].join(' ');
  }

} // End of Node class


/**
 * Represents the overall tree structure, managing nodes.
 */
class Tree {

  /**
   * Constructs a new Tree.
   * Initializes a map to store nodes by their ID.
   */
  constructor() {
    this.map = new Map();
  }

  /**
   * Retrieves a node by its ID, creating it if it doesn't already exist.
   * @param {number} id - The ID of the node to retrieve.
   * @returns {Node} The Node object corresponding to the given ID.
   */
  getNode(id) {
    // If the node doesn't exist in the map, create and add it.
    this.map.has(id) || this.map.set(id, new Node(id));
    return this.map.get(id);
  }

  /**
   * Initiates the calculation of start and end times for all nodes in the tree.
   * It iterates through nodes 1 to 'n' (map.size) and calls calc() on unvisited ones.
   */
  calc() {
    // Iterate from node 1 up to the total number of nodes.
    for (let i = 1; i <= this.map.size; i++) {
      const node = this.map.get(i);
      // If the node hasn't been visited yet, start its calculation.
      node.isVisited() || node.calc();
    }
  }

  /**
   * Prints the ID, start time, and end time for each node in the tree.
   */
  print() {
    // Iterate through nodes from 1 to 'n' and print their details.
    for (let i = 1; i <= this.map.size; i++) {
      const node = this.map.get(i);
      console.log(node.toString());
    }
  }

} // End of Tree class


// Create a new Tree instance.
const tree = new Tree();

/*
 * Process the adjacency list:
 * - Each entry `[u, k, ...vk]` represents node `u` and its `k` children `vk`.
 */
adj.forEach(([u, k, ...vk]) => {
  // Get or create the parent node `u`.
  const parent = tree.getNode(u);

  // For each child `v` in `vk`:
  vk.forEach(v => {
    // Get or create the child node `v`.
    const node = tree.getNode(v);
    // Add `v` as a child of `u`.
    parent.add(node);
  });
});


// Calculate the start and end times for all nodes in the tree.
tree.calc();

// Print the results for all nodes.
tree.print();