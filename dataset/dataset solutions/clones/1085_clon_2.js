/*
 * Utility function to cache results of expensive computations.
 * Prevents redundant calls for the same input arguments.
 */
function cachingFunc(operation) {
  // Internal storage for computed results.
  const memoStorage = {};
  // Returns a new function that will use the cache.
  return (...args) => {
    // Attempt to retrieve result from cache.
    const cachedResult = memoStorage[args];
    // If not found, compute and store; otherwise, return cached value.
    return typeof cachedResult === 'undefined'
      ? (memoStorage[args] = operation(...args))
      : cachedResult;
  };
}

/*
 * Represents a single element within the hierarchical structure.
 * Stores its unique identifier and connections to parent and children.
 */
class TreeNode {
  // Constructor to initialize a tree element.
  constructor(identifier, ancestorId, leftChildId, rightChildId) {
    this.identifier = identifier;
    this.ancestorId = ancestorId;
    this.leftChildId = leftChildId;
    this.rightChildId = rightChildId;
  }

  // Getter to determine the classification of the node.
  get category() {
    return this.ancestorId === -1
      ? 'main_root' // Node with no parent is the root.
      : this.leftChildId === -1 && this.rightChildId === -1
        ? 'terminal_node' // Node with no children is a leaf.
        : 'intermediate_node'; // Node with children and a parent.
  }
}

/**
 * Manages a collection of TreeNode objects, forming a binary tree structure.
 * Provides methods for tree manipulation and information retrieval.
 */
class HierarchicalTree {
  // Initializes a new tree instance.
  constructor() {
    this.elements = []; // Array to store TreeNode objects by their identifier.
    this.elementDetails = []; // Auxiliary information for each node, indexed by identifier.
    // Apply memoization to computationally intensive methods.
    this.calcLevel = cachingFunc(this.calcLevel.bind(this));
    this.measureExtent = cachingFunc(this.measureExtent.bind(this));
  }

  // Static getter to expose the TreeNode class.
  static get Element() {
    return TreeNode;
  }

  /*
   * Adds a new node to the tree.
   * @param {number} identifier - The unique ID for the new node.
   * @param {number} leftChildId - The ID of the left child, or -1 if none.
   * @param {number} rightChildId - The ID of the right child, or -1 if none.
   */
  insertElement(identifier, leftChildId, rightChildId) {
    this.elements[identifier] = new HierarchicalTree.Element(
      identifier,
      -1, // Parent ID is set later during connection.
      leftChildId,
      rightChildId
    );
  }

  /*
   * Establishes parent-child and sibling relationships across all nodes.
   * This method should be called after all nodes have been added.
   */
  establishRelationships() {
    // Initialize auxiliary information for each potential element slot.
    for (let idx = 0; idx < this.elements.length; idx++) {
      this.elementDetails[idx] = {
        elementRef: null,
        coEqual: -1,
        childCount: 0
      };
    }

    // First pass: set parent and sibling IDs based on children.
    this.elements.forEach(currentElement => {
      if (currentElement.leftChildId !== -1) {
        this.elements[currentElement.leftChildId].ancestorId = currentElement.identifier;
        this.elementDetails[currentElement.leftChildId].coEqual = currentElement.rightChildId;
      }
      if (currentElement.rightChildId !== -1) {
        this.elements[currentElement.rightChildId].ancestorId = currentElement.identifier;
        this.elementDetails[currentElement.rightChildId].coEqual = currentElement.leftChildId;
      }
    });

    // Second pass: Populate full node details including degree.
    this.elements.forEach(currentElement => {
      this.elementDetails[currentElement.identifier] = {
        coEqual: this.elementDetails[currentElement.identifier].coEqual,
        elementRef: currentElement,
        childCount: (currentElement.leftChildId !== -1) + (currentElement.rightChildId !== -1) // Convert boolean to 0 or 1 for sum
      };
    });
  }

  /*
   * Calculates the depth (level) of a specific node within the tree.
   * @param {number} identifier - The ID of the node to find the depth for.
   * @param {number} currentLevel - Internal counter for recursion, defaults to 0.
   * @returns {number} The depth of the node.
   */
  calcLevel(identifier, currentLevel = 0) {
    const ancestorRefId = this.locateElement(identifier).ancestorId;
    return ancestorRefId === -1
      ? currentLevel
      : this.calcLevel(ancestorRefId, currentLevel + 1);
  }

  /*
   * Computes the height of the subtree rooted at a specific node.
   * @param {number} identifier - The ID of the root of the subtree.
   * @param {number} currentHeight - Internal counter for recursion, defaults to 0.
   * @returns {number} The height of the subtree.
   */
  measureExtent(identifier, currentHeight = 0) {
    if (identifier === -1) {
      return currentHeight - 1; // Base case: end of a branch.
    }
    const currentElem = this.locateElement(identifier);
    const [leftRefId, rightRefId] = [currentElem.leftChildId, currentElem.rightChildId];
    return Math.max(
      this.measureExtent(leftRefId, currentHeight + 1),
      this.measureExtent(rightRefId, currentHeight + 1)
    );
  }

  /*
   * Retrieves a TreeNode object by its identifier.
   * @param {number} identifier - The ID of the node to locate.
   * @returns {TreeNode} The found TreeNode object.
   */
  locateElement(identifier) {
    return this.elements[identifier];
  }

  /*
   * Outputs a formatted string representation of all node details to the console.
   */
  displayStructure() {
    console.log(
      this.elementDetails
        .map(
          item =>
            `element ${item.elementRef.identifier}: ancestor = ${item.elementRef.ancestorId}, coEqual = ${item.coEqual}, childCount = ${item.childCount}, level = ${this.calcLevel(item.elementRef.identifier)}, extent = ${this.measureExtent(item.elementRef.identifier)}, ${item.elementRef.category}`
        )
        .join('\n')
    );
  }
}

/*
 * Main function to orchestrate the program execution.
 * Reads input, constructs the tree, and displays its properties.
 */
(function executeProgram() {
  // Read input from stdin, process it into an array of lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  // The first line is the number of elements, shifted off the array.
  const numElements = Number(inputLines.shift());

  // Create a new instance of our hierarchical tree.
  let dataStructure = new HierarchicalTree();

  // Variables for parsing individual node data.
  let elemId, leftRef, rightRef;
  // Process each remaining line to add nodes to the tree.
  inputLines
    .map(inputLine => inputLine.split(' ').map(Number)) // Split and convert to numbers.
    .forEach(function(parsedLine) {
      dataStructure.insertElement(...parsedLine); // Use spread operator to pass arguments.
    });

  // After all elements are added, establish their interconnections.
  dataStructure.establishRelationships();
  // Finally, display the calculated properties of the tree.
  dataStructure.displayStructure();
})();