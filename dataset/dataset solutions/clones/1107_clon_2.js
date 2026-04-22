/**
 *  This file contains a cloned version of a Binary Search Tree implementation.
 *  The original logic and structure are preserved, but all identifiers,
 *  whitespace, and comments have been extensively modified to create a Type II clone.
 *
 *  Original Author: N/A (provided by user)
 *  Cloned by: Code Clone Generator
 */

/**
 * Represents a single node within the Binary Search Tree.
 * Each node holds a value and references to its ancestor and children.
 */
class TreeNode {

  /**
   * Constructs a new tree node instance.
   * @param {number} value The numerical value stored in this node.
   * @param {TreeNode|null} [ancestor=null] Reference to the parent node.
   * @param {TreeNode|null} [leftChild=null] Reference to the left child node.
   * @param {TreeNode|null} [rightChild=null] Reference to the right child node.
   */
  constructor(value,
              ancestor = null,
              leftChild = null,
              rightChild = null) {
    this.value = value;
    this.ancestor = ancestor;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }


  /**
   * Calculates the total number of direct children this node possesses.
   * @returns {number} The count of children (0, 1, or 2).
   */
  countChildren() {
    return (Boolean(this.leftChild).valueOf() + Boolean(this.rightChild).valueOf());
  }


  /**
   * Determines if this node is the left child of its ancestor.
   * Returns null if the node has no ancestor (i.e., it's the root).
   * @returns {boolean|null} True if it's a left child, false if a right child, null if root.
   */
  isLeftNode() {
    if (this.ancestor === null) {
      return null;
    }
    return this.ancestor.leftChild === this;
  }


  /**
   * Provides a string indicating whether this node is a 'left_side' or 'right_side' child.
   * Assumes the node has an ancestor.
   * @returns {string} 'left_side' or 'right_side'.
   */
  getChildSide() {
    return this.isLeftNode() ? 'left_side' : 'right_side';
  }


  /**
   * Locates the in-order successor of this node.
   * If a right child exists, the successor is the smallest node in the right subtree.
   * Otherwise, it's the first ancestor for which this node is in the left subtree.
   * @returns {TreeNode|null} The successor node, or null if none exists.
   */
  findSuccessor() {
    let currentNode; // Declare a variable to hold the iterating node.

    // If there's a right branch, the successor is the leftmost node in that branch.
    if (this.rightChild !== null) {
      currentNode = this.rightChild;
      while (currentNode.leftChild !== null) {
        currentNode = currentNode.leftChild;
      }
    } else {
      // No right branch, search upwards.
      currentNode = this.ancestor;
      let traversalElement = this; // Keep track of the current node in the upward traversal.
      while (currentNode !== null && traversalElement === currentNode.rightChild) {
        traversalElement = currentNode;
        currentNode = currentNode.ancestor;
      }
    }
    return currentNode; // Return the identified successor.
  }
}

/**
 * Implements a Binary Search Tree (BST) data structure.
 * Supports insertion, searching, and deletion of numerical values.
 */
class SearchTree {

  /**
   * Initializes a new empty Search Tree.
   */
  constructor() {
    this.baseNode = null; // The root node of the tree.
  }

  /**
   * Static getter to expose the TreeNode class for external use.
   * @returns {typeof TreeNode} The TreeNode class constructor.
   */
  static get Branch() {
    return TreeNode;
  }


  /**
   * Inserts a new numerical value into the tree, maintaining BST properties.
   * @param {number} inputVal The value to be added.
   */
  addValue(inputVal) {
    // If the tree is empty, the new value becomes the root.
    if (this.baseNode === null) {
      this.baseNode = new SearchTree.Branch(inputVal);
      return;
    }

    let currentPoint = this.baseNode; // Start traversal from the root.
    let previousPoint;                 // Keep track of the parent of currentPoint.

    let newElement = new SearchTree.Branch(inputVal); // Create the new node.

    // Traverse the tree to find the correct insertion spot.
    while (currentPoint !== null) {
      previousPoint = currentPoint; // Update previousPoint before moving currentPoint.
      // Decide whether to go left or right based on the input value.
      currentPoint = currentPoint[inputVal < currentPoint.value ? 'leftChild' : 'rightChild'];
    }

    // Link the new node to its parent.
    newElement.ancestor = previousPoint;
    // Place the new node as either the left or right child of its parent.
    previousPoint[inputVal < previousPoint.value ? 'leftChild' : 'rightChild'] = newElement;
  }


  /**
   * Searches for a specific numerical value within the tree.
   * @param {number} targetVal The value to search for.
   * @param {TreeNode|null} [currentNode=this.baseNode] The starting node for the search (defaults to root).
   * @returns {TreeNode|null} The node containing the value if found, otherwise null.
   */
  locateValue(targetVal, currentNode = this.baseNode) {
    // Base case: if node is null or value found, return node.
    if (currentNode === null || currentNode.value === targetVal) {
      return currentNode;
    }
    // Recursively search left or right subtree.
    return this.locateValue(targetVal, currentNode[targetVal < currentNode.value ? 'leftChild' : 'rightChild']);
  }


  /**
   * Removes a node with the specified value from the tree.
   * Handles various deletion cases (no children, one child, two children).
   * @param {number|TreeNode} removalTarget The value to delete or the node object itself.
   */
  removeValue(removalTarget) {
    // If removalTarget is a node, get its value. Otherwise, it's already a value.
    const actualValue = typeof removalTarget === 'object' && removalTarget !== null ? removalTarget.value : removalTarget;
    const nodeToRemove = this.locateValue(actualValue);

    // If the node doesn't exist, do nothing.
    if (nodeToRemove === null) {
      return;
    }

    let childPlacement = nodeToRemove.getChildSide(); // 'left_side' or 'right_side' relative to its ancestor.

    // Handle deletion based on the number of children.
    switch (nodeToRemove.countChildren()) {
      case 0: // Case 1: Node has no children (it's a leaf node).
        if (nodeToRemove === this.baseNode) {
          this.baseNode = null; // If it's the root, clear the tree.
        } else {
          nodeToRemove.ancestor[childPlacement] = null; // Disconnect from its ancestor.
        }
        break;

      case 1: // Case 2: Node has exactly one child.
        const onlyChild = nodeToRemove.leftChild || nodeToRemove.rightChild; // Get the single child.
        if (nodeToRemove === this.baseNode) {
          this.baseNode = onlyChild; // If root, the child becomes the new root.
          this.baseNode.ancestor = null; // New root has no ancestor.
        } else {
          nodeToRemove.ancestor[childPlacement] = onlyChild; // Link ancestor to the grandchild.
          onlyChild.ancestor = nodeToRemove.ancestor;       // Update grandchild's ancestor.
        }
        break;

      default: // Case 3: Node has two children.
        // Find the in-order successor (smallest node in the right subtree).
        let successorNode = nodeToRemove.findSuccessor();
        // Copy the successor's value to the node being deleted.
        nodeToRemove.value = successorNode.value;
        // Recursively delete the successor node (which now effectively holds the original value).
        // The successor will have at most one child (a right child), simplifying its deletion.
        this.removeValue(successorNode);
        break;
    }
  }


  /**
   * Traverses the tree in-order (left, root, right) and prints node values to the console.
   */
  displayInorder() {
    let outputString = ''; // String to accumulate node values.

    /**
     * Helper function for recursive in-order traversal.
     * @param {TreeNode|null} currentNode The current node being visited.
     */
    const traverseNodes = (currentNode) => {
      if (currentNode === null) {
        return; // Base case: stop if node is null.
      }
      traverseNodes(currentNode.leftChild);       // Visit left subtree.
      outputString += ` ${currentNode.value}`;    // Process current node.
      traverseNodes(currentNode.rightChild);      // Visit right subtree.
    };

    traverseNodes(this.baseNode); // Start traversal from the root.
    console.info(outputString);   // Print the accumulated string.
  }


  /**
   * Traverses the tree pre-order (root, left, right) and prints node values to the console.
   */
  displayPreorder() {
    let outputString = ''; // String to accumulate node values.

    /**
     * Helper function for recursive pre-order traversal.
     * @param {TreeNode|null} currentNode The current node being visited.
     */
    const traverseNodes = (currentNode) => {
      if (currentNode === null) {
        return; // Base case: stop if node is null.
      }
      outputString += ` ${currentNode.value}`;    // Process current node.
      traverseNodes(currentNode.leftChild);       // Visit left subtree.
      traverseNodes(currentNode.rightChild);      // Visit right subtree.
    };

    traverseNodes(this.baseNode); // Start traversal from the root.
    console.info(outputString);   // Print the accumulated string.
  }


  /**
   * Calls both in-order and pre-order display methods to print tree contents.
   */
  displayAll() {
    this.displayInorder();
    this.displayPreorder();
  }
}


/**
 * Anonymous function acting as the main entry point of the program.
 * Reads commands from standard input, processes them, and interacts with the SearchTree.
 */
(function executeProgram() {
  // Read all input lines from /dev/stdin, remove leading/trailing whitespace, and split by newline.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  // The first line often contains a count, though not used in this specific implementation.
  const entryCount = parseInt(inputLines.shift(), 10); // Parse the first line as an integer.

  const dataStructure = new SearchTree(); // Instantiate a new SearchTree.

  // Iterate over each remaining line (command).
  inputLines.forEach(function (commandLine) {
    // Determine the command type based on the first character.
    switch (commandLine.charAt(0)) {
      case 'i': // 'i' for insert
        // Extract the numerical value from the command line and insert it.
        dataStructure.addValue(parseInt(commandLine.split(' ')[1], 10));
        break;
      case 'f': // 'f' for find
        // Extract the numerical value and search for it. Print 'affirmative' or 'negative'.
        console.info(dataStructure.locateValue(parseInt(commandLine.split(' ')[1], 10)) ? 'affirmative' : 'negative');
        break;
      case 'd': // 'd' for delete
        // Extract the numerical value and remove the corresponding node.
        dataStructure.removeValue(parseInt(commandLine.split(' ')[1], 10));
        break;
      default: // Any other command is assumed to be a print command.
        dataStructure.displayAll(); // Display tree contents using both traversals.
    }
  });
})();