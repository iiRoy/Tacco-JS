class BinaryTreeNode {
  constructor(nodeValue, leftChildRef = null, rightChildRef = null) {
    this.nodeValue = nodeValue; // The data stored in this node
    this.leftChildRef = leftChildRef; // Reference to the left child
    this.rightChildRef = rightChildRef; // Reference to the right child
  }
}

class CustomBinarySearchTree {
  constructor() {
    this.treeRootNode = null; // The root of the binary search tree
  }

  // Static getter to expose the node class type
  static get NodeType() {
    return BinaryTreeNode;
  }

  // Method to add a new value to the tree
  addValue(newValue) {
    // On the very first insertion, initialize the root node
    this.treeRootNode = new CustomBinarySearchTree.NodeType(newValue);

    // After the first insertion, redefine the 'addValue' method
    // to handle subsequent insertions iteratively.
    this.addValue = (newValue) => {
      let currentNodePointer = this.treeRootNode; // Start from the root
      let parentNodePointer; // Keep track of the parent node

      // Create a new node for the value to be inserted
      let freshlyCreatedNode = new CustomBinarySearchTree.NodeType(newValue);

      // Traverse the tree to find the correct insertion point
      while (currentNodePointer !== null) {
        parentNodePointer = currentNodePointer; // Update parent before moving
        // Move left or right based on the new value's comparison with the current node's value
        currentNodePointer = currentNodePointer[newValue < currentNodePointer.nodeValue ? 'leftChildRef' : 'rightChildRef'];
      }

      // Insert the new node as a child of the parent node
      parentNodePointer[newValue < parentNodePointer.nodeValue ? 'leftChildRef' : 'rightChildRef'] = freshlyCreatedNode;
    };
  }

  // Method to search for a value in the tree
  locateValue(targetValue, currentSearchNode = this.treeRootNode) {
    // If the current node is null, the value is not found
    if (currentSearchNode === null) {
      return false;
    }
    // If the current node's value matches the target, the value is found
    if (currentSearchNode.nodeValue === targetValue) {
      return true;
    }
    // Recursively search in the left or right subtree
    return this.locateValue(targetValue, currentSearchNode[targetValue < currentSearchNode.nodeValue ? 'leftChildRef' : 'rightChildRef']);
  }

  // Method to print the tree elements using in-order traversal
  displayInOrderTraversal() {
    let inOrderOutputBuffer = ''; // Buffer to store the traversal output

    // Recursive helper function for in-order traversal
    const recursiveInOrderWalk = (nodeForInOrder) => {
      if (nodeForInOrder === null) {
        return; // Base case: stop if node is null
      }
      recursiveInOrderWalk(nodeForInOrder.leftChildRef); // Traverse left subtree
      inOrderOutputBuffer += ` ${nodeForInOrder.nodeValue}`; // Visit current node
      recursiveInOrderWalk(nodeForInOrder.rightChildRef); // Traverse right subtree
    };

    recursiveInOrderWalk(this.treeRootNode); // Start traversal from the root
    console.log(inOrderOutputBuffer); // Print the collected string
  }

  // Method to print the tree elements using pre-order traversal
  displayPreOrderTraversal() {
    let preOrderOutputBuffer = ''; // Buffer to store the traversal output

    // Recursive helper function for pre-order traversal
    const recursivePreOrderWalk = (nodeForPreOrder) => {
      if (nodeForPreOrder === null) {
        return; // Base case: stop if node is null
      }
      preOrderOutputBuffer += ` ${nodeForPreOrder.nodeValue}`; // Visit current node
      recursivePreOrderWalk(nodeForPreOrder.leftChildRef); // Traverse left subtree
      recursivePreOrderWalk(nodeForPreOrder.rightChildRef); // Traverse right subtree
    };

    recursivePreOrderWalk(this.treeRootNode); // Start traversal from the root
    console.log(preOrderOutputBuffer); // Print the collected string
  }

  // Method to print both in-order and pre-order traversals
  outputAllTraversals() {
    this.displayInOrderTraversal();
    this.displayPreOrderTraversal();
  }
}

// Immediately Invoked Function Expression (IIFE) to run the main application logic
(function applicationEntry() {
  // Read input from stdin, decode as utf8, trim whitespace, and split into lines
  const inputCommandLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  // The first line contains the number of commands, which is then removed from the array
  const numberOfCommands = Number(inputCommandLines.shift());

  const myBinaryTreeInstance = new CustomBinarySearchTree(); // Create a new tree instance

  // Process each command line
  inputCommandLines.forEach(function (currentCommandString) {
    // Determine the action based on the first character of the command
    switch (currentCommandString.charAt(0)) {
      case 'i': // 'i' for insert
        myBinaryTreeInstance.addValue(Number(currentCommandString.split(' ')[1]));
        break;
      case 'f': // 'f' for find
        console.log(myBinaryTreeInstance.locateValue(Number(currentCommandString.split(' ')[1])) ? 'yes' : 'no');
        break;
      default: // Any other command (implicitly 'p' for print)
        myBinaryTreeInstance.outputAllTraversals();
    }
  });
})();
