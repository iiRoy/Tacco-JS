// This foundational module orchestrates the processing of standard input to manage a binary search tree data structure.

// Ensure the standard input stream remains active to capture all incoming data.
process.stdin.resume();

// Configure the input stream to decode incoming bytes as UTF-8 characters.
process.stdin.setEncoding("utf8");

// A dynamic buffer to accumulate all received data fragments from the input stream.
let accumulatedInputBuffer = "";

// Attach an event listener to the 'data' event of the standard input stream.
// Each time a new data fragment arrives, append it to our buffer.
process.stdin.on("data", function(incomingFragment) {
    accumulatedInputBuffer += incomingFragment;
});

// Attach an event listener to the 'end' event of the standard input stream.
// This signifies that all input has been received.
process.stdin.on("end", function() {
    // Once the input stream concludes, split the entire accumulated buffer into individual lines
    // and pass them to the primary command processing routine.
    processInputCommands(accumulatedInputBuffer.split("\n"));
});

/**
 * Constructs and initializes a new node object for potential insertion into the binary tree.
 * Each node stores a primary numerical value and references to its child nodes.
 * @param {number} elementValue - The distinct numerical value to be stored within this node.
 * @returns {object} A newly created node object, pre-configured with the given value and null child/parent references.
 */
function createBinaryTreeNode(elementValue) {
    // Declare and initialize a new generic object to represent the tree node.
    let freshNode = {};
    freshNode.elementValue = elementValue;       // Assign the core data value.
    freshNode.leftBranch = null;                 // Initialize the left child pointer to null.
    freshNode.rightBranch = null;                // Initialize the right child pointer to null.
    freshNode.parentReference = null;            // Optionally, include a parent pointer for potential future use or debugging.
    return freshNode;
}

/**
 * Recursively inserts a new node into the appropriate position within the binary search tree,
 * maintaining the BST properties (left child < parent < right child).
 * @param {object|null} currentSubtreeRoot - The root node of the current subtree being examined. Can be null.
 * @param {object} nodeToInsert - The new node object that needs to be placed into the tree.
 * @returns {object} The root of the modified subtree after the insertion.
 */
function placeElementInTree(currentSubtreeRoot, nodeToInsert) {
    // Base case: If the current subtree root is null, we've found the insertion point.
    // The new node becomes the root of this (previously empty) subtree.
    if (!currentSubtreeRoot) {
        return nodeToInsert;
    }

    // Compare the value of the node to be inserted with the current node's value.
    if (nodeToInsert.elementValue < currentSubtreeRoot.elementValue) {
        // If the new node's value is smaller, attempt insertion into the left subtree.
        let updatedLeftChild = placeElementInTree(currentSubtreeRoot.leftBranch, nodeToInsert);
        currentSubtreeRoot.leftBranch = updatedLeftChild; // Link the updated left subtree.
        // Important: Update the parent reference of the newly linked child, if it exists.
        if (updatedLeftChild) {
            updatedLeftChild.parentReference = currentSubtreeRoot;
        }
    } else {
        // If the new node's value is greater than or equal, attempt insertion into the right subtree.
        let updatedRightChild = placeElementInTree(currentSubtreeRoot.rightBranch, nodeToInsert);
        currentSubtreeRoot.rightBranch = updatedRightChild; // Link the updated right subtree.
        // Important: Update the parent reference of the newly linked child, if it exists.
        if (updatedRightChild) {
            updatedRightChild.parentReference = currentSubtreeRoot;
        }
    }
    // Return the current subtree root, which might have been modified.
    return currentSubtreeRoot;
}

/**
 * Performs an in-order traversal (Left -> Root -> Right) of the binary tree,
 * collecting the numerical values of nodes into a provided array in ascending order.
 * @param {object|null} currentTraversalNode - The node currently being visited in the traversal.
 * @param {Array<number>} collectedNodeValues - The array where node values will be stored.
 */
function performInOrderTraversal(currentTraversalNode, collectedNodeValues) {
    // Guard clause: If the current node is null, there's nothing to process further down this path.
    if (!currentTraversalNode) {
        return;
    }
    // Recursively traverse the left branch.
    performInOrderTraversal(currentTraversalNode.leftBranch, collectedNodeValues);
    // Visit the current node: Add its value to the collection.
    collectedNodeValues.push(currentTraversalNode.elementValue);
    // Recursively traverse the right branch.
    performInOrderTraversal(currentTraversalNode.rightBranch, collectedNodeValues);
}

/**
 * Performs a pre-order traversal (Root -> Left -> Right) of the binary tree,
 * collecting the numerical values of nodes into a provided array.
 * @param {object|null} currentTraversalNode - The node currently being visited in the traversal.
 * @param {Array<number>} collectedNodeValues - The array where node values will be stored.
 */
function performPreOrderTraversal(currentTraversalNode, collectedNodeValues) {
    // Guard clause: If the current node is null, terminate the recursive call for this branch.
    if (!currentTraversalNode) {
        return;
    }
    // Visit the current node first: Add its value to the collection.
    collectedNodeValues.push(currentTraversalNode.elementValue);
    // Recursively traverse the left branch.
    performPreOrderTraversal(currentTraversalNode.leftBranch, collectedNodeValues);
    // Recursively traverse the right branch.
    performPreOrderTraversal(currentTraversalNode.rightBranch, collectedNodeValues);
}

/**
 * Executes a specified tree traversal method and then outputs the resulting sequence of node values
 * to the console, joined by spaces.
 * @param {object|null} treeStructureRoot - The root node of the binary search tree to be traversed.
 * @param {function} traversalMethod - A callback function that dictates the traversal order (e.g., performInOrderTraversal).
 */
function presentTraversalResult(treeStructureRoot, traversalMethod) {
    // Initialize an empty array to hold the values gathered during the traversal.
    let sequenceOfValues = [];
    // Invoke the chosen traversal method, passing the tree root and the array for collection.
    traversalMethod(treeStructureRoot, sequenceOfValues);
    // Print the collected sequence, prefixed for clarity, with elements separated by spaces.
    console.log("Tree Sequence: " + sequenceOfValues.join(" "));
}

/**
 * The main execution function that parses input commands and manipulates the binary search tree.
 * It handles 'insert' and 'print' operations based on the provided input lines.
 * @param {Array<string>} commandLines - An array of strings, where each string represents a single command.
 */
function processInputCommands(commandLines) {
    // Initial validation: Ensure that commandLines is an array and contains data.
    if (!Array.isArray(commandLines) || commandLines.length === 0) {
        console.error("Critical Error: No command lines were supplied for processing.");
        return; // Halt execution if no input is available.
    }

    // Attempt to parse the first line, which should specify the total number of operations.
    const rawOperationCountString = commandLines[0];
    const totalOperationCount = parseInt(rawOperationCountString, 10); // Explicitly specify radix 10.

    // Validate the parsed operation count.
    if (isNaN(totalOperationCount) || totalOperationCount < 0) {
        console.error(`Error: The specified number of operations ('${rawOperationCountString}') is invalid or negative.`);
        return; // Abort if the count is nonsensical.
    }

    // Initialize the root of our binary search tree as empty.
    let mainBinaryTreeRoot = null;

    // Iterate through the command lines, starting from the second line (index 1),
    // up to the `totalOperationCount` specified. Changed to a while loop for structural variation.
    let currentCommandLineIndex = 0;
    while (currentCommandLineIndex < totalOperationCount) {
        // Calculate the actual line number in the input array (0-indexed vs. 1-indexed for commands).
        const actualInputLineNumber = currentCommandLineIndex + 1;

        // Ensure we don't try to access lines beyond the input array's bounds.
        if (actualInputLineNumber >= commandLines.length) {
            console.warn(`Warning: Expected ${totalOperationCount} operations, but input ended prematurely after ${currentCommandLineIndex} commands. Remaining operations skipped.`);
            break; // Exit the loop if we run out of input lines.
        }

        let currentCommandString = commandLines[actualInputLineNumber];

        // Basic validation for the current command line.
        if (!currentCommandString || currentCommandString.trim() === "") {
            console.warn(`Warning: Skipping an empty or whitespace-only command line at input index ${actualInputLineNumber}.`);
            currentCommandLineIndex++; // Advance to the next expected command.
            continue; // Skip processing this invalid line.
        }

        // Split the command string into its constituent parts.
        let commandParameters = currentCommandString.split(" ");
        let primaryCommandIdentifier = commandParameters[0]; // The first part is the command type.

        // Use an if-else if structure instead of switch for Type III variation.
        if (primaryCommandIdentifier && primaryCommandIdentifier.startsWith("i")) { // Command to 'insert' a value
            const valueAsString = commandParameters[1];
            const numericalValue = parseInt(valueAsString, 10);

            // Validate that the value to insert is indeed a number.
            if (isNaN(numericalValue)) {
                console.warn(`Warning: Attempted 'insert' command at line ${actualInputLineNumber} with non-numeric value '${valueAsString}'. Operation skipped.`);
            } else {
                // Create a new node and insert it into the tree.
                let newlyFormedNode = createBinaryTreeNode(numericalValue);
                mainBinaryTreeRoot = placeElementInTree(mainBinaryTreeRoot, newlyFormedNode);
            }
        } else if (primaryCommandIdentifier && primaryCommandIdentifier.startsWith("p")) { // Command to 'print' traversals
            // Execute both in-order and pre-order traversals and display their results.
            presentTraversalResult(mainBinaryTreeRoot, performInOrderTraversal);
            presentTraversalResult(mainBinaryTreeRoot, performPreOrderTraversal);
        } else {
            // Log a warning for any unrecognized or malformed commands.
            console.warn(`Warning: Unrecognized command '${primaryCommandIdentifier}' encountered at line ${actualInputLineNumber}. This command will be ignored.`);
        }
        currentCommandLineIndex++; // Move to the next command for processing.
    }
}