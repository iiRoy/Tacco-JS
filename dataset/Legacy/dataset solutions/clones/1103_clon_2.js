process.stdin.resume();
process.stdin.setEncoding("utf8");

let rawData = "";

process.stdin.on("data", function(chunk) {
    rawData += chunk;
});

process.stdin.on("end", function() {
    // Once all input is received, process it
    processInput(rawData.split("\n"));
});

/**
 * Creates a new binary tree node.
 * @param {number} val - The value to store in the node.
 * @returns {object} A new node object.
 */
function createNode(val) {
    const nodeObj = {}; // Use a different variable name for the object
    nodeObj.val = val;
    nodeObj.leftChild = null;
    nodeObj.rightChild = null;
    return nodeObj;
}

/**
 * Inserts a new node into the binary search tree.
 * @param {object|null} nodeRef - The current node being considered.
 * @param {object} newNode - The node to insert.
 * @returns {object} The root of the (sub)tree after insertion.
 */
function addNode(nodeRef, newNode) {
    if (nodeRef === null) {
        return newNode; // If current node is null, insert here
    }

    // Decide whether to go left or right
    if (newNode.val < nodeRef.val) {
        nodeRef.leftChild = addNode(nodeRef.leftChild, newNode);
    } else {
        nodeRef.rightChild = addNode(nodeRef.rightChild, newNode);
    }
    return nodeRef; // Return the (unchanged) current node
}

/**
 * Searches for a node with a specific value in the binary search tree.
 * @param {object|null} nodeRef - The current node being considered.
 * @param {number} valToFind - The value to search for.
 * @returns {object|null} The node if found, otherwise null.
 */
function searchNode(nodeRef, valToFind) {
    // If node is null or value matches, return nodeRef
    if (nodeRef !== null && nodeRef.val !== valToFind) {
        if (valToFind < nodeRef.val) {
            nodeRef = searchNode(nodeRef.leftChild, valToFind);
        } else {
            nodeRef = searchNode(nodeRef.rightChild, valToFind);
        }
    }
    return nodeRef;
}

/**
 * Performs an in-order traversal of the binary tree and collects node values.
 * @param {object|null} nodeRef - The current node.
 * @param {Array<number>} resultList - The array to store collected values.
 */
function traverseInOrder(nodeRef, resultList) {
    if (nodeRef === null) {
        return;
    }
    traverseInOrder(nodeRef.leftChild, resultList);
    resultList.push(nodeRef.val); // Add current node's value
    traverseInOrder(nodeRef.rightChild, resultList);
}

/**
 * Performs a pre-order traversal of the binary tree and collects node values.
 * @param {object|null} nodeRef - The current node.
 * @param {Array<number>} resultList - The array to store collected values.
 */
function traversePreOrder(nodeRef, resultList) {
    if (nodeRef === null) {
        return;
    }
    resultList.push(nodeRef.val); // Add current node's value first
    traversePreOrder(nodeRef.leftChild, resultList);
    traversePreOrder(nodeRef.rightChild, resultList);
}

/**
 * Prints the result of a tree traversal.
 * @param {object|null} treeRoot - The root of the tree.
 * @param {function} traversalFunc - The traversal function to use (e.g., traverseInOrder, traversePreOrder).
 */
function printTraversal(treeRoot, traversalFunc) {
    const resultList = [];
    traversalFunc(treeRoot, resultList);
    // Format and print the output
    console.log(resultList.map(item => ` ${item}`).join(""));
}

/**
 * Main function to process commands from input lines.
 * @param {Array<string>} inputLines - An array of input strings, one per line.
 */
function processInput(inputLines) {
    const numCommands = Number(inputLines[0]); // First line is the number of commands
    let currNode, valToProcess, currentCommand, treeRoot = null;

    // Iterate through each command
    for (let cmdIndex = 0; cmdIndex < numCommands; cmdIndex++) {
        currentCommand = inputLines[cmdIndex + 1].split(" "); // Get command line
        const commandType = currentCommand[0][0]; // First character of the command

        switch (commandType) {
            case "i": // Insert command
                valToProcess = Number(currentCommand[1]);
                currNode = createNode(valToProcess);
                treeRoot = addNode(treeRoot, currNode);
                break;
            case "p": // Print command (in-order and pre-order)
                printTraversal(treeRoot, traverseInOrder);
                printTraversal(treeRoot, traversePreOrder);
                break;
            case "f": // Find command
                valToProcess = Number(currentCommand[1]);
                if (searchNode(treeRoot, valToProcess) !== null) {
                    console.log("yes");
                } else {
                    console.log("no");
                }
                break;
        }
    }
}
