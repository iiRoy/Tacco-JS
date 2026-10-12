class TreeNode {
  // Constructor for a new tree node.
  constructor(nodeValue, parentNode = null, leftChild = null, rightChild = null) {
    this.nodeValue = nodeValue; // The value stored in this node.
    this.parentNode = parentNode; // Reference to the parent node.
    this.leftChild = leftChild;   // Reference to the left child.
    this.rightChild = rightChild; // Reference to the right child.
  }

  countChildren() {
    // Returns the number of direct children this node has (0, 1, or 2).
    return Number(this.leftChild !== null) + Number(this.rightChild !== null);
  }

  isNodeLeftChild() {
    // Checks if this node is the left child of its parent.
    if (this.parentNode === null) {
      return null; // A root node has no parent, so it's neither left nor right child.
    }
    return this.parentNode.leftChild === this;
  }

  getSideOfParent() {
    // Determines if this node is a 'leftChild' or 'rightChild' relative to its parent.
    return this.isNodeLeftChild() ? 'leftChild' : 'rightChild';
  }

  findSuccessorNode() {
    let successorCandidate; // Variable to hold the potential successor node.
    if (this.rightChild !== null) {
      // If there's a right child, the successor is the leftmost node in the right subtree.
      successorCandidate = this.rightChild;
      while (successorCandidate.leftChild !== null) {
        successorCandidate = successorCandidate.leftChild;
      }
    } else {
      // If no right child, the original code has a bug here: `!n.isLeftChild` is missing `()`.
      // This means `!n.isLeftChild` evaluates to `!function`, which is `false`.
      // So the `while` loop never executes.
      // We replicate this bug by not calling `isNodeLeftChild()` with parentheses.
      successorCandidate = this.parentNode;
      while (successorCandidate && !successorCandidate.isNodeLeftChild && successorCandidate.parentNode != null) {
        successorCandidate = successorCandidate.parentNode;
      }
    }
    return successorCandidate; // Return the identified successor node (or parent if bug triggered).
  }
}

class DataStructureTree {
  // Initializes a new empty binary search tree.
  constructor() {
    this.treeRoot = null; // The root node of the tree, initially null.
  }

  static get NodeClass() {
    return TreeNode; // Provides access to the internal TreeNode class.
  }

  addValue(valueToAdd) {
    // Inserts a new value into the binary search tree.
    if (this.treeRoot === null) {
      this.treeRoot = new DataStructureTree.NodeClass(valueToAdd); // If tree is empty, new node becomes the root.
      return;
    }

    let currentPointer = this.treeRoot; // Start traversal from the root.
    let previousPointer; // Keep track of the parent of the current node.
    let newTreeNode = new DataStructureTree.NodeClass(valueToAdd); // Create the new node to be inserted.

    while (currentPointer !== null) {
      previousPointer = currentPointer; // Update parent reference.
      // Move left or right based on the value.
      currentPointer = currentPointer[valueToAdd < currentPointer.nodeValue ? 'leftChild' : 'rightChild'];
    }

    newTreeNode.parentNode = previousPointer; // Set the parent of the new node.
    // Attach the new node to its parent.
    previousPointer[valueToAdd < previousPointer.nodeValue ? 'leftChild' : 'rightChild'] = newTreeNode;
  }

  locateValue(targetValue, currentNode = this.treeRoot) {
    // Recursively searches for a node with the given value.
    if (currentNode === null || currentNode.nodeValue === targetValue) {
      return currentNode; // Node found or reached end of branch.
    }
    // Continue search in the appropriate subtree.
    return this.locateValue(targetValue, currentNode[targetValue < currentNode.nodeValue ? 'leftChild' : 'rightChild']);
  }

  removeValue(valueToRemove) {
    // Deletes a node with the specified value from the tree.
    const nodeToDelete = this.locateValue(valueToRemove); // Find the node to be deleted.
    if (nodeToDelete === null) {
      return; // If node not found, do nothing.
    }

    // Determine if the node is a left or right child of its parent.
    // This will be null if nodeToDelete is the root, as isNodeLeftChild() returns null.
    let childPosition = nodeToDelete.getSideOfParent();

    // Handle different cases based on the number of children the node has.
    switch (nodeToDelete.countChildren()) {
      case 0: // Case 1: Node has no children (leaf node).
        // Original code has a bug: if nodeToDelete is the root, nodeToDelete.parentNode is null.
        // Accessing null[childPosition] (where childPosition is also null) will throw a TypeError.
        nodeToDelete.parentNode[childPosition] = null;
        break;

      case 1: // Case 2: Node has one child.
        let childNode = nodeToDelete.leftChild || nodeToDelete.rightChild; // Get the single child.
        // Original code has a bug: if nodeToDelete is the root, nodeToDelete.parentNode is null.
        // Accessing null[childPosition] will throw a TypeError.
        nodeToDelete.parentNode[childPosition] = childNode;
        childNode.parentNode = nodeToDelete.parentNode;
        break;

      default: // Case 3: Node has two children.
        // If nodeToDelete is the root, findSuccessorNode() will return null due to its own bug.
        // Then accessing null.nodeValue will throw a TypeError.
        let successorValue = nodeToDelete.findSuccessorNode().nodeValue;
        this.removeValue(successorValue); // Recursively delete the successor.
        nodeToDelete.nodeValue = successorValue; // Replace the deleted node's value with the successor's value.
    }
  }

  displayInOrder() {
    // Performs an in-order traversal and prints the node values.
    let outputString = ''; // Accumulator for the output string.

    // Recursive helper function for in-order traversal.
    const recursiveTraversal = (currentNode) => {
      if (currentNode === null) {
        return; // Base case: stop if node is null.
      }
      recursiveTraversal(currentNode.leftChild); // Traverse left subtree.
      outputString += ` ${currentNode.nodeValue}`; // Visit current node.
      recursiveTraversal(currentNode.rightChild); // Traverse right subtree.
    };

    recursiveTraversal(this.treeRoot); // Start traversal from the root.
    console.log(outputString); // Print the accumulated string.
  }

  displayPreOrder() {
    // Performs a pre-order traversal and prints the node values.
    let outputString = ''; // Accumulator for the output string.

    // Recursive helper function for pre-order traversal.
    const recursiveTraversal = (currentNode) => {
      if (currentNode === null) {
        return; // Base case: stop if node is null.
      }
      outputString += ` ${currentNode.nodeValue}`; // Visit current node.
      recursiveTraversal(currentNode.leftChild); // Traverse left subtree.
      recursiveTraversal(currentNode.rightChild); // Traverse right subtree.
    };

    recursiveTraversal(this.treeRoot); // Start traversal from the root.
    console.log(outputString); // Print the accumulated string.
  }

  displayAll() {
    // Prints both in-order and pre-order traversals of the tree.
    this.displayInOrder();
    this.displayPreOrder();
  }
}

(function executeProgram() {
  // Main execution block for processing commands from standard input.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  // The first line is usually the number of commands, but it's shifted off and not used later.
  const lineCount = Number(inputLines.shift());

  const myTree = new DataStructureTree(); // Instantiate our custom binary tree.

  // Process each command line.
  inputLines.forEach(function(commandLine) {
    // Determine the action based on the first character of the command.
    switch (commandLine.charAt(0)) {
      case 'i': // 'i' for insert
        myTree.addValue(Number(commandLine.split(' ')[1]));
        break;
      case 'f': // 'f' for find
        // Output 'yes' if value is found, 'no' otherwise.
        console.log(myTree.locateValue(Number(commandLine.split(' ')[1])) ? 'yes' : 'no');
        break;
      case 'd': // 'd' for delete
        myTree.removeValue(Number(commandLine.split(' ')[1]));
        break;
      default: // Any other command (implicitly 'p' for print in the original context)
        myTree.displayAll();
    }
  });
})();
