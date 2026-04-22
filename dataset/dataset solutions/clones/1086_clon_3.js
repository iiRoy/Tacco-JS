/**
 * A utility function that creates a memoized version of a given operation.
 * It stores the results of function calls in a cache (Map) to avoid redundant computations
 * for the same set of input arguments.
 *
 * @param {Function} operation The function whose results need to be cached.
 * @returns {Function} A new function that wraps the original operation with caching logic.
 */
function cacheFunctionResults(operation) {
  // `memoStorage` acts as the cache, using a Map for efficient key-value storage.
  // A Map is chosen over a plain object to better handle various argument types as keys,
  // especially arrays or objects, which would be stringified.
  const memoStorage = new Map();

  // This returned function is the memoized version of the original `operation`.
  return (...inputArguments) => {
    // To use arrays or multiple primitive arguments as a single unique key in the Map,
    // they are converted into a JSON string. This ensures consistent key generation.
    const keyString = JSON.stringify(inputArguments);

    // Check if a result for these specific `inputArguments` already exists in the cache.
    if (memoStorage.has(keyString)) {
      // If a cached result is found, return it immediately, bypassing the original operation.
      return memoStorage.get(keyString);
    } else {
      // If no cached result exists, execute the original `operation` with the given arguments.
      const computedResult = operation(...inputArguments);

      // Store the newly computed result in the cache for future calls with the same arguments.
      memoStorage.set(keyString, computedResult);

      // Return the computed result.
      return computedResult;
    }
  };
}

/**
 * Represents a single element (node) within a hierarchical structure, such as a binary tree.
 * Each node holds its unique identifier, references to its parent, and its left and right children.
 */
class TreeNode {
  /**
   * Initializes a new `TreeNode` instance.
   *
   * @param {number} nodeIdentifier A unique numerical ID for this node. Must be non-negative.
   * @param {number} [parentRef=-1] The ID of this node's parent. Defaults to -1, indicating no parent (root node).
   * @param {number} [leftChildRef=-1] The ID of this node's left child. Defaults to -1, indicating no left child.
   * @param {number} [rightChildRef=-1] The ID of this node's right child. Defaults to -1, indicating no right child.
   * @throws {Error} If `nodeIdentifier` is not a valid non-negative number.
   */
  constructor(nodeIdentifier, parentRef = -1, leftChildRef = -1, rightChildRef = -1) {
    // Basic validation to ensure the node has a valid identifier.
    if (typeof nodeIdentifier !== 'number' || nodeIdentifier < 0) {
      throw new Error(`Invalid 'nodeIdentifier' provided: ${nodeIdentifier}. Must be a non-negative number.`);
    }

    this.nodeIdentifier = nodeIdentifier;
    this.parentRef = parentRef;
    this.leftChildRef = leftChildRef;
    this.rightChildRef = rightChildRef;
  }

  /**
   * A getter that classifies the node's structural role within the tree.
   *
   * @returns {string} One of 'root', 'leaf', or 'internal node'.
   */
  get nodeKind() {
    // A root node has no parent.
    if (this.parentRef === -1) {
      return 'root';
    }
    // A leaf node has no children.
    else if (this.leftChildRef === -1 && this.rightChildRef === -1) {
      return 'leaf';
    }
    // Any other node is an internal node (has a parent and at least one child).
    else {
      return 'internal node';
    }
  }

  /**
   * Determines if this node is a leaf node (i.e., has no children).
   *
   * @returns {boolean} `true` if the node is a leaf, `false` otherwise.
   */
  isLeaf() {
    return this.leftChildRef === -1 && this.rightChildRef === -1;
  }
}

/**
 * Manages a collection of `TreeNode` objects to form a binary tree structure.
 * Provides functionalities to build, manipulate, and query the tree.
 */
class HierarchicalStructure {
  /**
   * Initializes a new `HierarchicalStructure` instance.
   */
  constructor() {
    // `structureElements` stores `TreeNode` objects, indexed by their `nodeIdentifier`.
    // An array is used, which can be sparse if node IDs are not contiguous.
    this.structureElements = [];
    // `elementDetailsMap` stores additional computed attributes for each node,
    // such as sibling ID, degree (number of children), etc. A Map is used for flexible
    // storage and retrieval by node ID.
    this.elementDetailsMap = new Map();
    // Keeps track of the total number of nodes successfully added to the structure.
    this.totalElementCount = 0;

    // The `calculateLevel` method is recursive and potentially expensive.
    // It is memoized using `cacheFunctionResults` to optimize performance.
    // `bind(this)` ensures `calculateLevel` retains its context when called by the memoizer.
    this.calculateLevel = cacheFunctionResults(this.calculateLevel.bind(this));
  }

  /**
   * A static getter that provides access to the `TreeNode` class constructor.
   * This allows users of `HierarchicalStructure` to create `TreeNode` instances directly
   * if needed, e.g., `HierarchicalStructure.ElementUnit`.
   *
   * @returns {typeof TreeNode} The `TreeNode` class.
   */
  static get ElementUnit() {
    return TreeNode;
  }

  /**
   * Inserts a new node into the hierarchical structure. If a node with the given ID
   * already exists, its child references are updated.
   *
   * @param {number} nodeId The unique identifier for the node to insert or update.
   * @param {number} leftChild The identifier of the left child, or -1 if none.
   * @param {number} rightChild The identifier of the right child, or -1 if none.
   */
  insertElement(nodeId, leftChild, rightChild) {
    // Validate the input `nodeId` to ensure it's a non-negative number.
    if (typeof nodeId !== 'number' || nodeId < 0) {
      console.warn(`Attempted to insert element with invalid ID: ${nodeId}. Insertion aborted.`);
      return;
    }

    // Check if an element with this `nodeId` already exists.
    if (this.structureElements[nodeId]) {
      // If it exists, update its child references. This behavior allows for
      // defining nodes initially and then specifying their children later.
      const existingNode = this.structureElements[nodeId];
      existingNode.leftChildRef = leftChild;
      existingNode.rightChildRef = rightChild;
      // Optionally, a warning could be logged here if this is an unexpected update.
      return;
    }

    // If the node does not exist, create a new `TreeNode` instance.
    // The `parentRef` is initially set to -1; it will be updated during `establishRelationships`.
    this.structureElements[nodeId] = new HierarchicalStructure.ElementUnit(nodeId, -1, leftChild, rightChild);
    this.totalElementCount++; // Increment the count of elements in the structure.
  }

  /**
   * Iterates through all elements in the structure to establish parent-child and sibling
   * relationships, and to compute additional details like the degree (number of children)
   * for each node. This method should be called after all nodes have been inserted.
   */
  establishRelationships() {
    // Iterate through `structureElements` using a standard `for` loop to handle sparse arrays.
    for (let i = 0; i < this.structureElements.length; i++) {
      const currentElement = this.structureElements[i];

      // Skip over undefined or null entries that might result from sparse array usage.
      if (!currentElement) {
        continue;
      }

      // Retrieve or initialize the detailed information object for the `currentElement`.
      // This object will store `element`, `siblingIdentifier`, and `childDegree`.
      const currentDetails = this.elementDetailsMap.get(currentElement.nodeIdentifier) || {
        element: currentElement,
        siblingIdentifier: -1, // Default to no sibling.
        childDegree: 0 // Default to zero children.
      };

      // Process the left child reference.
      if (currentElement.leftChildRef !== -1) {
        const leftChildNode = this.retrieveElement(currentElement.leftChildRef);
        if (leftChildNode) {
          // Set the parent reference for the left child.
          leftChildNode.parentRef = currentElement.nodeIdentifier;

          // Retrieve or initialize details for the left child.
          const leftChildDetails = this.elementDetailsMap.get(leftChildNode.nodeIdentifier) || {
            element: leftChildNode,
            siblingIdentifier: -1,
            childDegree: 0
          };
          // Assign the right child of the current element as the sibling of its left child.
          leftChildDetails.siblingIdentifier = currentElement.rightChildRef;
          this.elementDetailsMap.set(leftChildNode.nodeIdentifier, leftChildDetails);
        } else {
          // Log a warning if a referenced child node cannot be found in the structure.
          console.warn(`Left child with ID ${currentElement.leftChildRef} not found for node ${currentElement.nodeIdentifier}.`);
        }
        currentDetails.childDegree++; // Increment the child degree for the current element.
      }

      // Process the right child reference, similar to the left child.
      if (currentElement.rightChildRef !== -1) {
        const rightChildNode = this.retrieveElement(currentElement.rightChildRef);
        if (rightChildNode) {
          // Set the parent reference for the right child.
          rightChildNode.parentRef = currentElement.nodeIdentifier;

          // Retrieve or initialize details for the right child.
          const rightChildDetails = this.elementDetailsMap.get(rightChildNode.nodeIdentifier) || {
            element: rightChildNode,
            siblingIdentifier: -1,
            childDegree: 0
          };
          // Assign the left child of the current element as the sibling of its right child.
          rightChildDetails.siblingIdentifier = currentElement.leftChildRef;
          this.elementDetailsMap.set(rightChildNode.nodeIdentifier, rightChildDetails);
        } else {
          console.warn(`Right child with ID ${currentElement.rightChildRef} not found for node ${currentElement.nodeIdentifier}.`);
        }
        currentDetails.childDegree++; // Increment the child degree for the current element.
      }
      // Store or update the computed details for the current element in the map.
      this.elementDetailsMap.set(currentElement.nodeIdentifier, currentDetails);
    }
  }

  /**
   * Recursively calculates the level (depth) of a specific node within the tree.
   * The root node is at level 0. This method is memoized for performance.
   *
   * @param {number} nodeId The identifier of the node whose level is to be determined.
   * @param {number} [currentLevel=0] An internal parameter used to track the current depth during recursion.
   * @returns {number} The depth level of the node. Returns -1 if the node is not found in the structure.
   */
  calculateLevel(nodeId, currentLevel = 0) {
    const targetNode = this.retrieveElement(nodeId);

    // If the node isn't found, it indicates an invalid ID or a structural issue.
    if (!targetNode) {
      return -1;
    }

    // Base case: If the node has no parent, it is the root, and its level is `currentLevel`.
    if (targetNode.parentRef === -1) {
      return currentLevel;
    }

    // Recursive step: Increment the `currentLevel` and call `calculateLevel` for the parent node.
    return this.calculateLevel(targetNode.parentRef, currentLevel + 1);
  }

  /**
   * Recursively determines the maximum depth (height) of the subtree rooted at a given node.
   * The height of a leaf node is 0.
   *
   * @param {number} nodeId The identifier of the root node of the subtree.
   * @param {number} [currentMeasure=-1] An internal parameter tracking the current depth/height during recursion.
   *                                    Starts at -1 for the initial call, so a leaf node gets a height of 0.
   * @returns {number} The height of the subtree. Returns `currentMeasure` (which is -1 for initial calls)
   *                   if the `nodeId` is -1 (indicating a null child) or the node is not found.
   */
  determineMaxDepth(nodeId, currentMeasure = -1) {
    // Base case 1: If `nodeId` is -1 (representing a non-existent child), return the current measure.
    // This effectively means the path ends here, and its contribution to height is `currentMeasure`.
    if (nodeId === -1) {
      return currentMeasure;
    }

    const currentNode = this.retrieveElement(nodeId);

    // Base case 2: If the node is not found, stop the recursion along this path.
    if (!currentNode) {
      return currentMeasure;
    }

    // Recursively calculate the height of the left and right subtrees.
    // `currentMeasure` is incremented for each step down the tree.
    const leftSubtreeHeight = this.determineMaxDepth(currentNode.leftChildRef, currentMeasure + 1);
    const rightSubtreeHeight = this.determineMaxDepth(currentNode.rightChildRef, currentMeasure + 1);

    // The height of the current node's subtree is the maximum of its children's heights.
    return Math.max(leftSubtreeHeight, rightSubtreeHeight);
  }

  /**
   * Retrieves a `TreeNode` object from the structure by its identifier.
   *
   * @param {number} nodeId The identifier of the node to retrieve.
   * @returns {TreeNode | null} The `TreeNode` object if found, otherwise `null`.
   */
  retrieveElement(nodeId) {
    // Validate the `nodeId`. -1 is a valid reference for "no child/parent".
    if (typeof nodeId !== 'number' || nodeId < -1) {
      // console.warn(`Attempted to retrieve element with invalid ID type or value: ${nodeId}`);
      return null;
    }
    // Access the element from the `structureElements` array.
    const element = this.structureElements[nodeId];
    // Return the element if found, otherwise explicitly return `null`.
    return element || null;
  }

  /**
   * Generates and prints a detailed summary report for each node in the tree.
   * The report includes the node's identifier, parent, sibling, degree, level, height, and kind.
   */
  displayStructureSummary() {
    console.log("--- Hierarchical Structure Summary ---");

    // Retrieve all node identifiers from the `elementDetailsMap` and sort them numerically
    // to ensure a consistent and ordered output.
    const sortedNodeIds = Array.from(this.elementDetailsMap.keys()).sort((a, b) => a - b);

    if (sortedNodeIds.length === 0) {
      console.log("No elements were found in the structure to display.");
      console.log("------------------------------------");
      return;
    }

    // Iterate through each sorted node ID to generate its summary.
    for (const nodeId of sortedNodeIds) {
      const details = this.elementDetailsMap.get(nodeId);

      // Skip if details are missing, which indicates an inconsistency.
      if (!details || !details.element) {
        console.warn(`Details or element object missing for node ID: ${nodeId}. Skipping this entry.`);
        continue;
      }

      const node = details.element;
      // Format parent and sibling IDs for display, showing 'None' for -1.
      const nodeParent = node.parentRef === -1 ? 'None' : node.parentRef;
      const nodeSibling = details.siblingIdentifier === -1 ? 'None' : details.siblingIdentifier;
      const nodeDegree = details.childDegree;
      // Calculate level and height using the class methods.
      const nodeLevel = this.calculateLevel(node.nodeIdentifier);
      const nodeHeight = this.determineMaxDepth(node.nodeIdentifier);
      const nodeType = node.nodeKind;

      // Print the formatted summary for the current node.
      console.log(
        `Element: ${node.nodeIdentifier} | Parent: ${nodeParent} | Sibling: ${nodeSibling} | Children: ${nodeDegree} | Level: ${nodeLevel} | Height: ${nodeHeight} | Type: ${nodeType}`
      );
    }
    console.log("------------------------------------");
  }
}

/**
 * An immediately invoked function expression (IIFE) that serves as the main entry point
 * for processing tree data. It reads input, constructs the tree, and displays its summary.
 */
(function executeTreeProcessing() {
  // Require the 'fs' (file system) module to read input from standard input.
  const fileSystem = require('fs');

  // Read all data from '/dev/stdin', decode it as UTF-8, remove leading/trailing whitespace,
  // and split it into an array of lines.
  const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line of input is expected to be the total number of nodes.
  const totalNodesExpected = Number(inputLines.shift());

  // Input validation: Check if `totalNodesExpected` is a valid non-negative number.
  if (isNaN(totalNodesExpected) || totalNodesExpected < 0) {
    console.error("Error: Invalid or missing number of nodes specified in the first line of input.");
    return; // Exit if input is invalid.
  }

  // Instantiate the custom hierarchical structure.
  const myHierarchicalStructure = new HierarchicalStructure();

  // Process each remaining line in the input, which defines individual nodes.
  inputLines.forEach((lineText, index) => {
    // Skip empty lines to prevent errors.
    if (!lineText.trim()) {
      console.warn(`Skipping empty line at input index ${index + 1}.`);
      return;
    }

    // Split the line by spaces and convert each part to a number.
    // Destructure directly into `nodeId`, `leftChild`, `rightChild`.
    const [nodeId, leftChild, rightChild] = lineText.split(' ').map(Number);

    // Validate that all parsed values are indeed numbers.
    if (isNaN(nodeId) || isNaN(leftChild) || isNaN(rightChild)) {
      console.error(`Error: Invalid numeric data found in line "${lineText}" at input index ${index + 1}. Skipping this node.`);
      return;
    }

    // Insert the parsed node data into the hierarchical structure.
    myHierarchicalStructure.insertElement(nodeId, leftChild, rightChild);
  });

  // After all nodes have been added, establish their inter-relationships
  // (parent-child, sibling, degree calculations).
  myHierarchicalStructure.establishRelationships();

  // Finally, print a comprehensive summary of the constructed tree.
  myHierarchicalStructure.displayStructureSummary();
})();