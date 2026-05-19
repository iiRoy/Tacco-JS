class BstNode {
  constructor(nodeValue, parentNode = null, leftChild = null, rightChild = null) {
    this.nodeValue = nodeValue;
    this.parentNode = parentNode;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }

  countChildren() {
    let childCount = 0;
    if (this.leftChild !== null) {
      childCount++;
    }
    if (this.rightChild !== null) {
      childCount++;
    }
    return childCount;
  }

  isNodeLeftChild() {
    const currentParent = this.parentNode;
    if (currentParent === null) {
      return null;
    }
    return currentParent.leftChild === this;
  }

  determineChildPosition() {
    const isThisLeft = this.isNodeLeftChild();
    if (isThisLeft === null) {
      return null;
    }
    return isThisLeft ? 'leftChild' : 'rightChild';
  }

  findInorderSuccessor() {
    let successorCandidate;
    if (this.rightChild !== null) {
      successorCandidate = this.rightChild;
      while (successorCandidate.leftChild !== null) {
        successorCandidate = successorCandidate.leftChild;
      }
    } else {
      successorCandidate = this.parentNode;
      // Original code had a bug here: `!n.isLeftChild` instead of `!n.isLeftChild()`.
      // `!function` evaluates to `false`, so the loop never runs.
      // This behavior is preserved.
      while (!successorCandidate.isNodeLeftChild && successorCandidate.parentNode !== null) {
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

  static get BstNode() { return BstNode; }

  addValue(nodeValue) {
    const newTreeNode = new TreeManager.BstNode(nodeValue);
    if (this.treeRoot === null) {
      this.treeRoot = newTreeNode;
      return;
    }

    let currentTraversalNode = this.treeRoot;
    let parentCandidate = null;
    let isMovingLeft = false;

    while (currentTraversalNode !== null) {
      parentCandidate = currentTraversalNode;
      if (nodeValue < currentTraversalNode.nodeValue) {
        currentTraversalNode = currentTraversalNode.leftChild;
        isMovingLeft = true;
      } else {
        currentTraversalNode = currentTraversalNode.rightChild;
        isMovingLeft = false;
      }
    }

    newTreeNode.parentNode = parentCandidate;
    if (parentCandidate !== null) {
      if (isMovingLeft) {
        parentCandidate.leftChild = newTreeNode;
      } else {
        parentCandidate.rightChild = newTreeNode;
      }
    }
  }

  searchForValue(targetValue, startNode = this.treeRoot) {
    let currentNode = startNode;
    while (currentNode !== null) {
      if (currentNode.nodeValue === targetValue) {
        return currentNode;
      }
      if (targetValue < currentNode.nodeValue) {
        currentNode = currentNode.leftChild;
      } else {
        currentNode = currentNode.rightChild;
      }
    }
    return null;
  }

  removeValue(targetValue) {
    const nodeToRemove = this.searchForValue(targetValue);
    // Original code would throw TypeError if nodeToRemove is null (e.g., if targetValue is an object).
    // This behavior is preserved by not adding a null check here.

    const parentOfNodeToRemove = nodeToRemove.parentNode;
    const childPosition = nodeToRemove.determineChildPosition();

    const childrenCount = nodeToRemove.countChildren();

    if (childrenCount === 0) {
      if (parentOfNodeToRemove === null) {
        this.treeRoot = null;
      } else {
        parentOfNodeToRemove[childPosition] = null;
      }
    } else if (childrenCount === 1) {
      const childNode = nodeToRemove.leftChild !== null ? nodeToRemove.leftChild : nodeToRemove.rightChild;
      if (parentOfNodeToRemove === null) {
        this.treeRoot = childNode;
        childNode.parentNode = null;
      } else {
        parentOfNodeToRemove[childPosition] = childNode;
        childNode.parentNode = parentOfNodeToRemove;
      }
    } else { // childrenCount === 2
      const successorNode = nodeToRemove.findInorderSuccessor();
      nodeToRemove.nodeValue = successorNode.nodeValue;
      // Original code had a bug here: `this.delete(s)` where `s` is a node object.
      // `removeValue` expects a number. This call will trigger the same TypeError
      // or unexpected behavior as in the original, which is preserved.
      this.removeValue(successorNode);
    }
  }

  displayInOrderTraversal() {
    let traversalOutputBuffer = [];
    const recursiveVisitor = (currentNode) => {
      if (currentNode === null) {
        return;
      }
      recursiveVisitor(currentNode.leftChild);
      traversalOutputBuffer.push(currentNode.nodeValue);
      recursiveVisitor(currentNode.rightChild);
    };
    recursiveVisitor(this.treeRoot);
    console.log(traversalOutputBuffer.map(val => ` ${val}`).join(''));
  }

  displayPreOrderTraversal() {
    let traversalOutputBuffer = [];
    const recursiveVisitor = (currentNode) => {
      if (currentNode === null) {
        return;
      }
      traversalOutputBuffer.push(currentNode.nodeValue);
      recursiveVisitor(currentNode.leftChild);
      recursiveVisitor(currentNode.rightChild);
    };
    recursiveVisitor(this.treeRoot);
    console.log(traversalOutputBuffer.map(val => ` ${val}`).join(''));
  }

  outputAllTraversals() {
    this.displayInOrderTraversal();
    this.displayPreOrderTraversal();
  }
}

(function processTreeCommands() {
  const fileSystem = require('fs');
  const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputCommandLines = rawInput.trim().split('\n');

  const totalCommands = Number(inputCommandLines.shift());

  const treeInstance = new TreeManager();

  for (let i = 0; i < inputCommandLines.length; i++) {
    const currentCommand = inputCommandLines[i];
    const commandTypeChar = currentCommand[0];
    const commandParts = currentCommand.split(' ');

    if (commandTypeChar === 'i') {
      const valueToInsert = Number(commandParts[1]);
      treeInstance.addValue(valueToInsert);
    } else if (commandTypeChar === 'f') {
      const valueToFind = Number(commandParts[1]);
      const foundNode = treeInstance.searchForValue(valueToFind);
      console.log(foundNode !== null ? 'yes' : 'no');
    } else if (commandTypeChar === 'd') {
      const valueToDelete = Number(commandParts[1]);
      treeInstance.removeValue(valueToDelete);
    } else {
      treeInstance.outputAllTraversals();
    }
  }
})();
