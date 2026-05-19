const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input stream

const parsedLines = rawData.trim().split('\n'); // Split the input string into an array of lines
const nodeCount = Number(parsedLines.shift()); // Extract the first line as the total number of nodes
const adjacencyList = parsedLines.map((lineStr) => lineStr.split(' ').map(Number)); // Parse remaining lines into an adjacency list structure

/**
 * Represents a single node within the tree structure.
 * Manages its unique identifier, parent reference, and a list of child nodes.
 */
class TreeNode {
  /**
   * Constructs a new TreeNode instance.
   * @param {number} identifier - The unique numerical ID for this node.
   */
  constructor(identifier) {
    this.identifier = identifier; // Store the node's unique ID
    this.childNodes = []; // Initialize an empty array to hold child TreeNode objects
    // this.parentNode is intentionally left undefined initially, set when added as a child
  }

  /**
   * Adds a specified node as a child of the current node.
   * Sets the parent reference on the child node.
   * @param {TreeNode} childElement - The node to be added as a child.
   */
  addChild(childElement) {
    childElement.parentNode = this; // Assign the current node as the parent of the childElement
    this.childNodes.push(childElement); // Add the childElement to this node's list of children
  }

  /**
   * Checks if this node has a parent node.
   * @returns {boolean} True if a parent node exists, false otherwise.
   */
  hasParentNode() {
    return !!this.parentNode; // Returns true if parentNode is not null/undefined
  }

  /**
   * Checks if this node has any child nodes.
   * @returns {boolean} True if there are one or more child nodes, false otherwise.
   */
  hasChildNodes() {
    return !!this.childNodes.length; // Returns true if the childNodes array is not empty
  }

  /**
   * Determines the type of the node based on its parent and children status.
   * @returns {string} 'root', 'internal node', or 'leaf'.
   */
  getNodeType() {
    if (!this.hasParentNode()) {
      return 'root'; // A node without a parent is the root
    } else if (this.hasChildNodes()) {
      return 'internal node'; // A node with a parent and children is an internal node
    } else {
      return 'leaf'; // A node with a parent but no children is a leaf
    }
  }

  /**
   * Recursively calculates and assigns the depth for this node and all its descendants.
   * @param {number} currentLevel - The depth level of the current node.
   */
  calculateDepths(currentLevel) {
    this.nodeDepth = currentLevel; // Set the depth for the current node
    const nextLevel = currentLevel + 1; // Increment depth for the next level of children
    this.childNodes.forEach(childElement => childElement.calculateDepths(nextLevel)); // Recursively call for each child
  }

  /**
   * Generates a formatted string representation of the node's properties.
   * @returns {string} A string containing the node's ID, parent, depth, type, and children.
   */
  formatNodeInfo() {
    const parentIdDisplay = this.hasParentNode() ? this.parentNode.identifier : -1; // Get parent ID or -1 if no parent
    const childIdentifiers = this.childNodes.map(childElement => childElement.identifier).join(', '); // Join child IDs

    // Construct the output string exactly as specified in the problem
    return 'node ' + this.identifier + ': ' + [
      'parent = ' + parentIdDisplay,
      'depth = ' + this.nodeDepth,
      this.getNodeType(),
      '[' + childIdentifiers + ']',
    ].join(', ');
  }
}

/**
 * Manages a collection of TreeNode objects, forming a tree data structure.
 * Provides methods to retrieve nodes, find the root, compute depths, and display the structure.
 */
class GraphStructure {
  /**
   * Constructs a new GraphStructure instance.
   */
  constructor() {
    this.nodeRegistry = new Map(); // A Map to store TreeNode objects, keyed by their identifier
  }

  /**
   * Retrieves a TreeNode by its identifier. If the node does not exist, it creates and stores a new one.
   * @param {number} nodeIdentifier - The ID of the node to retrieve or create.
   * @returns {TreeNode} The requested TreeNode object.
   */
  retrieveNode(nodeIdentifier) {
    if (!this.nodeRegistry.has(nodeIdentifier)) {
      this.nodeRegistry.set(nodeIdentifier, new TreeNode(nodeIdentifier)); // Create and store a new node if not found
    }
    return this.nodeRegistry.get(nodeIdentifier); // Return the existing or newly created node
  }

  /**
   * Finds the root node of the tree.
   * Assumes there is exactly one root node (a node without a parent).
   * @returns {TreeNode} The root node of the tree.
   */
  findRootNode() {
    // Convert Map values to an array and find the first node that has no parent
    return Array.from(this.nodeRegistry.values()).find(element => !element.hasParentNode());
  }

  /**
   * Initiates the depth calculation process for all nodes in the tree, starting from the root.
   */
  computeAllDepths() {
    const rootElement = this.findRootNode(); // Get the root node of the tree
    rootElement.calculateDepths(0); // Start the recursive depth calculation from depth 0
  }

  /**
   * Prints the formatted information for all nodes in the tree, ordered by their identifier.
   */
  displayStructure() {
    // Iterate from identifier 0 up to the total number of nodes
    for (let idx = 0; idx < this.nodeRegistry.size; idx++) {
      const currentElement = this.nodeRegistry.get(idx); // Retrieve the node by its identifier
      console.log(currentElement.formatNodeInfo()); // Output the formatted information for the node
    }
  }
}

const graphInstance = new GraphStructure(); // Create a new instance of our tree manager

// Iterate through each entry in the adjacency list to build the tree structure
adjacencyList.forEach(([parentNodeId, numChildren, ...childNodeIds]) => {
  const currentParentNode = graphInstance.retrieveNode(parentNodeId); // Get or create the parent node
  childNodeIds.forEach(childId => {
    const currentNode = graphInstance.retrieveNode(childId); // Get or create the child node
    currentParentNode.addChild(currentNode); // Establish the parent-child relationship
  });
});

graphInstance.computeAllDepths(); // Calculate the depth for all nodes in the constructed tree
graphInstance.displayStructure(); // Display the final tree structure information to console
