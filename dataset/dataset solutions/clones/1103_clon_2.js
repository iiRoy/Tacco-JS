process.stdin.resume(); /* Ensure standard input stream remains open */

process.stdin.setEncoding("utf8"); // Set character encoding for input

let receivedData = ""; // Accumulator for all incoming data chunks

// Event listener for data chunks from standard input
process.stdin.on("data", function(dataSegment) {
  receivedData += dataSegment; // Append each chunk to the accumulator
});

// Event listener for the end of standard input stream
process.stdin.on("end", function() {
  // Once all data is received, split by newline and pass to main logic
  executePrimaryLogic(receivedData.split("\n"));
});

/**
 * Generates a new tree node object.
 * @param {number} nodeValue - The numerical value to store in the node.
 * @returns {object} A fresh node with the given value and null children.
 */
function createTreeNode(nodeValue) {
  /*
   * Initialize a plain JavaScript object to represent our tree node.
   * This is a simple binary search tree node structure.
   */
  const newNode = {};

  // Assign the provided value to the node.
  newNode.value = nodeValue;

  // Initialize left child pointer to null.
  newNode.leftChild = null;

  // Initialize right child pointer to null.
  newNode.rightChild = null;

  // Return the newly created node.
  return newNode;
}

/**
 * Inserts a new node into the binary search tree.
 * @param {object|null} currentNode - The current root of the subtree being considered.
 * @param {object} nodeToInsert - The node object to be inserted.
 * @returns {object} The updated root of the subtree.
 */
function addNodeToTree(currentNode, nodeToInsert) {
  // If the current position is null, this is where the new node goes.
  if (currentNode === null) {
    return nodeToInsert;
  }

  // Determine insertion path based on the value comparison.
  if (nodeToInsert.value < currentNode.value) {
    // If the new node's value is smaller, go to the left subtree.
    currentNode.leftChild = addNodeToTree(currentNode.leftChild, nodeToInsert);
  } else {
    // Otherwise, go to the right subtree (for equal or larger values).
    currentNode.rightChild = addNodeToTree(currentNode.rightChild, nodeToInsert);
  }

  // Return the (potentially updated) current node.
  return currentNode;
}

/**
 * Locates a node with a specific value within the binary search tree.
 * @param {object|null} currentPosition - The root of the subtree to search.
 * @param {number} targetValue - The value to find.
 * @returns {object|null} The node if found, otherwise null.
 */
function locateNode(currentPosition, targetValue) {
  // Continue searching as long as we haven't hit a null node AND the value doesn't match.
  if (currentPosition !== null && currentPosition.value !== targetValue) {
    if (targetValue < currentPosition.value) {
      // If target is smaller, search in the left subtree.
      currentPosition = locateNode(currentPosition.leftChild, targetValue);
    } else {
      // If target is larger, search in the right subtree.
      currentPosition = locateNode(currentPosition.rightChild, targetValue);
    }
  }
  // Return the found node or null if not found.
  return currentPosition;
}

/**
 * Performs an in-order traversal of the binary search tree, collecting node values.
 * (Left -> Root -> Right)
 * @param {object|null} currentRoot - The current node in the traversal.
 * @param {Array<number>} resultList - An array to accumulate the node values.
 */
function inorderTraversal(currentRoot, resultList) {
  // Base case: if current node is null, stop.
  if (currentRoot === null) return;

  // Recursively traverse the left subtree.
  inorderTraversal(currentRoot.leftChild, resultList);

  // Add the current node's value to the list.
  resultList.push(currentRoot.value);

  // Recursively traverse the right subtree.
  inorderTraversal(currentRoot.rightChild, resultList);
}

/**
 * Performs a pre-order traversal of the binary search tree, collecting node values.
 * (Root -> Left -> Right)
 * @param {object|null} currentRoot - The current node in the traversal.
 * @param {Array<number>} resultList - An array to accumulate the node values.
 */
function preorderTraversal(currentRoot, resultList) {
  // Base case: if current node is null, stop.
  if (currentRoot === null) {
    return;
  }

  // Add the current node's value to the list first.
  resultList.push(currentRoot.value);

  // Recursively traverse the left subtree.
  preorderTraversal(currentRoot.leftChild, resultList);

  // Recursively traverse the right subtree.
  preorderTraversal(currentRoot.rightChild, resultList);
}

/**
 * Prints the contents of the tree using a specified traversal function.
 * @param {object|null} treeRoot - The root of the tree to print.
 * @param {function} traversalFunction - The function to use for tree traversal (e.g., inorderTraversal, preorderTraversal).
 */
function printTreeContents(treeRoot, traversalFunction) {
  const collectedValues = []; // Array to store values during traversal.

  // Execute the chosen traversal function to populate the array.
  traversalFunction(treeRoot, collectedValues);

  // Format and print the collected values, separated by spaces.
  console.log(collectedValues.map(val => ` ${val}`).join(""));
}

/**
 * The main logic function that processes input commands to manipulate the binary search tree.
 * @param {Array<string>} inputLines - An array of strings, each representing a command line.
 */
function executePrimaryLogic(inputLines) {
  // Parse the first line to get the number of operations.
  const numberOfOperations = Number(inputLines[0]);

  let tempNode; // Temporary node for insertion operations.
  let searchKey; // Key value for insert/find operations.
  let currentLineParts; // Array to hold parts of the current command line.
  let treeHead = null; // The root of our binary search tree, initially null.

  // Loop through each operation specified in the input.
  for (let opIndex = 0; opIndex < numberOfOperations; opIndex++) {
    // Split the current command line into parts.
    currentLineParts = inputLines[opIndex + 1].split(" ");

    // Use a switch statement to handle different command types.
    switch (currentLineParts[0][0]) {
      case "i": // 'insert' command
        searchKey = Number(currentLineParts[1]); // Get the key to insert.
        tempNode = createTreeNode(searchKey); // Create a new node.
        treeHead = addNodeToTree(treeHead, tempNode); // Insert the node into the tree.
        break;

      case "p": // 'print' command
        // Dump tree contents using in-order traversal.
        printTreeContents(treeHead, inorderTraversal);
        // Dump tree contents using pre-order traversal.
        printTreeContents(treeHead, preorderTraversal);
        break;

      case "f": // 'find' command
        searchKey = Number(currentLineParts[1]); // Get the key to find.
        // Check if the node with the key exists and print "yes" or "no".
        if (locateNode(treeHead, searchKey) !== null) {
          console.log("yes");
        } else {
          console.log("no");
        }
        break;
    }
  }
}