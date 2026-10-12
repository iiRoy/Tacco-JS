class TreeStructure {
  constructor(nodeCount) {
    this.elements = [];
    // Initialize each node with a unique identifier and default parent/child links.
    for (let currentIdx = 0; currentIdx < nodeCount; currentIdx++) {
      this.elements[currentIdx] = {
        nodeIdentifier: currentIdx + 1,
        parentIdentifier: -1,
        leftIdentifier: -1,
        rightIdentifier: -1
      };
    }
  }

  // Property to get the root node of the tree.
  get baseNode() {
    // The root node is identified by having no parent.
    return this.elements.find(someNode => someNode.parentIdentifier === -1);
  }

  // Method to find a node by its unique identifier.
  locateNode(identifierValue) {
    // Adjust for 0-based array indexing from 1-based node identifiers.
    return this.elements[identifierValue - 1];
  }

  // Generates and returns the post-order traversal sequence of node identifiers.
  retrievePostOrderTraversal() {
    let traversalResult = []; // Stores the sequence of node identifiers.

    // Inner recursive function to perform the post-order traversal.
    const performPostOrder = (currentIdentifier) => {
      // If the current identifier is invalid (-1), terminate this branch.
      if (currentIdentifier === -1) {
        return;
      }
      // Retrieve the node object corresponding to the current identifier.
      let currentNode = this.locateNode(currentIdentifier);
      // Recursively visit the left child.
      performPostOrder(currentNode.leftIdentifier);
      // Recursively visit the right child.
      performPostOrder(currentNode.rightIdentifier);
      // After visiting children, add the current node's identifier to the result.
      traversalResult.push(currentIdentifier);
    };

    // Initiate the post-order traversal starting from the root node.
    performPostOrder(this.baseNode.nodeIdentifier);
    return traversalResult;
  }
}

// Main execution block, encapsulated in an immediately invoked function expression.
(function executeMainLogic() {
  // Read input data from standard input, decode as UTF-8, trim whitespace, and split into lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Extract the total number of nodes from the first line.
  const nodeCount = Number(inputLines.shift());
  // Parse the pre-order traversal sequence from the next line.
  const preSequence = inputLines.shift().split(' ').map(Number);
  // Parse the in-order traversal sequence from the subsequent line.
  const inSequence = inputLines.shift().split(' ').map(Number);

  // Construct the binary tree using the provided pre-order and in-order sequences.
  let constructedTree = constructTreeFromOrders(preSequence, inSequence);
  // Obtain the post-order traversal result and print it to console, with elements separated by spaces.
  console.log(constructedTree.retrievePostOrderTraversal().join(' '));
})();

// Function to build a binary tree given its pre-order and in-order traversals.
function constructTreeFromOrders(preSequence, inSequence) {
  // Create a new tree instance with the appropriate number of nodes.
  let newTreeInstance = new TreeStructure(preSequence.length);

  // Recursive helper function to populate the tree structure.
  const recursiveTreeBuilder = (currentPreOrder, currentInOrder) => {
    // The first element in the current pre-order sequence is always the root of the current subtree.
    let middleNodeId = currentPreOrder[0];
    // Find the index of this root node in the current in-order sequence.
    let middleNodeIndex = currentInOrder.indexOf(middleNodeId);

    // If there are elements to the left of the root in the in-order sequence, a left subtree exists.
    if (middleNodeIndex > 0) {
      // Assign the left child: the next element in the pre-order sequence is the root of the left subtree.
      newTreeInstance.locateNode(middleNodeId).leftIdentifier = currentPreOrder[1];
      // Set the parent of the left child.
      newTreeInstance.locateNode(currentPreOrder[1]).parentIdentifier = middleNodeId;
      // Recursively build the left subtree using corresponding slices of pre-order and in-order.
      recursiveTreeBuilder(currentPreOrder.slice(1, middleNodeIndex + 1), currentInOrder.slice(0, middleNodeIndex));
    }

    // If there are elements to the right of the root in the in-order sequence, a right subtree exists.
    if (middleNodeIndex < currentInOrder.length - 1) {
      // Assign the right child: the element in pre-order at `middleNodeIndex + 1` is the root of the right subtree.
      newTreeInstance.locateNode(middleNodeId).rightIdentifier = currentPreOrder[middleNodeIndex + 1];
      // Set the parent of the right child.
      newTreeInstance.locateNode(currentPreOrder[middleNodeIndex + 1]).parentIdentifier = middleNodeId;
      // Recursively build the right subtree using corresponding slices of pre-order and in-order.
      recursiveTreeBuilder(currentPreOrder.slice(middleNodeIndex + 1), currentInOrder.slice(middleNodeIndex + 1));
    }
  };

  // Start the recursive tree construction process with the initial full sequences.
  recursiveTreeBuilder(preSequence, inSequence);
  return newTreeInstance;
}
