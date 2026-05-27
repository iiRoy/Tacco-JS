class NodeCollection {
  // Initializes a new collection of tree nodes.
  constructor(nodeCount) {
    this.nodeRecords = []; // Stores individual node data
    for (let idx = 0; idx < nodeCount; idx++) {
      this.nodeRecords[idx] = {
        nodeIdentifier: idx + 1,
        parentIdentifier: -1,
        leftChildIdentifier: -1,
        rightChildIdentifier: -1
      };
    }
  }

  // Retrieves the root node of the tree.
  get root() {
    return this.nodeRecords.find(currentRecord => currentRecord.parentIdentifier === -1);
  }

  // Locates a node by its unique identifier.
  find(targetIdentifier) {
    // Node IDs are 1-based, array indices are 0-based.
    return this.nodeRecords[targetIdentifier - 1] || {};
  }

  // Performs a postorder traversal and returns the sequence of node identifiers.
  getPostorderTraversal() {
    let resultList = []; // Accumulates node identifiers in postorder
    const performPostorder = (currentIdentifier) => {
      // Base case: if identifier is invalid, stop recursion.
      if (currentIdentifier === -1) return;

      let currentNode = this.find(currentIdentifier); // Get the current node's data
      performPostorder(currentNode.leftChildIdentifier); // Traverse left subtree
      performPostorder(currentNode.rightChildIdentifier); // Traverse right subtree
      resultList.push(currentIdentifier); // Add current node after children
    };
    performPostorder(this.root.nodeIdentifier); // Start traversal from the root
    return resultList;
  }
}

(function executeMainLogic() {
  // Read input from standard input
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Parse the number of nodes
  const totalNodes = Number(inputLines.shift());

  // Parse preorder and inorder traversal sequences
  const preTraversal = inputLines.shift().split(' ').map(Number);
  const inTraversal = inputLines.shift().split(' ').map(Number);

  // Build the binary tree structure
  let constructedTree = buildTreeStructure(preTraversal, inTraversal);

  // Output the postorder traversal sequence
  console.log(constructedTree.getPostorderTraversal().join(' '));
})();

// Function to construct a binary tree from its preorder and inorder traversals
function buildTreeStructure(preSequence, inSequence) {
  let newTree = new NodeCollection(preSequence.length); // Initialize tree with given number of nodes

  // Recursive helper function to build the tree
  const recursiveBuild = (currentPre, currentIn) => {
    let rootIdentifier = currentPre[0]; // The first element in preorder is always the root of the current subtree
    let rootIndex = currentIn.indexOf(rootIdentifier); // Find the root in the inorder sequence

    // If the root is not found in the inorder sequence, it's an invalid subtree or base case
    if (rootIndex === -1) return;

    // If there's a left subtree
    if (rootIndex > 0) {
      // The left child is the second element in the current preorder sequence
      newTree.find(rootIdentifier).leftChildIdentifier = currentPre[1];
      // Set the parent of the left child
      newTree.find(currentPre[1]).parentIdentifier = rootIdentifier;
      // Recursively build the left subtree
      recursiveBuild(currentPre.slice(1, rootIndex + 1), currentIn.slice(0, rootIndex));
    }

    // If there's a right subtree
    if (rootIndex < currentIn.length - 1) {
      // The right child is found in preorder after all left subtree elements
      newTree.find(rootIdentifier).rightChildIdentifier = currentPre[rootIndex + 1];
      // Set the parent of the right child
      newTree.find(currentPre[rootIndex + 1]).parentIdentifier = rootIdentifier;
      // Recursively build the right subtree
      recursiveBuild(currentPre.slice(rootIndex + 1), currentIn.slice(rootIndex + 1));
    }
  };

  recursiveBuild(preSequence, inSequence); // Start the recursive tree building process
  return newTree; // Return the fully constructed tree
}
