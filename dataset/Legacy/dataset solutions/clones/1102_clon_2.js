process.stdin.resume();
process.stdin.setEncoding("utf8");

let receivedData = ""; // Accumulates all incoming standard input data
process.stdin.on("data", function(chunk) {
    receivedData += chunk; // Append each data chunk to the buffer
});

process.stdin.on("end", function() {
    // Once all input is received, split it by newline and pass to the main processing function
    processInputData(receivedData.split("\n"));
});

/**
 * Creates a new binary tree node object.
 * @param {number} nodeValue - The numeric value to store in the node.
 * @returns {object} A new node instance with the specified value and null children.
 */
function createTreeNode(nodeValue) {
    let nodeObject = {}; // Initialize a plain object for the node
    nodeObject.val = nodeValue; // Assign the value
    nodeObject.leftBranch = null; // Initialize left child as null
    nodeObject.rightBranch = null; // Initialize right child as null
    return nodeObject; // Return the newly created node
}

/**
 * Inserts a new node into a binary search tree.
 * @param {object|null} currentNode - The current node being considered in the recursion.
 * @param {object} newNode - The node to be inserted.
 * @returns {object} The root of the (sub)tree after insertion.
 */
function addNodeToTree(currentNode, newNode) {
    if (currentNode === null) { // If the current position is empty, insert the new node here
        return newNode;
    }
    // Decide whether to go left or right based on the new node's value
    if (newNode.val < currentNode.val) {
        currentNode.leftBranch = addNodeToTree(currentNode.leftBranch, newNode);
    } else {
        currentNode.rightBranch = addNodeToTree(currentNode.rightBranch, newNode);
    }
    return currentNode; // Return the current node (root of this subtree)
}

/**
 * Searches for a node with a specific value in a binary search tree.
 * @param {object|null} currentNode - The current node being examined.
 * @param {number} searchValue - The value to search for.
 * @returns {object|null} The node if found, otherwise null.
 */
function locateNode(currentNode, searchValue) {
    // Continue searching if the current node is not null and its value doesn't match
    if (currentNode !== null && currentNode.val !== searchValue) {
        if (searchValue < currentNode.val) { // If search value is smaller, go left
            currentNode = locateNode(currentNode.leftBranch, searchValue);
        } else { // If search value is larger, go right
            currentNode = locateNode(currentNode.rightBranch, searchValue);
        }
    }
    return currentNode; // Return the found node or null
}

/**
 * Performs an in-order traversal of the tree, collecting node values into an array.
 * (Left -> Root -> Right)
 * @param {object|null} currentNode - The current node in the traversal.
 * @param {Array<number>} resultArray - The array to accumulate node values.
 */
function traverseInOrder(currentNode, resultArray) {
    if (currentNode === null) { // Base case: if node is null, do nothing
        return;
    }
    traverseInOrder(currentNode.leftBranch, resultArray); // Traverse left subtree
    resultArray.push(currentNode.val); // Add current node's value
    traverseInOrder(currentNode.rightBranch, resultArray); // Traverse right subtree
}

/**
 * Performs a pre-order traversal of the tree, collecting node values into an array.
 * (Root -> Left -> Right)
 * @param {object|null} currentNode - The current node in the traversal.
 * @param {Array<number>} resultArray - The array to accumulate node values.
 */
function traversePreOrder(currentNode, resultArray) {
    if (currentNode === null) { // Base case: if node is null, do nothing
        return;
    }
    resultArray.push(currentNode.val); // Add current node's value
    traversePreOrder(currentNode.leftBranch, resultArray); // Traverse left subtree
    traversePreOrder(currentNode.rightBranch, resultArray); // Traverse right subtree
}

/**
 * Executes a specified tree traversal function and prints the results to the console.
 * @param {object|null} treeRootNode - The root of the tree to traverse.
 * @param {Function} traversalFunction - The function to use for traversing (e.g., traverseInOrder, traversePreOrder).
 */
function displayTraversal(treeRootNode, traversalFunction) {
    let resultArray = []; // Initialize an empty array for traversal results
    traversalFunction(treeRootNode, resultArray); // Populate the array using the provided traversal function
    // Format and print the array contents, prefixed with a space for each item
    console.log(resultArray.map(item => ` ${item}`).join(""));
}

/**
 * Main function to parse input commands and perform operations on the binary search tree.
 * @param {Array<string>} inputLines - An array of strings, where each string is a command line.
 */
function processInputData(inputLines) {
    const operationCount = Number(inputLines[0]); // First line indicates the number of operations
    let treeRoot = null; // Initialize the binary search tree root as null
    let tempNode, searchVal, currentLineParts; // Declare variables for temporary node, search value, and parsed line parts

    // Loop through each operation command
    for (let idx = 0; idx < operationCount; idx++) {
        currentLineParts = inputLines[idx + 1].split(" "); // Split the command line into parts
        switch (currentLineParts[0][0]) { // Check the first character of the command
            case "i": // 'i' for insert
                searchVal = Number(currentLineParts[1]); // Get the value to insert
                tempNode = createTreeNode(searchVal); // Create a new node
                treeRoot = addNodeToTree(treeRoot, tempNode); // Insert the node into the tree
                break;
            case "p": // 'p' for print (traversals)
                displayTraversal(treeRoot, traverseInOrder); // Print in-order traversal
                displayTraversal(treeRoot, traversePreOrder); // Print pre-order traversal
                break;
            case "f": // 'f' for find
                searchVal = Number(currentLineParts[1]); // Get the value to find
                if (locateNode(treeRoot, searchVal) !== null) { // If the node is found
                    console.log("yes");
                } else { // If the node is not found
                    console.log("no");
                }
                break;
        }
    }
}
