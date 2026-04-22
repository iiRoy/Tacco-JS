const createMemoizedFunction = (originalFunc) => {
  // Guard clause: Ensure the target for memoization is indeed a function.
  if (typeof originalFunc !== 'function') {
    throw new Error("Memoization target must be a valid function.");
  }

  // Utilize a Map for caching to handle various key types more robustly than a plain object.
  const memoizationCache = new Map();

  return (...invocationArgs) => {
    // Generate a unique cache key from the arguments. JSON.stringify works well for primitive
    // or simple array/object arguments where order and value define uniqueness.
    const cacheKey = JSON.stringify(invocationArgs);

    // Check if the result for these arguments is already in the cache.
    if (memoizationCache.has(cacheKey)) {
      // console.log(`Cache HIT for key: ${cacheKey}`); // Debugging: uncomment to see cache hits
      return memoizationCache.get(cacheKey);
    } else {
      // console.log(`Cache MISS for key: ${cacheKey}`); // Debugging: uncomment to see cache misses
      // If not cached, execute the original function to compute the result.
      const computedResult = originalFunc(...invocationArgs);
      // Store the computed result in the cache for future use.
      memoizationCache.set(cacheKey, computedResult);
      return computedResult;
    }
  };
};

// Define a constant for indicating an unlinked or non-existent association.
const UNLINKED_ID_CONST = -1;
const INITIAL_CHILD_DEGREE = 0; // New constant for initial degree

/**
 * Represents a single element within the hierarchical tree structure.
 * Stores its own identifier and references to its parent, left child, and right child.
 */
class TreeElementDescriptor {
  constructor(elementIdentifier, parentLink = UNLINKED_ID_CONST, leftLink = UNLINKED_ID_CONST, rightLink = UNLINKED_ID_CONST) {
    // Input validation for the element's unique identifier.
    if (typeof elementIdentifier !== 'number' || elementIdentifier < 0) {
      throw new Error(`Invalid element identifier provided: ${elementIdentifier}. Must be a non-negative number.`);
    }

    this.nodeIdentifier = elementIdentifier;
    this.parentReference = parentLink;
    this.leftChildReference = leftLink;
    this.rightChildReference = rightLink;
  }

  /**
   * Getter to classify the node's role within the tree (Root, Leaf, or Internal).
   * This logic is slightly restructured for readability.
   */
  get classification() {
    const isRoot = this.parentReference === UNLINKED_ID_CONST;
    const hasLeftChild = this.leftChildReference !== UNLINKED_ID_CONST;
    const hasRightChild = this.rightChildReference !== UNLINKED_ID_CONST;
    const isLeaf = !hasLeftChild && !hasRightChild; // A node is a leaf if it has no children.

    if (isRoot) {
      return 'Root Node';
    } else if (isLeaf) {
      return 'Leaf Node';
    } else {
      return 'Internal Node';
    }
  }

  /**
   * Helper method to explicitly check if this element is the root.
   */
  isRootElement() {
    return this.parentReference === UNLINKED_ID_CONST;
  }

  /**
   * Helper method to explicitly check if this element is a leaf.
   */
  isLeafElement() {
    return this.leftChildReference === UNLINKED_ID_CONST && this.rightChildReference === UNLINKED_ID_CONST;
  }

  /**
   * Provides a string representation of the element for debugging or logging.
   */
  toString() {
    return `Element ID: ${this.nodeIdentifier}, Parent: ${this.parentReference}, Left: ${this.leftChildReference}, Right: ${this.rightChildReference}`;
  }
}

/**
 * Manages a collection of TreeElementDescriptor objects, forming a binary tree structure.
 * Provides methods for construction, relationship establishment, and querying properties like depth and height.
 */
class HierarchicalTreeStructure {
  constructor() {
    // Stores TreeElementDescriptor instances, mapped by their unique identifiers.
    this.elementRegistry = new Map();
    // Stores auxiliary data for each element (e.g., sibling ID, degree count).
    this.structuralMetadata = new Map();
    // Stores the identifier of the tree's root element, determined during connection.
    this.rootElementId = UNLINKED_ID_CONST;

    // Memoize computationally intensive methods for performance.
    // Binding 'this' ensures the methods correctly refer to the tree instance.
    this.getNodeDepth = createMemoizedFunction(this.calculateElementDepth.bind(this));
    this.getBranchHeight = createMemoizedFunction(this.determineSubtreeHeight.bind(this));
  }

  // Static getter to provide access to the TreeElementDescriptor class.
  static get TreeComponent() {
    return TreeElementDescriptor;
  }

  /**
   * Inserts a new element into the tree's registry.
   * @param {number} identifier - The unique ID of the new element.
   * @param {number} leftChild - The ID of its left child, or UNLINKED_ID_CONST.
   * @param {number} rightChild - The ID of its right child, or UNLINKED_ID_CONST.
   */
  insertElement(identifier, leftChild, rightChild) {
    // Prevent adding elements with the special unlinked constant ID.
    if (identifier === UNLINKED_ID_CONST) {
      throw new Error("Element ID cannot be the unassociated constant value.");
    }
    // Check for duplicate element IDs to maintain tree integrity.
    if (this.elementRegistry.has(identifier)) {
      console.warn(`Attempted to add duplicate element ID: ${identifier}. Skipping insertion.`);
      return;
    }

    const newElement = new HierarchicalTreeStructure.TreeComponent(identifier, UNLINKED_ID_CONST, leftChild, rightChild);
    this.elementRegistry.set(identifier, newElement);
  }

  /**
   * Establishes parent-child relationships between elements and computes additional structural metadata.
   * This method performs two passes to ensure all relationships and metadata are correctly set.
   */
  establishConnections() {
    if (this.elementRegistry.size === 0) {
      console.log("No elements in the registry to establish connections for.");
      return;
    }

    // A set to keep track of elements that are potentially roots (have no parent assigned yet).
    let potentialRootCandidates = new Set(this.elementRegistry.keys());

    // --- First Pass: Update parent references and initialize sibling/degree metadata ---
    for (const element of this.elementRegistry.values()) {
      // Process left child:
      if (element.leftChildReference !== UNLINKED_ID_CONST) {
        const leftChildNode = this.elementRegistry.get(element.leftChildReference);
        if (leftChildNode) {
          leftChildNode.parentReference = element.nodeIdentifier; // Set parent link for child
          potentialRootCandidates.delete(element.leftChildReference); // A child cannot be a root

          // Initialize metadata for the left child, setting its sibling.
          this.structuralMetadata.set(element.leftChildReference, {
            siblingIdentifier: element.rightChildReference,
            elementRef: leftChildNode,
            degreeCount: INITIAL_CHILD_DEGREE
          });
        } else {
          console.warn(`Warning: Left child ${element.leftChildReference} of element ${element.nodeIdentifier} not found in registry.`);
        }
      }

      // Process right child:
      if (element.rightChildReference !== UNLINKED_ID_CONST) {
        const rightChildNode = this.elementRegistry.get(element.rightChildReference);
        if (rightChildNode) {
          rightChildNode.parentReference = element.nodeIdentifier; // Set parent link for child
          potentialRootCandidates.delete(element.rightChildReference); // A child cannot be a root

          // Initialize metadata for the right child, setting its sibling.
          this.structuralMetadata.set(element.rightChildReference, {
            siblingIdentifier: element.leftChildReference,
            elementRef: rightChildNode,
            degreeCount: INITIAL_CHILD_DEGREE
          });
        } else {
          console.warn(`Warning: Right child ${element.rightChildReference} of element ${element.nodeIdentifier} not found in registry.`);
        }
      }
    }

    // Determine the root element after the first pass.
    if (potentialRootCandidates.size === 1) {
      this.rootElementId = potentialRootCandidates.values().next().value;
    } else if (potentialRootCandidates.size === 0) {
      console.error("Error: No root element found or cyclical references detected. This may indicate an invalid tree structure.");
    } else {
      // If multiple potential roots, it implies a forest (multiple trees) or disconnected components.
      // We'll arbitrarily pick the first one as the root of the "main" tree.
      console.warn("Warning: Multiple potential root candidates found. Assuming the first identified as the primary root.");
      this.rootElementId = potentialRootCandidates.values().next().value;
    }

    // --- Second Pass: Finalize structural metadata (degree and element reference) ---
    for (const element of this.elementRegistry.values()) {
      let currentMetadata = this.structuralMetadata.get(element.nodeIdentifier);

      // If no children were processed for this element in the first pass, its metadata might not exist yet.
      if (!currentMetadata) {
        currentMetadata = {
          siblingIdentifier: UNLINKED_ID_CONST, // Default to no sibling
          elementRef: element,
          degreeCount: INITIAL_CHILD_DEGREE
        };
      }

      // Calculate the degree (number of direct children) for the current element.
      currentMetadata.degreeCount =
        (element.leftChildReference !== UNLINKED_ID_CONST ? 1 : 0) +
        (element.rightChildReference !== UNLINKED_ID_CONST ? 1 : 0);

      currentMetadata.elementRef = element; // Ensure element reference is correctly set.

      // If the sibling was not set in the first pass (e.g., parent has only one child, or node is root itself),
      // and this node has a parent, try to infer the sibling from the parent.
      if (element.parentReference !== UNLINKED_ID_CONST && currentMetadata.siblingIdentifier === UNLINKED_ID_CONST) {
          const parentNode = this.retrieveElement(element.parentReference);
          if (parentNode) {
              // If this node is the parent's left child, its sibling is the parent's right child, and vice-versa.
              currentMetadata.siblingIdentifier = (parentNode.leftChildReference === element.nodeIdentifier)
                  ? parentNode.rightChildReference
                  : parentNode.leftChildReference;
          }
      }

      this.structuralMetadata.set(element.nodeIdentifier, currentMetadata);
    }
  }

  /**
   * Recursively calculates the depth of a specific element within the tree.
   * The depth of the root node is 0.
   * @param {number} targetIdentifier - The ID of the element whose depth is to be calculated.
   * @param {number} currentLevel - Internal parameter for tracking recursion depth.
   * @returns {number} The depth of the element, or -1 if the element is not found or invalid.
   */
  calculateElementDepth(targetIdentifier, currentLevel = 0) {
    // Guard clause for invalid or non-existent identifiers.
    if (targetIdentifier === UNLINKED_ID_CONST) {
      return -1; // Indicates an invalid path or non-existent node.
    }
    const targetElement = this.retrieveElement(targetIdentifier);
    if (!targetElement) {
      console.warn(`Element with ID ${targetIdentifier} not found for depth calculation.`);
      return -1; // Node not found in the registry.
    }

    // Base case: If the element has no parent, it's the root, and its depth is the current level.
    if (targetElement.parentReference === UNLINKED_ID_CONST) {
      return currentLevel;
    } else {
      // Recursive step: Increment level and call for the parent element.
      return this.calculateElementDepth(targetElement.parentReference, currentLevel + 1);
    }
  }

  /**
   * Recursively determines the height of the subtree rooted at a given element.
   * The height of a leaf node is 0.
   * @param {number} identifier - The ID of the element at the root of the subtree.
   * @param {number} currentHeight - Internal parameter for tracking recursion height.
   * @returns {number} The height of the subtree, or -1 if the element is not found or invalid.
   */
  determineSubtreeHeight(identifier, currentHeight = 0) {
    // Base case: If the identifier is unlinked, it signifies the end of a branch.
    // We return currentHeight - 1 to correctly calculate height (leaf height is 0).
    if (identifier === UNLINKED_ID_CONST) {
      return currentHeight - 1;
    }

    const nodeToExamine = this.retrieveElement(identifier);
    if (!nodeToExamine) {
      console.warn(`Element with ID ${identifier} not found for height calculation.`);
      return currentHeight - 1; // Node not found, similar to UNLINKED_ID_CONST.
    }

    // Recursively calculate the height of the left and right subtrees.
    const leftSubtreeHeight = this.determineSubtreeHeight(nodeToExamine.leftChildReference, currentHeight + 1);
    const rightSubtreeHeight = this.determineSubtreeHeight(nodeToExamine.rightChildReference, currentHeight + 1);

    // The height of the current node's subtree is 1 + the maximum height of its children's subtrees.
    return Math.max(leftSubtreeHeight, rightSubtreeHeight);
  }

  /**
   * Retrieves an element from the registry by its identifier.
   * @param {number} identifier - The ID of the element to retrieve.
   * @returns {TreeElementDescriptor|undefined} The element if found, otherwise undefined.
   */
  retrieveElement(identifier) {
    // Basic validation for the identifier.
    if (typeof identifier !== 'number' || identifier < 0) {
      // console.warn(`Attempted to retrieve element with an invalid identifier: ${identifier}`); // Debugging
      return undefined;
    }
    return this.elementRegistry.get(identifier);
  }

  /**
   * Displays a comprehensive report of all elements in the tree,
   * including their parent, sibling, degree, depth, height, and classification.
   */
  displayTreeInfo() {
    if (this.elementRegistry.size === 0) {
      console.log("The hierarchical tree structure is currently empty. No information to display.");
      return;
    }

    console.log("\n--- Comprehensive Hierarchical Tree Report ---");
    console.log(`Total number of elements: ${this.elementRegistry.size}`);
    console.log(`Identified Root Element ID: ${this.rootElementId === UNLINKED_ID_CONST ? 'Not found' : this.rootElementId}`);
    console.log("--------------------------------------------");

    // Iterate over the structural metadata to display information for each element.
    for (const [id, metadata] of this.structuralMetadata.entries()) {
      const currentElement = metadata.elementRef;
      if (!currentElement) {
        console.warn(`Internal error: Metadata found for ID ${id}, but no corresponding element reference.`);
        continue;
      }

      // Utilize the memoized depth and height calculation methods.
      const calculatedDepth = this.getNodeDepth(currentElement.nodeIdentifier);
      const calculatedHeight = this.getBranchHeight(currentElement.nodeIdentifier);

      const outputString = `Element ${currentElement.nodeIdentifier}: ` +
                           `Parent = ${currentElement.parentReference}, ` +
                           `Sibling = ${metadata.siblingIdentifier === UNLINKED_ID_CONST ? 'None' : metadata.siblingIdentifier}, ` +
                           `Degree = ${metadata.degreeCount}, ` +
                           `Depth = ${calculatedDepth}, ` +
                           `Height = ${calculatedHeight}, ` +
                           `Classification = ${currentElement.classification}`;
      console.log(outputString);
    }
    console.log("--------------------------------------------\n");
  }
}

/**
 * Main execution block: Reads tree data from standard input, constructs the tree,
 * and then prints out its structural information.
 */
(function processTreeData() {
  console.time("TreeProcessingDuration"); // Start a timer to measure execution time.

  const INPUT_FILE_PATH = '/dev/stdin'; // Define a constant for the input file path.

  let rawInputContent;
  try {
    rawInputContent = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
  } catch (error) {
    // Gracefully handle file read errors.
    console.error(`Error: Failed to read input file from ${INPUT_FILE_PATH}. Details: ${error.message}`);
    process.exit(1); // Exit the process with an error code.
  }

  const inputLines = rawInputContent.trim().split('\n');

  // Validate if the input content is empty.
  if (inputLines.length === 0 || inputLines[0].trim() === '') {
      console.warn("Input file is empty or contains no data. Exiting tree processing.");
      return;
  }

  // The first line typically contains the total number of elements.
  const numberOfElements = Number(inputLines.shift());
  // Validate the parsed number of elements.
  if (isNaN(numberOfElements) || numberOfElements < 0) {
      console.error(`Error: Invalid number of elements specified in input (${numberOfElements}). Expected a non-negative integer.`);
      process.exit(1);
  }

  // Instantiate the tree structure.
  let treeStructure = new HierarchicalTreeStructure();

  // Iterate over the remaining input lines to add elements to the tree.
  inputLines.forEach((currentLine, lineIndex) => {
    const parsedValues = currentLine.split(' ').map(Number);

    // Validate each line's format.
    if (parsedValues.length !== 3 || parsedValues.some(isNaN)) {
        console.error(`Warning: Skipping malformed input line ${lineIndex + 2} (original index ${lineIndex}): "${currentLine}". Expected 3 numeric values (id, leftChild, rightChild).`);
        return; // Skip this line and continue processing others.
    }

    // Destructure the parsed values for clarity.
    const [elementId, leftChildId, rightChildId] = parsedValues;
    treeStructure.insertElement(elementId, leftChildId, rightChildId);
  });

  // Once all elements are added, establish their connections and build metadata.
  treeStructure.establishConnections();

  // Finally, display the calculated structural information of the tree.
  treeStructure.displayTreeInfo();

  console.timeEnd("TreeProcessingDuration"); // End the timer and log the duration.
})();