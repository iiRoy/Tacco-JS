class TreeStructure {
  constructor(nodeCount) {
    this.elements = [];
    for (let idx = 0; idx < nodeCount; ++idx) {
      this.elements[idx] = {
        nodeId: -1,
        parentRef: -1,
        leftRef: -1,
        rightRef: -1
      };
    }
  }

  get mainRoot() {
    return this.elements.find(currNode => currNode.parentRef === -1);
  }

  insertNodeData(nodeIdentifier, leftChildIdentifier, rightChildIdentifier) {
    let currentNodeRef = this.elements[nodeIdentifier];
    [currentNodeRef.nodeId, currentNodeRef.leftRef, currentNodeRef.rightRef] = [nodeIdentifier, leftChildIdentifier, rightChildIdentifier];
    if (leftChildIdentifier !== -1) {
      this.locateNode(leftChildIdentifier).parentRef = nodeIdentifier;
    }
    if (rightChildIdentifier !== -1) {
      this.locateNode(rightChildIdentifier).parentRef = nodeIdentifier;
    }
  }

  locateNode(searchIdentifier) {
    return this.elements[searchIdentifier] || {};
  }

  traversePreorder(currentIdentifier = this.mainRoot.nodeId) {
    if (currentIdentifier === -1) {
      return;
    }
    let nodeReference = this.locateNode(currentIdentifier);
    process.stdout.write(` ${currentIdentifier}`);
    this.traversePreorder(nodeReference.leftRef);
    this.traversePreorder(nodeReference.rightRef);
  }

  traverseInorder(currentIdentifier = this.mainRoot.nodeId) {
    if (currentIdentifier === -1) {
      return;
    }
    let nodeReference = this.locateNode(currentIdentifier);
    this.traverseInorder(nodeReference.leftRef);
    process.stdout.write(` ${currentIdentifier}`);
    this.traverseInorder(nodeReference.rightRef);
  }

  traversePostorder(currentIdentifier = this.mainRoot.nodeId) {
    if (currentIdentifier === -1) {
      return;
    }
    let nodeReference = this.locateNode(currentIdentifier);
    this.traversePostorder(nodeReference.leftRef);
    this.traversePostorder(nodeReference.rightRef);
    process.stdout.write(` ${currentIdentifier}`);
  }
}

(function executeTreeOperations() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalNodes = Number(inputLines.shift());
  let myTree = new TreeStructure(totalNodes);
  inputLines.map(lineStr => lineStr.split(' ').map(Number)).forEach(parsedLine => myTree.insertNodeData(...parsedLine));
  console.log('Preorder');
  myTree.traversePreorder();
  console.log('\nInorder');
  myTree.traverseInorder();
  console.log('\nPostorder');
  myTree.traversePostorder();
  console.log();
})();
