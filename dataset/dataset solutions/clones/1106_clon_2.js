class TreeNode {
  // Constructor for a tree node, initializing its value and pointers.
  constructor(nodeValue, parentNode = null, leftChild = null, rightChild = null) {
    this.nodeValue = nodeValue; // The data stored in this node.
    this.parentNode = parentNode; // Reference to the parent node.
    this.leftChild = leftChild;   // Reference to the left child node.
    this.rightChild = rightChild; // Reference to the right child node.
  }

  /**
   * Calculates the number of direct children this node has.
   * @returns {number} The count of children (0, 1, or 2).
   */
  countChildren() {
    // Check if leftChild exists (1) or not (0), and similarly for rightChild.
    // The bitwise AND with 1 for rightChild is a stylistic choice,
    // functionally equivalent to (this.rightChild ? 1 : 0).
    return (this.leftChild ? 1 : 0) + (this.rightChild & 1);
  }

  /**
   * Determines if this node is the left child of its parent.
   * @returns {boolean|null} True if it's a left child, false if a right child, null if it's the root.
   */
  isNodeLeftChild() {
    if (this.parentNode === null) {
      return null; // This node is the root, so it has no parent.
    }
    return this.parentNode.leftChild === this;
  }

  /**
   * Returns a string indicating whether this node is a 'left' or 'right' child.
   * @returns {string} 'left' or 'right'.
   */
  determineChildPosition() {
    return this.isNodeLeftChild() ? 'left' : 'right';
  }

  /**
   * Finds the successor node in an in-order traversal.
   * This is the smallest node in the right subtree, or the first ancestor for which this node is in the left subtree.
   * @returns {TreeNode|null} The successor node, or null if none exists.
   */
  findSuccessorNode() {
    let currentElement;
    // If there's a right child, the successor is the leftmost node in the right subtree.
    if (this.rightChild !== null) {
      currentElement = this.rightChild;
      while (currentElement.leftChild !== null) {
        currentElement = currentElement.leftChild;
      }
    } else {
      // If no right child, go up the parent chain until we find a parent
      // for which this node is a left child.
      currentElement = this.parentNode;
      while (currentElement && !currentElement.isNodeLeftChild()) {
        currentElement = currentElement.parentNode;
      }
    }
    return currentElement;
  }
}

class BinarySearchStructure {
  // Initializes an empty binary search tree.
  constructor() {
    this.treeRoot = null; // The root node of the tree.
  }

  // Static getter to expose the TreeNode class.
  static get Element() {
    return TreeNode;
  }

  /**
   * Inserts a new value into the binary search tree.
   * @param {*} valueToInsert The value to be added to the tree.
   */
  addValue(valueToInsert) {
    // If the tree is empty, the new value becomes the root.
    if (this.treeRoot === null) {
      this.treeRoot = new BinarySearchStructure.Element(valueToInsert);
      return;
    }

    let currentNode = this.treeRoot; // Start traversal from the root.
    let previousNode;                // Keep track of the parent of currentNode.
    let newElement = new BinarySearchStructure.Element(valueToInsert); // Create the new node.

    // Traverse the tree to find the correct insertion point.
    while (currentNode !== null) {
      previousNode = currentNode; // Update previousNode before moving down.
      // Decide whether to go left or right based on the value.
      currentNode = currentNode[valueToInsert < currentNode.nodeValue ? 'leftChild' : 'rightChild'];
    }

    // Link the new node to its parent.
    newElement.parentNode = previousNode;
    // Place the new node as either the left or right child of its parent.
    previousNode[valueToInsert < previousNode.nodeValue ? 'leftChild' : 'rightChild'] = newElement;
  }

  /**
   * Searches for a specific value in the tree.
   * @param {*} targetValue The value to search for.
   * @param {TreeNode} [currentElement=this.treeRoot] The node to start the search from (defaults to root).
   * @returns {TreeNode|null} The node containing the value, or null if not found.
   */
  locateValue(targetValue, currentElement = this.treeRoot) {
    // Base case: if node is null or value is found.
    if (currentElement === null || currentElement.nodeValue === targetValue) {
      return currentElement;
    }
    // Recursively search in the left or right subtree.
    return this.locateValue(targetValue, currentElement[targetValue < currentElement.nodeValue ? 'leftChild' : 'rightChild']);
  }

  /**
   * Deletes a node with the specified value from the tree.
   * @param {*} valueToRemove The value of the node to be deleted.
   */
  removeValue(valueToRemove) {
    const nodeToDelete = this.locateValue(valueToRemove); // Find the node to delete.
    if (!nodeToDelete) return; // If node not found, do nothing.

    const childPosition = nodeToDelete.determineChildPosition(); // Determine if it's a left or right child.

    // Handle deletion based on the number of children the node has.
    switch (nodeToDelete.countChildren()) {
      case 0: // Case 1: Node has no children (leaf node).
        // Simply remove the reference from its parent.
        if (nodeToDelete.parentNode) {
          nodeToDelete.parentNode[childPosition] = null;
        } else {
          this.treeRoot = null; // If it's the root and has no children.
        }
        break;
      case 1: // Case 2: Node has one child.
        // Replace the node with its single child.
        const childNode = nodeToDelete.leftChild || nodeToDelete.rightChild;
        if (nodeToDelete.parentNode) {
          nodeToDelete.parentNode[childPosition] = childNode;
          childNode.parentNode = nodeToDelete.parentNode;
        } else {
          this.treeRoot = childNode; // If it's the root with one child.
          childNode.parentNode = null;
        }
        break;
      default: // Case 3: Node has two children.
        // Find the in-order successor, replace the node's value with successor's value,
        // then delete the successor node (which will have 0 or 1 child).
        const successorValue = nodeToDelete.findSuccessorNode().nodeValue;
        this.removeValue(successorValue); // Recursively delete the successor.
        nodeToDelete.nodeValue = successorValue; // Update the current node's value.
    }
  }

  /**
   * Performs an in-order traversal of the tree and prints the node values.
   */
  displayInOrder() {
    let outputString = ''; // Accumulator for the output.

    // Recursive helper function for in-order traversal.
    const traverseInOrder = (currentElement) => {
      if (currentElement === null) {
        return;
      }
      traverseInOrder(currentElement.leftChild); // Visit left child.
      outputString += ` ${currentElement.nodeValue}`; // Visit current node.
      traverseInOrder(currentElement.rightChild); // Visit right child.
    };

    traverseInOrder(this.treeRoot); // Start traversal from the root.
    console.log(outputString); // Print the accumulated string.
  }

  /**
   * Performs a pre-order traversal of the tree and prints the node values.
   */
  displayPreOrder() {
    let outputString = ''; // Accumulator for the output.

    // Recursive helper function for pre-order traversal.
    const traversePreOrder = (currentElement) => {
      if (currentElement === null) {
        return;
      }
      outputString += ` ${currentElement.nodeValue}`; // Visit current node.
      traversePreOrder(currentElement.leftChild);  // Visit left child.
      traversePreOrder(currentElement.rightChild); // Visit right child.
    };

    traversePreOrder(this.treeRoot); // Start traversal from the root.
    console.log(outputString); // Print the accumulated string.
  }

  /**
   * Prints the tree content using both in-order and pre-order traversals.
   */
  displayAllOrders() {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

// Immediately Invoked Function Expression (IIFE) to encapsulate main logic.
(function executeTreeOperations() {
  // Read input from stdin, trim whitespace, and split into lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const numberOfOperations = Number(inputLines.shift()); // First line is the number of operations (unused in this implementation).

  const mySearchTree = new BinarySearchStructure(); // Create a new binary search tree instance.

  // Process each command line.
  inputLines.forEach(function(currentCommand) {
    // Use a switch statement to handle different command types.
    switch (currentCommand.charAt(0)) {
      case 'i': // 'insert' command
        mySearchTree.addValue(Number(currentCommand.split(' ')[1]));
        break;
      case 'f': // 'find' command
        console.log(mySearchTree.locateValue(Number(currentCommand.split(' ')[1])) ? 'yes' : 'no');
        break;
      case 'd': // 'delete' command
        mySearchTree.removeValue(Number(currentCommand.split(' ')[1]));
        break;
      default: // 'print' command (or any other unrecognized command)
        mySearchTree.displayAllOrders();
    }
  });
})();
