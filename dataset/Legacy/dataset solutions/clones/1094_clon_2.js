class NodeStructure {
  constructor(nodeCount) {
    this.nodeRecords = [];
    // Initialize an array to hold node objects with default values.
    for (let currentIdx = 0; currentIdx < nodeCount; currentIdx++) {
      this.nodeRecords[currentIdx] = {
        nodeIdentifier: currentIdx + 1,
        parentIdentifier: -1,
        leftNodeIdentifier: -1,
        rightNodeIdentifier: -1
      };
    }
  }

  // Getter to find the primary root node of the tree.
  get mainRoot() {
    return this.nodeRecords.find(aNode => aNode.parentIdentifier === -1);
  }

  // Method to establish parent-child relationships for a given node.
  insertChildren(nodeIdentifier, leftNodeIdentifier, rightNodeIdentifier) {
    let targetNode = this.locateNode(nodeIdentifier);
    // Assign the left and right child identifiers to the target node.
    [targetNode.leftNodeIdentifier, targetNode.rightNodeIdentifier] = [leftNodeIdentifier, rightNodeIdentifier];

    // If a left child exists, update its parent identifier.
    if (leftNodeIdentifier !== -1) {
      this.locateNode(leftNodeIdentifier).parentIdentifier = nodeIdentifier;
    }
    // If a right child exists, update its parent identifier.
    if (rightNodeIdentifier !== -1) {
      this.locateNode(rightNodeIdentifier).parentIdentifier = nodeIdentifier;
    }
  }

  // Locates a node object by its identifier.
  locateNode(nodeIdentifier) {
    return this.nodeRecords[nodeIdentifier - 1];
  }

  // Performs a post-order traversal and returns the sequence of node identifiers.
  retrievePostOrderSequence() {
    let resultSequence = [];
    // Recursive helper function for post-order traversal.
    const traversePostOrder = (currentIdentifier) => {
      if (currentIdentifier === -1) {
        return;
      }
      let currentNode = this.locateNode(currentIdentifier);
      traversePostOrder(currentNode.leftNodeIdentifier);
      traversePostOrder(currentNode.rightNodeIdentifier);
      resultSequence.push(currentIdentifier);
    };
    // Start traversal from the root node's identifier.
    traversePostOrder(this.mainRoot.nodeIdentifier);
    return resultSequence;
  }
}

// Main execution block for the program.
(function executeProgram() {
  // Read input from standard input, trim whitespace, and split into lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  // The first line contains the total number of nodes.
  const totalNodes = Number(inputLines.shift());
  // The second line contains the pre-order traversal sequence.
  const preTraversal = inputLines.shift().split(' ').map(Number);
  // The third line contains the in-order traversal sequence.
  const inTraversal = inputLines.shift().split(' ').map(Number);

  // Construct the binary tree from the given traversals.
  let constructedTree = buildTreeFromTraversals(preTraversal, inTraversal);
  // Get the post-order traversal sequence and print it space-separated.
  console.log(constructedTree.retrievePostOrderSequence().join(' '));
})();

// Function to reconstruct a binary tree given its pre-order and in-order traversals.
function buildTreeFromTraversals(preTraversalArray, inTraversalArray) {
  // Create a new tree structure with the appropriate number of nodes.
  let binaryStructure = new NodeStructure(preTraversalArray.length);
  // Recursive helper function to build the tree.
  const recursiveBuilder = (preArr, inArr) => {
    // The first element in pre-order traversal is always the root of the current subtree.
    let currentRootId = preArr[0];
    let indexCounter, rootIndexInInOrder;
    // Find the root's position in the in-order traversal.
    // This loop is effectively equivalent to `rootIndexInInOrder = inArr.indexOf(currentRootId);`
    for (indexCounter = 0; indexCounter < preArr.length; indexCounter++) {
      if ((rootIndexInInOrder = inArr.indexOf(currentRootId)) !== -1) {
        break;
      }
    }
    // Base case: if root not found or single node, return the node or -1 if empty.
    if (rootIndexInInOrder === -1 && inArr.length <= 1) {
      return inArr[0] || -1;
    }

    // Elements to the left of the root in in-order traversal form the left subtree.
    let leftSubtreeIds = inArr.slice(0, rootIndexInInOrder);
    // Elements to the right of the root in in-order traversal form the right subtree.
    let rightSubtreeIds = inArr.slice(rootIndexInInOrder + 1);

    // Add the current root and recursively build its left and right children.
    // Note: The preArr.slice(1) is passed to both recursive calls,
    // which means the recursiveBuilder must correctly filter based on inArr.
    binaryStructure.insertChildren(
      currentRootId,
      recursiveBuilder(preArr.slice(1), leftSubtreeIds),
      recursiveBuilder(preArr.slice(1), rightSubtreeIds)
    );
    // Return the identifier of the current root.
    return currentRootId;
  };
  // Initiate the recursive tree building process.
  recursiveBuilder(preTraversalArray, inTraversalArray);
  return binaryStructure;
}
