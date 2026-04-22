class NodeCollectionHandler {
  /**
   * Initializes the node collection with a specified number of elements.
   * Each element is assigned a unique identifier and default relationship properties.
   * @param {number} totalElements - The total number of nodes to initialize.
   * @throws {Error} If an invalid number of elements is provided.
   */
  constructor(totalElements) {
    // Validate the input count to prevent issues with array/map initialization.
    if (typeof totalElements !== 'number' || totalElements <= 0 || !Number.isInteger(totalElements)) {
      throw new Error("NodeCollectionHandler: Invalid number of elements provided. Must be a positive integer.");
    }

    // Using a Map for efficient lookup by identifier, which is a structural change from an array.
    // Each node object stores its own identifier and references to parent/children.
    this.elementMap = new Map();

    // Populate the map with initial node structures.
    for (let k = 0; k < totalElements; ++k) {
      const currentIdentifier = k + 1; // Node identifiers are 1-based as per original logic.
      this.elementMap.set(currentIdentifier, {
        identifier: currentIdentifier,
        parentIdentifier: null,       // Using 'null' instead of -1 for clearer semantic meaning of 'no parent'.
        leftChildIdentifier: null,    // Using 'null' instead of -1 for clearer semantic meaning of 'no child'.
        rightChildIdentifier: null    // Using 'null' instead of -1 for clearer semantic meaning of 'no child'.
      });
    }
  }

  /**
   * Retrieves the primary (root) node of the tree.
   * The root node is defined as the one without a parent.
   * @returns {object|null} The root node object, or null if no root is found.
   */
  get primaryNode() {
    // Iterate through the map values to find the node with no parent.
    // This is an explicit iteration instead of a built-in find method for structural variation.
    for (const element of this.elementMap.values()) {
      if (element.parentIdentifier === null) {
        return element; // Found the root.
      }
    }
    // No root found, which might indicate an empty tree or an error in construction.
    return null;
  }

  /**
   * Locates and returns a node object by its unique identifier.
   * @param {number} nodeIdentifier - The ID of the node to retrieve.
   * @returns {object} The node object corresponding to the given identifier.
   * @throws {Error} If no node is found for the given identifier.
   */
  retrieveElement(nodeIdentifier) {
    // Attempt to get the node from the map.
    const foundElement = this.elementMap.get(nodeIdentifier);
    if (!foundElement) {
      // Provide a clear error message if the node doesn't exist, adding a guard clause.
      throw new Error(`Node with identifier ${nodeIdentifier} not found in the collection.`);
    }
    return foundElement;
  }

  /**
   * Generates a sequence of node identifiers based on a post-order traversal.
   * In a post-order traversal, a node is visited after its left and right children.
   * @returns {Array<number>} An array containing the node identifiers in post-order.
   */
  generatePostOrderSequence() {
    const traversalResult = []; // Accumulator for the post-order sequence.
    const treeRoot = this.primaryNode;

    // Guard clause: if the tree is empty or no root is found, return an empty array.
    if (!treeRoot) {
      // A warning for an unusual state, indicating potential issue or empty input.
      console.warn("Attempted post-order traversal on an empty or improperly constructed tree; returning empty sequence.");
      return traversalResult;
    }

    /**
     * Recursive helper function to perform the post-order traversal.
     * This function is nested to maintain scope for `traversalResult` and `this`.
     * @param {number|null} currentId - The identifier of the node currently being processed.
     */
    const processNodeRecursively = (currentId) => {
      // Base case: if the current identifier is null, there's no node to process.
      if (currentId === null) {
        return;
      }

      // Retrieve the current node's full object structure using the helper method.
      const currentNode = this.retrieveElement(currentId);

      // Recursively visit the left child first.
      processNodeRecursively(currentNode.leftChildIdentifier);
      // Then recursively visit the right child.
      processNodeRecursively(currentNode.rightChildIdentifier);

      // Finally, after both children have been visited, add the current node's identifier to the result sequence.
      traversalResult.push(currentId);
    };

    // Start the traversal from the root node's identifier.
    processNodeRecursively(treeRoot.identifier);

    return traversalResult;
  }
}

/**
 * Constructs a binary tree structure given its pre-order and in-order traversal sequences.
 * This is a common algorithm for reconstructing a unique binary tree.
 * @param {Array<number>} preOrderArr - The pre-order traversal sequence of node identifiers.
 * @param {Array<number>} inOrderArr - The in-order traversal sequence of node identifiers.
 * @returns {NodeCollectionHandler} An instance of NodeCollectionHandler representing the built tree.
 * @throws {Error} If input arrays are invalid or inconsistent.
 */
function buildGraphFromTraversals(preOrderArr, inOrderArr) {
  // Input validation: Ensure arrays are provided and have consistent lengths.
  if (!Array.isArray(preOrderArr) || !Array.isArray(inOrderArr) ||
      preOrderArr.length === 0 || inOrderArr.length === 0 ||
      preOrderArr.length !== inOrderArr.length) {
    throw new Error("Invalid or inconsistent input arrays for tree construction. Both must be non-empty arrays of equal length.");
  }

  // Create a new handler to store the tree nodes.
  const graphInstance = new NodeCollectionHandler(preOrderArr.length);

  /**
   * Recursive function to construct subtrees using segments of pre-order and in-order arrays.
   * This version uses indices to avoid expensive array slicing operations, a significant Type III optimization.
   * @param {number} preStart - Starting index of the current pre-order segment.
   * @param {number} preEnd - Ending index (inclusive) of the current pre-order segment.
   * @param {number} inStart - Starting index of the current in-order segment.
   * @param {number} inEnd - Ending index (inclusive) of the current in-order segment.
   */
  const recursiveSubtreeBuilder = (preStart, preEnd, inStart, inEnd) => {
    // Base case: if the segment is empty or invalid, return.
    if (preStart > preEnd || inStart > inEnd) {
      return;
    }

    // The first element in the pre-order segment is always the root of the current subtree.
    const currentRootValue = preOrderArr[preStart];
    const currentRootNode = graphInstance.retrieveElement(currentRootValue);

    // Find the index of the current root value in the in-order segment.
    // This index splits the in-order array into left and right subtrees.
    let rootIndexInInOrder = -1;
    // Explicit loop for finding index instead of `indexOf` as a Type III structural change.
    for (let i = inStart; i <= inEnd; ++i) {
      if (inOrderArr[i] === currentRootValue) {
        rootIndexInInOrder = i;
        break;
      }
    }

    // Critical validation: if root not found in in-order, input is inconsistent, which is an added guard.
    if (rootIndexInInOrder === -1) {
      throw new Error(`Node value ${currentRootValue} from pre-order not found in corresponding in-order segment. Input data is inconsistent.`);
    }

    // Calculate the size of the left subtree. This is a crucial intermediate step.
    const leftSubtreeSize = rootIndexInInOrder - inStart;

    // Process the left child subtree if it exists.
    if (leftSubtreeSize > 0) {
      // The left child's identifier is the element immediately after the root in pre-order.
      const leftChildId = preOrderArr[preStart + 1];
      currentRootNode.leftChildIdentifier = leftChildId;
      // Establish the parent relationship for the left child.
      graphInstance.retrieveElement(leftChildId).parentIdentifier = currentRootValue;

      // Recursively build the left subtree.
      recursiveSubtreeBuilder(
        preStart + 1,                       // Pre-order start for left subtree
        preStart + leftSubtreeSize,         // Pre-order end for left subtree
        inStart,                            // In-order start for left subtree
        rootIndexInInOrder - 1              // In-order end for left subtree
      );
    }

    // Process the right child subtree if it exists.
    // The size of the right subtree is the total segment size minus left subtree size minus the root itself.
    const rightSubtreeSize = inEnd - rootIndexInInOrder;
    if (rightSubtreeSize > 0) {
      // The right child's identifier is found after the left subtree in pre-order.
      const rightChildId = preOrderArr[preStart + leftSubtreeSize + 1];
      currentRootNode.rightChildIdentifier = rightChildId;
      // Establish the parent relationship for the right child.
      graphInstance.retrieveElement(rightChildId).parentIdentifier = currentRootValue;

      // Recursively build the right subtree.
      recursiveSubtreeBuilder(
        preStart + leftSubtreeSize + 1,     // Pre-order start for right subtree
        preEnd,                             // Pre-order end for right subtree
        rootIndexInInOrder + 1,             // In-order start for right subtree
        inEnd                               // In-order end for right subtree
      );
    }
  };

  // Initiate the recursive build process for the entire tree, starting with full array ranges.
  recursiveSubtreeBuilder(0, preOrderArr.length - 1, 0, inOrderArr.length - 1);

  return graphInstance;
}

// Self-executing anonymous function to run the main application logic, encapsulated for scope.
(function executeProcessingPipeline() {
  // Try-catch block for robust error handling during input processing and tree construction.
  try {
    // Standard input reading from /dev/stdin.
    const fileSystemModule = require('fs'); // Explicitly naming the module variable.
    const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Process raw input: trim whitespace and split into individual lines.
    const rawInputLines = rawInputContent.trim().split('\n');

    // Extract the number of nodes from the first line.
    const nodeCountFromInputString = rawInputLines.shift();
    const nodeCountFromInput = Number(nodeCountFromInputString);

    // Validate the parsed node count, adding guard clauses for robustness.
    if (isNaN(nodeCountFromInput) || nodeCountFromInput <= 0 || !Number.isInteger(nodeCountFromInput)) {
      throw new Error(`Invalid node count: '${nodeCountFromInputString}'. Must be a positive integer.`);
    }
    // Additional check: ensure enough lines for subsequent arrays.
    if (rawInputLines.length < 2) {
        throw new Error("Insufficient input lines provided for pre-order and in-order sequences.");
    }

    // Parse the pre-order traversal sequence from the next line.
    const preOrderLineContent = rawInputLines.shift();
    const preOrderArr = preOrderLineContent.split(' ').map(numStr => {
      const num = Number(numStr);
      // Inline validation for each number in the sequence.
      if (isNaN(num)) throw new Error(`Invalid number found in pre-order sequence: '${numStr}'`);
      return num;
    });

    // Parse the in-order traversal sequence from the subsequent line.
    const inOrderLineContent = rawInputLines.shift();
    const inOrderArr = inOrderLineContent.split(' ').map(numStr => {
      const num = Number(numStr);
      // Inline validation for each number in the sequence.
      if (isNaN(num)) throw new Error(`Invalid number found in in-order sequence: '${numStr}'`);
      return num;
    });

    // Ensure the lengths of the traversal arrays match the declared node count.
    if (preOrderArr.length !== nodeCountFromInput || inOrderArr.length !== nodeCountFromInput) {
      throw new Error("Mismatch: Traversal array lengths do not match the declared node count.");
    }

    // Construct the binary tree using the provided traversal sequences.
    const constructedGraph = buildGraphFromTraversals(preOrderArr, inOrderArr);

    // Obtain the post-order sequence from the constructed tree.
    const postOrderOutput = constructedGraph.generatePostOrderSequence();

    // Print the result to standard output, joined by spaces, followed by a newline.
    process.stdout.write(postOrderOutput.join(' ') + '\n');

  } catch (error) {
    // Log any errors that occur during execution to standard error.
    console.error(`Application Error: ${error.message}`);
    // Exit with a non-zero code to indicate failure, which is a common practice for scripts.
    process.exit(1);
  }
})();