class TreeStructure {
  constructor(totalNodes) {
    const NO_REFERENCE_ID = -1;
    this.nodeCollection = Array.from({ length: totalNodes }, (_, index) => ({
      nodeIdentifier: index + 1,
      parentRef: NO_REFERENCE_ID,
      leftRef: NO_REFERENCE_ID,
      rightRef: NO_REFERENCE_ID
    }));
  }

  get getTreeRoot() {
    const rootNodePredicate = (node) => node.parentRef === -1;
    return this.nodeCollection.find(rootNodePredicate);
  }

  attachChildren(nodeIdentifier, leftChildRef, rightChildRef) {
    const targetNode = this.retrieveNode(nodeIdentifier);
    targetNode.leftRef = leftChildRef;
    targetNode.rightRef = rightChildRef;

    const setParentReference = (childId, parentId) => {
      if (childId !== -1) {
        this.retrieveNode(childId).parentRef = parentId;
      }
    };

    setParentReference(leftChildRef, nodeIdentifier);
    setParentReference(rightChildRef, nodeIdentifier);
  }

  retrieveNode(nodeIdentifier) {
    return this.nodeCollection[nodeIdentifier - 1];
  }

  performPostorderTraversal() {
    const resultSequence = [];
    const traversePostorder = (currentNodeIdentifier) => {
      if (currentNodeIdentifier === -1) {
        return;
      }
      const currentNode = this.retrieveNode(currentNodeIdentifier);
      traversePostorder(currentNode.leftRef);
      traversePostorder(currentNode.rightRef);
      resultSequence.push(currentNodeIdentifier);
    };
    const treeRootNode = this.getTreeRoot;
    traversePostorder(treeRootNode.nodeIdentifier);
    return resultSequence;
  }
}

(function initializeApplication() {
  const fileSystemModule = require('fs');

  const parseInputData = () => {
    const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();
    const inputLines = rawInputContent.split('\n');

    const totalNodeCount = Number(inputLines.shift());
    const preorderSequence = inputLines.shift().split(' ').map(Number);
    const inorderSequence = inputLines.shift().split(' ').map(Number);

    return { totalNodeCount, preorderSequence, inorderSequence };
  };

  const { preorderSequence, inorderSequence } = parseInputData();

  const constructedTree = constructBinaryTreeFromTraversals(preorderSequence, inorderSequence);
  console.log(constructedTree.performPostorderTraversal().join(' '));
})();

function constructBinaryTreeFromTraversals(preorderSequence, inorderSequence) {
  const currentTree = new TreeStructure(preorderSequence.length);

  const buildSubtreeRecursive = (currentPreorder, currentInorder) => {
    if (currentPreorder.length === 0) {
      return -1; // Base case: no nodes in this subtree
    }

    const currentRootIdentifier = currentPreorder[0];
    const rootInorderIndex = currentInorder.indexOf(currentRootIdentifier);

    // Handle specific base case where root is not found in a small inorder sequence
    if (rootInorderIndex === -1 && currentInorder.length <= 1) {
      return currentInorder.length === 1 ? currentInorder[0] : -1;
    }

    const leftSubtreeInorder = currentInorder.slice(0, rootInorderIndex);
    const rightSubtreeInorder = currentInorder.slice(rootInorderIndex + 1);

    const remainingPreorder = currentPreorder.slice(1);
    const leftSubtreePreorder = remainingPreorder.slice(0, leftSubtreeInorder.length);
    const rightSubtreePreorder = remainingPreorder.slice(leftSubtreeInorder.length);

    const leftChildRef = buildSubtreeRecursive(leftSubtreePreorder, leftSubtreeInorder);
    const rightChildRef = buildSubtreeRecursive(rightSubtreePreorder, rightSubtreeInorder);

    currentTree.attachChildren(currentRootIdentifier, leftChildRef, rightChildRef);
    return currentRootIdentifier;
  };

  buildSubtreeRecursive(preorderSequence, inorderSequence);
  return currentTree;
}
