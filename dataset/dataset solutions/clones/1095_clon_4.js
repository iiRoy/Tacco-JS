class TreeStructure {
  constructor(nodeMapData) {
    this.nodeMap = nodeMapData;
  }

  get rootId() {
    for (const nodeEntry of this.nodeMap.values()) {
      if (nodeEntry.parentId === -1) {
        return nodeEntry.id;
      }
    }
    return -1;
  }

  retrieveNode(identifier) {
    return this.nodeMap.get(identifier);
  }

  getPostorderTraversal() {
    const resultSequence = [];
    const stackForTraversal = [];
    const stackForOutput = [];

    const rootIdentifier = this.rootId;
    if (rootIdentifier === -1) {
      return resultSequence;
    }

    stackForTraversal.push(rootIdentifier);

    while (stackForTraversal.length > 0) {
      const currentIdentifier = stackForTraversal.pop();
      stackForOutput.push(currentIdentifier);
      const currentNode = this.retrieveNode(currentIdentifier);

      if (currentNode.leftId !== -1) {
        stackForTraversal.push(currentNode.leftId);
      }
      if (currentNode.rightId !== -1) {
        stackForTraversal.push(currentNode.rightId);
      }
    }

    while (stackForOutput.length > 0) {
      resultSequence.push(stackForOutput.pop());
    }

    return resultSequence;
  }
}

(function processInputAndOutput(){
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const nodeCount = Number(inputLines.shift());
  const preorderSequence = inputLines.shift().split(' ').map(Number);
  const inorderSequence = inputLines.shift().split(' ').map(Number);

  let constructedNodeMap = constructTreeFromOrders(preorderSequence, inorderSequence);
  let finalTree = new TreeStructure(constructedNodeMap);
  console.log(finalTree.getPostorderTraversal().join(' '));
})();

function constructTreeFromOrders(preorderSequence, inorderSequence) {
  const nodeCollection = new Map();
  const inorderIndexMap = new Map();
  inorderSequence.forEach((value, index) => inorderIndexMap.set(value, index));

  function buildNodeStructure(preStart, preEnd, inStart, inEnd) {
    if (preStart > preEnd || inStart > inEnd) {
      return -1;
    }

    const currentRootId = preorderSequence[preStart];
    const currentRootInorderIdx = inorderIndexMap.get(currentRootId);

    const newNode = {
      id: currentRootId,
      parentId: -1,
      leftId: -1,
      rightId: -1
    };
    nodeCollection.set(currentRootId, newNode);

    const leftSubtreeSize = currentRootInorderIdx - inStart;

    const leftChildId = buildNodeStructure(
      preStart + 1,
      preStart + leftSubtreeSize,
      inStart,
      currentRootInorderIdx - 1
    );
    if (leftChildId !== -1) {
      newNode.leftId = leftChildId;
      nodeCollection.get(leftChildId).parentId = currentRootId;
    }

    const rightChildId = buildNodeStructure(
      preStart + leftSubtreeSize + 1,
      preEnd,
      currentRootInorderIdx + 1,
      inEnd
    );
    if (rightChildId !== -1) {
      newNode.rightId = rightChildId;
      nodeCollection.get(rightChildId).parentId = currentRootId;
    }

    return currentRootId;
  }

  buildNodeStructure(0, preorderSequence.length - 1, 0, inorderSequence.length - 1);

  return nodeCollection;
}
