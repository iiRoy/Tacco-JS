/*
 * This file defines a class for a binary search tree data structure
 * and an associated node class, along with methods for common tree operations.
 */
class TreeNode {
    // Constructor initializes a new tree node
    constructor(
        val, // The value stored in this node
        ancestor = null, // Reference to the parent node
        childL = null, // Reference to the left child node
        childR = null // Reference to the right child node
    ) {
        this.value = val; // Assign the provided value
        this.ancestor = ancestor; // Set the parent reference
        this.childL = childL; // Set the left child reference
        this.childR = childR; // Set the right child reference
    }

    // Determines the total count of direct children for this node
    countChildren() {
        return (this.childL ? 1 : 0) + (this.childR ? 1 : 0);
    }

    // Checks if this node is the left child of its parent
    isLeftBranch() {
        if (this.ancestor === null) {
            return null; // A root node has no parent, so it's neither left nor right child
        }
        return this.ancestor.childL === this; // Compare with parent's left child
    }

    // Returns a string indicating whether this node is a 'childL' or 'childR' of its parent
    getBranchType() {
        return this.isLeftBranch() ? 'childL' : 'childR';
    }

    // Locates the in-order successor of this node
    findNextInOrder() {
        let currentElement; // Temporary variable for traversal

        // If a right child exists, the successor is the leftmost node in the right subtree
        if (this.childR !== null) {
            currentElement = this.childR;
            while (currentElement.childL !== null) {
                currentElement = currentElement.childL;
            }
        }
        // If no right child, the successor is the first ancestor for which this node is in its left subtree
        else {
            currentElement = this.ancestor;
            // Traverse up until we are a left child or reach the root
            while (!currentElement.isLeftBranch && currentElement.ancestor != null) {
                currentElement = currentElement.ancestor;
            }
        }
        return currentElement; // Return the found successor node
    }
}

/*
 * This class implements a Binary Search Tree (BST)
 * and provides methods to manipulate its structure.
 */
class OrderedTree {
    // Initializes an empty tree
    constructor() {
        this.topNode = null; // The root of the tree
    }

    // Static getter to expose the internal node class
    static get TreeElement() {
        return TreeNode;
    }

    // Adds a new value into the tree, maintaining BST properties
    addValue(val) {
        // If the tree is empty, the new value becomes the root
        if (this.topNode === null) {
            this.topNode = new OrderedTree.TreeElement(val);
            return;
        }

        let traversalNode = this.topNode; // Starts traversal from the root
        let previousNode; // Keeps track of the parent of the current node

        // Create a new node for the value to be inserted
        let newElement = new OrderedTree.TreeElement(val);

        // Traverse the tree to find the correct insertion point
        while (traversalNode !== null) {
            previousNode = traversalNode; // Update parent tracker
            // Move left or right based on the value comparison
            traversalNode = traversalNode[val < traversalNode.value ? 'childL' : 'childR'];
        }

        // Link the new node to its parent
        newElement.ancestor = previousNode;
        // Place the new node as the left or right child of its parent
        previousNode[val < previousNode.value ? 'childL' : 'childR'] = newElement;
    }

    // Searches for a specific value within the tree
    locateValue(val, startNode = this.topNode) {
        // Base case: if node is null or value found, return the node
        if (startNode === null || startNode.value === val) {
            return startNode;
        }
        // Recursively search in the appropriate subtree
        return this.locateValue(val, startNode[val < startNode.value ? 'childL' : 'childR']);
    }

    // Removes a node with a given value from the tree
    removeValue(val) {
        const targetNode = this.locateValue(val); // Find the node to be removed
        // If the node isn't found, do nothing (or throw error, depending on requirements)
        if (!targetNode) return;

        // Determine if the node is a left or right child of its parent
        const branchSide = targetNode.getBranchType();

        // Handle deletion based on the number of children the target node has
        switch (targetNode.countChildren()) {
            case 0: // Case 1: Node has no children (it's a leaf)
                if (targetNode === this.topNode) {
                    this.topNode = null; // If it's the root, tree becomes empty
                } else {
                    targetNode.ancestor[branchSide] = null; // Disconnect from parent
                }
                break;
            case 1: // Case 2: Node has one child
                const childToPromote = targetNode.childL || targetNode.childR; // Get the single child
                if (targetNode === this.topNode) {
                    this.topNode = childToPromote; // Promote child to root
                    childToPromote.ancestor = null;
                } else {
                    targetNode.ancestor[branchSide] = childToPromote; // Link parent to grandchild
                    childToPromote.ancestor = targetNode.ancestor; // Update grandchild's parent
                }
                break;
            default: // Case 3: Node has two children
                // Find the in-order successor (smallest in right subtree)
                const successorValue = targetNode.findNextInOrder().value;
                this.removeValue(successorValue); // Recursively delete the successor
                targetNode.value = successorValue; // Replace target node's value with successor's value
        }
    }

    // Prints the tree elements in in-order traversal
    displayInOrder() {
        let outputString = ''; // String to accumulate printed values

        // Recursive helper function for in-order traversal
        const recursiveDisplay = (currentTreeElement) => {
            if (currentTreeElement === null) {
                return; // Base case: end of branch
            }
            recursiveDisplay(currentTreeElement.childL); // Traverse left subtree
            outputString += ` ${currentTreeElement.value}`; // Visit current node
            recursiveDisplay(currentTreeElement.childR); // Traverse right subtree
        };

        recursiveDisplay(this.topNode); // Start traversal from the root
        printToConsole(outputString); // Output the accumulated string
    }

    // Prints the tree elements in pre-order traversal
    displayPreOrder() {
        let outputString = ''; // String to accumulate printed values

        // Recursive helper function for pre-order traversal
        const recursiveDisplay = (currentTreeElement) => {
            if (currentTreeElement === null) {
                return; // Base case: end of branch
            }
            outputString += ` ${currentTreeElement.value}`; // Visit current node
            recursiveDisplay(currentTreeElement.childL); // Traverse left subtree
            recursiveDisplay(currentTreeElement.childR); // Traverse right subtree
        };

        recursiveDisplay(this.topNode); // Start traversal from the root
        printToConsole(outputString); // Output the accumulated string
    }

    // Displays both in-order and pre-order traversals of the tree
    showAll() {
        this.displayInOrder();
        this.displayPreOrder();
    }
}

// Global function to simulate console.log for cloning purposes
const printToConsole = (message) => console.log(message);

// Global function to simulate Number() for cloning purposes
const parseNumber = (input) => Number(input);

// Global function to simulate String.prototype.trim()
String.prototype.stripWhitespace = function() {
    return this.trim();
};

// Global function to simulate String.prototype.charAt(0)
String.prototype.getFirstChar = function() {
    return this.charAt(0);
};

// Main execution block wrapped in an IIFE
(function executeProgram() {
    // Obtain necessary file system module and read input
    const obtainModule = require;
    const fileSystem = obtainModule('fs');
    const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').stripWhitespace().split('\n');

    // Extract the number of commands (though not explicitly used later)
    const numCommands = parseNumber(inputLines.shift());

    // Create a new instance of the ordered tree
    const myTree = new OrderedTree();

    // Process each command line from the input
    inputLines.forEach(function(commandLine) {
        // Use the first character of the command to determine action
        switch (commandLine.getFirstChar()) {
            case 'i': // Insert command
                myTree.addValue(parseNumber(commandLine.split(' ')[1]));
                break;
            case 'f': // Find command
                printToConsole(myTree.locateValue(parseNumber(commandLine.split(' ')[1])) ? 'yes' : 'no');
                break;
            case 'd': // Delete command
                myTree.removeValue(parseNumber(commandLine.split(' ')[1]));
                break;
            default: // Default case, typically for 'p' (print)
                myTree.showAll();
        }
    });
})();