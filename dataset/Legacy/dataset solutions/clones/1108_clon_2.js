class TreeNode {
  // Constructor for a tree node, initializing its value and connections.
  constructor(val, ancestor = null, leftBranch = null, rightBranch = null) {
    this.val = val;
    this.ancestor = ancestor;
    this.leftBranch = leftBranch;
    this.rightBranch = rightBranch;
  }

  // Calculates the number of direct children this node has.
  countChildren() {
    return Number(this.leftBranch !== null) + Number(this.rightBranch !== null);
  }

  // Checks if this node is the left child of its parent.
  // Returns null if it's the root, true if left child, false if right child.
  isLeftDescendant() {
    if (this.ancestor === null) {
      return null;
    }
    return this.ancestor.leftBranch === this;
  }

  // Returns a string indicating whether the node is a 'left' or 'right' child.
  getBranchSide() {
    return this.isLeftDescendant() ? 'left' : 'right';
  }

  // Finds the in-order successor of this node.
  // Note: The original code's logic for finding successor when right child is null
  // contains a logical flaw (`!n.isLeftChild` will always be false as `isLeftChild` is a method).
  // This flaw is preserved as per Type II cloning rules.
  findSuccessor() {
    let current;
    if (this.rightBranch !== null) {
      current = this.rightBranch;
      while (current.leftBranch !== null) {
        current = current.leftBranch;
      }
    } else {
      current = this.ancestor;
      // This loop condition `!current.isLeftDescendant` will always be false
      // because `isLeftDescendant` is a function and thus truthy.
      // The original behavior is preserved.
      while (!current.isLeftDescendant && current.ancestor != null) {
        current = current.ancestor;
      }
    }
    return current;
  }
}

class BinarySearchTree {
  // Initializes an empty binary search tree.
  constructor() {
    this.treeRoot = null;
  }

  // Static getter to expose the Node class for external use.
  static get NodeClass() {
    return TreeNode;
  }

  // Inserts a new value into the binary search tree.
  // This method has a unique self-redefining behavior:
  // The first call sets the root and then replaces itself with a standard insert logic.
  addValue(value) {
    this.treeRoot = new BinarySearchTree.NodeClass(value);
    this.addValue = (value) => {
      let currentNode = this.treeRoot,
        parentNode;
      let newBranchNode = new BinarySearchTree.NodeClass(value);
      while (currentNode !== null) {
        parentNode = currentNode;
        currentNode = currentNode[value < currentNode.val ? 'left' : 'right'];
      }
      newBranchNode.ancestor = parentNode;
      parentNode[value < parentNode.val ? 'left' : 'right'] = newBranchNode;
    };
  }

  // Searches for a node with the given value in the tree.
  // Returns the node if found, otherwise null.
  locateValue(value, currentSearchNode = this.treeRoot) {
    if (currentSearchNode === null || currentSearchNode.val === value) {
      return currentSearchNode;
    }
    return this.locateValue(value, currentSearchNode[value < currentSearchNode.val ? 'left' : 'right']);
  }

  // Deletes a node with the specified value from the tree.
  removeValue(value) {
    const nodeToDelete = this.locateValue(value);
    if (nodeToDelete === null) {
      return; // Node not found, nothing to delete.
    }

    let branchPosition = nodeToDelete.getBranchSide();

    switch (nodeToDelete.countChildren()) {
      case 0: // Node has no children
        if (nodeToDelete.ancestor) {
          nodeToDelete.ancestor[branchPosition] = null;
        } else {
          this.treeRoot = null; // Deleting the root node with no children
        }
        break;
      case 1: // Node has one child
        const childNode = nodeToDelete.leftBranch || nodeToDelete.rightBranch;
        if (nodeToDelete.ancestor) {
          nodeToDelete.ancestor[branchPosition] = childNode;
          childNode.ancestor = nodeToDelete.ancestor;
        } else {
          this.treeRoot = childNode; // Deleting the root node with one child
          childNode.ancestor = null;
        }
        break;
      default: // Node has two children
        let successorValue = nodeToDelete.findSuccessor().val;
        this.removeValue(successorValue); // Recursively delete the successor
        nodeToDelete.val = successorValue; // Replace current node's value with successor's value
    }
  }

  // Prints the tree nodes in in-order traversal.
  displayInOrder() {
    let outputString = '';
    const traverseInOrder = (currentTraversalNode) => {
      if (currentTraversalNode === null) {
        return;
      }
      traverseInOrder(currentTraversalNode.leftBranch);
      outputString += ` ${currentTraversalNode.val}`;
      traverseInOrder(currentTraversalNode.rightBranch);
    };
    traverseInOrder(this.treeRoot);
    console.log(outputString);
  }

  // Prints the tree nodes in pre-order traversal.
  displayPreOrder() {
    let resultString = '';
    const traversePreOrder = (currentPreorderNode) => {
      if (currentPreorderNode === null) {
        return;
      }
      resultString += ` ${currentPreorderNode.val}`;
      traversePreOrder(currentPreorderNode.leftBranch);
      traversePreOrder(currentPreorderNode.rightBranch);
    };
    traversePreOrder(this.treeRoot);
    console.log(resultString);
  }

  // Prints both in-order and pre-order traversals of the tree.
  displayAllOrders() {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

// Main execution block for processing commands.
(function executeTreeOperations() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const numOperations = Number(inputLines.shift()); // The number of operations is read but not used in the original code.

  const bstInstance = new BinarySearchTree();
  inputLines.forEach(function(commandLine) {
    switch (commandLine.charAt(0)) {
      case 'i':
        bstInstance.addValue(Number(commandLine.split(' ')[1]));
        break;
      case 'f':
        console.log(bstInstance.locateValue(Number(commandLine.split(' ')[1])) ? 'yes' : 'no');
        break;
      case 'd':
        bstInstance.removeValue(Number(commandLine.split(' ')[1]));
        break;
      default: // 'p' for print
        bstInstance.displayAllOrders();
    }
  });
})();
