const appSettings = {
  input: '/dev/stdin', // Specifies the input source, typically standard input for Linux
  newline: '\n'        // Defines the newline character for parsing input lines
};

/**
 * Represents a fundamental Binary Search Tree structure.
 * @constructor
 */
function BinarySearchTree() {
  this.topNode = null; // The initial root node of the tree, set to null when empty
}

/**
 * Inserts a new numeric value into the binary search tree, maintaining its properties.
 * @param {number} nodeValue - The numerical value to be added to the tree.
 */
BinarySearchTree.prototype.addNode = function (nodeValue) {
  let newNode, parentNode, currentNode; // Variables for node creation and tree traversal
  
  // Construct a new node object with the given value
  newNode = {
    leftBranch: null,  // Pointer to the left child node
    rightBranch: null, // Pointer to the right child node
    data: nodeValue,   // The actual data stored within this node
    ancestor: null     // Pointer to the parent node in the tree
  };
  
  parentNode = null;      // Initialize the potential parent of the new node
  currentNode = this.topNode; // Begin the search for insertion point from the tree's root
  
  // Traverse the tree to locate the appropriate position for the new node
  while (currentNode !== null) {
    parentNode = currentNode; // Keep track of the last visited non-null node (potential parent)
    if (newNode.data < currentNode.data) {
      currentNode = currentNode.leftBranch; // Move to the left subtree if new data is smaller
    } else {
      currentNode = currentNode.rightBranch; // Move to the right subtree if new data is larger or equal
    }
  }
  
  newNode.ancestor = parentNode; // Assign the found parent to the new node
  
  // Place the new node into the tree
  if (parentNode === null) {
    this.topNode = newNode; // If no parent, the tree was empty, so new node becomes the root
  } else if (newNode.data < parentNode.data) {
    parentNode.leftBranch = newNode; // Attach new node as the left child of its parent
  } else {
    parentNode.rightBranch = newNode; // Attach new node as the right child of its parent
  }
};

/**
 * Provides a structured console output of the tree's hierarchy.
 * This method is available but not actively used in the primary execution flow.
 */
BinarySearchTree.prototype.displayStructure = function() {
  /**
   * Recursive helper function to print nodes with increasing indentation based on depth.
   * @param {object} currentElement - The node currently being processed.
   * @param {number} level - The current depth level of the node in the tree.
   */
  function traverseAndDisplay(currentElement, level) {
    let spacing = ''; // String to build indentation
    let idx;          // Loop index for indentation
    
    // Construct the indentation string
    for (idx = 0; idx < level; idx++) {
      spacing = spacing + '  ';
    }
    
    // If the current node is null, print 'NIL'
    if (currentElement === null) {
      console.log(spacing + 'NIL');
      return;
    }
    
    // Print the data of the current node
    console.log(spacing + currentElement.data);
    
    // Recursively call for the left and right children, increasing the level
    traverseAndDisplay(currentElement.leftBranch, level + 1);
    traverseAndDisplay(currentElement.rightBranch, level + 1);
  }
  
  // Initiate the recursive display starting from the root at level 0
  traverseAndDisplay(this.topNode, 0);
};

/**
 * Outputs the in-order and pre-order traversals of the tree to the console.
 */
BinarySearchTree.prototype.outputTraversal = function() {
  /**
   * Performs an in-order traversal (Left-Root-Right) of the tree.
   * @param {object} currentElement - The node currently being visited.
   * @returns {Array<number>} An array containing the node data in in-order sequence.
   */
  function traverseInOrder(currentElement) {
    let resultArray = []; // Accumulator for the traversal results
    if (currentElement === null) {
      return resultArray; // Base case: an empty node contributes an empty array
    }
    
    // Recursively traverse left, then add current node's data, then recursively traverse right
    resultArray = resultArray.concat(traverseInOrder(currentElement.leftBranch));
    resultArray.push(currentElement.data);
    resultArray = resultArray.concat(traverseInOrder(currentElement.rightBranch));
    return resultArray;
  }
  
  /**
   * Performs a pre-order traversal (Root-Left-Right) of the tree.
   * @param {object} currentElement - The node currently being visited.
   * @returns {Array<number>} An array containing the node data in pre-order sequence.
   */
  function traversePreOrder(currentElement) {
    let resultArray = []; // Accumulator for the traversal results
    if (currentElement === null) {
      return resultArray; // Base case: an empty node contributes an empty array
    }
    
    // Add current node's data, then recursively traverse left, then recursively traverse right
    resultArray.push(currentElement.data);
    resultArray = resultArray.concat(traversePreOrder(currentElement.leftBranch));
    resultArray = resultArray.concat(traversePreOrder(currentElement.rightBranch));
    return resultArray;
  }
  
  // Print the in-order traversal result, joined by spaces
  console.log(' ' + traverseInOrder(this.topNode).join(' '));
  // Print the pre-order traversal result, joined by spaces
  console.log(' ' + traversePreOrder(this.topNode).join(' '));
};

// Initialize a readable stream from the configured input source
const inputStream = require('fs').createReadStream(appSettings.input, 'r');

// Create a readline interface to process input line by line
const lineReader = require('readline').createInterface({
  input: inputStream,
  output: process.stdout // This output stream is for readline's internal use, not for program output
});

// Instantiate a new Binary Search Tree
const myTree = new BinarySearchTree();

// Attach an event listener to handle each line read from the input
lineReader.on('line', function (currentLine) {
  let instructionParts; // Array to store the command and its arguments
  
  // Split the input line into parts based on space delimiter
  instructionParts = currentLine.split(' ');
  
  // Process the command based on the first part of the instruction
  if (instructionParts[0] === 'insert') {
    // If the command is 'insert', parse the second part as an integer and add to the tree
    myTree.addNode(parseInt(instructionParts[1], 10));
  } else if (instructionParts[0] === 'print') {
    // If the command is 'print', execute the tree's traversal output method
    // myTree.displayStructure(); // This line is intentionally commented out, mirroring original behavior
    myTree.outputTraversal();
  }
});
