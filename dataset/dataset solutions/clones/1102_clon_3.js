process.stdin.resume();
process.stdin.setEncoding("utf8");

// Buffer to accumulate all input data until the stream ends.
let accumulatedInputData = "";

// Event listener for receiving data chunks from standard input.
process.stdin.on("data", function(dataFragment) {
    accumulatedInputData += dataFragment; // Append the new data to the buffer.
});

// Event listener for when the standard input stream has ended.
process.stdin.on("end", function() {
    // Split the accumulated input into individual command lines and
    // pass them to the main processing function.
    const commandLines = accumulatedInputData.split("\n");
    executeTreeOperations(commandLines);
});

/**
 * Represents a single node within the Binary Search Tree structure.
 * Each node stores a numerical value and references to its child nodes.
 */
class TreeNode {
    /**
     * Initializes a new instance of a TreeNode.
     * @param {number} nodeValue - The numerical value to be stored in this node.
     */
    constructor(nodeValue) {
        // Basic validation for the input value.
        if (typeof nodeValue !== 'number' || isNaN(nodeValue)) {
            // In a production system, one might throw an error here.
            // For this context, we'll log a warning and assign a default.
            console.error("Warning: Attempted to create TreeNode with invalid value:", nodeValue);
            this.value = 0; // Assign a default value for robustness.
        } else {
            this.value = nodeValue;
        }
        this.leftChild = null;  // Reference to the left child node (smaller values).
        this.rightChild = null; // Reference to the right child node (larger or equal values).
    }
}

/**
 * Encapsulates the operations and structure of a Binary Search Tree (BST).
 * This class manages the root node and provides methods for insertion,
 * searching, and various tree traversals.
 */
class BinarySearchTree {
    constructor() {
        this.rootNode = null; // The starting point of the tree.
    }

    /**
     * Inserts a new numerical value into the Binary Search Tree.
     * Duplicates are placed in the right subtree.
     * @param {number} newValue - The numerical value to add to the tree.
     */
    addValue(newValue) {
        const newNode = new TreeNode(newValue); // Create a new node for the value.

        // If the tree is currently empty, the new node becomes the root.
        if (this.rootNode === null) {
            this.rootNode = newNode;
            return;
        }

        // Traverse the tree to find the correct insertion point.
        let currentNode = this.rootNode;
        // Using an iterative approach for insertion, a Type III structural change.
        while (true) {
            if (newValue < currentNode.value) {
                // If the new value is smaller, go to the left subtree.
                if (currentNode.leftChild === null) {
                    currentNode.leftChild = newNode; // Insert here if left child is empty.
                    return;
                }
                currentNode = currentNode.leftChild; // Continue searching left.
            } else {
                // If the new value is larger or equal, go to the right subtree.
                if (currentNode.rightChild === null) {
                    currentNode.rightChild = newNode; // Insert here if right child is empty.
                    return;
                }
                currentNode = currentNode.rightChild; // Continue searching right.
            }
        }
    }

    /**
     * Searches for a specific numerical value within the tree.
     * @param {number} targetValue - The value to locate in the tree.
     * @returns {TreeNode | null} The TreeNode object if the value is found, otherwise null.
     */
    locateValue(targetValue) {
        let currentNode = this.rootNode; // Start the search from the tree's root.

        // Iterative search through the tree.
        while (currentNode !== null) {
            if (targetValue === currentNode.value) {
                return currentNode; // Value found! Return the node.
            } else if (targetValue < currentNode.value) {
                currentNode = currentNode.leftChild; // Target is smaller, move to left child.
            } else {
                currentNode = currentNode.rightChild; // Target is larger, move to right child.
            }
        }
        return null; // Value was not found after traversing the relevant path.
    }

    /**
     * Performs an in-order traversal (Left -> Root -> Right) of the tree.
     * This typically retrieves elements in ascending order.
     * @returns {number[]} An array containing all node values in in-order sequence.
     */
    getInOrderTraversal() {
        const collectedValues = []; // Array to store the traversed values.

        // Inner helper function for recursive traversal.
        const performTraversal = (node) => {
            if (node === null) {
                return; // Base case: end of a branch.
            }
            performTraversal(node.leftChild); // Recursively traverse the left subtree.
            collectedValues.push(node.value); // Visit the current node (add its value).
            performTraversal(node.rightChild); // Recursively traverse the right subtree.
        };

        performTraversal(this.rootNode); // Start traversal from the root.
        return collectedValues;
    }

    /**
     * Performs a pre-order traversal (Root -> Left -> Right) of the tree.
     * @returns {number[]} An array containing all node values in pre-order sequence.
     */
    getPreOrderTraversal() {
        const collectedValues = []; // Array to store the traversed values.

        // Inner helper function for recursive traversal.
        const performTraversal = (node) => {
            if (node === null) {
                return; // Base case: end of a branch.
            }
            collectedValues.push(node.value); // Visit the current node first.
            performTraversal(node.leftChild);  // Then traverse the left subtree.
            performTraversal(node.rightChild); // Finally, traverse the right subtree.
        };

        performTraversal(this.rootNode); // Start traversal from the root.
        return collectedValues;
    }

    /**
     * [Type III Addition] Performs a post-order traversal (Left -> Right -> Root) of the tree.
     * This function is added for completeness but not directly used by the main logic in this clone.
     * @returns {number[]} An array containing all node values in post-order sequence.
     */
    getPostOrderTraversal() {
        const collectedValues = [];
        const performTraversal = (node) => {
            if (node === null) {
                return;
            }
            performTraversal(node.leftChild);
            performTraversal(node.rightChild);
            collectedValues.push(node.value);
        };
        performTraversal(this.rootNode);
        return collectedValues;
    }
}

/**
 * Utility function to format an array of numbers into a space-separated string
 * and print it to the console.
 * @param {number[]} valuesArray - The array of numbers to be formatted and displayed.
 */
function formatAndDisplaySequence(valuesArray) {
    // Type III: Guard clause for empty or invalid input array.
    if (!valuesArray || valuesArray.length === 0) {
        console.log(""); // Print an empty line if there are no values.
        return;
    }
    // Formats each item with a leading space and joins them.
    const formattedString = valuesArray.map(item => ` ${item}`).join("");
    console.log(formattedString);
}


/**
 * The main application logic that processes a series of commands to
 * manipulate a Binary Search Tree.
 * @param {string[]} operationCommands - An array of strings, where each string represents a command.
 */
function executeTreeOperations(operationCommands) {
    // Type III: Initial validation for the command input.
    if (operationCommands.length === 0 || !operationCommands[0]) {
        console.error("Error: No operation count line provided in input.");
        return;
    }

    const totalOperations = Number(operationCommands[0]);
    // Type III: Robustness check for the number of operations.
    if (isNaN(totalOperations) || totalOperations < 0) {
        console.error("Error: Invalid or negative number of operations specified.");
        return;
    }

    const myBinaryTree = new BinarySearchTree(); // Instantiate the BST.

    // Process each command line, starting from the second line (index 1),
    // as the first line contains the total count.
    for (let opIndex = 0; opIndex < totalOperations; opIndex++) {
        const currentCommandLine = operationCommands[opIndex + 1];

        // Type III: Skip any empty or whitespace-only lines to prevent errors.
        if (!currentCommandLine || currentCommandLine.trim() === "") {
            continue;
        }

        const commandParts = currentCommandLine.split(" ");
        const actionType = commandParts[0];         // e.g., "insert", "print", "find"
        const commandArgument = Number(commandParts[1]); // The numerical value for the command.

        // Type III: Using more descriptive string commands in the switch statement.
        switch (actionType) {
            case "insert":
                myBinaryTree.addValue(commandArgument);
                break;
            case "print":
                // Display both in-order and pre-order traversals as required.
                formatAndDisplaySequence(myBinaryTree.getInOrderTraversal());
                formatAndDisplaySequence(myBinaryTree.getPreOrderTraversal());
                break;
            case "find":
                // Type III: Use a helper variable for clarity.
                const foundNode = myBinaryTree.locateValue(commandArgument);
                // Type III: Use a ternary operator for concise conditional output.
                console.log(foundNode !== null ? "yes" : "no");
                break;
            default:
                // Type III: Handle unrecognized commands gracefully with a warning.
                console.warn(`Warning: Unrecognized command encountered: '${actionType}' on line ${opIndex + 2}.`);
                break;
        }
    }
}