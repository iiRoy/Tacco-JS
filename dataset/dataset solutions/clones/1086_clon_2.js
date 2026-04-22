// This utility function creates a memoized version of a given operation.
function rememberResult(operation) {
  const storage = {}; // Internal storage for computed results.

  // Returns a new function that will cache its results.
  return (...args) => {
    const cachedValue = storage[args]; // Check if result for these arguments is already stored.

    // If the value is not found, compute it, store it, and then return it.
    // Otherwise, return the previously stored value.
    return typeof cachedValue === 'undefined' ?
      (storage[args] = operation(...args)) :
      cachedValue;
  };
}


// Represents a single node within a binary tree structure.
class TreeNode {
  constructor(uniqueId, ancestorId, leftChildId, rightChildId) {
    this.uniqueId = uniqueId;         // The node's distinct identification number.
    this.ancestorId = ancestorId;     // ID of the parent node; -1 if it's the root.
    this.leftChildId = leftChildId;   // ID of the left child node; -1 if none exists.
    this.rightChildId = rightChildId; // ID of the right child node; -1 if none exists.
  }

  // A getter that determines the category of the node (root, leaf, or internal).
  get nodeCategory() {
    return this.ancestorId === -1 ?
      'root' :
      (this.leftChildId === -1 && this.rightChildId === -1 ?
        'leaf' :
        'internal node');
  }
}


// Manages a collection of nodes arranged in a binary tree hierarchy.
class HierarchicalStructure {
  constructor() {
    this.nodeCollection = [];       // Stores all TreeNode instances, indexed by their unique ID.
    this._supplementaryData = [];   // Holds additional computed information for each node (e.g., sibling, degree).

    // Memoize the level calculation method to optimize performance for repeated calls.
    this.calculateLevel = rememberResult(this.calculateLevel.bind(this));
  }

  // Provides static access to the TreeNode class for creating new nodes.
  static get StructureUnit() {
    return TreeNode;
  }

  // Adds a new node to the tree structure.
  insertNode(unitId, leftNodeId, rightNodeId) {
    // Create a new TreeNode instance and store it in the collection at its unique ID index.
    this.nodeCollection[unitId] = new HierarchicalStructure.StructureUnit(unitId, -1, leftNodeId, rightNodeId);
  }

  // Establishes parent-child and sibling relationships between nodes after all nodes are added.
  establishRelationships() {
    // Initialize supplementary data for all potential nodes with default values.
    for (let idx = 0; idx < this.nodeCollection.length; idx++) {
      this._supplementaryData[idx] = { currentUnit: null, coSibling: -1, childCount: 0 };
    }

    // First pass: Iterate through all nodes to assign parent IDs and initial sibling IDs to children.
    this.nodeCollection.forEach(current => {
      if (current.leftChildId !== -1) {
        this.nodeCollection[current.leftChildId].ancestorId = current.uniqueId;
        this._supplementaryData[current.leftChildId].coSibling = current.rightChildId;
      }
      if (current.rightChildId !== -1) {
        this.nodeCollection[current.rightChildId].ancestorId = current.uniqueId;
        this._supplementaryData[current.rightChildId].coSibling = current.leftChildId;
      }
    });

    // Second pass: Populate the full supplementary data, including the node reference itself and its child count.
    this.nodeCollection.forEach(current => {
      this._supplementaryData[current.uniqueId] = {
        coSibling: this._supplementaryData[current.uniqueId].coSibling,
        currentUnit: current,
        childCount: (current.leftChildId !== -1) + (current.rightChildId !== -1) // Count direct children (0, 1, or 2).
      };
    });
  }

  // Recursively computes the depth (or level) of a specific node from the root.
  calculateLevel(nodeIdentifier, currentLevel = 0) {
    let parentIdentifier = this.locateNode(nodeIdentifier).ancestorId;
    // If the node has no parent (it's the root), its level is currentLevel.
    // Otherwise, recursively call for the parent, incrementing the level.
    return parentIdentifier === -1 ? currentLevel : this.calculateLevel(parentIdentifier, currentLevel + 1);
  }

  // Recursively determines the height of a specific node (the distance to its farthest leaf descendant).
  determineHeight(nodeIdentifier, currentLevel = 0) {
    // Base case: If the node ID is -1 (non-existent child), return currentLevel - 1.
    if (nodeIdentifier === -1) return currentLevel - 1;

    let foundNode = this.locateNode(nodeIdentifier);
    let [leftID, rightID] = [foundNode.leftChildId, foundNode.rightChildId];

    // The height of a node is 1 plus the maximum height of its children.
    return Math.max(this.determineHeight(leftID, currentLevel + 1), this.determineHeight(rightID, currentLevel + 1));
  }

  // Retrieves a node instance from the collection by its unique identifier.
  locateNode(nodeIdentifier) {
    return this.nodeCollection[nodeIdentifier];
  }

  // Outputs a formatted summary of each node's properties to the console.
  displayStructure() {
    console.log(
      this._supplementaryData.map(dataEntry =>
        `Unit: ${dataEntry.currentUnit.uniqueId}: Ancestor = ${dataEntry.currentUnit.ancestorId}, Co-Sibling = ${dataEntry.coSibling}, Child Count = ${dataEntry.childCount}, Level = ${this.calculateLevel(dataEntry.currentUnit.uniqueId)}, Max Child Level = ${this.determineHeight(dataEntry.currentUnit.uniqueId)}, Category = ${dataEntry.currentUnit.nodeCategory}`
      ).join('\n')
    );
  }
}


// Entry point for the application logic, executed immediately.
(function executeProgram() {
  // Read input from standard input, remove leading/trailing whitespace, and split into individual lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const numNodes = Number(inputLines.shift()); // Get the total number of nodes (the first line of input).

  let hierarchy = new HierarchicalStructure(); // Instantiate our custom tree structure.

  // Declare variables for node components (ID, left child, right child).
  // These are declared but not explicitly assigned here, as they are handled by the `insertNode` method.
  let nodeId, leftC, rightC;

  // Process each line of input to add nodes to the tree.
  inputLines
    .map(lineStr => lineStr.split(' ').map(Number)) // Parse each line string into an array of numbers.
    .forEach(function(nodeData) {
      hierarchy.insertNode(...nodeData); // Add a new node to the hierarchy using the parsed data.
    });

  hierarchy.establishRelationships(); // Build the parent-child and sibling connections within the tree.
  hierarchy.displayStructure();       // Output the detailed information of the tree structure.
})();