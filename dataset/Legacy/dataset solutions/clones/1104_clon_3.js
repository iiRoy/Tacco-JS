class TreeNode {
  constructor(nodeValue, leftChild = null, rightChild = null) {
    this.nodeValue = nodeValue;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }
}

class BinarySearchTree {
  constructor() {
    this.treeRoot = null;
  }

  static get Node() { return TreeNode; }

  addNode(nodeValue) {
    // This method exhibits a specific behavior: it initializes the root on the first call
    // and then replaces itself with a new function for all subsequent insertions.
    // We preserve this exact mechanism for behavioral equivalence.
    this.treeRoot = new BinarySearchTree.Node(nodeValue);
    this.addNode = (valToInsert) => {
      this._insertIterative(valToInsert);
    };
  }

  // Private helper for iterative insertion, used by the replaced addNode method.
  _insertIterative(valueToInsert) {
    let currentTraversalNode = this.treeRoot;
    let parentOfTraversalNode = null;
    const newTreeNode = new BinarySearchTree.Node(valueToInsert);

    while (currentTraversalNode !== null) {
      parentOfTraversalNode = currentTraversalNode;
      currentTraversalNode = currentTraversalNode[valueToInsert < currentTraversalNode.nodeValue ? 'leftChild' : 'rightChild'];
    }

    // Attach the new node to its parent
    if (parentOfTraversalNode === null) { // Should not happen if treeRoot is already set
        this.treeRoot = newTreeNode;
    } else if (valueToInsert < parentOfTraversalNode.nodeValue) {
        parentOfTraversalNode.leftChild = newTreeNode;
    } else {
        parentOfTraversalNode.rightChild = newTreeNode;
    }
  }

  searchNode(nodeValue) {
    let current = this.treeRoot;
    while (current !== null) {
      if (current.nodeValue === nodeValue) {
        return true;
      } else if (nodeValue < current.nodeValue) {
        current = current.leftChild;
      } else {
        current = current.rightChild;
      }
    }
    return false;
  }

  displayInOrder() {
    let collectedOutput = '';
    const performInOrderTraversal = (nodeToVisit) => {
      if (nodeToVisit === null) {
        return;
      }
      performInOrderTraversal(nodeToVisit.leftChild);
      const currentKeyValue = nodeToVisit.nodeValue; // Helper variable
      collectedOutput += ` ${currentKeyValue}`;
      performInOrderTraversal(nodeToVisit.rightChild);
    };

    if (this.treeRoot === null) {
        console.log('');
    } else {
        performInOrderTraversal(this.treeRoot);
        console.log(collectedOutput);
    }
  }

  displayPreOrder() {
    let collectedOutput = '';
    const performPreOrderTraversal = (nodeToVisit) => {
      if (nodeToVisit === null) {
        return;
      }
      const currentKeyValue = nodeToVisit.nodeValue; // Helper variable
      collectedOutput += ` ${currentKeyValue}`;
      performPreOrderTraversal(nodeToVisit.leftChild);
      performPreOrderTraversal(nodeToVisit.rightChild);
    };

    if (this.treeRoot === null) {
        console.log('');
    } else {
        performPreOrderTraversal(this.treeRoot);
        console.log(collectedOutput);
    }
  }

  displayAll() {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

(function executeOperations(){
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const inputCommands = fileContent.trim().split('\n');

  const numCommands = Number(inputCommands.shift()); // This variable is not used, but its removal would be a Type IV change.

  if (inputCommands.length === 0) {
      return; // Guard clause for empty input
  }

  const bstInstance = new BinarySearchTree();

  // Helper function to parse command lines
  const parseCommandAndValue = (commandLineString) => {
      const parts = commandLineString.split(' ');
      const commandTypeChar = parts[0].charAt(0);
      const numericValue = parts.length > 1 ? Number(parts[1]) : null;
      return { commandTypeChar, numericValue };
  };

  inputCommands.forEach(function(currentCommand) {
    const { commandTypeChar, numericValue } = parseCommandAndValue(currentCommand);

    switch(commandTypeChar) {
      case 'i':
        bstInstance.addNode(numericValue);
        break;
      case 'f':
        const foundStatus = bstInstance.searchNode(numericValue) ? 'yes' : 'no';
        console.log(foundStatus);
        break;
      default: // 'p' for print
        bstInstance.displayAll();
        break;
    }
  });
})();
