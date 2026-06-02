function createNode(value, parentRef = null, childrenRefs = [null, null]) {
  return {
    value: value,
    parentRef: parentRef,
    childrenRefs: childrenRefs
  };
}

class TreeStructure {
  constructor() {
    this.rootNode = null;
  }

  addValue(val) {
    const freshNode = createNode(val);
    if (!this.rootNode) {
      this.rootNode = freshNode;
      return;
    }
    let current = this.rootNode;
    let trail = null;
    while (current) {
      trail = current;
      if (val < current.value) {
        current = current.childrenRefs[0];
      } else {
        current = current.childrenRefs[1];
      }
    }
    freshNode.parentRef = trail;
    if (val < trail.value) {
      trail.childrenRefs[0] = freshNode;
    } else {
      trail.childrenRefs[1] = freshNode;
    }
  }

  locateValue(targetVal) {
    let current = this.rootNode;
    while (current && current.value !== targetVal) {
      current = (targetVal < current.value) ? current.childrenRefs[0] : current.childrenRefs[1];
    }
    return current;
  }

  _findMinimum(node) {
    while (node.childrenRefs[0]) {
      node = node.childrenRefs[0];
    }
    return node;
  }

  _replaceSubtree(oldNode, newNode) {
    if (!oldNode.parentRef) {
      this.rootNode = newNode;
    } else if (oldNode === oldNode.parentRef.childrenRefs[0]) {
      oldNode.parentRef.childrenRefs[0] = newNode;
    } else {
      oldNode.parentRef.childrenRefs[1] = newNode;
    }
    if (newNode) {
      newNode.parentRef = oldNode.parentRef;
    }
  }

  removeValue(targetVal) {
    const nodeToRemove = this.locateValue(targetVal);
    if (!nodeToRemove) return;

    if (!nodeToRemove.childrenRefs[0]) {
      this._replaceSubtree(nodeToRemove, nodeToRemove.childrenRefs[1]);
    } else if (!nodeToRemove.childrenRefs[1]) {
      this._replaceSubtree(nodeToRemove, nodeToRemove.childrenRefs[0]);
    } else {
      const successorNode = this._findMinimum(nodeToRemove.childrenRefs[1]);
      if (successorNode.parentRef !== nodeToRemove) {
        this._replaceSubtree(successorNode, successorNode.childrenRefs[1]);
        successorNode.childrenRefs[1] = nodeToRemove.childrenRefs[1];
        successorNode.childrenRefs[1].parentRef = successorNode;
      }
      this._replaceSubtree(nodeToRemove, successorNode);
      successorNode.childrenRefs[0] = nodeToRemove.childrenRefs[0];
      successorNode.childrenRefs[0].parentRef = successorNode;
    }
  }

  *_inOrderTraversal(node) {
    if (node) {
      yield* this._inOrderTraversal(node.childrenRefs[0]);
      yield node.value;
      yield* this._inOrderTraversal(node.childrenRefs[1]);
    }
  }

  *_preOrderTraversal(node) {
    if (node) {
      yield node.value;
      yield* this._preOrderTraversal(node.childrenRefs[0]);
      yield* this._preOrderTraversal(node.childrenRefs[1]);
    }
  }

  outputInOrder() {
    const values = Array.from(this._inOrderTraversal(this.rootNode));
    console.log(values.map(v => ` ${v}`).join(''));
  }

  outputPreOrder() {
    const values = Array.from(this._preOrderTraversal(this.rootNode));
    console.log(values.map(v => ` ${v}`).join(''));
  }

  outputAll() {
    this.outputInOrder();
    this.outputPreOrder();
  }
}

(function processInput() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const operationCount = Number(inputLines.shift());

  const dataStructure = new TreeStructure();
  inputLines.forEach(function(instruction) {
    const commandType = instruction[0];
    const numericValue = Number(instruction.substring(instruction.indexOf(' ') + 1));

    switch (commandType) {
      case 'i':
        dataStructure.addValue(numericValue);
        break;
      case 'f':
        console.log(dataStructure.locateValue(numericValue) ? 'yes' : 'no');
        break;
      case 'd':
        dataStructure.removeValue(numericValue);
        break;
      default:
        dataStructure.outputAll();
        break;
    }
  });
})();
