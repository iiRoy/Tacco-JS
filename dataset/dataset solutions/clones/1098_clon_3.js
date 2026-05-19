class TreeNode {
  constructor(nodeValue, leftChild = null, rightChild = null) {
    this.nodeValue = nodeValue;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }

  getValue() {
    return this.nodeValue;
  }
}

class TreeStructure {
  constructor() {
    this.treeRoot = null;
  }

  static get NodeClass() { return TreeNode; }

  addNode(nodeValue) {
    const subsequentNodeInsertion = (val) => {
      let currentTraversalNode = this.treeRoot;
      let parentNode = null;
      const newTreeNode = new TreeStructure.NodeClass(val, null, null);

      while (currentTraversalNode !== null) {
        parentNode = currentTraversalNode;
        const direction = val < currentTraversalNode.nodeValue ? 'leftChild' : 'rightChild';
        currentTraversalNode = currentTraversalNode[direction];
      }

      if (parentNode !== null) {
        const insertionDirection = val < parentNode.nodeValue ? 'leftChild' : 'rightChild';
        parentNode[insertionDirection] = newTreeNode;
      } else {
        this.treeRoot = newTreeNode;
      }
    };

    this.treeRoot = new TreeStructure.NodeClass(nodeValue, null, null);
    this.addNode = subsequentNodeInsertion;
  }

  _traverseAndCollect(traversalType) {
    let collectedString = '';
    const recursiveTraversal = (currentNode) => {
      if (currentNode === null) {
        return;
      }

      const currentVal = currentNode.getValue();

      if (traversalType === 'preorder') {
        collectedString += ` ${currentVal}`;
      }
      recursiveTraversal(currentNode.leftChild);
      if (traversalType === 'inorder') {
        collectedString += ` ${currentVal}`;
      }
      recursiveTraversal(currentNode.rightChild);
    };

    recursiveTraversal(this.treeRoot);
    return collectedString;
  }

  displayInOrder() {
    const outputContent = this._traverseAndCollect('inorder');
    console.log(outputContent);
  }

  displayPreOrder() {
    const outputContent = this._traverseAndCollect('preorder');
    console.log(outputContent);
  }

  displayAll() {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

(function processInput(){
  const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
  const inputLines = rawInputData.trim().split('\n');

  const numCommands = Number(inputLines.shift());

  const binarySearchTree = new TreeStructure();

  for (let i = 0; i < inputLines.length; i++) {
    const commandLine = inputLines[i];
    const firstChar = commandLine.charAt(0);

    switch(firstChar) {
      case 'i':
        const parts = commandLine.split(' ');
        const valueToInsert = Number(parts[1]);
        binarySearchTree.addNode(valueToInsert);
        break;
      default:
        binarySearchTree.displayAll();
    }
  }
})();
