class TreeStructure {
  constructor(nodeCount) {
    this.vertexCollection = [];
    for (let i = 0; i < nodeCount; i++) {
      this.vertexCollection[i] = {
        nodeIdentifier: i + 1,
        ancestorIdentifier: -1,
        leftDescendantIdentifier: -1,
        rightDescendantIdentifier: -1
      };
    }
  }

  get primaryNode() {
    return this.vertexCollection.find(vtx => vtx.ancestorIdentifier === -1);
  }

  locateNode(nodeIdentifier) {
    return this.vertexCollection[nodeIdentifier - 1];
  }

  retrievePostorderTraversal() {
    const traversalResult = [];
    const stackOne = [];
    const stackTwo = [];

    if (this.primaryNode) {
      stackOne.push(this.primaryNode);
    }

    while (stackOne.length > 0) {
      const currentNode = stackOne.pop();
      stackTwo.push(currentNode.nodeIdentifier);

      if (currentNode.leftDescendantIdentifier !== -1) {
        stackOne.push(this.locateNode(currentNode.leftDescendantIdentifier));
      }
      if (currentNode.rightDescendantIdentifier !== -1) {
        stackOne.push(this.locateNode(currentNode.rightDescendantIdentifier));
      }
    }

    while (stackTwo.length > 0) {
      traversalResult.push(stackTwo.pop());
    }

    return traversalResult;
  }
}

function constructTreeFromOrders(prefixSequence, infixSequence) {
  const nodeCount = prefixSequence.length;
  const temporaryVertexCollection = Array.from({
    length: nodeCount
  }, (_, i) => ({
    nodeIdentifier: i + 1,
    ancestorIdentifier: -1,
    leftDescendantIdentifier: -1,
    rightDescendantIdentifier: -1
  }));

  const infixIndexMap = new Map();
  infixSequence.forEach((id, idx) => infixIndexMap.set(id, idx));

  let prefixIndexPointer = 0;

  function buildSubtree(inStart, inEnd) {
    if (inStart > inEnd) {
      return -1;
    }

    const currentRootIdentifier = prefixSequence[prefixIndexPointer];
    prefixIndexPointer++;

    const rootInfixIndex = infixIndexMap.get(currentRootIdentifier);

    const currentRootNode = temporaryVertexCollection[currentRootIdentifier - 1];

    const leftChildIdentifier = buildSubtree(inStart, rootInfixIndex - 1);
    if (leftChildIdentifier !== -1) {
      currentRootNode.leftDescendantIdentifier = leftChildIdentifier;
      temporaryVertexCollection[leftChildIdentifier - 1].ancestorIdentifier = currentRootIdentifier;
    }

    const rightChildIdentifier = buildSubtree(rootInfixIndex + 1, inEnd);
    if (rightChildIdentifier !== -1) {
      currentRootNode.rightDescendantIdentifier = rightChildIdentifier;
      temporaryVertexCollection[rightChildIdentifier - 1].ancestorIdentifier = currentRootIdentifier;
    }

    return currentRootIdentifier;
  }

  buildSubtree(0, nodeCount - 1);

  const constructedTree = new TreeStructure(nodeCount);
  constructedTree.vertexCollection = temporaryVertexCollection;
  return constructedTree;
}

(function executeMain() {
  const fs = require('fs');
  const inputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const nodeCount = Number(inputLines.shift());
  const prefixSequence = inputLines.shift().split(' ').map(Number);
  const infixSequence = inputLines.shift().split(' ').map(Number);

  const constructedTree = constructTreeFromOrders(prefixSequence, infixSequence);
  console.log(constructedTree.retrievePostorderTraversal().join(' '));
})();
