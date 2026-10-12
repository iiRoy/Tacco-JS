function makeNode(val, leftChild = null, rightChild = null) {
  return {
    val: val,
    leftChild: leftChild,
    rightChild: rightChild,
  };
}

class TreeStructure {
  constructor() {
    this.topNode = null;
  }

  static get NodeCreator() { return makeNode; }

  addValue(value) {
    this.topNode = TreeStructure.NodeCreator(value);

    this.addValue = (newValue) => {
      const placeNodeRecursively = (currentNode, itemValue) => {
        if (currentNode === null) {
          return TreeStructure.NodeCreator(itemValue);
        }

        if (itemValue < currentNode.val) {
          currentNode.leftChild = placeNodeRecursively(currentNode.leftChild, itemValue);
        } else {
          currentNode.rightChild = placeNodeRecursively(currentNode.rightChild, itemValue);
        }
        return currentNode;
      };

      this.topNode = placeNodeRecursively(this.topNode, newValue);
    };
  }

  displayInOrder() {
    const collectedValues = [];
    const nodeStack = [];
    let currentPointer = this.topNode;

    while (currentPointer !== null || nodeStack.length > 0) {
      while (currentPointer !== null) {
        nodeStack.push(currentPointer);
        currentPointer = currentPointer.leftChild;
      }
      currentPointer = nodeStack.pop();
      collectedValues.push(currentPointer.val);
      currentPointer = currentPointer.rightChild;
    }
    console.log(collectedValues.map(v => ` ${v}`).join(''));
  }

  displayPreOrder() {
    const collectedValues = [];
    if (this.topNode === null) {
      console.log('');
      return;
    }

    const nodeStack = [this.topNode];

    while (nodeStack.length > 0) {
      let currentPointer = nodeStack.pop();
      collectedValues.push(currentPointer.val);

      if (currentPointer.rightChild !== null) {
        nodeStack.push(currentPointer.rightChild);
      }
      if (currentPointer.leftChild !== null) {
        nodeStack.push(currentPointer.leftChild);
      }
    }
    console.log(collectedValues.map(v => ` ${v}`).join(''));
  }

  showAll() {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

(function processInput() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalCommands = Number(inputLines.shift());

  const treeInstance = new TreeStructure();

  const commandHandlers = {
    'i': (value) => treeInstance.addValue(Number(value)),
    'p': () => treeInstance.showAll(),
  };

  for (const line of inputLines) {
    const parts = line.split(' ');
    const commandType = parts[0];
    const commandValue = parts[1];

    if (commandHandlers[commandType]) {
      commandHandlers[commandType](commandValue);
    }
  }
})();
