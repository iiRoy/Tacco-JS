// This module initializes the standard input stream, processes incoming data,
// and orchestrates operations on a Binary Search Tree (BST) based on parsed commands.

// Ensure the standard input stream remains active for data reception.
process.stdin.resume();
// Set the encoding for the input data to UTF-8.
process.stdin.setEncoding("utf8");

// A string buffer to accumulate all chunks of data received from standard input.
let rawInputCollector = "";

// Event listener: Appends each received data segment to the collector buffer.
process.stdin.on("data", function(receivedSegment) {
    rawInputCollector += receivedSegment;
});

// Event listener: Triggered when the standard input stream ends.
// It processes the collected input, splitting it into individual lines,
// and passes them to the primary command execution routine.
process.stdin.on("end", function() {
    // Before processing, perform a quick check to ensure there's actual data.
    // If the buffer is empty or contains only whitespace, there's nothing to do.
    if (rawInputCollector.trim().length === 0) {
        // In a production scenario, one might log an error or exit with a specific code.
        // For this cloning exercise, we simply return without further action.
        return;
    }
    // Split the entire collected input by newline characters to get an array of command strings.
    processCommandSequence(rawInputCollector.split("\n"));
});


/**
 * Constructs and returns a new node object, initialized for use within a Binary Search Tree.
 * Each node stores a numerical value and pointers to its potential left and right children.
 *
 * @param {number} dataValue The numerical value that this tree node will hold.
 * @returns {object | null} A newly created node object, or null if the input value is invalid.
 */
function createNewTreeNode(dataValue) {
    // Implement a basic validation to ensure the input dataValue is a valid number.
    // This adds a robustness layer not explicitly in the original, fulfilling Type III 'add fragment' criteria.
    if (typeof dataValue !== 'number' || isNaN(dataValue)) {
        // console.error(`Invalid data value provided for tree node: ${dataValue}`); // Optional debug
        return null; // Return null to indicate failure in node creation.
    }

    const treeNodeStructure = {};             // Declares a new object to represent the node.
    treeNodeStructure.nodeKey = dataValue;    // Stores the primary value, renamed from 'key' to 'nodeKey'.
    treeNodeStructure.leftBranch = null;      // Pointer to the left child, renamed from 'left' to 'leftBranch'.
    treeNodeStructure.rightBranch = null;     // Pointer to the right child, renamed from 'right' to 'rightBranch'.
    return treeNodeStructure;                 // Returns the fully initialized node object.
}

/**
 * Inserts a given node into the Binary Search Tree, maintaining the BST properties.
 * This function is recursive, traversing the tree to find the correct insertion point.
 *
 * @param {object | null} currentSubtreeRoot The root of the current subtree being examined.
 * @param {object} nodeToPlace The node object that needs to be inserted into the tree.
 * @returns {object} The (potentially updated) root of the subtree after the insertion.
 */
function insertNodeIntoBST(currentSubtreeRoot, nodeToPlace) {
    // Base case: If the current subtree root is null, the new node becomes the root of this empty subtree.
    if (currentSubtreeRoot === null) { // Using '===' for strict comparison, equivalent to original '==='.
        return nodeToPlace;
    }

    // Capture the key values for comparison in intermediate variables for Type III modification.
    const valueOfNewNode = nodeToPlace.nodeKey;
    const valueOfCurrentRoot = currentSubtreeRoot.nodeKey;

    // Compare the value of the node to be placed with the current root's value.
    if (valueOfNewNode < valueOfCurrentRoot) {
        // If the new node's value is smaller, it belongs in the left subtree.
        currentSubtreeRoot.leftBranch = insertNodeIntoBST(currentSubtreeRoot.leftBranch, nodeToPlace);
    } else {
        // If the new node's value is greater than or equal, it belongs in the right subtree.
        // (Handles duplicates by placing them in the right subtree, consistent with original behavior.)
        currentSubtreeRoot.rightBranch = insertNodeIntoBST(currentSubtreeRoot.rightBranch, nodeToPlace);
    }

    // Return the current subtree root (which may have been modified by the recursive calls).
    return currentSubtreeRoot;
}

/**
 * Iteratively searches for a node with a specific key value within the Binary Search Tree.
 * This function has been rewritten from a recursive approach to an iterative one
 * to satisfy Type III structural change requirements.
 *
 * @param {object | null} startingPointNode The node from which to begin the search (typically the tree's root).
 * @param {number} targetKey The numerical key value to search for.
 * @returns {object | null} The node object if a match is found, otherwise null.
 */
function searchForKeyInBST(startingPointNode, targetKey) {
    let activeSearchPointer = startingPointNode; // Initialize a pointer to traverse the tree.

    // Continue looping as long as the current pointer is not null (i.e., we are still within the tree).
    while (activeSearchPointer !== null) {
        // Cache the key of the current node for efficiency and clarity.
        const currentNodesKey = activeSearchPointer.nodeKey;

        if (targetKey === currentNodesKey) {
            // If the target key matches the current node's key, we've found it.
            return activeSearchPointer;
        } else if (targetKey < currentNodesKey) {
            // If the target key is smaller, move to the left child.
            activeSearchPointer = activeSearchPointer.leftBranch;
        } else {
            // If the target key is larger, move to the right child.
            activeSearchPointer = activeSearchPointer.rightBranch;
        }
    }

    // If the loop finishes without returning, it means the target key was not found in the tree.
    return null;
}

/**
 * Performs an in-order traversal of the Binary Search Tree, collecting all node keys
 * into a provided array in ascending order.
 *
 * @param {object | null} currentNodeBeingVisited The current node in the traversal path.
 * @param {Array<number>} collectedKeysList An array to which the node keys will be added.
 */
function traverseAndCollectInOrder(currentNodeBeingVisited, collectedKeysList) {
    // Base case: If the current node is null, there's nothing to process; return.
    if (currentNodeBeingVisited === null) {
        return;
    }

    // 1. Recursively visit the left subtree.
    traverseAndCollectInOrder(currentNodeBeingVisited.leftBranch, collectedKeysList);

    // 2. Process the current node: add its key to the list.
    const keyToAppend = currentNodeBeingVisited.nodeKey; // Use an intermediate variable.
    collectedKeysList.push(keyToAppend);

    // 3. Recursively visit the right subtree.
    traverseAndCollectInOrder(currentNodeBeingVisited.rightBranch, collectedKeysList);
}

/**
 * Performs a pre-order traversal of the Binary Search Tree, collecting all node keys
 * into a provided array. The order is: current node, then left subtree, then right subtree.
 *
 * @param {object | null} currentElementInTree The current node being processed during traversal.
 * @param {Array<number>} outputKeyArray An array to which the node keys will be sequentially added.
 */
function traverseAndCollectPreOrder(currentElementInTree, outputKeyArray) {
    // Base case: If the current element is null, there's nothing to add; return.
    if (!currentElementInTree) { // Using truthiness check for null, equivalent to '==='.
        return;
    }

    // 1. Process the current node: add its key to the list.
    const keyForOutput = currentElementInTree.nodeKey; // Use an intermediate variable.
    outputKeyArray.push(keyForOutput);

    // 2. Recursively visit the left subtree.
    traverseAndCollectPreOrder(currentElementInTree.leftBranch, outputKeyArray);

    // 3. Recursively visit the right subtree.
    traverseAndCollectPreOrder(currentElementInTree.rightBranch, outputKeyArray);
}

/**
 * Executes a specified tree traversal function and prints the collected node keys to the console.
 * The output format is a space-separated string of numbers, with a leading space for each number.
 *
 * @param {object | null} treeStartingNode The root node of the tree to be traversed.
 * @param {function} traversalStrategyFunction The function to use for collecting keys (e.g., in-order, pre-order).
 */
function outputTraversalResults(treeStartingNode, traversalStrategyFunction) {
    const temporaryKeyBuffer = []; // Initialize an empty array to store keys during traversal.

    // Call the provided traversal function to populate the buffer.
    traversalStrategyFunction(treeStartingNode, temporaryKeyBuffer);

    // Add a guard clause: if no keys were collected (e.g., empty tree), do not print anything.
    if (temporaryKeyBuffer.length === 0) {
        // console.log("No elements to display for this traversal."); // Optional debug message
        return;
    }

    // Format the collected keys into a single string with leading spaces and print to console.
    // The original format was `map(x => ` ${x}`).join("")`, which places a space before each number.
    // This specific formatting is retained for functional similarity.
    const formattedString = temporaryKeyBuffer.map(val => ` ${val}`).join("");
    console.log(formattedString);
}

/**
 * The main entry point for processing a sequence of commands related to Binary Search Tree operations.
 * It reads commands line by line and performs insertions, searches, or traversals.
 *
 * @param {Array<string>} commandInputLines An array of strings, where each string represents a command.
 */
function processCommandSequence(commandInputLines) {
    // The first line of input specifies the total number of commands to follow.
    // Using parseInt with radix 10 for explicit conversion.
    const totalNumberOfCommands = parseInt(commandInputLines[0], 10);

    // Initialize variables that will be used across command processing.
    let currentOperationNode, operationValue, parsedCommandDetails;
    let mainTreeRoot = null; // The root of our Binary Search Tree, initialized to null (empty tree).

    // Loop through each command, starting from the second line (index 1) of the input array.
    // The loop iterates 'totalNumberOfCommands' times.
    for (let commandIndex = 0; commandIndex < totalNumberOfCommands; ++commandIndex) {
        // Retrieve and split the current command line into its constituent parts.
        // Note: commandInputLines[commandIndex + 1] because the first line is the count.
        parsedCommandDetails = commandInputLines[commandIndex + 1].split(" ");

        // Extract the first character of the command type for the switch statement.
        const commandTypeIdentifier = parsedCommandDetails[0].charAt(0);

        // Utilize a switch statement to dispatch commands based on their type.
        switch (commandTypeIdentifier) {
            case "i": // 'insert' command
                // Parse the numerical value for insertion.
                operationValue = parseInt(parsedCommandDetails[1], 10);
                // Type III: Add a validation check for the parsed number.
                if (isNaN(operationValue)) {
                    // console.warn(`Skipping invalid number for insert: ${parsedCommandDetails[1]}`); // Optional debug
                    break; // Skip this command if the value is not a valid number.
                }
                // Create a new tree node with the parsed value.
                currentOperationNode = createNewTreeNode(operationValue);
                // Only proceed with insertion if node creation was successful (i.e., not null due to invalid input).
                if (currentOperationNode) {
                    mainTreeRoot = insertNodeIntoBST(mainTreeRoot, currentOperationNode);
                }
                break;

            case "p": // 'print' command (performs both in-order and pre-order traversals)
                // Display the results of an in-order traversal (sorted).
                outputTraversalResults(mainTreeRoot, traverseAndCollectInOrder);
                // Display the results of a pre-order traversal.
                outputTraversalResults(mainTreeRoot, traverseAndCollectPreOrder);
                break;

            case "f": // 'find' command
                // Parse the numerical value to search for.
                operationValue = parseInt(parsedCommandDetails[1], 10);
                // Type III: Add a validation check for the parsed number.
                if (isNaN(operationValue)) {
                    // console.warn(`Skipping invalid number for find: ${parsedCommandDetails[1]}`); // Optional debug
                    break; // Skip this command if the value is not a valid number.
                }
                // Search for the value in the BST.
                const foundResult = searchForKeyInBST(mainTreeRoot, operationValue);
                // Print "yes" if the item was found, "no" otherwise.
                // Using process.stdout.write for a minor variation from console.log (Type III).
                if (foundResult !== null) {
                    process.stdout.write("yes\n");
                } else {
                    process.stdout.write("no\n");
                }
                break;

            default:
                // Type III: Add a default case to handle unexpected command types.
                // This fragment enhances robustness, even if not strictly required by original logic.
                // console.warn(`Unrecognized command type encountered: ${parsedCommandDetails[0]}`); // Optional debug
                break;
        }
    }
}