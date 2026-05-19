class NodeUnit {
  constructor(unitIdentifier) {
    this.unitIdentifier = unitIdentifier;
    this.parentUnit = null;
    this.leftUnit = null;
    this.rightUnit = null;
  }
}

class TreeManager {
  constructor(totalNodeCount) {
    this.unitRegistry = new Map();
    this.primaryRootUnit = null;
  }

  obtainUnit(identifier) {
    if (!this.unitRegistry.has(identifier)) {
      this.unitRegistry.set(identifier, new NodeUnit(identifier));
    }
    return this.unitRegistry.get(identifier);
  }

  establishLink(currentIdentifier, leftChildIdentifier, rightChildIdentifier) {
    const currentUnit = this.obtainUnit(currentIdentifier);

    if (leftChildIdentifier !== -1) {
      const leftUnit = this.obtainUnit(leftChildIdentifier);
      currentUnit.leftUnit = leftUnit;
      leftUnit.parentUnit = currentUnit;
    }

    if (rightChildIdentifier !== -1) {
      const rightUnit = this.obtainUnit(rightChildIdentifier);
      currentUnit.rightUnit = rightUnit;
      rightUnit.parentUnit = currentUnit;
    }
  }

  determinePrimaryRoot() {
    for (const unit of this.unitRegistry.values()) {
      if (unit.parentUnit === null) {
        this.primaryRootUnit = unit;
        return;
      }
    }
  }

  traversePreOrder() {
    if (!this.primaryRootUnit) return;

    const traversalStack = [];
    traversalStack.push(this.primaryRootUnit);

    while (traversalStack.length > 0) {
      const currentUnit = traversalStack.pop();
      process.stdout.write(` ${currentUnit.unitIdentifier}`);

      if (currentUnit.rightUnit) {
        traversalStack.push(currentUnit.rightUnit);
      }
      if (currentUnit.leftUnit) {
        traversalStack.push(currentUnit.leftUnit);
      }
    }
  }

  traverseInOrder() {
    if (!this.primaryRootUnit) return;

    const traversalStack = [];
    let currentUnit = this.primaryRootUnit;

    while (currentUnit !== null || traversalStack.length > 0) {
      while (currentUnit !== null) {
        traversalStack.push(currentUnit);
        currentUnit = currentUnit.leftUnit;
      }

      currentUnit = traversalStack.pop();
      process.stdout.write(` ${currentUnit.unitIdentifier}`);
      currentUnit = currentUnit.rightUnit;
    }
  }

  traversePostOrder() {
    if (!this.primaryRootUnit) return;

    const stackOne = [];
    const stackTwo = [];

    stackOne.push(this.primaryRootUnit);

    while (stackOne.length > 0) {
      const currentUnit = stackOne.pop();
      stackTwo.push(currentUnit);

      if (currentUnit.leftUnit) {
        stackOne.push(currentUnit.leftUnit);
      }
      if (currentUnit.rightUnit) {
        stackOne.push(currentUnit.rightUnit);
      }
    }

    while (stackTwo.length > 0) {
      const currentUnit = stackTwo.pop();
      process.stdout.write(` ${currentUnit.unitIdentifier}`);
    }
  }
}

(function executeMainProcess(){
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const nodeCount = Number(inputLines.shift());
  let treeStructure = new TreeManager(nodeCount);

  inputLines.map(lineContent => lineContent.split(' ').map(Number)).forEach(parsedLine => treeStructure.establishLink(...parsedLine));

  treeStructure.determinePrimaryRoot();

  console.log('Preorder');
  treeStructure.traversePreOrder();
  console.log('\nInorder');
  treeStructure.traverseInOrder();
  console.log('\nPostorder');
  treeStructure.traversePostOrder();
  console.log();
})();
