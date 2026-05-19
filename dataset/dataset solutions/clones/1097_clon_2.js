process.stdin.resume();
process.stdin.setEncoding("utf8");

let inputBuffer = "";

process.stdin.on("data", function(dataChunk) {
    inputBuffer += dataChunk;
});

process.stdin.on("end", function() {
    // Once all input is received, process it
    executeTreeOperations(inputBuffer.split("\n"));
});

/**
 * Creates a new binary tree node.
 * @param {number} nodeValue The value to store in the node.
 * @returns {object} A new node object.
 */
function createBinaryTreeNode(nodeValue) {
    let newNodeObject = {}; // Initialize a new object for the node
    newNodeObject.key = nodeValue;
    newNodeObject.left = null;
    newNodeObject.right = null;
    return newNodeObject;
}

/**
 * Inserts a node into the binary search tree.
 * @param {object|null} currentTreeRoot The current root of the subtree.
 * @param {object} nodeToPlace The node to be inserted.
 * @returns {object} The root of the modified subtree.
 */
function addNodeToBinaryTree(currentTreeRoot, nodeToPlace) {
    if (currentTreeRoot === null) {
        return nodeToPlace; // If subtree is empty, the new node becomes the root
    }

    // Decide whether to go left or right based on the key
    if (nodeToPlace.key < currentTreeRoot.key) {
        currentTreeRoot.left = addNodeToBinaryTree(currentTreeRoot.left, nodeToPlace);
    } else {
        currentTreeRoot.right = addNodeToBinaryTree(currentTreeRoot.right, nodeToPlace);
    }

    return currentTreeRoot; // Return the (potentially updated) root of the subtree
}

/**
 * Performs an in-order traversal of the binary tree.
 * @param {object|null} currentTreeRoot The current root of the subtree.
 * @param {Array<number>} collectedValues An array to store the node keys.
 */
function performInOrderTraversal(currentTreeRoot, collectedValues) {
    if (currentTreeRoot === null) {
        return; // Base case: empty subtree
    }
    performInOrderTraversal(currentTreeRoot.left, collectedValues); // Traverse left
    collectedValues.push(currentTreeRoot.key); // Visit current node
    performInOrderTraversal(currentTreeRoot.right, collectedValues); // Traverse right
}

/**
 * Performs a pre-order traversal of the binary tree.
 * @param {object|null} currentTreeRoot The current root of the subtree.
 * @param {Array<number>} collectedValues An array to store the node keys.
 */
function performPreOrderTraversal(currentTreeRoot, collectedValues) {
    if (currentTreeRoot === null) {
        return; // Base case: empty subtree
    }
    collectedValues.push(currentTreeRoot.key); // Visit current node
    performPreOrderTraversal(currentTreeRoot.left, collectedValues); // Traverse left
    performPreOrderTraversal(currentTreeRoot.right, collectedValues); // Traverse right
}

/**
 * Executes a given traversal strategy and prints the result.
 * @param {object|null} treeRoot The root of the binary tree.
 * @param {function} traversalStrategy The function to use for traversal (e.g., performInOrderTraversal).
 */
function displayTraversalResult(treeRoot, traversalStrategy) {
    let outputBuffer = []; // Array to hold the keys during traversal
    traversalStrategy(treeRoot, outputBuffer); // Populate the array using the provided strategy
    console.log(outputBuffer.join(" ")); // Print the collected keys, space-separated
}

/**
 * Main function to process input commands and manage the binary tree.
 * @param {Array<string>} inputCommandLines An array of strings, each representing a command.
 */
function executeTreeOperations(inputCommandLines) {
    let totalOperations = Number(inputCommandLines[0]); // First line is the number of operations
    let mainTreeRoot = null; // Initialize the root of the binary tree

    // Iterate through each command line
    for (let operationIndex = 0; operationIndex < totalOperations; operationIndex++) {
        let currentOperationDetails = inputCommandLines[operationIndex + 1].split(" "); // Split command into parts

        // Determine the type of operation based on the first character
        switch (currentOperationDetails[0][0]) {
            case "i": // Insert operation
                let valueForInsertion = Number(currentOperationDetails[1]);
                let newTreeNode = createBinaryTreeNode(valueForInsertion);
                mainTreeRoot = addNodeToBinaryTree(mainTreeRoot, newTreeNode);
                break;
            case "p": // Print operation (in-order and pre-order)
                displayTraversalResult(mainTreeRoot, performInOrderTraversal);
                displayTraversalResult(mainTreeRoot, performPreOrderTraversal);
                break;
        }
    }
}
