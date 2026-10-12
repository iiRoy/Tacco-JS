function createTreeNode(value, leftChild = null, rightChild = null) {
  return {
    val: value,
    lChild: leftChild,
    rChild: rightChild,
  };
}

class TreeStructure {
  constructor() {
    this.root = null;
  }

  static makeNode(value, leftChild = null, rightChild = null) {
    return createTreeNode(value, leftChild, rightChild);
  }

  addValue(val) {
    if (this.root === null) {
      this.root = TreeStructure.makeNode(val);
      return;
    }

    const placeNodeRecursively = (current, newValue) => {
      if (newValue < current.val) {
        if (current.lChild === null) {
          current.lChild = TreeStructure.makeNode(newValue);
        } else {
          placeNodeRecursively(current.lChild, newValue);
        }
      } else {
        if (current.rChild === null) {
          current.rChild = TreeStructure.makeNode(newValue);
        } else {
          placeNodeRecursively(current.rChild, newValue);
        }
      }
    };

    placeNodeRecursively(this.root, val);
  }

  traverseInOrderAndOutput() {
    let collectedValues = [];
    let currentPointer = this.root;
    let traversalStack = [];

    while (currentPointer !== null || traversalStack.length > 0) {
      while (currentPointer !== null) {
        traversalStack.push(currentPointer);
        currentPointer = currentPointer.lChild;
      }
      currentPointer = traversalStack.pop();
      collectedValues.push(currentPointer.val);
      currentPointer = currentPointer.rChild;
    }
    console.log(collectedValues.join(' '));
  }

  traversePreOrderAndOutput() {
    let collectedValues = [];
    if (this.root === null) {
      console.log('');
      return;
    }

    let traversalStack = [];
    traversalStack.push(this.root);

    while (traversalStack.length > 0) {
      let currentPointer = traversalStack.pop();
      collectedValues.push(currentPointer.val);

      if (currentPointer.rChild !== null) {
        traversalStack.push(currentPointer.rChild);
      }
      if (currentPointer.lChild !== null) {
        traversalStack.push(currentPointer.lChild);
      }
    }
    console.log(collectedValues.join(' '));
  }

  displayAllTraversals() {
    this.traverseInOrderAndOutput();
    this.traversePreOrderAndOutput();
  }
}

(function processInput() {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const inputLines = fileContent.trim().split('\n');
  const commandCount = Number(inputLines.shift());

  const treeInstance = new TreeStructure();

  for (const lineEntry of inputLines) {
    const commandTokens = lineEntry.split(' ');
    const primaryCommandChar = commandTokens[0].charAt(0);

    if (primaryCommandChar === 'i') {
      treeInstance.addValue(Number(commandTokens[1]));
    } else if (primaryCommandChar === 'p') {
      treeInstance.displayAllTraversals();
    }
  }
})();
