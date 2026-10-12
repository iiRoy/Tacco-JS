class TreeNode {
  constructor(nodeValue, leftChildRef = null, rightChildRef = null) {
    this.nodeValue = nodeValue;
    this.leftChildRef = leftChildRef;
    this.rightChildRef = rightChildRef;
  }
}

class BinarySearchTree {
  constructor() {
    this.treeRoot = null;
  }

  static get NodeClass() {
    return TreeNode;
  }

  insertValue(itemToInsert) {
    this.treeRoot = new BinarySearchTree.NodeClass(itemToInsert, null, null);
    this.insertValue = (itemToInsert) => {
      let currentTraversalNode = this.treeRoot,
        parentOfCurrentNode;
      let newNodeForInsertion = new BinarySearchTree.NodeClass(itemToInsert, null, null);
      while (currentTraversalNode !== null) {
        parentOfCurrentNode = currentTraversalNode;
        currentTraversalNode = currentTraversalNode[itemToInsert < currentTraversalNode.nodeValue ? 'leftChildRef' : 'rightChildRef'];
      }
      parentOfCurrentNode[itemToInsert < parentOfCurrentNode.nodeValue ? 'leftChildRef' : 'rightChildRef'] = newNodeForInsertion;
    };
  }

  displayInOrderTraversal() {
    let collectedOutputString = '';
    const recursiveInOrderWalk = (currentNodePointer) => {
      if (currentNodePointer === null) return;
      recursiveInOrderWalk(currentNodePointer.leftChildRef);
      collectedOutputString += ` ${currentNodePointer.nodeValue}`;
      recursiveInOrderWalk(currentNodePointer.rightChildRef);
    };
    recursiveInOrderWalk(this.treeRoot);
    console.log(collectedOutputString);
  }

  displayPreOrderTraversal() {
    let preOrderResultString = '';
    const recursivePreOrderWalk = (currentNodePointer) => {
      if (currentNodePointer === null) return;
      preOrderResultString += ` ${currentNodePointer.nodeValue}`;
      recursivePreOrderWalk(currentNodePointer.leftChildRef);
      recursivePreOrderWalk(currentNodePointer.rightChildRef);
    };
    recursivePreOrderWalk(this.treeRoot);
    console.log(preOrderResultString);
  }

  outputAllTraversals() {
    this.displayInOrderTraversal();
    this.displayPreOrderTraversal();
  }
}

(function executeTreeOperations() {
  const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const numCommands = Number(inputDataLines.shift());

  const myBinaryTree = new BinarySearchTree();
  inputDataLines.forEach(function(commandString) {
    switch (commandString.charAt(0)) {
      case 'i':
        myBinaryTree.insertValue(Number(commandString.split(' ')[1]));
        break;
      default:
        myBinaryTree.outputAllTraversals();
    }
  });
})();
