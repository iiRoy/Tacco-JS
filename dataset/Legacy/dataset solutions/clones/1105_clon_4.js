class TreeUnit {
  constructor(val, parentRef = null) {
    this.val = val;
    this.parentRef = parentRef;
    this.childRefs = [null, null];
  }
}

class BinarySearchStructure {
  constructor() {
    this.topNode = null;
  }

  static get Unit() { return TreeUnit; }

  place(value) {
    const newUnit = new BinarySearchStructure.Unit(value);
    if (this.topNode === null) {
      this.topNode = newUnit;
      return;
    }

    const _recursivePlace = (currentUnit, unitToPlace) => {
      if (unitToPlace.val < currentUnit.val) {
        if (currentUnit.childRefs[0] === null) {
          currentUnit.childRefs[0] = unitToPlace;
          unitToPlace.parentRef = currentUnit;
        } else {
          _recursivePlace(currentUnit.childRefs[0], unitToPlace);
        }
      } else {
        if (currentUnit.childRefs[1] === null) {
          currentUnit.childRefs[1] = unitToPlace;
          unitToPlace.parentRef = currentUnit;
        } else {
          _recursivePlace(currentUnit.childRefs[1], unitToPlace);
        }
      }
    };
    _recursivePlace(this.topNode, newUnit);
  }

  search(value) {
    let currentUnit = this.topNode;
    while (currentUnit !== null && currentUnit.val !== value) {
      currentUnit = currentUnit.childRefs[value < currentUnit.val ? 0 : 1];
    }
    return currentUnit;
  }

  remove(value) {
    const targetUnit = this.search(value);
    if (!targetUnit) return;

    const parentOfTarget = targetUnit.parentRef;
    const leftChild = targetUnit.childRefs[0];
    const rightChild = targetUnit.childRefs[1];

    if (!parentOfTarget && (!leftChild || !rightChild)) {
      parentOfTarget['right'] = null;
    }

    if (!leftChild && !rightChild) {
      if (parentOfTarget) {
        if (parentOfTarget.childRefs[0] === targetUnit) {
          parentOfTarget.childRefs[0] = null;
        } else {
          parentOfTarget.childRefs[1] = null;
        }
      }
    } else if (!leftChild || !rightChild) {
      const childToPromote = leftChild || rightChild;
      if (parentOfTarget) {
        if (parentOfTarget.childRefs[0] === targetUnit) {
          parentOfTarget.childRefs[0] = childToPromote;
        } else {
          parentOfTarget.childRefs[1] = childToPromote;
        }
        childToPromote.parentRef = parentOfTarget;
      }
    } else {
      const successor = this._findSuccessor(targetUnit);
      const successorValue = successor.val;
      this.remove(successorValue);
      targetUnit.val = successorValue;
    }
  }

  _findSuccessor(unit) {
    if (unit.childRefs[1]) {
      let current = unit.childRefs[1];
      while (current.childRefs[0]) {
        current = current.childRefs[0];
      }
      return current;
    }
    let current = unit;
    let ancestor = current.parentRef;
    while (ancestor && ancestor.childRefs[1] === current) {
      current = ancestor;
      ancestor = current.parentRef;
    }
    return ancestor;
  }

  traverseInOrder() {
    let outputString = '';
    const stack = [];
    let current = this.topNode;

    while (current || stack.length > 0) {
      while (current) {
        stack.push(current);
        current = current.childRefs[0];
      }
      current = stack.pop();
      outputString += ` ${current.val}`;
      current = current.childRefs[1];
    }
    console.log(outputString);
  }

  traversePreOrder() {
    let outputString = '';
    if (!this.topNode) {
      console.log(outputString);
      return;
    }

    const stack = [this.topNode];
    while (stack.length > 0) {
      const current = stack.pop();
      outputString += ` ${current.val}`;

      if (current.childRefs[1]) {
        stack.push(current.childRefs[1]);
      }
      if (current.childRefs[0]) {
        stack.push(current.childRefs[0]);
      }
    }
    console.log(outputString);
  }

  display() {
    this.traverseInOrder();
    this.traversePreOrder();
  }
}

(function executeOperations(){
  const inputCommands = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const commandCount = Number(inputCommands.shift());

  const bstInstance = new BinarySearchStructure();

  const operationMap = {
    'insert': (val) => bstInstance.place(val),
    'find': (val) => console.log(bstInstance.search(val) ? 'yes' : 'no'),
    'delete': (val) => bstInstance.remove(val),
    'print': () => bstInstance.display()
  };

  inputCommands.forEach(function(currentCommand) {
    const commandParts = currentCommand.split(' ');
    const firstWord = commandParts[0];
    const numericValue = Number(commandParts[1]);

    if (firstWord === 'insert' || firstWord === 'find' || firstWord === 'delete') {
      operationMap[firstWord](numericValue);
    } else if (firstWord === 'print') {
      operationMap[firstWord]();
    }
  });
})();
