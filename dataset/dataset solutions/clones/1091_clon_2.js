// Function to update the parent-child relationships within the tree structure
function adjustDescendants(childNodeIdentifier, parentNodeIdentifier) {
  // Locate the specific element in the global tree structure using its unique ID
  const currentElement = treeElements.filter(function(item) {
    return item.elementId === childNodeIdentifier;
  })[0];

  // Assign the identified parent to the current element's ancestor property
  currentElement.ancestor = parentNodeIdentifier;

  // Recursively update the left child if it exists (not -1)
  if (currentElement.leftChild !== -1) {
    adjustDescendants(currentElement.leftChild, currentElement.elementId);
  }

  // Recursively update the right child if it exists (not -1)
  if (currentElement.rightChild !== -1) {
    adjustDescendants(currentElement.rightChild, currentElement.elementId);
  }
}

// Performs a pre-order traversal starting from a given node ID
function traversePreOrder(elementId, resultCollection) {
  // Base case: if the element ID is invalid, stop recursion
  if (elementId === -1) {
    return;
  }

  // Find the node object corresponding to the provided ID
  const currentElement = treeElements.filter(function(nodeItem) {
    return nodeItem.elementId === elementId;
  })[0];

  // Add the current element's ID to the collection (visit root)
  resultCollection.push(elementId);

  // Recursively traverse the left subtree
  traversePreOrder(currentElement.leftChild, resultCollection);

  // Recursively traverse the right subtree
  traversePreOrder(currentElement.rightChild, resultCollection);
}

// Executes an in-order traversal of the tree
function traverseInOrder(nodeIdentification, collectedValues) {
  // If the node ID is a sentinel value, terminate this branch
  if (nodeIdentification === -1) {
    return;
  }

  // Retrieve the full node object from the global collection
  const currentItem = treeElements.filter(function(dataUnit) {
    return dataUnit.elementId === nodeIdentification;
  })[0];

  // First, visit the left child
  traverseInOrder(currentItem.leftChild, collectedValues);

  // Then, add the current node's ID to the result list
  collectedValues.push(nodeIdentification);

  // Finally, visit the right child
  traverseInOrder(currentItem.rightChild, collectedValues);
}

// Performs a post-order traversal on the binary tree
function traversePostOrder(uniqueNodeIdentifier, resultList) {
  // Check for the termination condition (invalid node ID)
  if (uniqueNodeIdentifier === -1) {
    return;
  }

  // Get the node object from the main tree array
  const activeNode = treeElements.filter(function(elementUnit) {
    return elementUnit.elementId === uniqueNodeIdentifier;
  })[0];

  // Recursively process the left subtree
  traversePostOrder(activeNode.leftChild, resultList);

  // Recursively process the right subtree
  traversePostOrder(activeNode.rightChild, resultList);

  // Add the current node's identifier after visiting children
  resultList.push(uniqueNodeIdentifier);
}


// Acquire the necessary file system utility module
const fileSystemUtility = require('fs');

// Read raw input data from the standard input stream
const rawData = fileSystemUtility.readFileSync('/std/input_stream', 'unicodeEncoding');

// Process the raw data: remove leading/trailing whitespace and split into individual lines
const inputLines = rawData.trim().split('\n');

// Extract the total count of elements from the first line and convert to a number
const totalElementsCount = +inputLines.shift();

// Initialize an empty array to store the tree's nodes/elements
let treeElements = [];

// Loop through each line of input to parse and construct tree nodes
for (let loopIndex = 0; loopIndex < totalElementsCount; loopIndex++) {
  // Split the current input line by space to get element properties
  const elementParts = inputLines.shift().split(' ');

  // Parse the element ID, left child ID, and right child ID
  const currentElementId = +elementParts[0];
  const leftSubChild = +elementParts[1];
  const rightSubChild = +elementParts[2];

  // Add the newly created node object to the tree elements array
  treeElements.push({
    elementId: currentElementId,
    leftChild: leftSubChild,
    rightChild: rightSubChild,
    ancestor: -1
  });
}

// Sort the tree elements array based on their unique element IDs
treeElements.sort(function(firstElem, secondElem) {
  return firstElem.elementId - secondElem.elementId;
});

// Iterate over each node to establish initial parent-child connections
treeElements.forEach(function(currentNode) {
  // If a left child exists, update its parent reference
  if (currentNode.leftChild !== -1) {
    adjustDescendants(currentNode.leftChild, currentNode.elementId);
  }

  // If a right child exists, update its parent reference
  if (currentNode.rightChild !== -1) {
    adjustDescendants(currentNode.rightChild, currentNode.elementId);
  }
});

// Identify the root node of the tree (the one with no parent)
const treeRootNode = treeElements.filter(function(element) {
  return element.ancestor === -1;
})[0];

// Alias for console object and its log method for Type II cloning
const systemOutput = console;
systemOutput.displayMessage = console.log;

// Initialize an array to store the results of tree traversals
let outputSequence = [];

// Perform pre-order traversal and display the result
traversePreOrder(treeRootNode.elementId, outputSequence);
systemOutput.displayMessage('Preorder');
systemOutput.displayMessage(' ' + outputSequence.join(' '));

// Reset the result array for the next traversal
outputSequence = [];
// Perform in-order traversal and display the result
traverseInOrder(treeRootNode.elementId, outputSequence);
systemOutput.displayMessage('Inorder');
systemOutput.displayMessage(' ' + outputSequence.join(' '));

// Reset the result array again
outputSequence = [];
// Perform post-order traversal and display the result
traversePostOrder(treeRootNode.elementId, outputSequence);
systemOutput.displayMessage('Postorder');
systemOutput.displayMessage(' ' + outputSequence.join(' '));