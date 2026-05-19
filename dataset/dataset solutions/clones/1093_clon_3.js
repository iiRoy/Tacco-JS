class TreeStructure {
  constructor(nodeCount) {
    this.nodeList = Array.from({ length: nodeCount }, (_, idx) => ({
      nodeIdentifier: idx + 1,
      parentIdentifier: -1,
      leftNodeIdentifier: -1,
      rightNodeIdentifier: -1
    }));
  }

  get treeRoot() {
    return this.nodeList.find(nodeItem => nodeItem.parentIdentifier === -1);
  }

  retrieveNode(nodeIdentifier) {
    return this.nodeList[nodeIdentifier - 1];
  }

  getTraversalPostorder() {
    if (this.nodeList.length === 0) {
      return [];
    }
    const traversalResult = [];

    const traversePostorder = (currentIdentifier) => {
      if (currentIdentifier === -1) {
        return;
      }
      const currentNode = this.retrieveNode(currentIdentifier);
      traversePostorder(currentNode.leftNodeIdentifier);
      traversePostorder(currentNode.rightNodeIdentifier);
      traversalResult.push(currentIdentifier);
    };
    traversePostorder(this.treeRoot.nodeIdentifier);
    return traversalResult;
  }
}

(function executeMainLogic() {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const trimmedContent = fileContent.trim();
  const inputLines = trimmedContent.split('\n');

  const totalNodes = parseInt(inputLines.shift(), 10);
  const preorderSequence = inputLines.shift().split(' ').map(val => parseInt(val, 10));
  const inorderSequence = inputLines.shift().split(' ').map(val => parseInt(val, 10));

  const constructedTree = buildTreeFromSequences(preorderSequence, inorderSequence);

  const outputSeparator = ' ';
  console.log(constructedTree.getTraversalPostorder().join(outputSeparator));
})();

function buildTreeFromSequences(preorderSequence, inorderSequence) {
  const treeInstance = new TreeStructure(preorderSequence.length);

  const assignChildAndParent = (parentNodeId, childNodeId, isLeftChild) => {
    const parentNode = treeInstance.retrieveNode(parentNodeId);
    const childNode = treeInstance.retrieveNode(childNodeId);
    if (isLeftChild) {
      parentNode.leftNodeIdentifier = childNodeId;
    } else {
      parentNode.rightNodeIdentifier = childNodeId;
    }
    childNode.parentIdentifier = parentNodeId;
  };

  const recursiveTreeBuilder = (currentPreorder, currentInorder) => {
    if (currentPreorder.length === 0 || currentInorder.length === 0) {
      return;
    }

    const rootNodeIdentifier = currentPreorder[0];
    const rootNodeIndex = currentInorder.indexOf(rootNodeIdentifier);

    if (rootNodeIndex > 0) {
      const leftChildId = currentPreorder[1];
      assignChildAndParent(rootNodeIdentifier, leftChildId, true);

      const leftPreorderSlice = currentPreorder.slice(1, rootNodeIndex + 1);
      const leftInorderSlice = currentInorder.slice(0, rootNodeIndex);
      recursiveTreeBuilder(leftPreorderSlice, leftInorderSlice);
    }

    if (rootNodeIndex < currentInorder.length - 1) {
      const rightChildId = currentPreorder[rootNodeIndex + 1];
      assignChildAndParent(rootNodeIdentifier, rightChildId, false);

      const rightPreorderSlice = currentPreorder.slice(rootNodeIndex + 1);
      const rightInorderSlice = currentInorder.slice(rootNodeIndex + 1);
      recursiveTreeBuilder(rightPreorderSlice, rightInorderSlice);
    }
  };
  recursiveTreeBuilder(preorderSequence, inorderSequence);
  return treeInstance;
}
