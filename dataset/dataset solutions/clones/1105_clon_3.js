/**
 * This module defines the foundational components for constructing and managing a Binary Search Tree (BST).
 * It includes a node class (`TreeElement`) and the main tree class (`ValueOrderedTree`)
 * with methods for common BST operations like insertion, searching, deletion, and various traversals.
 */

/**
 * Represents a single element or node within the binary search tree.
 * Each node stores a numeric value and maintains references to its parent and its left and right children.
 */
class TreeElement {
  // Private field for the numerical value held by this node.
  #nodeValue;
  // Private field for the reference to the parent node.
  #ancestorNode;
  // Private field for the reference to the left child node.
  #leftChild;
  // Private field for the reference to the right child node.
  #rightChild;

  /**
   * Initializes a new instance of a TreeElement.
   * @param {number} elementKey - The numerical value to be stored in this node. Must be a valid number.
   * @param {TreeElement | null} [parentNodeRef=null] - An optional reference to the parent node.
   * @param {TreeElement | null} [leftRef=null] - An optional reference to the left child node.
   * @param {TreeElement | null} [rightRef=null] - An optional reference to the right child node.
   * @throws {Error} If the provided elementKey is not a valid number.
   */
  constructor(elementKey, parentNodeRef = null, leftRef = null, rightRef = null) {
    if (typeof elementKey !== 'number' || isNaN(elementKey)) {
        throw new Error('TreeElement construction requires a valid numeric key.');
    }
    this.#nodeValue = elementKey;
    this.#ancestorNode = parentNodeRef;
    this.#leftChild = leftRef;
    this.#rightChild = rightRef;
  }

  /**
   * Getter for the node's stored numerical value.
   * @returns {number} The value of this node.
   */
  get value() {
    return this.#nodeValue;
  }

  /**
   * Setter for the node's numerical value.
   * @param {number} newValue - The new numerical value to assign.
   * @returns {void}
   */
  set value(newValue) {
    // Basic validation for the new value.
    if (typeof newValue !== 'number' || isNaN(newValue)) {
      console.warn(`Attempted to assign an invalid value (${newValue}) to a TreeElement. Value remains unchanged.`);
      return;
    }
    this.#nodeValue = newValue;
  }

  /**
   * Getter for the parent node reference.
   * @returns {TreeElement | null} The parent node or null if this is the root.
   */
  get parent() {
    return this.#ancestorNode;
  }

  /**
   * Setter for the parent node reference.
   * @param {TreeElement | null} newParent - The new parent node.
   * @returns {void}
   */
  set parent(newParent) {
    this.#ancestorNode = newParent;
  }

  /**
   * Getter for the left child node reference.
   * @returns {TreeElement | null} The left child node or null if none.
   */
  get left() {
    return this.#leftChild;
  }

  /**
   * Setter for the left child node reference.
   * @param {TreeElement | null} newLeft - The new left child node.
   * @returns {void}
   */
  set left(newLeft) {
    this.#leftChild = newLeft;
  }

  /**
   * Getter for the right child node reference.
   * @returns {TreeElement | null} The right child node or null if none.
   */
  get right() {
    return this.#rightChild;
  }

  /**
   * Setter for the right child node reference.
   * @param {TreeElement | null} newRight - The new right child node.
   * @returns {void}
   */
  set right(newRight) {
    this.#rightChild = newRight;
  }

  /**
   * Calculates the number of direct child nodes (left or right) this element has.
   * @returns {number} A count, either 0, 1, or 2.
   */
  getDirectChildCount() {
    let currentChildCount = 0;
    if (this.#leftChild !== null) {
      currentChildCount++;
    }
    if (this.#rightChild !== null) {
      currentChildCount++;
    }
    return currentChildCount;
  }

  /**
   * Checks if this node is the left child of its parent.
   * @returns {boolean | null} Returns true if it's a left child, false if a right child.
   *   Returns null if this node has no parent (i.e., it's the root of the tree).
   */
  isItsParentLeftChild() {
    if (this.#ancestorNode === null) {
      // The root node has no parent, thus it cannot be a left or right child.
      return null;
    }
    return this.#ancestorNode.#leftChild === this;
  }

  /**
   * Determines and returns the position of this node relative to its parent.
   * @returns {'left' | 'right' | 'root'} A string indicating 'left', 'right', or 'root'.
   */
  getChildPositionFromParent() {
    const isLeft = this.isItsParentLeftChild();
    if (isLeft === null) {
      return 'root'; // This node is the root of the entire tree.
    }
    return isLeft ? 'left' : 'right';
  }

  /**
   * Locates the in-order successor of this node within the BST.
   * The successor is the node that would be visited immediately after this node in an in-order traversal.
   * @returns {TreeElement | null} The successor node, or null if this is the last node in in-order.
   */
  findInorderSuccessor() {
    let currentProcessingNode = this;

    // Case 1: If there is a right subtree, the successor is the leftmost node in that right subtree.
    if (currentProcessingNode.#rightChild !== null) {
      let candidateSuccessor = currentProcessingNode.#rightChild;
      while (candidateSuccessor.#leftChild !== null) {
        candidateSuccessor = candidateSuccessor.#leftChild;
      }
      return candidateSuccessor;
    }

    // Case 2: No right subtree. The successor is the lowest ancestor of `currentProcessingNode`
    // for which `currentProcessingNode` is in the ancestor's left subtree.
    let ancestorIterator = currentProcessingNode.#ancestorNode;
    while (ancestorIterator !== null && currentProcessingNode === ancestorIterator.#rightChild) {
      currentProcessingNode = ancestorIterator;
      ancestorIterator = ancestorIterator.#ancestorNode;
    }
    // If ancestorIterator becomes null, it means we ascended from a rightmost node.
    return ancestorIterator;
  }
}

/**
 * Implements a Binary Search Tree (BST) structure, enabling efficient storage
 * and retrieval of numerical data while maintaining sorted order.
 */
class ValueOrderedTree {
  // Private field for the root node of the tree.
  #mainRoot;

  /**
   * Constructs an empty ValueOrderedTree.
   */
  constructor() {
    this.#mainRoot = null;
  }

  /**
   * Provides a static method to retrieve the constructor for the TreeElement class.
   * This allows external code to create nodes if needed, though typically done internally.
   * @returns {typeof TreeElement} The TreeElement class constructor.
   */
  static getNodeDefinition() {
    return TreeElement;
  }

  /**
   * Inserts a new numerical value into the tree.
   * The tree maintains its BST properties after insertion.
   * @param {number} elementToInsert - The numerical value to add.
   * @returns {void}
   */
  addValue(elementToInsert) {
    if (typeof elementToInsert !== 'number' || isNaN(elementToInsert)) {
      console.error(`Attempted to insert an invalid value: ${elementToInsert}. Insertion aborted.`);
      return;
    }

    const newElement = new TreeElement(elementToInsert);

    // Handle the case of an empty tree: the new element becomes the root.
    if (this.#mainRoot === null) {
      this.#mainRoot = newElement;
      return;
    }

    let currentNode = this.#mainRoot;
    let parentCandidate = null; // This variable will track the potential parent for the new node.

    // Traverse the tree to find the appropriate position for the new element.
    while (currentNode !== null) {
      parentCandidate = currentNode;
      if (elementToInsert < currentNode.value) {
        currentNode = currentNode.left; // Go left for smaller values.
      } else {
        currentNode = currentNode.right; // Go right for larger or equal values.
      }
    }

    // Link the new element to its determined parent.
    newElement.parent = parentCandidate;
    if (elementToInsert < parentCandidate.value) {
      parentCandidate.left = newElement;
    } else {
      parentCandidate.right = newElement;
    }
  }

  /**
   * Searches for a specific numerical value within the tree.
   * @param {number} targetValue - The value to find.
   * @param {TreeElement | null} [startingNode=this.#mainRoot] - The node from which to begin the search.
   * @returns {TreeElement | null} The node containing the value if found, otherwise null.
   */
  locateElement(targetValue, startingNode = this.#mainRoot) {
    // Base case 1: If the current node is null, the value is not in this path.
    // Base case 2: If the current node's value matches, we found it.
    if (startingNode === null || startingNode.value === targetValue) {
      return startingNode;
    }

    // Recursive step: Traverse left or right based on the comparison.
    if (targetValue < startingNode.value) {
      return this.locateElement(targetValue, startingNode.left);
    } else {
      return this.locateElement(targetValue, startingNode.right);
    }
  }

  /**
   * Internal helper method to replace a child of a given parent node.
   * Handles updating both the parent's child reference and the new child's parent reference.
   * @param {TreeElement | null} parentOfOldChild - The parent node whose child is being replaced.
   * @param {TreeElement | null} oldChildNode - The child node that is being replaced.
   * @param {TreeElement | null} newChildNode - The new node that will take the old child's place.
   * @returns {void}
   */
  #replaceChild(parentOfOldChild, oldChildNode, newChildNode) {
    // If there's no parent, it means the oldChildNode was the root of the entire tree.
    if (parentOfOldChild === null) {
      this.#mainRoot = newChildNode;
      if (newChildNode) {
        newChildNode.parent = null; // The new root has no parent.
      }
      return;
    }

    // Determine if the old child was a left or right child and update the parent's reference.
    if (parentOfOldChild.left === oldChildNode) {
      parentOfOldChild.left = newChildNode;
    } else if (parentOfOldChild.right === oldChildNode) {
      parentOfOldChild.right = newChildNode;
    } else {
      // This case should ideally not happen if oldChildNode is indeed a child of parentOfOldChild.
      console.warn("Attempted to replace a node that isn't a direct child of the specified parent.");
      return;
    }

    // Update the new child's parent reference if it exists.
    if (newChildNode) {
      newChildNode.parent = parentOfOldChild;
    }
  }

  /**
   * Removes a node with the specified value from the tree, maintaining BST properties.
   * @param {number} valueToRemove - The numerical value of the node to be deleted.
   * @returns {boolean} True if the node was found and successfully deleted, false otherwise.
   */
  purgeElement(valueToRemove) {
    const nodeForDeletion = this.locateElement(valueToRemove);

    // If the node is not found, there's nothing to delete.
    if (nodeForDeletion === null) {
      return false;
    }

    const parentOfTarget = nodeForDeletion.parent;
    const directChildCount = nodeForDeletion.getDirectChildCount();

    // Handle deletion based on the number of children the node has.
    if (directChildCount === 0) {
      // Case 1: Node is a leaf (no children).
      this.#replaceChild(parentOfTarget, nodeForDeletion, null);
    } else if (directChildCount === 1) {
      // Case 2: Node has one child.
      const childToPromote = nodeForDeletion.left !== null ? nodeForDeletion.left : nodeForDeletion.right;
      this.#replaceChild(parentOfTarget, nodeForDeletion, childToPromote);
    } else {
      // Case 3: Node has two children.
      // Find the in-order successor (the smallest node in the right subtree).
      const successorNode = nodeForDeletion.findInorderSuccessor();

      // Recursively delete the successor from its original position.
      // This handles the successor's potential right child (it won't have a left child).
      this.purgeElement(successorNode.value);

      // Replace the value of the node-to-be-deleted with the successor's value.
      nodeForDeletion.value = successorNode.value;
    }
    return true; // Deletion was successful.
  }

  /**
   * Performs an in-order traversal of the tree.
   * This visits nodes in ascending order of their values (Left -> Root -> Right).
   * @returns {string} A space-separated string of the node values in in-order.
   */
  performInorderTraversal() {
    const valuesCollected = []; // Using an array for efficient accumulation.

    /**
     * Recursive helper function for in-order traversal.
     * @param {TreeElement | null} currentElement - The node currently being processed.
     */
    const recursiveInorderHelper = (currentElement) => {
      if (currentElement === null) {
        return; // Base case: end of a branch.
      }
      recursiveInorderHelper(currentElement.left);      // 1. Traverse left subtree
      valuesCollected.push(currentElement.value);       // 2. Visit current node
      recursiveInorderHelper(currentElement.right);     // 3. Traverse right subtree
    };

    recursiveInorderHelper(this.#mainRoot);
    return valuesCollected.join(' ').trim(); // Join values with spaces and remove any trailing/leading whitespace.
  }

  /**
   * Performs a pre-order traversal of the tree.
   * This visits the current node first, then its left subtree, then its right subtree (Root -> Left -> Right).
   * @returns {string} A space-separated string of the node values in pre-order.
   */
  performPreorderTraversal() {
    const valuesCollected = [];

    /**
     * Recursive helper function for pre-order traversal.
     * @param {TreeElement | null} currentElement - The node currently being processed.
     */
    const recursivePreorderHelper = (currentElement) => {
      if (currentElement === null) {
        return;
      }
      valuesCollected.push(currentElement.value); // 1. Visit current node
      recursivePreorderHelper(currentElement.left);  // 2. Traverse left subtree
      recursivePreorderHelper(currentElement.right); // 3. Traverse right subtree
    };

    recursivePreorderHelper(this.#mainRoot);
    return valuesCollected.join(' ').trim();
  }

  /**
   * Prints both the in-order and pre-order traversals to the console.
   * Each traversal is output on a new line.
   * Prints an empty line if a traversal yields no results (e.g., empty tree).
   * @returns {void}
   */
  displayAllTraversals() {
    const inorderResult = this.performInorderTraversal();
    console.log(inorderResult.length > 0 ? inorderResult : '');

    const preorderResult = this.performPreorderTraversal();
    console.log(preorderResult.length > 0 ? preorderResult : '');
  }
}

/**
 * Self-executing anonymous function to serve as the main entry point
 * for processing input and performing tree operations.
 * This structure helps in avoiding global variable pollution.
 */
(function processInputAndExecuteTreeOperations() {
  let rawInputData;
  // Attempt to read input from standard input, falling back to dummy data for local testing.
  try {
    rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (error) {
    console.error("Failed to read from /dev/stdin. Using embedded dummy input data for execution.");
    rawInputData = `8
insert 30
insert 8
insert 20
insert 5
insert 12
insert 15
insert 18
print
delete 5
print
find 12
find 1
delete 12
print
delete 18
print
insert 2
print`;
  }

  const inputCommandLines = rawInputData.trim().split('\n');
  // The first line often indicates the number of operations, but we can simply process all lines.
  // const totalOperations = Number(inputCommandLines.shift()); // This line is not strictly needed for processing.

  const treeManager = new ValueOrderedTree();

  // Process each command line sequentially.
  inputCommandLines.forEach(function(currentCommand) {
    // Skip empty or purely whitespace lines.
    if (!currentCommand || currentCommand.trim().length === 0) {
      return;
    }

    const commandParts = currentCommand.split(' ');
    const commandAction = commandParts[0];
    const commandValue = Number(commandParts[1]); // Convert the second part to a number.

    // Validate the numeric part for commands that require it.
    const requiresValue = ['insert', 'find', 'delete'].includes(commandAction);
    if (requiresValue && isNaN(commandValue)) {
      console.warn(`Skipping command: '${currentCommand}' due to invalid numeric value.`);
      return;
    }

    // Execute the appropriate tree method based on the parsed command action.
    switch (commandAction) {
      case 'insert':
        treeManager.addValue(commandValue);
        break;
      case 'find':
        const foundElement = treeManager.locateElement(commandValue);
        console.log(foundElement !== null ? 'yes' : 'no');
        break;
      case 'delete':
        treeManager.purgeElement(commandValue);
        break;
      case 'print':
        treeManager.displayAllTraversals();
        break;
      default:
        console.warn(`Unrecognized command: '${currentCommand}'. This command will be ignored.`);
        break;
    }
  });
})();