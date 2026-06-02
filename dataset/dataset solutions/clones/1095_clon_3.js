class TreeDataStructure {
  constructor(nodeCount) {
    this.nodeCollection = [];
    for (let i = 0; i < nodeCount; i++) {
      this.nodeCollection[i] = {
        identifier: i + 1,
        parentIdentifier: -1,
        leftIdentifier: -1,
        rightIdentifier: -1
      };
    }
  }

  get rootNode() {
    const rootCandidate = this.nodeCollection.find(nodeItem => nodeItem.parentIdentifier === -1);
    return rootCandidate;
  }

  retrieveNode(nodeIdentifierValue) {
    const foundNode = this.nodeCollection[nodeIdentifierValue - 1];
    return foundNode || {};
  }

  getPostorderTraversal() {
    let traversalSequence = [];
    const performRecursivePostorder = (currentIdentifier) => {
      if (currentIdentifier === -1) {
        return;
      }
      const currentNode = this.retrieveNode(currentIdentifier);
      performRecursivePostorder(currentNode.leftIdentifier);
      performRecursivePostorder(currentNode.rightIdentifier);
      traversalSequence.push(currentIdentifier);
    };
    
    const initialRoot = this.rootNode;
    if (initialRoot && initialRoot.identifier !== undefined) {
        performRecursivePostorder(initialRoot.identifier);
    }
    return traversalSequence;
  }
}

(function executeMainProcess(){
  const fileSystem = require('fs');
  const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputLines = rawInput.trim().split('\n');

  const nodeCount = Number(inputLines.shift());
  const preorderSequence = inputLines.shift().split(' ').map(Number);
  const inorderSequence = inputLines.shift().split(' ').map(Number);

  const constructedTree = buildTreeFromTraversals(preorderSequence, inorderSequence);
  const postorderResult = constructedTree.getPostorderTraversal();
  console.log(postorderResult.join(' '));
})();

function buildTreeFromTraversals(preorderArr, inorderArr) {
  const treeSize = preorderArr.length;
  const binaryTreeInstance = new TreeDataStructure(treeSize);

  const establishChildParentRelationship = (parentVal, childVal, isLeftChild) => {
    const parentNodeRef = binaryTreeInstance.retrieveNode(parentVal);
    const childNodeRef = binaryTreeInstance.retrieveNode(childVal);

    if (isLeftChild) {
      parentNodeRef.leftIdentifier = childVal;
    } else {
      parentNodeRef.rightIdentifier = childVal;
    }
    childNodeRef.parentIdentifier = parentVal;
  };

  const recursiveTreeBuilder = (currentPreorderSegment, currentInorderSegment) => {
    if (currentPreorderSegment.length === 0) {
        return;
    }

    const currentRootValue = currentPreorderSegment[0];
    const rootIndexInInorder = currentInorderSegment.indexOf(currentRootValue);

    if (rootIndexInInorder === -1) {
      return;
    }

    const leftSubtreeSize = rootIndexInInorder;
    const rightSubtreeSize = currentInorderSegment.length - 1 - rootIndexInInorder;

    if (leftSubtreeSize > 0) {
      const leftChildValue = currentPreorderSegment[1];
      establishChildParentRelationship(currentRootValue, leftChildValue, true);

      const leftPreorderSlice = currentPreorderSegment.slice(1, leftSubtreeSize + 1);
      const leftInorderSlice = currentInorderSegment.slice(0, rootIndexInInorder);
      recursiveTreeBuilder(leftPreorderSlice, leftInorderSlice);
    }

    if (rightSubtreeSize > 0) {
      const rightChildValue = currentPreorderSegment[leftSubtreeSize + 1];
      establishChildParentRelationship(currentRootValue, rightChildValue, false);

      const rightPreorderSlice = currentPreorderSegment.slice(leftSubtreeSize + 1);
      const rightInorderSlice = currentInorderSegment.slice(rootIndexInInorder + 1);
      recursiveTreeBuilder(rightPreorderSlice, rightInorderSlice);
    }
  };

  recursiveTreeBuilder(preorderArr, inorderArr);
  return binaryTreeInstance;
}
