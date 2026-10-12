class _TreeElement {
  constructor(value, leftChild = null, rightChild = null) {
    this.value = value;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
  }
}

class TreeManager {
  constructor() {
    this.topElement = null;
  }

  static get Element() { return _TreeElement; }

  addValue(itemValue) {
    this.topElement = new TreeManager.Element(itemValue, null, null);
    this.addValue = (itemValue) => {
      let currentElement = this.topElement, parentElement;
      let newElement = new TreeManager.Element(itemValue, null, null);
      while (currentElement !== null) {
        parentElement = currentElement;
        currentElement = currentElement[itemValue < currentElement.value ? 'leftChild' : 'rightChild'];
      }
      parentElement[itemValue < parentElement.value ? 'leftChild' : 'rightChild'] = newElement;
    }
  }

  showInOrder() {
    let inOrderOutput = '';
    const performInOrderTraversal = (nodeToVisit) => {
      if (nodeToVisit === null) return;
      performInOrderTraversal(nodeToVisit.leftChild);
      inOrderOutput += ` ${nodeToVisit.value}`;
      performInOrderTraversal(nodeToVisit.rightChild);
    }
    performInOrderTraversal(this.topElement);
    console.log(inOrderOutput);
  }

  showPreOrder() {
    let preOrderOutput = '';
    const performPreOrderTraversal = (nodeToVisit) => {
      if (nodeToVisit === null) return;
      preOrderOutput += ` ${nodeToVisit.value}`;
      performPreOrderTraversal(nodeToVisit.leftChild);
      performPreOrderTraversal(nodeToVisit.rightChild);
    }
    performPreOrderTraversal(this.topElement);
    console.log(preOrderOutput);
  }

  displayAll() {
    this.showInOrder();
    this.showPreOrder();
  }
}

(function executeProgram(){
  const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const lineCount = Number(inputDataLines.shift());

  const managedTree = new TreeManager();
  inputDataLines.map((singleLine) => singleLine.split(' ')).forEach(function(commandDetails) {
    switch(commandDetails[0].charAt(0)) {
    case 'i': managedTree.addValue(Number(commandDetails[1])); break;
    default: managedTree.displayAll();
    }
  });
})();
