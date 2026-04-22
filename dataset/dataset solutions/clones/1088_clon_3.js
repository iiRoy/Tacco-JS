function createCachedOperation(operationFn) {
  // Storage for previously computed results
  const memoizationCache = new Map();

  // Returns a wrapped function that caches its results
  return (...args) => {
    // Generate a unique key for the arguments. JSON.stringify works for most cases,
    // but for simple numeric/string arrays, Array.prototype.join is often sufficient
    // and matches the original's implicit behavior for object keys.
    const cacheKey = args.join(',');

    // Check if the result is already in the cache
    if (memoizationCache.has(cacheKey)) {
      return memoizationCache.get(cacheKey); // Return cached value
    } else {
      // If not in cache, compute the result using the original function
      const computationResult = operationFn(...args);
      // Store the result in the cache before returning
      memoizationCache.set(cacheKey, computationResult);
      return computationResult;
    }
  };
}

/**
 * Represents an individual element within the hierarchical structure.
 * Stores references to its parent, left child, and right child.
 */
class TreeNodeElement {
  // A constant indicating an unassigned or non-existent reference
  static UNASSIGNED_REF = -1;

  constructor(elementIdentifier, parentReferenceId, leftChildRef, rightChildRef) {
    // Assign unique identifier to this node
    this.nodeIdentifier = elementIdentifier;
    // Identifier of the parent node; -1 for root
    this.parentReferenceId = parentReferenceId;
    // Identifier of the left child node; -1 if no left child
    this.leftChildRef = leftChildRef;
    // Identifier of the right child node; -1 if no right child
    this.rightChildRef = rightChildRef;
  }

  // Determines the classification of the node (root, leaf, or internal)
  get classification() {
    let nodeCategory;
    if (this.parentReferenceId === TreeNodeElement.UNASSIGNED_REF) {
      nodeCategory = 'root'; // This node has no parent
    } else if (this.leftChildRef === TreeNodeElement.UNASSIGNED_REF && this.rightChildRef === TreeNodeElement.UNASSIGNED_REF) {
      nodeCategory = 'leaf'; // This node has no children
    } else {
      nodeCategory = 'internal node'; // This node has a parent and at least one child
    }
    return nodeCategory;
  }
}

/**
 * Manages a collection of TreeNodeElement objects to form a binary tree structure.
 * Provides methods for adding nodes, establishing connections, and calculating properties.
 */
class HierarchicalStructure {
  constructor() {
    // A Map to store all tree nodes, keyed by their nodeIdentifier
    this.nodeRegistry = new Map();
    // A Map to store auxiliary information for each node, keyed by nodeIdentifier
    this.auxiliaryDataMap = new Map();
    // Memoize the depth calculation function for performance
    this.computeNodeDepth = createCachedOperation(this.computeNodeDepth.bind(this));
  }

  // Static getter to expose the TreeNodeElement class
  static get ElementClass() {
    return TreeNodeElement;
  }

  /**
   * Adds a new node to the structure.
   * @param {number} elementId - The unique identifier for the new node.
   * @param {number} leftChildId - The identifier of the left child.
   * @param {number} rightChildId - The identifier of the right child.
   */
  addNode(elementId, leftChildId, rightChildId) {
    // Ensure the node doesn't already exist
    if (this.nodeRegistry.has(elementId)) {
      console.warn(`Node with ID ${elementId} already exists. Overwriting.`);
    }
    // Create a new node instance and store it in the registry
    const newNode = new HierarchicalStructure.ElementClass(elementId, TreeNodeElement.UNASSIGNED_REF, leftChildId, rightChildId);
    this.nodeRegistry.set(elementId, newNode);
  }

  /**
   * Establishes parent-child and sibling relationships between nodes
   * based on the initial left/right child references.
   */
  establishConnections() {
    // Iterate over all nodes in the registry to set up relationships
    for (const currentNode of this.nodeRegistry.values()) {
      const currentId = currentNode.nodeIdentifier;
      let degreeCount = 0; // Initialize degree for the current node

      // Initialize auxiliary data for current node if not present
      if (!this.auxiliaryDataMap.has(currentId)) {
        this.auxiliaryDataMap.set(currentId, {
          associatedNode: currentNode,
          siblingRef: TreeNodeElement.UNASSIGNED_REF,
          connectionDegree: 0
        });
      }

      // Process left child
      if (currentNode.leftChildRef !== TreeNodeElement.UNASSIGNED_REF) {
        const leftChildNode = this.nodeRegistry.get(currentNode.leftChildRef);
        if (leftChildNode) {
          leftChildNode.parentReferenceId = currentId; // Set parent for left child
          // Ensure auxiliary data exists for left child
          if (!this.auxiliaryDataMap.has(leftChildNode.nodeIdentifier)) {
            this.auxiliaryDataMap.set(leftChildNode.nodeIdentifier, {
              associatedNode: leftChildNode,
              siblingRef: TreeNodeElement.UNASSIGNED_REF,
              connectionDegree: 0
            });
          }
          this.auxiliaryDataMap.get(leftChildNode.nodeIdentifier).siblingRef = currentNode.rightChildRef;
          degreeCount++;
        }
      }

      // Process right child
      if (currentNode.rightChildRef !== TreeNodeElement.UNASSIGNED_REF) {
        const rightChildNode = this.nodeRegistry.get(currentNode.rightChildRef);
        if (rightChildNode) {
          rightChildNode.parentReferenceId = currentId; // Set parent for right child
          // Ensure auxiliary data exists for right child
          if (!this.auxiliaryDataMap.has(rightChildNode.nodeIdentifier)) {
            this.auxiliaryDataMap.set(rightChildNode.nodeIdentifier, {
              associatedNode: rightChildNode,
              siblingRef: TreeNodeElement.UNASSIGNED_REF,
              connectionDegree: 0
            });
          }
          this.auxiliaryDataMap.get(rightChildNode.nodeIdentifier).siblingRef = currentNode.leftChildRef;
          degreeCount++;
        }
      }

      // Update the degree for the current node in its auxiliary data
      this.auxiliaryDataMap.get(currentId).connectionDegree = degreeCount;
    }
  }

  /**
   * Recursively computes the depth of a specific node within the tree.
   * Depth is the number of edges from the root to the node. Root has depth 0.
   * @param {number} targetNodeId - The identifier of the node.
   * @param {number} currentLevel - The current depth level during recursion. Defaults to 0.
   * @returns {number} The depth of the node.
   */
  computeNodeDepth(targetNodeId, currentLevel = 0) {
    const targetNode = this.retrieveNode(targetNodeId);
    if (!targetNode) {
      // Handle cases where the node might not exist (e.g., malformed tree)
      return TreeNodeElement.UNASSIGNED_REF;
    }

    // Base case: if it's the root, its depth is the current level (0 for initial call)
    if (targetNode.parentReferenceId === TreeNodeElement.UNASSIGNED_REF) {
      return currentLevel;
    } else {
      // Recursive step: increment level and call for the parent
      const parentId = targetNode.parentReferenceId;
      return this.computeNodeDepth(parentId, currentLevel + 1);
    }
  }

  /**
   * Recursively calculates the height of the subtree rooted at a specific node.
   * Height is the number of edges on the longest path from the node to a leaf.
   * A leaf node has a height of 0.
   * @param {number} rootId - The identifier of the node to start height calculation from.
   * @param {number} currentHeightLevel - The current level in the height calculation. Defaults to 0.
   * @returns {number} The height of the subtree.
   */
  calculateSubtreeHeight(rootId, currentHeightLevel = 0) {
    // If the reference is invalid, it means we've gone past a leaf or an empty slot
    if (rootId === TreeNodeElement.UNASSIGNED_REF) {
      return currentHeightLevel - 1; // Subtract 1 because the current level was incremented unnecessarily
    }

    const currentNode = this.retrieveNode(rootId);
    if (!currentNode) {
      // If node doesn't exist, treat it as a non-existent path
      return currentHeightLevel - 1;
    }

    // Recursively calculate height for left and right subtrees
    const leftSubtreeHeight = this.calculateSubtreeHeight(currentNode.leftChildRef, currentHeightLevel + 1);
    const rightSubtreeHeight = this.calculateSubtreeHeight(currentNode.rightChildRef, currentHeightLevel + 1);

    // The height of the current node is 1 + the maximum height of its children
    // (but the recursive calls already handle the +1 logic relative to their own children,
    // so we just take the max of what they return)
    return Math.max(leftSubtreeHeight, rightSubtreeHeight);
  }

  /**
   * Retrieves a node object from the registry by its identifier.
   * @param {number} identifier - The unique ID of the node.
   * @returns {TreeNodeElement | undefined} The node object, or undefined if not found.
   */
  retrieveNode(identifier) {
    // A simple lookup in the node registry
    return this.nodeRegistry.get(identifier);
  }

  /**
   * Generates and outputs a formatted string containing detailed information
   * for each node in the hierarchical structure.
   */
  displayStructureDetails() {
    const detailLines = [];
    for (const [nodeId, auxData] of this.auxiliaryDataMap.entries()) {
      const nodeEntity = auxData.associatedNode;
      if (!nodeEntity) {
        // Skip if the associated node somehow doesn't exist (shouldn't happen with proper connection logic)
        continue;
      }

      const nodeDepth = this.computeNodeDepth(nodeId);
      const nodeHeight = this.calculateSubtreeHeight(nodeId);
      const nodeType = nodeEntity.classification;

      // Construct a detailed information string for the current node
      const detailString = `node: ${nodeEntity.nodeIdentifier}: ` +
                           `parent = ${nodeEntity.parentReferenceId}, ` +
                           `sibling = ${auxData.siblingRef}, ` +
                           `degree = ${auxData.connectionDegree}, ` +
                           `depth = ${nodeDepth}, ` +
                           `height = ${nodeHeight}, ` +
                           `${nodeType}`;
      detailLines.push(detailString);
    }
    // Return all detail lines joined by newline characters
    return detailLines.join('\n');
  }
}

// Main execution block wrapped in an immediately invoked function expression (IIFE)
(function executeProgram() {
  // Use 'fs' module to read input from standard input (typically for competitive programming)
  const fileSystem = require('fs');
  const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

  // Process input: trim whitespace, split into lines
  const inputLines = rawInputData.trim().split('\n');

  // The first line usually contains the total number of elements, but not strictly used here
  const totalElementsCount = Number(inputLines.shift());
  if (isNaN(totalElementsCount) || totalElementsCount < 0) {
    console.error("Invalid number of elements provided in input.");
    return;
  }

  // Instantiate our custom hierarchical data structure
  let structureInstance = new HierarchicalStructure();

  // Process remaining lines to add nodes to the structure
  for (const lineContent of inputLines) {
    const numericValues = lineContent.split(' ').map(Number);
    // Destructure the array to get node ID, left child ID, and right child ID
    const [elementId, leftLink, rightLink] = numericValues;

    // Validate parsed numbers
    if (numericValues.some(isNaN)) {
      console.warn(`Skipping malformed input line: "${lineContent}"`);
      continue;
    }

    structureInstance.addNode(elementId, leftLink, rightLink);
  }

  // After all nodes are added, establish their interconnections
  structureInstance.establishConnections();

  // Print the detailed report of the tree structure
  console.log(structureInstance.displayStructureDetails());

  // Indicate successful program completion
  // console.log("\nStructure analysis complete.");
})();