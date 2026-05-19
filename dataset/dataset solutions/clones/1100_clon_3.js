class TreeNode {
  constructor(nodeValue, leftChild = null, rightChild = null) {
    this.nodeValue = nodeValue;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }

  getNodeValue() {
    return this.nodeValue;
  }
}

class BinarySearchTree {
  constructor() {
    this.treeRoot = null;
  }

  static get Node() { return TreeNode; }

  addNode(nodeValue) {
    const freshNode = new BinarySearchTree.Node(nodeValue);

    if (this.treeRoot === null) {
      this.treeRoot = freshNode;
      return;
    }

    let currentNode = this.treeRoot;
    let parentNode = null;

    while (currentNode !== null) {
      parentNode = currentNode;
      const isLesser = nodeValue < currentNode.getNodeValue();
      currentNode = isLesser ? currentNode.leftChild : currentNode.rightChild;
    }

    if (nodeValue < parentNode.getNodeValue()) {
      parentNode.leftChild = freshNode;
    } else {
      parentNode.rightChild = freshNode;
    }
  }

  _performTraversalAndLog(traversalMode) {
    let outputString = '';

    const recursiveTraversal = (currentTraversalNode) => {
      if (currentTraversalNode === null) {
        return;
      }

      if (traversalMode === 'preOrder') {
        outputString += ` ${currentTraversalNode.getNodeValue()}`;
      }
      recursiveTraversal(currentTraversalNode.leftChild);
      if (traversalMode === 'inOrder') {
        outputString += ` ${currentTraversalNode.getNodeValue()}`;
      }
      recursiveTraversal(currentTraversalNode.rightChild);
    };

    recursiveTraversal(this.treeRoot);
    console.log(outputString);
  }

  traverseInOrderAndPrint() {
    this._performTraversalAndLog('inOrder');
  }

  traversePreOrderAndPrint() {
    this._performTraversalAndLog('preOrder');
  }

  displayTree() {
    this.traverseInOrderAndPrint();
    this.traversePreOrderAndPrint();
  }
}

(function processInput() {
  const fileSystemModule = require('fs');
  const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();
  const inputLines = rawInputContent.split('\n');

  const numCommandsStr = inputLines.shift();
  const numCommands = Number(numCommandsStr);

  const bstInstance = new BinarySearchTree();

  for (const currentLine of inputLines) {
    const commandParts = currentLine.split(' ');
    const commandIdentifier = commandParts[0].charAt(0);

    if (commandIdentifier === 'i') {
      const valueToInsert = Number(commandParts[1]);
      bstInstance.addNode(valueToInsert);
    } else {
      bstInstance.displayTree();
    }
  }
})();
