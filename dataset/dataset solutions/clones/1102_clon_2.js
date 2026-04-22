/* This script processes commands to manage a binary search tree. */
// Resume standard input stream to listen for data.
process.stdin.resume();
// Set the encoding for the input data to UTF-8.
process.stdin.setEncoding("utf8");

// Variable to accumulate all incoming data from stdin.
let receivedData = "";

// Attach an event listener for "data" chunks.
process.stdin.on("data", function (dataSegment) {
    // Append each new data segment to the overall received data.
    receivedData += dataSegment;
});

// Attach an event listener for the "end" of the input stream.
process.stdin.on("end", function () {
    // Once all input is received, split it into lines and pass to the main execution routine.
    executeProgram(receivedData.split("\n"));
});


/**
 * Constructs and returns a brand new node object for the binary tree.
 * @param {number} nodeValue - The numerical value to be stored within this new node.
 * @returns {object} A fresh node instance, initialized with the provided value and null children pointers.
 */
function createTreeNode(nodeValue) {
    // Initialize a blank object to serve as our tree node.
    let newNodeObject = {};
    // Assign the given numerical value to the node's data field.
    newNodeObject.value = nodeValue;
    // Set the left child reference to null initially.
    newNodeObject.leftChild = null;
    // Set the right child reference to null initially.
    return newNodeObject;
}

/**
 * Inserts a specified child node into the binary search tree, starting from a given root.
 * This function handles the recursive insertion logic.
 * @param {object | null} currentNode - The current node being examined in the tree, or null if empty.
 * @param {object} childNode - The node that needs to be positioned within the tree.
 * @returns {object} The root of the (potentially altered) subtree after insertion.
 */
function addNodeToTree(currentNode, childNode) {
    // If the current position is empty, the child node becomes the new root of this subtree.
    if (currentNode === null) {
        return childNode;
    }

    // Compare the value of the node to be inserted with the current node's value.
    if (childNode.value < currentNode.value) {
        // If the child's value is smaller, attempt to insert it into the left subtree.
        currentNode.leftChild = addNodeToTree(currentNode.leftChild, childNode);
    } else {
        // Otherwise (if value is greater or equal), insert into the right subtree.
        currentNode.rightChild = addNodeToTree(currentNode.rightChild, childNode);
    }
    // Return the current node, whose children might have been updated.
    return currentNode;
}

/**
 * Searches for a node containing a specific numerical value within the binary tree.
 * @param {object | null} currentPoint - The starting point for the search operation.
 * @param {number} searchValue - The numeric value we are trying to locate.
 * @returns {object | null} The tree node if its value matches the search value, otherwise null.
 */
function locateNode(currentPoint, searchValue) {
    // Continue the search as long as we haven't hit a null node and haven't found the value.
    if (currentPoint !== null && currentPoint.value !== searchValue) {
        // If the search value is less than the current node's value, proceed to the left child.
        if (searchValue < currentPoint.value) {
            currentPoint = locateNode(currentPoint.leftChild, searchValue);
        }
        // Otherwise, move to the right child.
        else {
            currentPoint = locateNode(currentPoint.rightChild, searchValue);
        }
    }
    // Return the node if found, or the null reference if the search ended unsuccessfully.
    return currentPoint;
}

/**
 * Performs an in-order traversal (Left-Root-Right) of the tree, collecting node values.
 * @param {object | null} nodePtr - The current node being visited during the traversal.
 * @param {Array<number>} resultArray - An array where the collected node values will be stored.
 */
function traverseInOrder(nodePtr, resultArray) {
    // Base case for recursion: if the node pointer is null, simply return.
    if (nodePtr === null) {
        return;
    }
    // Recursively visit the left child.
    traverseInOrder(nodePtr.leftChild, resultArray);
    // Add the current node's value to the result array.
    resultArray.push(nodePtr.value);
    // Recursively visit the right child.
    traverseInOrder(nodePtr.rightChild, resultArray);
}

/**
 * Performs a pre-order traversal (Root-Left-Right) of the tree, gathering node values.
 * @param {object | null} nodePointer - The current node in the recursive traversal.
 * @param {Array<number>} outputCollection - The array used to accumulate the values in pre-order.
 */
function traversePreOrder(nodePointer, outputCollection) {
    // Base condition for the recursion: if the node is null, terminate this branch.
    if (nodePointer === null) {
        return;
    }
    // First, add the current node's value to the collection.
    outputCollection.push(nodePointer.value);
    // Then, recursively traverse the left subtree.
    traversePreOrder(nodePointer.leftChild, outputCollection);
    // Finally, recursively traverse the right subtree.
    traversePreOrder(nodePointer.rightChild, outputCollection);
}

/**
 * Outputs the contents of a tree to the console using a specified traversal method.
 * @param {object | null} rootNodeRef - The root node of the tree whose content is to be displayed.
 * @param {function} traversalFunction - The specific traversal function (e.g., traverseInOrder, traversePreOrder) to use.
 */
function displayTreeContent(rootNodeRef, traversalFunction) {
    // Create an empty array to temporarily store the elements during traversal.
    let collectedElements = [];
    // Call the provided traversal function to populate the array with node values.
    traversalFunction(rootNodeRef, collectedElements);
    // Format the collected elements with leading spaces and join them, then print to console.
    console.log(collectedElements.map(elementItem => ` ${elementItem}`).join(""));
}

/**
 * The primary function that orchestrates the execution of tree operations based on input commands.
 * @param {Array<string>} inputLines - An array where each string represents a single command line.
 */
function executeProgram(inputLines) {
    // Parse the first line to get the total number of operations to perform.
    const totalOperations = Number(inputLines[0]);
    // Initialize the root of the binary search tree to an empty state.
    let treeRoot = null;
    // Declare variables for temporary node storage, current key, and parsed line data.
    let tempNode, currentKey, currentLineData;

    // Iterate through each command line, starting from the second line of input.
    for (let loopCounter = 0; loopCounter < totalOperations; loopCounter++) {
        // Split the current command line by spaces to separate the command and its arguments.
        currentLineData = inputLines[loopCounter + 1].split(" ");

        // Use a switch statement to handle different command types.
        switch (currentLineData[0][0]) {
            case "i": // Command to 'insert' a new value.
                // Convert the second part of the line to a number for the key.
                currentKey = Number(currentLineData[1]);
                // Create a new tree node with the extracted key.
                tempNode = createTreeNode(currentKey);
                // Insert the newly created node into the tree, updating the root if necessary.
                treeRoot = addNodeToTree(treeRoot, tempNode);
                break;

            case "p": // Command to 'print' the tree contents using different traversals.
                // Display the tree's values using in-order traversal.
                displayTreeContent(treeRoot, traverseInOrder);
                // Display the tree's values using pre-order traversal.
                displayTreeContent(treeRoot, traversePreOrder);
                break;

            case "f": // Command to 'find' a specific value in the tree.
                // Extract the key to be searched for from the command line.
                currentKey = Number(currentLineData[1]);
                // Attempt to locate the node with the specified key.
                if (locateNode(treeRoot, currentKey) !== null) {
                    console.log("yes"); // If the node is found, print "yes".
                } else {
                    console.log("no");  // If the node is not found, print "no".
                }
                break;
        }
    }
}