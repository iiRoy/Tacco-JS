class ArborealStructure {
  // A sophisticated data structure for managing hierarchical relationships between nodes.
  // This constructor initializes the tree with a specified number of elements.
  constructor(initialElementCount) {
    // Array to hold all node objects, accessible by index (node ID - 1).
    this.elementArray = new Array(initialElementCount);
    // A mapping from node ID to the actual node object for quick lookups.
    this.elementMap = new Map();

    // Populate the array with basic node structures.
    for (let currentIdx = 0; currentIdx < initialElementCount; currentIdx++) {
      const newNodeId = currentIdx + 1;
      const initialNodeState = {
        nodeIdentifier: newNodeId,
        parentIdentifier: -1, // -1 signifies no parent
        leftChildIdentifier: -1, // -1 signifies no left child
        rightChildIdentifier: -1 // -1 signifies no right child
      };
      this.elementArray[currentIdx] = initialNodeState;
      this.elementMap.set(newNodeId, initialNodeState);
    }
  }

  // Property to retrieve the primary (root) node of the tree.
  // The root is defined as the node without a parent.
  get obtainRootElement() {
    // If the collection is empty, there's no root.
    if (this.elementArray.length === 0) {
      console.warn("Attempted to get root from an empty tree structure.");
      return null;
    }
    // Iterate through all elements to find the one whose parent is undefined (-1).
    for (const anElement of this.elementArray) {
      if (anElement.parentIdentifier === -1) {
        return anElement;
      }
    }
    // Fallback: This should ideally not be reached if the tree is well-formed.
    return null;
  }

  // Method to establish the left and right children for a given node.
  // Also updates the parent identifiers of the new children.
  establishChildren(currentNodeId, potentialLeftChildId, potentialRightChildId) {
    const currentElement = this.retrieveElement(currentNodeId);

    // Validate if the target node exists before proceeding.
    if (!currentElement) {
      console.error(`Error: Parent node with ID ${currentNodeId} not found.`);
      return; // Exit if parent doesn't exist.
    }

    // Assign the child identifiers to the current node.
    currentElement.leftChildIdentifier = potentialLeftChildId;
    currentElement.rightChildIdentifier = potentialRightChildId;

    // If a valid left child ID is provided, update its parent reference.
    if (potentialLeftChildId !== -1) {
      const leftChildElement = this.retrieveElement(potentialLeftChildId);
      if (leftChildElement) { // Ensure the child node actually exists.
        leftChildElement.parentIdentifier = currentNodeId;
      } else {
        console.warn(`Warning: Left child node with ID ${potentialLeftChildId} not found for parent ${currentNodeId}.`);
      }
    }

    // If a valid right child ID is provided, update its parent reference.
    if (potentialRightChildId !== -1) {
      const rightChildElement = this.retrieveElement(potentialRightChildId);
      if (rightChildElement) { // Ensure the child node actually exists.
        rightChildElement.parentIdentifier = currentNodeId;
      } else {
        console.warn(`Warning: Right child node with ID ${potentialRightChildId} not found for parent ${currentNodeId}.`);
      }
    }
  }

  // Method to retrieve a node object by its unique identifier.
  retrieveElement(targetId) {
    // Basic validation for node ID range.
    if (targetId < 1 || targetId > this.elementArray.length) {
      // console.debug(`Debug: Attempted to retrieve element with invalid ID: ${targetId}`);
      return null; // Return null for out-of-bounds IDs.
    }
    // Using the map for O(1) average time complexity lookup.
    return this.elementMap.get(targetId);
  }

  // Performs a post-order traversal and returns a sequence of node identifiers.
  fetchPostOrderSequence() {
    const traversalOutput = []; // Array to store the result of the traversal.
    const rootNode = this.obtainRootElement;

    // Guard clause: if there's no root, return an empty array.
    if (!rootNode) {
      return traversalOutput;
    }

    // Internal recursive function to perform the post-order traversal.
    // This closure captures `traversalOutput` and `this` (the tree instance).
    const processNodePostOrder = (currentNodeId) => {
      // Base case: if the node ID is invalid or represents a null child.
      if (currentNodeId === -1) {
        return;
      }

      const currentNodeObject = this.retrieveElement(currentNodeId);

      // Guard against non-existent nodes in case of malformed IDs.
      if (!currentNodeObject) {
        console.warn(`Warning: Node object for ID ${currentNodeId} not found during traversal.`);
        return;
      }

      // Recursively traverse the left subtree.
      processNodePostOrder(currentNodeObject.leftChildIdentifier);
      // Recursively traverse the right subtree.
      processNodePostOrder(currentNodeObject.rightChildIdentifier);

      // After visiting children, add the current node's ID to the result.
      traversalOutput.push(currentNodeId);
    };

    // Initiate the traversal from the root node.
    processNodePostOrder(rootNode.nodeIdentifier);
    return traversalOutput;
  }
}

// Helper function to convert an array of strings to an array of numbers.
const parseNumericArray = (strArray) => strArray.map(Number);

// Global counter for debugging recursive calls (Type III addition).
let recursiveCallCount = 0;

// Function to construct a binary tree given its pre-order and in-order traversal sequences.
function constructTreeFromTraversals(preOrderArr, inOrderArr) {
  // Initialize the tree structure with the total number of nodes.
  const newlyFormedTree = new ArborealStructure(preOrderArr.length);
  recursiveCallCount = 0; // Reset counter for each new tree construction.

  // Recursive helper function to build the tree.
  // `currentPreOrderSegment`: The pre-order sequence for the current subtree.
  // `currentInOrderSegment`: The in-order sequence for the current subtree.
  const partitionAndBuild = (currentPreOrderSegment, currentInOrderSegment) => {
    recursiveCallCount++; // Increment call counter.
    // console.debug(`Recursive call #${recursiveCallCount}: Pre: [${currentPreOrderSegment}], In: [${currentInOrderSegment}]`);

    // Base cases for recursion:
    // If either segment is empty, there are no nodes to process in this subtree.
    if (currentPreOrderSegment.length === 0 || currentInOrderSegment.length === 0) {
      return -1; // Indicate a null child.
    }
    // If there's only one element, it's a leaf node.
    if (currentPreOrderSegment.length === 1) {
      return currentPreOrderSegment[0];
    }

    // The first element in the pre-order sequence is always the root of the current subtree.
    const segmentRootId = currentPreOrderSegment[0];
    // Find the position of this root in the in-order sequence.
    const rootPositionInInOrder = currentInOrderSegment.indexOf(segmentRootId);

    // Critical validation: if root not found in in-order, something is wrong with input.
    if (rootPositionInInOrder === -1) {
      console.error(`Error: Root ID ${segmentRootId} from pre-order not found in current in-order segment: [${currentInOrderSegment}]. Tree construction aborted.`);
      return -1; // Indicate an error state or null child.
    }

    // Split the in-order sequence into left and right subtree segments.
    const leftSubtreeInOrder = currentInOrderSegment.slice(0, rootPositionInInOrder);
    const rightSubtreeInOrder = currentInOrderSegment.slice(rootPositionInInOrder + 1);

    // Determine the pre-order segments for the left and right subtrees.
    // The elements after the root in pre-order correspond to the left subtree,
    // followed by the right subtree. The length of the left pre-order segment
    // is equal to the length of the left in-order segment.
    const leftSubtreePreOrder = currentPreOrderSegment.slice(1, 1 + leftSubtreeInOrder.length);
    const rightSubtreePreOrder = currentPreOrderSegment.slice(1 + leftSubtreeInOrder.length);

    // Recursively build the left and right subtrees.
    const actualLeftChildId = partitionAndBuild(leftSubtreePreOrder, leftSubtreeInOrder);
    const actualRightChildId = partitionAndBuild(rightSubtreePreOrder, rightSubtreeInOrder);

    // Add the relationships to the tree structure.
    newlyFormedTree.establishChildren(segmentRootId, actualLeftChildId, actualRightChildId);

    return segmentRootId; // Return the ID of the root of the current subtree.
  };

  // Start the recursive tree building process with the full traversal sequences.
  partitionAndBuild(preOrderArr, inOrderArr);
  return newlyFormedTree;
}

// Main execution block wrapped in an Immediately Invoked Function Expression (IIFE).
(function executeProgram() {
  const fileSystem = require('fs'); // Explicitly import fs module.
  const startTime = Date.now(); // Record start time for performance tracking.

  // Read input from standard input, trim whitespace, and split by newlines.
  const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
  const inputLines = rawInputData.split('\n');

  // Basic validation for minimum number of input lines.
  if (inputLines.length < 3) {
    console.error("Insufficient input data provided. Expected at least 3 lines.");
    process.exit(1); // Exit with an error code.
  }

  // Parse the number of nodes (though not directly used by makeTree, it's part of the spec).
  const numberOfNodesSpecified = Number(inputLines.shift());
  // Parse the pre-order and in-order traversal sequences.
  const prefixTraversal = parseNumericArray(inputLines.shift().split(' '));
  const infixTraversal = parseNumericArray(inputLines.shift().split(' '));

  // Sanity check: number of nodes must match length of traversals.
  if (numberOfNodesSpecified !== prefixTraversal.length || numberOfNodesSpecified !== infixTraversal.length) {
      console.warn("Warning: Declared number of nodes does not match traversal array lengths. Proceeding with array lengths.");
      // Potentially adjust numberOfNodesSpecified here, or exit.
  }

  // Construct the tree using the parsed traversal sequences.
  const constructedTree = constructTreeFromTraversals(prefixTraversal, infixTraversal);

  // Retrieve the post-order sequence and print it to standard output, space-separated.
  console.log(constructedTree.fetchPostOrderSequence().join(' '));

  const endTime = Date.now();
  // console.debug(`Program finished in ${endTime - startTime} ms.`); // Log execution time.
})();