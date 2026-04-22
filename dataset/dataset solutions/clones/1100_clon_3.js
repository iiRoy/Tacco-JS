class TreeNode {
  constructor(elementData, leftSubtree = null, rightSubtree = null) {
    this.data = elementData;
    this.leftRef = leftSubtree;
    this.rightRef = rightSubtree;
  }

  isLeafNode() {
    return this.leftRef === null && this.rightRef === null;
  }
}

class BstManager {
  constructor() {
    this.treeRoot = null;
    this.nodeCount = 0;
    this.creationTimestamp = Date.now();
  }

  static get NodeFactory() {
    return TreeNode;
  }

  addNode(valueToAdd) {
    if (typeof valueToAdd !== 'number' || isNaN(valueToAdd)) {
      return false;
    }

    const freshNode = new BstManager.NodeFactory(valueToAdd);

    if (this.treeRoot === null) {
      this.treeRoot = freshNode;
      this.nodeCount++;
      return true;
    }

    let currentNode = this.treeRoot;
    let parentOfCurrent = null;

    while (currentNode !== null) {
      parentOfCurrent = currentNode;

      if (valueToAdd < currentNode.data) {
        currentNode = currentNode.leftRef;
      } else {
        currentNode = currentNode.rightRef;
      }
    }

    if (valueToAdd < parentOfCurrent.data) {
      parentOfCurrent.leftRef = freshNode;
    } else {
      parentOfCurrent.rightRef = freshNode;
    }

    this.nodeCount++;
    return true;
  }

  getInfixTraversal() {
    const collectedElements = [];

    const _collectInfix = (nodeRef) => {
      if (nodeRef === null) {
        return;
      }
      _collectInfix(nodeRef.leftRef);
      collectedElements.push(nodeRef.data);
      _collectInfix(nodeRef.rightRef);
    };

    _collectInfix(this.treeRoot);
    return collectedElements.join(' ');
  }

  getPrefixTraversal() {
    const collectedElements = [];

    const _collectPrefix = (nodeRef) => {
      if (nodeRef === null) {
        return;
      }
      collectedElements.push(nodeRef.data);
      _collectPrefix(nodeRef.leftRef);
      _collectPrefix(nodeRef.rightRef);
    };

    _collectPrefix(this.treeRoot);
    return collectedElements.join(' ');
  }

  reportTreeStatus() {
    if (this.treeRoot === null) {
      console.log("Tree is empty. No elements to display.");
      return;
    }

    console.log(`In-Order Traversal (Sorted):${this.getInfixTraversal()}`);
    console.log(`Pre-Order Traversal (Root First):${this.getPrefixTraversal()}`);
  }
}

(async function processInputCommands() {
  const fs = require('fs').promises;
  let inputInstructions = [];
  let totalLinesExpected = 0;

  try {
    const fileContent = await fs.readFile('/dev/stdin', 'utf8');
    inputInstructions = fileContent.trim().split('\n');
    totalLinesExpected = Number(inputInstructions.shift());

  } catch (error) {
    console.error(`Error reading input file: ${error.message}`);
    return;
  }

  const myBstInstance = new BstManager();

  for (const lineEntry of inputInstructions) {
    const commandPair = lineEntry.split(' ');
    const operationType = commandPair[0].charAt(0);

    switch (operationType) {
      case 'i':
        const valueToInsert = Number(commandPair[1]);
        if (!isNaN(valueToInsert)) {
          myBstInstance.addNode(valueToInsert);
        } else {
          console.warn(`Skipping invalid insert command: '${lineEntry}'. Value '${commandPair[1]}' is not a number.`);
        }
        break;
      case 'p':
        myBstInstance.reportTreeStatus();
        break;
      default:
        console.warn(`Unknown command detected: '${commandPair[0]}'. Skipping.`);
        break;
    }
  }
})();