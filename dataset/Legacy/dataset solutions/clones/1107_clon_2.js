class TreeNode {
  // Constructor for a tree node.
  constructor(nodeVal, parentNode = null, leftChild = null, rightChild = null) {
    this.nodeVal = nodeVal; // The value stored in the node.
    this.parentNode = parentNode; // Reference to the parent node.
    this.leftChild = leftChild; // Reference to the left child node.
    this.rightChild = rightChild; // Reference to the right child node.
  }

  // Returns the number of direct children this node has (0, 1, or 2).
  countChildren() {
    return Number(this.leftChild !== null) + Number(this.rightChild !== null);
  }

  // Checks if this node is the left child of its parent.
  isLeft() {
    if (this.parentNode === null) return null; // If root, returns null
    return this.parentNode.leftChild === this;
  }

  // Determines if the node is a 'left' or 'right' child relative to its parent.
  getSide() {
    return this.isLeft() ? 'left' : 'right'; // If isLeft() returns null, it's falsy, so 'right' is returned.
  }

  // Finds the in-order successor of this node.
  findSuccessor() {
    let current; // Temporary variable for traversal.
    if (this.rightChild !== null) {
      current = this.rightChild;
      while (current.leftChild !== null) {
        current = current.leftChild; // Go left as far as possible in the right subtree.
      }
    } else {
      current = this.parentNode;
      // Replicating original bug: `!n.isLeftChild` instead of `!n.isLeftChild()`
      // This means the loop condition `!current.isLeft` will always be false
      // because `current.isLeft` (the method itself) is a truthy object.
      while (!current.isLeft && current.parentNode != null) {
        current = current.parentNode;
      }
    }
    return current;
  }
}

class SearchTree {
  // Initializes an empty binary search tree.
  constructor() {
    this.treeRoot = null; // The root node of the tree.
  }

  // Static getter to expose the Node class.
  static get NodeClass() {
    return TreeNode;
  }

  // Inserts a new value into the binary search tree.
  addValue(nodeVal) {
    if (this.treeRoot === null) {
      this.treeRoot = new SearchTree.NodeClass(nodeVal);
      return; // Tree was empty, new node is the root.
    }

    let currNode = this.treeRoot; // Start traversal from the root.
    let prevNode; // Keep track of the parent of currNode.
    let newEntry = new SearchTree.NodeClass(nodeVal); // Create the new node.

    // Traverse the tree to find the correct insertion point.
    while (currNode !== null) {
      prevNode = currNode;
      currNode = currNode[nodeVal < currNode.nodeVal ? 'leftChild' : 'rightChild'];
    }

    // Link the new node to its parent.
    newEntry.parentNode = prevNode;
    prevNode[nodeVal < prevNode.nodeVal ? 'leftChild' : 'rightChild'] = newEntry;
  }

  // Searches for a value in the tree.
  // Returns the node if found, otherwise null.
  locateValue(nodeVal, currSearchNode = this.treeRoot) {
    if (currSearchNode === null || currSearchNode.nodeVal === nodeVal) {
      return currSearchNode; // Found the node or reached a leaf.
    }
    // Recursively search in the appropriate subtree.
    return this.locateValue(nodeVal, currSearchNode[nodeVal < currSearchNode.nodeVal ? 'leftChild' : 'rightChild']);
  }

  // Deletes a node with the specified value from the tree.
  removeValue(nodeVal) {
    const targetNode = this.locateValue(nodeVal); // Find the node to delete.
    if (targetNode === null) {
      return; // Node not found, nothing to delete.
    }

    // Determine if the target node is a left or right child of its parent.
    // For the root node, targetNode.getSide() will return 'right' due to isLeft() returning null.
    let childPosition = targetNode.getSide();

    // Handle different cases based on the number of children the target node has.
    switch (targetNode.countChildren()) {
      case 0: // Case 1: Node has no children (it's a leaf).
        // Replicating original bug: If targetNode is the root, targetNode.parentNode is null,
        // leading to a TypeError when trying to access targetNode.parentNode[childPosition].
        targetNode.parentNode[childPosition] = null;
        break;
      case 1: // Case 2: Node has one child.
        let childToPromote = targetNode.leftChild || targetNode.rightChild;
        // Replicating original bug: If targetNode is the root, targetNode.parentNode is null,
        // leading to a TypeError when trying to access targetNode.parentNode[childPosition].
        targetNode.parentNode[childPosition] = childToPromote;
        targetNode.parentNode[childPosition].parentNode = targetNode.parentNode;
        break;
      default: // Case 3: Node has two children.
        let successorNode = targetNode.findSuccessor();
        targetNode.nodeVal = successorNode.nodeVal;
        // Replicating original bug: passing the node object instead of its value.
        // This will cause locateValue(successorNode) to return null,
        // and then targetNode.getSide() on null will throw TypeError in the recursive call.
        this.removeValue(successorNode);
    }
  }

  // Prints the tree elements in in-order traversal.
  displayInOrder() {
    let outputString = ''; // Accumulator for the output.
    const traverseInOrder = (currentNode) => {
      if (currentNode === null) {
        return; // Base case for recursion.
      }
      traverseInOrder(currentNode.leftChild); // Visit left subtree.
      outputString += ` ${currentNode.nodeVal}`; // Visit current node.
      traverseInOrder(currentNode.rightChild); // Visit right subtree.
    };
    traverseInOrder(this.treeRoot); // Start traversal from the root.
    console.log(outputString); // Output the collected string.
  }

  // Prints the tree elements in pre-order traversal.
  displayPreOrder() {
    let resultString = ''; // Accumulator for the output.
    const traversePreOrder = (currentElement) => {
      if (currentElement === null) {
        return; // Base case for recursion.
      }
      resultString += ` ${currentElement.nodeVal}`; // Visit current node.
      traversePreOrder(currentElement.leftChild); // Visit left subtree.
      traversePreOrder(currentElement.rightChild); // Visit right subtree.
    };
    traversePreOrder(this.treeRoot); // Start traversal from the root.
    console.log(resultString); // Output the collected string.
  }

  // Calls both in-order and pre-order print methods.
  showTree() {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

// Main execution block (Immediately Invoked Function Expression).
(function executeMain() {
  // Read input from stdin.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const numOperations = Number(inputLines.shift()); // First line is number of operations (unused in this specific implementation, but read).

  const binarySearchTree = new SearchTree(); // Create a new binary search tree instance.

  // Process each command line.
  inputLines.forEach(function(commandLine) {
    switch (commandLine.charAt(0)) {
      case 'i': // Insert command
        binarySearchTree.addValue(Number(commandLine.split(' ')[1]));
        break;
      case 'f': // Find command
        console.log(binarySearchTree.locateValue(Number(commandLine.split(' ')[1])) ? 'yes' : 'no');
        break;
      case 'd': // Delete command
        binarySearchTree.removeValue(Number(commandLine.split(' ')[1]));
        break;
      default: // Print command (any other character, typically 'p')
        binarySearchTree.showTree();
    }
  });
})();
