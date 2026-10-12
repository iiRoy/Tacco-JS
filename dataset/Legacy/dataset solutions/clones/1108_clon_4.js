class _NodeItem {
  constructor(value, upRef = null) {
    this.value = value;
    this.up = upRef;
    this.down = [null, null];
  }
}

class TreeManager {
  constructor() {
    this._topNode = null;
  }

  _countChildren(node) {
    if (!node) return 0;
    return (node.down[0] !== null ? 1 : 0) + (node.down[1] !== null ? 1 : 0);
  }

  _findSuccessor(node) {
    if (!node) return null;

    if (node.down[1] !== null) {
      let current = node.down[1];
      while (current.down[0] !== null) {
        current = current.down[0];
      }
      return current;
    } else {
      let current = node;
      let parent = node.up;
      while (parent !== null && current === parent.down[1]) {
        current = parent;
        parent = parent.up;
      }
      return parent;
    }
  }

  _updateParentChild(parent, oldChild, newChild) {
    if (!parent) {
      this._topNode = newChild;
      if (newChild) newChild.up = null;
      return;
    }
    if (parent.down[0] === oldChild) {
      parent.down[0] = newChild;
    } else if (parent.down[1] === oldChild) {
      parent.down[1] = newChild;
    }
    if (newChild) {
      newChild.up = parent;
    }
  }

  insert(val) {
    if (this._topNode === null) {
      this._topNode = new _NodeItem(val);
      return;
    }

    const _recursiveInsert = (current, parent, valueToInsert) => {
      if (current === null) {
        const newNode = new _NodeItem(valueToInsert, parent);
        if (valueToInsert < parent.value) {
          parent.down[0] = newNode;
        } else {
          parent.down[1] = newNode;
        }
        return;
      }

      if (valueToInsert < current.value) {
        _recursiveInsert(current.down[0], current, valueToInsert);
      } else {
        _recursiveInsert(current.down[1], current, valueToInsert);
      }
    };

    _recursiveInsert(this._topNode, null, val);
  }

  find(val) {
    let current = this._topNode;
    while (current !== null) {
      if (val === current.value) {
        return current;
      } else if (val < current.value) {
        current = current.down[0];
      } else {
        current = current.down[1];
      }
    }
    return null;
  }

  delete(val) {
    const targetNode = this.find(val);
    if (targetNode === null) return;

    const childCount = this._countChildren(targetNode);
    const parentRef = targetNode.up;

    if (childCount === 0) {
      this._updateParentChild(parentRef, targetNode, null);
    } else if (childCount === 1) {
      const childToPromote = targetNode.down[0] || targetNode.down[1];
      this._updateParentChild(parentRef, targetNode, childToPromote);
    } else {
      const successorNode = this._findSuccessor(targetNode);
      targetNode.value = successorNode.value;

      const successorParent = successorNode.up;
      const successorChild = successorNode.down[1];

      this._updateParentChild(successorParent, successorNode, successorChild);
    }
  }

  printInOrder() {
    let outputBuffer = '';
    const traversalStack = [];
    let current = this._topNode;

    while (current !== null || traversalStack.length > 0) {
      while (current !== null) {
        traversalStack.push(current);
        current = current.down[0];
      }
      current = traversalStack.pop();
      outputBuffer += ` ${current.value}`;
      current = current.down[1];
    }
    console.log(outputBuffer);
  }

  printPreOrder() {
    let outputBuffer = '';
    if (this._topNode === null) {
      console.log(outputBuffer);
      return;
    }

    const traversalStack = [this._topNode];
    while (traversalStack.length > 0) {
      let current = traversalStack.pop();
      outputBuffer += ` ${current.value}`;

      if (current.down[1] !== null) {
        traversalStack.push(current.down[1]);
      }
      if (current.down[0] !== null) {
        traversalStack.push(current.down[0]);
      }
    }
    console.log(outputBuffer);
  }

  display() {
    this.printInOrder();
    this.printPreOrder();
  }
}

(function executeOperations() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const operationCount = Number(inputLines.shift());

  const bstManager = new TreeManager();
  inputLines.forEach(function(commandLine) {
    const parts = commandLine.split(' ');
    const operation = parts[0];
    const value = Number(parts[1]);

    switch (operation) {
      case 'insert':
      case 'i':
        bstManager.insert(value);
        break;
      case 'find':
      case 'f':
        console.log(bstManager.find(value) ? 'yes' : 'no');
        break;
      case 'delete':
      case 'd':
        bstManager.delete(value);
        break;
      case 'print':
      case 'p':
        bstManager.display();
        break;
    }
  });
})();
