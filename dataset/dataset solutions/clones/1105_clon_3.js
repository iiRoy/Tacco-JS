class TreeNode {
  constructor(value, parentNode = null, leftChild = null, rightChild = null) {
    this.value = value;
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
    const parentRef = this.parentNode;
    if (parentRef === null) {
      return null;
    }
    return parentRef.leftChild === this;
  }

  getChildPosition() {
    const isLeft = this.isNodeLeftChild();
    return isLeft ? 'leftChild' : 'rightChild';
  }

  findInorderSuccessor() {
    let successorCandidate;
    if (this.rightChild !== null) {
      successorCandidate = this.rightChild;
      while (successorCandidate.leftChild !== null) {
        successorCandidate = successorCandidate.leftChild;
      }
    } else {
      // The original code's `while (!n.isLeftChild && n.parent != null)`
      // `n.isLeftChild` is a method, so `!n.isLeftChild` evaluates to `!function_object`, which is `false`.
      // The loop condition `false && n.parent != null` is always `false`.
      // Thus, the loop never executes. It effectively returns `n.parent`.
      successorCandidate = this.parentNode;
    }
    return successorCandidate;
  }
}

class BinarySearchTree {
  constructor() {
    this.treeRoot = null;
  }

  static get Node() { return TreeNode; }

  addNode(newValue) {
    const newNodeInstance = new BinarySearchTree.Node(newValue);

    if (this.treeRoot === null) {
      this.treeRoot = newNodeInstance;
      return;
    }

    let currentNodeWalker = this.treeRoot;
    let parentOfCurrentNode = null;

    while (currentNodeWalker !== null) {
      parentOfCurrentNode = currentNodeWalker;
      if (newValue < currentNodeWalker.value) {
        currentNodeWalker = currentNodeWalker.leftChild;
      } else {
        currentNodeWalker = currentNodeWalker.rightChild;
      }
    }

    newNodeInstance.parentNode = parentOfCurrentNode;

    if (newValue < parentOfCurrentNode.value) {
      parentOfCurrentNode.leftChild = newNodeInstance;
    } else {
      parentOfCurrentNode.rightChild = newNodeInstance;
    }
  }

  searchNode(targetValue, currentSearchNode = this.treeRoot) {
    const recursiveSearch = (node, value) => {
      if (node === null || node.value === value) {
        return node;
      }

      if (value < node.value) {
        return recursiveSearch(node.leftChild, value);
      } else {
        return recursiveSearch(node.rightChild, value);
      }
    };
    return recursiveSearch(currentSearchNode, targetValue);
  }

  _deleteNodeWithZeroChildren(nodeToDelete) {
    const parent = nodeToDelete.parentNode;
    const childPosition = nodeToDelete.getChildPosition();
    parent[childPosition] = null;
  }

  _deleteNodeWithOneChild(nodeToDelete) {
    const parent = nodeToDelete.parentNode;
    const child = nodeToDelete.leftChild || nodeToDelete.rightChild;
    const childPosition = nodeToDelete.getChildPosition();
    parent[childPosition] = child;
    child.parentNode = parent;
  }

  removeNode(valueToRemove) {
    const targetNode = this.searchNode(valueToRemove);
    if (targetNode === null) {
      return;
    }

    const childrenCount = targetNode.countChildren();

    if (childrenCount === 0) {
      if (targetNode === this.treeRoot) {
        // Replicate original error for deleting root with 0 children.
        // Original code would attempt `null['right'] = null;` which throws TypeError.
        const simulatedPosition = targetNode.getChildPosition();
        targetNode.parentNode[simulatedPosition] = null;
      } else {
        this._deleteNodeWithZeroChildren(targetNode);
      }
    } else if (childrenCount === 1) {
      if (targetNode === this.treeRoot) {
        // Replicate original error for deleting root with 1 child.
        // Original code would attempt `null['right'] = child;` which throws TypeError.
        const simulatedPosition = targetNode.getChildPosition();
        targetNode.parentNode[simulatedPosition] = targetNode.leftChild || targetNode.rightChild;
      } else {
        this._deleteNodeWithOneChild(targetNode);
      }
    } else { // childrenCount === 2
      const inorderSuccessor = targetNode.findInorderSuccessor();
      const successorValue = inorderSuccessor.value;
      this.removeNode(successorValue);
      targetNode.value = successorValue;
    }
  }

  _collectTraversalString(node, orderType) {
    let currentTraversalString = '';
    const recursiveCollector = (currentNode) => {
      if (currentNode === null) return;

      if (orderType === 'preorder') {
        currentTraversalString += ` ${currentNode.value}`;
      }
      recursiveCollector(currentNode.leftChild);
      if (orderType === 'inorder') {
        currentTraversalString += ` ${currentNode.value}`;
      }
      recursiveCollector(currentNode.rightChild);
    };
    recursiveCollector(node);
    return currentTraversalString;
  }

  traverseInorder() {
    const outputString = this._collectTraversalString(this.treeRoot, 'inorder');
    console.log(outputString);
  }

  traversePreorder() {
    const outputString = this._collectTraversalString(this.treeRoot, 'preorder');
    console.log(outputString);
  }

  displayTree() {
    this.traverseInorder();
    this.traversePreorder();
  }
}

(function executeMainLogic() {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';
  const fileContents = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  const inputLines = fileContents.trim().split('\n');

  const totalOperations = Number(inputLines.shift());

  const binarySearchTreeInstance = new BinarySearchTree();

  inputLines.forEach(function(commandLine) {
    const commandIdentifier = commandLine.charAt(0);
    let parsedCommandValue;

    const extractNumericValue = (cmdString) => {
      const parts = cmdString.split(' ');
      if (parts.length > 1) {
        return Number(parts[1]);
      }
      return null;
    };

    if (commandIdentifier === 'i') {
      parsedCommandValue = extractNumericValue(commandLine);
      binarySearchTreeInstance.addNode(parsedCommandValue);
    } else if (commandIdentifier === 'f') {
      parsedCommandValue = extractNumericValue(commandLine);
      const searchResultNode = binarySearchTreeInstance.searchNode(parsedCommandValue);
      console.log(searchResultNode ? 'yes' : 'no');
    } else if (commandIdentifier === 'd') {
      parsedCommandValue = extractNumericValue(commandLine);
      binarySearchTreeInstance.removeNode(parsedCommandValue);
    } else if (commandIdentifier === 'p') {
      binarySearchTreeInstance.displayTree();
    }
  });
})();
