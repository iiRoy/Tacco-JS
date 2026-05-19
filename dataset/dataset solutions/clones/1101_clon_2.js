/*
 * Configuration settings for input/output operations.
 * This object defines the source of input and the newline character to expect.
 */
const appConfig = {
  input: '/dev/stdin', // Specifies the standard input stream for Linux environments.
  newline: '\n'        // Defines the newline character for parsing input lines.
};

/**
 * Represents a Binary Search Tree data structure.
 * Manages nodes with keys and provides methods for insertion and lookup.
 */
function DataStructure() {
  this.topNode = null; // The root node of the tree, initially null.
  this.valuePresence = {}; // An object to quickly check if a key exists in the tree.
}

/**
 * Inserts a new value into the Binary Search Tree.
 * @param {number} itemValue - The numeric value to be inserted into the tree.
 */
DataStructure.prototype.insert = function (itemValue) {
  let newNode, parentNode, currentNode;

  // Mark the value as present in the tree for quick lookups.
  this.valuePresence[itemValue] = null;

  // Create a new node object with the given value and null pointers.
  newNode = {
    leftChild: null,
    rightChild: null,
    nodeKey: itemValue,
    parentNodeRef: null
  };

  parentNode = null; // Will track the parent of the current node.
  currentNode = this.topNode; // Start traversal from the root.

  // Traverse the tree to find the correct insertion point.
  while (currentNode !== null) {
    parentNode = currentNode; // Keep track of the current node as a potential parent.
    if (newNode.nodeKey < currentNode.nodeKey) {
      currentNode = currentNode.leftChild; // Move to the left child if new key is smaller.
    } else {
      currentNode = currentNode.rightChild; // Move to the right child if new key is larger or equal.
    }
  }

  newNode.parentNodeRef = parentNode; // Set the parent of the new node.

  // Insert the new node into the tree.
  if (parentNode === null) {
    this.topNode = newNode; // If parent is null, tree was empty, new node becomes root.
  } else if (newNode.nodeKey < parentNode.nodeKey) {
    parentNode.leftChild = newNode; // Insert as left child.
  } else {
    parentNode.rightChild = newNode; // Insert as right child.
  }
};

/**
 * Checks if a given value exists in the Binary Search Tree.
 * @param {number} searchValue - The value to search for.
 * @returns {boolean} - True if the value is found, false otherwise.
 */
DataStructure.prototype.find = function (searchValue) {
  // Utilizes the `valuePresence` map for O(1) average time complexity lookup.
  return (this.valuePresence.hasOwnProperty(searchValue));
};

/**
 * Prints a visual representation of the tree structure to the console.
 * This method is commented out in the original usage, but its logic is cloned.
 */
DataStructure.prototype.printTree = function () {
  /**
   * Recursive helper function to print nodes with indentation.
   * @param {object} currentBranch - The current node to print.
   * @param {number} indentationLevel - The current depth for indentation.
   */
  function displayNode(currentBranch, indentationLevel) {
    let prefixString = '';
    let counter;

    // Generate indentation string.
    for (counter = 0; counter < indentationLevel; counter++) {
      prefixString = prefixString + '  ';
    }

    // If the node is null, print NIL.
    if (currentBranch === null) {
      console.log(prefixString + 'NIL');
      return;
    }

    // Print the node's key.
    console.log(prefixString + currentBranch.nodeKey);

    // Recursively print left and right children.
    displayNode(currentBranch.leftChild, indentationLevel + 1);
    displayNode(currentBranch.rightChild, indentationLevel + 1);
  }

  // Start printing from the root with initial depth 0.
  displayNode(this.topNode, 0);
};

/**
 * Prints the in-order and pre-order traversals of the tree to the console.
 * This method is commented out in the original usage, but its logic is cloned.
 */
DataStructure.prototype.print = function () {
  /**
   * Performs an in-order traversal of the tree.
   * @param {object} currentElement - The current node in traversal.
   * @returns {Array<number>} - An array of node keys in in-order sequence.
   */
  function traverseInOrder(currentElement) {
    let collectedValues = [];
    if (currentElement === null) {
      return collectedValues;
    }
    collectedValues = collectedValues.concat(traverseInOrder(currentElement.leftChild));
    collectedValues.push(currentElement.nodeKey);
    collectedValues = collectedValues.concat(traverseInOrder(currentElement.rightChild));
    return collectedValues;
  }

  /**
   * Performs a pre-order traversal of the tree.
   * @param {object} branch - The current node in traversal.
   * @returns {Array<number>} - An array of node keys in pre-order sequence.
   */
  function traversePreOrder(branch) {
    let collectedValues = [];
    if (branch === null) {
      return collectedValues;
    }
    collectedValues.push(branch.nodeKey);
    collectedValues = collectedValues.concat(traversePreOrder(branch.leftChild));
    collectedValues = collectedValues.concat(traversePreOrder(branch.rightChild));
    return collectedValues;
  }

  // Log the in-order traversal result.
  console.log(' ' + traverseInOrder(this.topNode).join(' '));
  // Log the pre-order traversal result.
  console.log(' ' + traversePreOrder(this.topNode).join(' '));
};

// Set up input stream and readline interface.
const inputStream = require('fs').createReadStream(appConfig.input, { encoding: 'ascii' });
const lineReader = require('readline').createInterface({
  input: inputStream,
  output: process.stdout
});

// Create a new instance of our data structure.
const bstInstance = new DataStructure();

// Event listener for each line read from the input.
lineReader.on('line', function (inputLine) {
  let commandTokens;
  // Split the input line into command and argument parts.
  commandTokens = inputLine.split(' ');

  // Process commands based on the first token.
  if (commandTokens[0] === 'insert') {
    // Parse the argument as an integer and insert it into the tree.
    bstInstance.insert(parseInt(commandTokens[1], 10));
  } else if (commandTokens[0] === 'find') {
    // Parse the argument and check if it exists in the tree, then print 'yes' or 'no'.
    console.log(bstInstance.find(parseInt(commandTokens[1], 10)) ? 'yes' : 'no');
  } else if (commandTokens[0] === 'print') {
    // These print methods are commented out in the original, so they remain so.
    //bstInstance.printTree();
    //bstInstance.print();
  }
});
