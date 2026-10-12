class BstNode {
  constructor(nodeVal, parentNode = null, leftChild = null, rightChild = null) {
    this.nodeVal = nodeVal;
    this.parentNode = parentNode;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }

  countChildren() {
    const leftCount = this.leftChild ? 1 : 0;
    const rightCount = this.rightChild ? 1 : 0;
    return leftCount + rightCount;
  }

  isNodeLeftChild() {
    if (this.parentNode === null) {
      return null;
    }
    return this.parentNode.leftChild === this;
  }

  getChildPosition() {
    const isCurrentNodeLeft = this.isNodeLeftChild();
    return isCurrentNodeLeft ? 'leftChild' : 'rightChild';
  }

  findSuccessorNode() {
    let successorCandidate;
    const hasRightSubtree = this.rightChild !== null;

    if (hasRightSubtree) {
      successorCandidate = this.rightChild;
      while (successorCandidate.leftChild !== null) {
        successorCandidate = successorCandidate.leftChild;
      }
    } else {
      successorCandidate = this.parentNode;
      // The original code's loop condition `!n.isLeftChild` evaluates to `false`
      // because `n.isLeftChild` is a function object (truthy).
      // Thus, the loop `while (!successorCandidate.isNodeLeftChild && successorCandidate.parentNode != null)`
      // will never execute. This behavior is preserved.
      while (!successorCandidate.isNodeLeftChild && successorCandidate.parentNode != null) {
        successorCandidate = successorCandidate.parentNode;
      }
    }
    return successorCandidate;
  }
}

class TreeManager {
  constructor() {
    this.treeRoot = null;
  }

  static get Node() { return BstNode; }

  addNode(valToAdd) {
    if (this.treeRoot === null) {
      this.treeRoot = new TreeManager.Node(valToAdd);
      return;
    }

    let currentNode = this.treeRoot;
    let previousNode;
    const newNode = new TreeManager.Node(valToAdd);

    while (currentNode !== null) {
      previousNode = currentNode;
      const goLeft = valToAdd < currentNode.nodeVal;
      if (goLeft) {
        currentNode = currentNode.leftChild;
      } else {
        currentNode = currentNode.rightChild;
      }
    }

    newNode.parentNode = previousNode;
    const shouldBeLeftChild = valToAdd < previousNode.nodeVal;
    if (shouldBeLeftChild) {
      previousNode.leftChild = newNode;
    } else {
      previousNode.rightChild = newNode;
    }
  }

  locateNode(searchVal, currentNode = this.treeRoot) {
    if (currentNode === null) {
      return null;
    }
    if (currentNode.nodeVal === searchVal) {
      return currentNode;
    }
    const isSearchValSmaller = searchVal < currentNode.nodeVal;
    const nextNode = isSearchValSmaller ? currentNode.leftChild : currentNode.rightChild;
    return this.locateNode(searchVal, nextNode);
  }

  removeNode(valToDelete) {
    const targetNode = this.locateNode(valToDelete);
    const childPosition = targetNode.getChildPosition();
    const numberOfChildren = targetNode.countChildren();

    switch (numberOfChildren) {
      case 0:
        // Node has no children, simply remove it from its parent
        targetNode.parentNode[childPosition] = null;
        break;
      case 1:
        // Node has one child, replace node with its child
        const childToPromote = targetNode.leftChild || targetNode.rightChild;
        targetNode.parentNode[childPosition] = childToPromote;
        childToPromote.parentNode = targetNode.parentNode;
        break;
      default:
        // Node has two children, find successor, delete successor, replace node's value
        const successorVal = targetNode.findSuccessorNode().nodeVal;
        this.removeNode(successorVal);
        targetNode.nodeVal = successorVal;
    }
  }

  displayInOrder() {
    let resultString = '';
    const recursiveTraversal = (currentNode) => {
      if (currentNode === null) {
        return;
      }
      recursiveTraversal(currentNode.leftChild);
      resultString += ` ${currentNode.nodeVal}`;
      recursiveTraversal(currentNode.rightChild);
    };
    recursiveTraversal(this.treeRoot);
    console.log(resultString);
  }

  displayPreOrder() {
    let resultString = '';
    const recursiveTraversal = (currentNode) => {
      if (currentNode === null) {
        return;
      }
      resultString += ` ${currentNode.nodeVal}`;
      recursiveTraversal(currentNode.leftChild);
      recursiveTraversal(currentNode.rightChild);
    };
    recursiveTraversal(this.treeRoot);
    console.log(resultString);
  }

  displayAllOrders() {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

(function processTreeCommands() {
  const fileSystem = require('fs');
  const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputLines = inputData.trim().split('\n');

  const commandCount = Number(inputLines.shift()); // This variable is read but not used in the original. Preserving this.

  const treeInstance = new TreeManager();

  inputLines.forEach(function(currentCommand) {
    const commandTypeChar = currentCommand.charAt(0);
    let commandValue;

    // Extract command value if present
    if (currentCommand.length > 1) {
      const commandParts = currentCommand.split(' ');
      commandValue = Number(commandParts[1]);
    }

    switch (commandTypeChar) {
      case 'i':
        treeInstance.addNode(commandValue);
        break;
      case 'f':
        const foundNode = treeInstance.locateNode(commandValue);
        console.log(foundNode ? 'yes' : 'no');
        break;
      case 'd':
        treeInstance.removeNode(commandValue);
        break;
      default: // 'p' for print
        treeInstance.displayAllOrders();
    }
  });
})();
