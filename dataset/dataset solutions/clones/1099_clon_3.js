const applicationSettings = {
  inputSource: process.stdin,
  lineDelimiter: '\n'
};

const fileSystemModule = require('fs');
const readlineModule = require('readline');

function BinarySearchTree() {
  this.treeRootNode = null; // The root node of the binary search tree
}

BinarySearchTree.prototype.addNode = function (elementValue) {
  // Validate that the input value is a valid number
  if (typeof elementValue !== 'number' || isNaN(elementValue)) {
    console.error('Invalid value provided for insertion; a number is expected.');
    return;
  }

  // Create a new node with initial properties
  const newNodeItem = {
    leftChild: null,
    rightChild: null,
    nodeValue: elementValue,
    parentNode: null
  };

  let parentCandidate = null; // Will track the potential parent of the new node
  let traversePtr = this.treeRootNode; // Pointer used to traverse the tree

  // Search for the correct position to insert the new node
  while (traversePtr !== null) {
    parentCandidate = traversePtr; // Update the parent candidate
    if (newNodeItem.nodeValue < traversePtr.nodeValue) {
      traversePtr = traversePtr.leftChild; // Go left if new value is smaller
    } else {
      // Go right if new value is greater or equal (handles duplicates by placing them on the right)
      traversePtr = traversePtr.rightChild;
    }
  }

  newNodeItem.parentNode = parentCandidate; // Set the parent of the new node

  // Place the new node into the tree
  if (parentCandidate === null) {
    this.treeRootNode = newNodeItem; // If tree was empty, new node becomes the root
  } else if (newNodeItem.nodeValue < parentCandidate.nodeValue) {
    parentCandidate.leftChild = newNodeItem; // Insert as left child
  } else {
    parentCandidate.rightChild = newNodeItem; // Insert as right child
  }
};

BinarySearchTree.prototype.renderVisualStructure = function () {
  // Guard clause for an empty tree
  if (this.treeRootNode === null) {
    console.log('The tree structure is empty; nothing to display.');
    return;
  }

  // Recursive helper function for depth-first visual rendering
  const _recursiveRenderNode = (currentTreeNode, currentLevel) => {
    // Create indentation based on the current level
    const displayPrefix = '  '.repeat(currentLevel);

    if (currentTreeNode === null) {
      console.log(`${displayPrefix}[NULL]`); // Represent null children
      return;
    }

    console.log(`${displayPrefix}${currentTreeNode.nodeValue}`); // Display current node's value
    _recursiveRenderNode(currentTreeNode.leftChild, currentLevel + 1); // Render left subtree
    _recursiveRenderNode(currentTreeNode.rightChild, currentLevel + 1); // Render right subtree
  };

  console.log('--- Binary Tree Visual Layout ---');
  _recursiveRenderNode(this.treeRootNode, 0); // Start rendering from the root at level 0
  console.log('---------------------------------');
};

BinarySearchTree.prototype.outputTraversalOrders = function () {
  // Helper for in-order traversal: Left -> Root -> Right (produces sorted output for BST)
  const _performInOrderTraversal = (traversalNode) => {
    if (traversalNode === null) {
      return [];
    }
    return [
      ..._performInOrderTraversal(traversalNode.leftChild),
      traversalNode.nodeValue,
      ..._performInOrderTraversal(traversalNode.rightChild)
    ];
  };

  // Helper for pre-order traversal: Root -> Left -> Right (useful for cloning a tree structure)
  const _performPreOrderTraversal = (traversalNode) => {
    if (traversalNode === null) {
      return [];
    }
    return [
      traversalNode.nodeValue,
      ..._performPreOrderTraversal(traversalNode.leftChild),
      ..._performPreOrderTraversal(traversalNode.rightChild)
    ];
  };

  // Guard clause for an empty tree
  if (this.treeRootNode === null) {
    console.log('No elements available for traversal in the tree.');
    return;
  }

  const inOrderResult = _performInOrderTraversal(this.treeRootNode);
  const preOrderResult = _performPreOrderTraversal(this.treeRootNode);

  // Output the results of the traversals
  console.log(`In-Order Sequence: [ ${inOrderResult.join(' -> ')} ]`);
  console.log(`Pre-Order Sequence: [ ${preOrderResult.join(' -> ')} ]`);
};

// Set up the input stream reader
const fileStreamReader = fileSystemModule.createReadStream(applicationSettings.inputSource, 'utf8');

// Initialize the readline interface to process input line by line
const inputLineInterface = readlineModule.createInterface({
  input: fileStreamReader,
  output: process.stdout // Output stream, optional for pure input processing
});

// Create an instance of our binary search tree
const myBinaryTree = new BinarySearchTree();

// Event listener for each line received from the input
inputLineInterface.on('line', (inputCommandLine) => {
  const commandTokens = inputCommandLine.trim().split(' ');
  const primaryCommand = commandTokens[0];

  // Use a switch statement for robust command handling
  switch (primaryCommand) {
    case 'insert':
      const valueToInsert = Number(commandTokens[1]);
      myBinaryTree.addNode(valueToInsert);
      break;
    case 'print':
      myBinaryTree.outputTraversalOrders(); // Display the tree's elements in different orders
      // myBinaryTree.renderVisualStructure(); // Uncomment to also display the visual tree structure
      break;
    default:
      if (primaryCommand) { // Only warn if a non-empty command was given
        console.warn(`Unknown command encountered: "${primaryCommand}". Skipping.`);
      }
      break;
  }
});

// Event listener for when the input stream has ended
inputLineInterface.on('close', () => {
  console.log('\n--- Input Processing Concluded ---');
  console.log('Final State of the Binary Search Tree:');
  myBinaryTree.outputTraversalOrders();
  // myBinaryTree.renderVisualStructure(); // Uncomment to see the final visual structure
  process.exit(0); // Exit the process cleanly
});