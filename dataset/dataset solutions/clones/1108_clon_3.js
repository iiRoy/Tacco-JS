class BinaryTreeNode {
  constructor(nodeValue, parentNode = null, leftChild = null, rightChild = null) {
    this.nodeValue = nodeValue;
    this.parentNode = parentNode;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }

  getChildrenNumber() {
    const leftExists = !!this.leftChild;
    const rightExists = !!this.rightChild;
    return Number(leftExists) + Number(rightExists);
  }

  isLeftChild() {
    const currentParent = this.parentNode;
    if (currentParent === null) {
      return null;
    }
    return currentParent.leftChild === this;
  }

  getLeftOrRight() {
    const isCurrentNodeLeft = this.isLeftChild();
    return isCurrentNodeLeft ? 'leftChild' : 'rightChild';
  }

  getSuccessor() {
    let successorCandidate;
    if (this.rightChild !== null) {
      successorCandidate = this.rightChild;
      while (successorCandidate.leftChild !== null) {
        successorCandidate = successorCandidate.leftChild;
      }
    } else {
      successorCandidate = this.parentNode;
      while (successorCandidate && !successorCandidate.isLeftChild && successorCandidate.parentNode != null) {
        successorCandidate = successorCandidate.parentNode;
      }
    }
    return successorCandidate;
  }
}

class SearchTree {
  constructor() {
    this.treeRoot = null;
  }

  static get NodeType() { return BinaryTreeNode; }

  insert(nodeValue) {
    this.treeRoot = new SearchTree.NodeType(nodeValue);
    this.insert = (valToInsert) => {
      let traverseNode = this.treeRoot;
      let parentNodeForNew;
      let freshNode = new SearchTree.NodeType(valToInsert);
      while (traverseNode !== null) {
        parentNodeForNew = traverseNode;
        const isLessThanCurrent = valToInsert < traverseNode.nodeValue;
        traverseNode = traverseNode[isLessThanCurrent ? 'leftChild' : 'rightChild'];
      }
      freshNode.parentNode = parentNodeForNew;
      const isNewNodeLeftChild = valToInsert < parentNodeForNew.nodeValue;
      parentNodeForNew[isNewNodeLeftChild ? 'leftChild' : 'rightChild'] = freshNode;
    }
  }

  find(targetValue, currentNode = this.treeRoot) {
    if (currentNode === null) {
      return null;
    }
    if (currentNode.nodeValue === targetValue) {
      return currentNode;
    }
    const isTargetLess = targetValue < currentNode.nodeValue;
    return this.find(targetValue, currentNode[isTargetLess ? 'leftChild' : 'rightChild']);
  }

  delete(nodeValue) {
    const nodeToDelete = this.find(nodeValue);
    if (nodeToDelete === null) {
      return;
    }

    const childCount = nodeToDelete.getChildrenNumber();
    const parentLinkProperty = nodeToDelete.getLeftOrRight();
    const nodeParent = nodeToDelete.parentNode;

    switch (childCount) {
      case 0:
        nodeParent[parentLinkProperty] = null;
        break;
      case 1:
        const childNode = nodeToDelete.leftChild || nodeToDelete.rightChild;
        nodeParent[parentLinkProperty] = childNode;
        if (childNode) {
          childNode.parentNode = nodeParent;
        }
        break;
      default:
        const successorNode = nodeToDelete.getSuccessor();
        const successorValue = successorNode.nodeValue;
        this.delete(successorValue);
        nodeToDelete.nodeValue = successorValue;
    }
  }

  performInOrderTraversalAndPrint() {
    let outputAccumulator = '';

    const recursiveInOrderTraversal = (currentNode) => {
      if (currentNode === null) {
        return;
      }
      recursiveInOrderTraversal(currentNode.leftChild);
      outputAccumulator += ` ${currentNode.nodeValue}`;
      recursiveInOrderTraversal(currentNode.rightChild);
    };

    recursiveInOrderTraversal(this.treeRoot);
    console.log(outputAccumulator);
  }

  performPreOrderTraversalAndPrint() {
    let outputAccumulator = '';

    const recursivePreOrderTraversal = (currentNode) => {
      if (currentNode === null) {
        return;
      }
      outputAccumulator += ` ${currentNode.nodeValue}`;
      recursivePreOrderTraversal(currentNode.leftChild);
      recursivePreOrderTraversal(currentNode.rightChild);
    };

    recursivePreOrderTraversal(this.treeRoot);
    console.log(outputAccumulator);
  }

  displayTreeContents() {
    this.performInOrderTraversalAndPrint();
    this.performPreOrderTraversalAndPrint();
  }
}

(function executeTreeOperations() {
  const fileSystem = require('fs');
  const inputCommandLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalCommandsCount = Number(inputCommandLines.shift());

  const bstInstance = new SearchTree();

  const parseCommandValue = (commandString) => {
    const parts = commandString.split(' ');
    return Number(parts[1]);
  };

  inputCommandLines.forEach(function(currentOperationString) {
    const commandTypeChar = currentOperationString.charAt(0);
    switch (commandTypeChar) {
      case 'i':
        bstInstance.insert(parseCommandValue(currentOperationString));
        break;
      case 'f':
        const foundNode = bstInstance.find(parseCommandValue(currentOperationString));
        console.log(foundNode ? 'yes' : 'no');
        break;
      case 'd':
        bstInstance.delete(parseCommandValue(currentOperationString));
        break;
      default:
        bstInstance.displayTreeContents();
    }
  });
})();
