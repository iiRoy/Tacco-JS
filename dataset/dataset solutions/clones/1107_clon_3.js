class TreeNode {
  constructor(dataValue, ancestorNode = null, leftSubChild = null, rightSubChild = null) {
    this.nodeValue = dataValue;
    this.parentNode = ancestorNode;
    this.leftChild = leftSubChild;
    this.rightChild = rightSubChild;
    this.nodeLevel = 0;
    this.uniqueId = Math.random().toString(36).substring(2, 9);
  }

  countChildren() {
    if (!this) return 0;
    let childCount = 0;
    if (this.leftChild !== null) {
      childCount++;
    }
    if (this.rightChild !== null) {
      childCount++;
    }
    return childCount;
  }

  isAnOnlyLeftChild() {
    if (this.parentNode === null) {
      return undefined;
    }
    return this.parentNode.leftChild === this;
  }

  determineChildPosition() {
    if (this.parentNode === null) {
      return null;
    }
    const isLeft = this.isAnOnlyLeftChild();
    return isLeft === true ? 'left' : 'right';
  }

  findInOrderSuccessor() {
    if (!this) return null;

    let searchNode = this;

    if (searchNode.rightChild !== null) {
      searchNode = searchNode.rightChild;
      while (searchNode.leftChild !== null) {
        searchNode = searchNode.leftChild;
      }
      return searchNode;
    }

    let current = searchNode;
    let ancestor = current.parentNode;
    while (ancestor !== null && !current.isAnOnlyLeftChild()) {
      current = ancestor;
      ancestor = ancestor.parentNode;
    }
    return ancestor;
  }
}

class BinarySearchTree {
  constructor() {
    this.treeRoot = null;
    this.nodeCount = 0;
  }

  static getNodeClass() {
    return TreeNode;
  }

  addValue(incomingValue) {
    const newNodeInstance = new BinarySearchTree.getNodeClass(incomingValue);
    if (this.treeRoot === null) {
      this.treeRoot = newNodeInstance;
      this.nodeCount++;
      return;
    }

    let traversalNode = this.treeRoot;
    let parentTracker = null;

    while (traversalNode !== null) {
      parentTracker = traversalNode;
      const isSmaller = incomingValue < traversalNode.nodeValue;
      traversalNode = isSmaller ? traversalNode.leftChild : traversalNode.rightChild;
    }

    newNodeInstance.parentNode = parentTracker;
    if (incomingValue < parentTracker.nodeValue) {
      parentTracker.leftChild = newNodeInstance;
    } else {
      parentTracker.rightChild = newNodeInstance;
    }
    this.nodeCount++;
  }

  locateValue(valueToFind, startNode = this.treeRoot) {
    if (startNode === null) {
      return null;
    }

    let currentNode = startNode;
    let nodesVisited = 0;

    while (currentNode !== null) {
      nodesVisited++;
      if (currentNode.nodeValue === valueToFind) {
        return currentNode;
      } else if (valueToFind < currentNode.nodeValue) {
        currentNode = currentNode.leftChild;
      } else {
        currentNode = currentNode.rightChild;
      }
    }

    return null;
  }

  _removeSpecificNode(targetNode) {
    if (!targetNode) {
      console.warn("Attempted to remove a null or undefined node.");
      return;
    }

    const parentOfTarget = targetNode.parentNode;
    const isTargetRoot = (targetNode === this.treeRoot);
    const childPosition = targetNode.determineChildPosition();

    if (targetNode.countChildren() === 0) {
      if (isTargetRoot) {
        this.treeRoot = null;
      } else {
        parentOfTarget[childPosition === 'left' ? 'leftChild' : 'rightChild'] = null;
      }
    }
    else if (targetNode.countChildren() === 1) {
      const childNode = targetNode.leftChild || targetNode.rightChild;
      if (isTargetRoot) {
        this.treeRoot = childNode;
        childNode.parentNode = null;
      } else {
        parentOfTarget[childPosition === 'left' ? 'leftChild' : 'rightChild'] = childNode;
        childNode.parentNode = parentOfTarget;
      }
    }
    else {
      const successorNode = targetNode.findInOrderSuccessor();
      if (!successorNode) {
          console.error("Error: Two-child node without a successor found.");
          return;
      }

      targetNode.nodeValue = successorNode.nodeValue;
      this._removeSpecificNode(successorNode);
      return;
    }
    this.nodeCount--;
  }

  removeValue(valueToRemove) {
    const nodeFound = this.locateValue(valueToRemove);
    if (nodeFound === null) {
      return false;
    }
    this._removeSpecificNode(nodeFound);
    return true;
  }

  traverseInOrder(separator = ' ') {
    if (this.treeRoot === null) {
      return "[Empty Tree]";
    }
    let resultValues = [];
    const stack = [];
    let current = this.treeRoot;

    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current);
        current = current.leftChild;
      }
      current = stack.pop();
      resultValues.push(current.nodeValue);
      current = current.rightChild;
    }
    return resultValues.join(separator).trim();
  }

  traversePreOrder(separator = ' ') {
    if (this.treeRoot === null) {
      return "[Empty Tree]";
    }
    let outputString = [];
    const recursiveTraversal = (nodeToProcess) => {
      if (nodeToProcess === null) {
        return;
      }
      outputString.push(nodeToProcess.nodeValue);
      recursiveTraversal(nodeToProcess.leftChild);
      recursiveTraversal(nodeToProcess.rightChild);
    };
    recursiveTraversal(this.treeRoot);
    return outputString.join(separator).trim();
  }

  displayTreeContents() {
    console.log("In-order traversal:  " + this.traverseInOrder());
    console.log("Pre-order traversal: " + this.traversePreOrder());
  }

  getSize() {
      return this.nodeCount;
  }
}

(function executeTreeOperations() {
  const fileSystemModule = require('fs');

  const inputCommands = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  const numOperations = Number(inputCommands.shift());

  const binarySearchStructure = new BinarySearchTree();
  let operationCounter = 0;

  inputCommands.forEach(function(currentCommand) {
    operationCounter++;
    if (!currentCommand || currentCommand.trim() === '') {
        console.warn(`Skipping empty command at line ${operationCounter}.`);
        return;
    }

    const commandParts = currentCommand.split(/\s+/);
    const commandType = commandParts[0].charAt(0);
    const commandValue = commandParts.length > 1 ? Number(commandParts[1]) : null;

    switch (commandType) {
      case 'i':
        if (commandValue !== null) {
          binarySearchStructure.addValue(commandValue);
        } else {
            console.error(`Invalid insert command: ${currentCommand}`);
        }
        break;
      case 'f':
        if (commandValue !== null) {
          const found = binarySearchStructure.locateValue(commandValue);
          console.log(found !== null ? 'yes' : 'no');
        } else {
            console.error(`Invalid find command: ${currentCommand}`);
        }
        break;
      case 'd':
        if (commandValue !== null) {
          const deleted = binarySearchStructure.removeValue(commandValue);
        } else {
            console.error(`Invalid delete command: ${currentCommand}`);
        }
        break;
      case 'p':
        binarySearchStructure.displayTreeContents();
        break;
      default:
        console.warn(`Unknown command or missing command type: ${currentCommand}. Defaulting to print.`);
        binarySearchStructure.displayTreeContents();
    }
  });
})();