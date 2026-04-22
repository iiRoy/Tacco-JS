class NavigableNodeCollection {
  /**
   * Initializes the node collection with a specified capacity.
   * Each node is pre-allocated with a unique key and default parent/child keys.
   * @param {number} initialCapacity - The number of nodes to pre-allocate in the collection.
   */
  constructor(initialCapacity) {
    // Validate input capacity to ensure it's a non-negative number.
    if (typeof initialCapacity !== 'number' || initialCapacity < 0) {
      console.warn("Invalid initial capacity provided to NavigableNodeCollection. Defaulting to an empty collection.");
      this.nodeRecords = [];
      return;
    }

    // Pre-allocate the array to the specified size for potential performance benefits.
    this.nodeRecords = new Array(initialCapacity);

    // Populate the array with basic node structures. Node keys are 1-based.
    for (let currentIdx = 0; currentIdx < initialCapacity; currentIdx++) {
      this.nodeRecords[currentIdx] = {
        nodeKey: currentIdx + 1,      // Unique identifier for this node.
        parentKey: -1,                // Identifier of the parent node; -1 indicates no parent (root).
        leftKey: -1,                  // Identifier of the left child node; -1 if no left child.
        rightKey: -1                  // Identifier of the right child node; -1 if no right child.
      };
    }
  }

  /**
   * Retrieves the principal (root) node of the tree.
   * The root node is identified by having a parentKey of -1.
   * @returns {object|null} The root node's data object, or null if the collection is empty or no root is found.
   */
  get getPrincipalNode() {
    if (this.nodeRecords.length === 0) {
      return null; // An empty collection has no root.
    }
    // Search for the first node that has no parent.
    const foundRoot = this.nodeRecords.find(element => element.parentKey === -1);
    return foundRoot;
  }

  /**
   * Locates and returns a node's data object by its unique key.
   * Node keys are 1-based, while the underlying array uses 0-based indexing.
   * @param {number} uniqueNodeKey - The unique key (ID) of the node to retrieve.
   * @returns {object} The node's data object, or an empty object if the key is invalid or the node is not found.
   */
  retrieveNodeDetails(uniqueNodeKey) {
    // Basic validation for the node key.
    if (typeof uniqueNodeKey !== 'number' || uniqueNodeKey < 1) {
      console.warn(`Attempted to retrieve node with an invalid key type or value: ${uniqueNodeKey}.`);
      return {}; // Return an empty object for invalid input.
    }

    // Convert 1-based key to 0-based array index.
    const targetIndex = uniqueNodeKey - 1;

    // Check if the calculated index is within the valid bounds of the node records array.
    if (targetIndex < 0 || targetIndex >= this.nodeRecords.length) {
      // console.info(`Node with key ${uniqueNodeKey} not found (index out of bounds).`);
      return {}; // Node not found or index is invalid.
    }
    // Return the node data, or an empty object if the slot is unexpectedly empty.
    return this.nodeRecords[targetIndex] || {};
  }

  /**
   * Performs a post-order traversal of the tree and returns the sequence of node keys.
   * In post-order, children are visited before the parent: Left -> Right -> Root.
   * @returns {number[]} An array containing the node keys in post-order sequence.
   */
  performPostOrderTraversal() {
    const collectedKeys = []; // This array will store the keys as they are visited in post-order.

    // First, check if the tree has a principal (root) node to start traversal.
    const principalNode = this.getPrincipalNode;
    if (!principalNode) {
      console.info("No principal node found in the collection. Tree is empty or malformed. Returning an empty traversal result.");
      return collectedKeys; // Return an empty array if there's no root.
    }

    /**
     * Recursive helper function to perform the post-order visit.
     * @param {number} currentKey - The key of the node currently being processed.
     */
    const traverseRecursive = (currentKey) => {
      // Base case for recursion: if the key is -1, it signifies a null child, so stop.
      if (currentKey === -1) {
        return;
      }

      // Retrieve the data for the current node.
      const currentNodeData = this.retrieveNodeDetails(currentKey);

      // Guard against cases where node data might not be found for a given key.
      if (Object.keys(currentNodeData).length === 0) {
        console.warn(`Node data not found for key: ${currentKey} during traversal. Skipping this branch.`);
        return;
      }

      // 1. Recursively visit the left child.
      traverseRecursive(currentNodeData.leftKey);
      // 2. Recursively visit the right child.
      traverseRecursive(currentNodeData.rightKey);
      // 3. Add the current node's key to the result array after its children have been visited.
      collectedKeys.push(currentKey);
    };

    // Initiate the recursive traversal starting from the principal node's key.
    traverseRecursive(principalNode.nodeKey);
    return collectedKeys;
  }
}

/**
 * Constructs a binary tree structure from its pre-order and in-order traversal sequences.
 * This function uses a recursive approach to build the tree.
 * @param {number[]} preOrderSequence - An array representing the pre-order traversal of the tree.
 * @param {number[]} inOrderSequence - An array representing the in-order traversal of the tree.
 * @returns {NavigableNodeCollection} A new tree collection populated with the constructed nodes.
 */
function assembleTreeFromOrders(preOrderSequence, inOrderSequence) {
  // Initial validation: ensure input sequences are provided and non-empty.
  if (!preOrderSequence || preOrderSequence.length === 0 || !inOrderSequence || inOrderSequence.length === 0) {
    console.error("Input sequences for tree assembly cannot be null or empty. Returning an empty tree.");
    return new NavigableNodeCollection(0);
  }
  // Validate that both sequences have the same number of elements.
  if (preOrderSequence.length !== inOrderSequence.length) {
    console.error("Pre-order and In-order sequences must contain the same number of node keys.");
    return new NavigableNodeCollection(0);
  }

  const totalNodeCount = preOrderSequence.length;
  // Create a new collection to store the nodes of the tree being built.
  const constructedTreeInstance = new NavigableNodeCollection(totalNodeCount);

  /**
   * Recursive helper function to partition sequences and assign node relationships.
   * @param {number[]} preSegment - The current segment of the pre-order sequence.
   * @param {number[]} inSegment - The current segment of the in-order sequence.
   */
  const recursiveTreeAssembler = (preSegment, inSegment) => {
    // Base case: if either segment is empty, there are no more nodes for this subtree.
    if (preSegment.length === 0 || inSegment.length === 0) {
      return;
    }

    // In a pre-order traversal, the first element is always the root of the current subtree.
    const currentRootKey = preSegment[0];
    // Find the index of this root in the in-order sequence. This index divides the in-order sequence into
    // left subtree elements (before the root) and right subtree elements (after the root).
    const rootKeyIndexInInOrder = inSegment.indexOf(currentRootKey);

    // Critical validation: if the root key from pre-order is not found in the in-order segment,
    // it indicates an inconsistent input or a malformed subtree.
    if (rootKeyIndexInInOrder === -1) {
      console.warn(`Key ${currentRootKey} (from pre-order) not found in its corresponding in-order segment. This branch might be inconsistent.`);
      return;
    }

    // --- Process the left subtree ---
    // If there are elements before the root in the in-order sequence, a left subtree exists.
    if (rootKeyIndexInInOrder > 0) {
      // The element immediately after the root in pre-order is the root of its left child.
      const potentialLeftChildKey = preSegment[1];

      // Retrieve node references to update their parent/child relationships.
      const rootNodeRef = constructedTreeInstance.retrieveNodeDetails(currentRootKey);
      const leftChildNodeRef = constructedTreeInstance.retrieveNodeDetails(potentialLeftChildKey);

      // Assign the left child key to the current root node.
      if (Object.keys(rootNodeRef).length > 0) {
        rootNodeRef.leftKey = potentialLeftChildKey;
      } else {
        console.warn(`Root node data for key ${currentRootKey} not found when trying to assign left child.`);
      }

      // Assign the current root as the parent of its left child.
      if (Object.keys(leftChildNodeRef).length > 0) {
        leftChildNodeRef.parentKey = currentRootKey;
      } else {
        console.warn(`Left child node data for key ${potentialLeftChildKey} not found when trying to assign parent.`);
      }

      // Recursively build the left subtree:
      // Pre-order segment for left: slices from index 1 up to (but not including) the element after the left subtree's elements.
      // In-order segment for left: slices from index 0 up to (but not including) the root's index.
      recursiveTreeAssembler(
        preSegment.slice(1, rootKeyIndexInInOrder + 1),
        inSegment.slice(0, rootKeyIndexInInOrder)
      );
    }

    // --- Process the right subtree ---
    // If there are elements after the root in the in-order sequence, a right subtree exists.
    if (rootKeyIndexInInOrder < inSegment.length - 1) {
      // The element in pre-order immediately after all left subtree elements is the root of the right child.
      const potentialRightChildKey = preSegment[rootKeyIndexInInOrder + 1];

      // Retrieve node references to update their parent/child relationships.
      const rootNodeRef = constructedTreeInstance.retrieveNodeDetails(currentRootKey);
      const rightChildNodeRef = constructedTreeInstance.retrieveNodeDetails(potentialRightChildKey);

      // Assign the right child key to the current root node.
      if (Object.keys(rootNodeRef).length > 0) {
        rootNodeRef.rightKey = potentialRightChildKey;
      } else {
        console.warn(`Root node data for key ${currentRootKey} not found when trying to assign right child.`);
      }

      // Assign the current root as the parent of its right child.
      if (Object.keys(rightChildNodeRef).length > 0) {
        rightChildNodeRef.parentKey = currentRootKey;
      } else {
        console.warn(`Right child node data for key ${potentialRightChildKey} not found when trying to assign parent.`);
      }

      // Recursively build the right subtree:
      // Pre-order segment for right: slices from the element after the left subtree's elements to the end.
      // In-order segment for right: slices from the element after the root's index to the end.
      recursiveTreeAssembler(
        preSegment.slice(rootKeyIndexInInOrder + 1),
        inSegment.slice(rootKeyIndexInInOrder + 1)
      );
    }
  };

  // Start the recursive tree assembly process with the full initial sequences.
  recursiveTreeAssembler(preOrderSequence, inOrderSequence);
  return constructedTreeInstance;
}

// An Immediately Invoked Function Expression (IIFE) to encapsulate the main execution flow.
(function executeTreeOperations() {
  const fs = require('fs'); // Import the Node.js file system module.
  const inputEncoding = 'utf8'; // Define the character encoding for input.
  const stdinPath = '/dev/stdin'; // Path to standard input on Unix-like systems.

  let rawInputContent;
  try {
    // Attempt to synchronously read all content from standard input.
    rawInputContent = fs.readFileSync(stdinPath, inputEncoding);
  } catch (error) {
    // Handle potential errors during file reading (e.g., file not found, permissions).
    console.error(`ERROR: Failed to read from standard input (${stdinPath}). Details: ${error.message}`);
    process.exit(1); // Exit the process with an error code.
  }

  // Process the raw input: trim whitespace and split into individual lines.
  const rawInputLines = rawInputContent.trim().split('\n');

  // Validate that a sufficient number of input lines are provided.
  const expectedMinLines = 3; // Expecting N, preOrder sequence, inOrder sequence.
  if (rawInputLines.length < expectedMinLines) {
    console.error(`ERROR: Insufficient input lines provided. Expected at least ${expectedMinLines}, but received only ${rawInputLines.length}.`);
    process.exit(1);
  }

  // --- Parse the number of nodes (N) ---
  const totalNodesCountStr = rawInputLines.shift(); // Get the first line.
  const totalNodesCount = Number(totalNodesCountStr); // Convert to number.
  if (isNaN(totalNodesCount) || totalNodesCount <= 0) {
    console.error(`ERROR: Invalid node count provided: '${totalNodesCountStr}'. Node count must be a positive integer.`);
    process.exit(1);
  }

  // --- Parse the pre-order traversal sequence ---
  const preOrderSequenceStr = rawInputLines.shift(); // Get the next line.
  const preOrderSequence = preOrderSequenceStr
    .split(' ')              // Split by space.
    .filter(s => s.length > 0) // Remove any empty strings resulting from multiple spaces.
    .map(Number);            // Convert each segment to a number.

  // --- Parse the in-order traversal sequence ---
  const inOrderSequenceStr = rawInputLines.shift(); // Get the final line for sequences.
  const inOrderSequence = inOrderSequenceStr
    .split(' ')
    .filter(s => s.length > 0)
    .map(Number);

  // --- Final validation of parsed sequence lengths ---
  if (preOrderSequence.length !== totalNodesCount || inOrderSequence.length !== totalNodesCount) {
    console.error(`ERROR: Mismatched node count with sequence lengths. Expected ${totalNodesCount} nodes, but pre-order has ${preOrderSequence.length} and in-order has ${inOrderSequence.length}.`);
    process.exit(1);
  }

  // --- Tree Construction ---
  // Call the helper function to build the tree from the parsed sequences.
  const constructedTreeInstance = assembleTreeFromOrders(preOrderSequence, inOrderSequence);

  // --- Post-order Traversal and Output ---
  // Perform the post-order traversal on the newly constructed tree.
  const finalTraversalResult = constructedTreeInstance.performPostOrderTraversal();

  // Define the separator for the output.
  const outputSeparator = ' ';
  // Print the resulting post-order sequence to standard output, joined by spaces.
  console.log(finalTraversalResult.join(outputSeparator));

})(); // End of IIFE.