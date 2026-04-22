let dataBuffer = ''; // Buffer to accumulate incoming standard input data

process.stdin.resume(); // Ensure the standard input stream is active
process.stdin.setEncoding('utf8'); // Configure input stream to use UTF-8 character encoding

// Attach a callback function to handle incoming data chunks from stdin
process.stdin.on('data', function (dataSegment) {
    dataBuffer += dataSegment; // Append each received data segment to the buffer
});

// Attach a callback function to execute when the standard input stream ends
process.stdin.on('end', function () {
    // Parse the accumulated data buffer into an array of individual lines
    const processedLines = dataBuffer.split('\n');

    // Define the structure for a binary tree node
    class BinaryTreeNode {
        // Constructor method for initializing a new tree node
        constructor() {
            this.leftChild = null;  // Reference to the node's left child
            this.rightChild = null; // Reference to the node's right child
            this.parentNode = null; // Reference to the node's parent
        }

        // Method to assign a new node as the left child
        attachLeft(childNode) {
            this.leftChild = childNode;
            childNode.parentNode = this; // Set the parent reference for the child
        }

        // Method to assign a new node as the right child
        attachRight(childNode) {
            this.rightChild = childNode;
            childNode.parentNode = this; // Set the parent reference for the child
        }

        // Generates a string representation of the subtree rooted at this node
        representAsString() {
            // Recursively builds the string, handling null children
            return `(${this.leftChild === null ? '' : this.leftChild.representAsString()},${this.rightChild === null ? '' : this.rightChild.representAsString()})`;
        }
    }

    // Function to construct a binary tree from a specific string format
    const buildTreeStructure = treeRepresentationString => {
        const treeRoot = new BinaryTreeNode(); // Create a dummy root node
        let currentTraversalNode = treeRoot;    // Pointer to the current node during parsing
        let separatorFlag = 0;                  // Flag: 0 for left child, 1 for right child

        // Iterate through each character of the input string
        for (const characterSymbol of treeRepresentationString) {
            if (characterSymbol === "(") {
                const newlyCreatedChild = new BinaryTreeNode(); // Instantiate a new child node
                if (separatorFlag === 0) {
                    currentTraversalNode.attachLeft(newlyCreatedChild); // Insert as left child
                } else {
                    currentTraversalNode.attachRight(newlyCreatedChild); // Insert as right child
                }
                currentTraversalNode = newlyCreatedChild; // Move traversal pointer to the new child
            }
            if (characterSymbol === ",") {
                separatorFlag = 1; // Change flag to indicate subsequent child is right
            }
            if (characterSymbol === ")") {
                currentTraversalNode = currentTraversalNode.parentNode; // Ascend to the parent node
                separatorFlag = 0; // Reset flag for potential next left child
            }
        }
        return treeRoot.leftChild; // Return the actual root of the constructed tree
    };

    // Computes the union of two binary trees recursively
    const combineTrees = (firstTree, secondTree) => {
        const newNode = new BinaryTreeNode(); // Create a new node for the combined result
        if (firstTree === null) return secondTree; // If the first tree is empty, union is the second
        if (secondTree === null) return firstTree; // If the second tree is empty, union is the first

        // Recursively combine the left subtrees
        let resultantSubtree = combineTrees(firstTree.leftChild, secondTree.leftChild);
        if (resultantSubtree !== null) {
            newNode.attachLeft(resultantSubtree); // Attach combined left subtree
        }

        // Recursively combine the right subtrees
        resultantSubtree = combineTrees(firstTree.rightChild, secondTree.rightChild);
        if (resultantSubtree !== null) {
            newNode.attachRight(resultantSubtree); // Attach combined right subtree
        }
        return newNode; // Return the new node representing the union
    };

    // Computes the intersection of two binary trees recursively
    const findCommonParts = (firstTree, secondTree) => {
        const newNode = new BinaryTreeNode(); // Create a new node for the intersection result
        if (firstTree === null || secondTree === null) return null; // If either tree is empty, intersection is null

        // Recursively find common parts in the left subtrees
        let resultantSubtree = findCommonParts(firstTree.leftChild, secondTree.leftChild);
        if (resultantSubtree !== null) {
            newNode.attachLeft(resultantSubtree); // Attach intersected left subtree
        }

        // Recursively find common parts in the right subtrees
        resultantSubtree = findCommonParts(firstTree.rightChild, secondTree.rightChild);
        if (resultantSubtree !== null) {
            newNode.attachRight(resultantSubtree); // Attach intersected right subtree
        }
        return newNode; // Return the new node representing the intersection
    };

    // Process each individual line of input data
    for (const currentInputLine of processedLines) {
        // Split the line into operation type and two tree string representations
        const [operationKind, firstTreeString, secondTreeString] = currentInputLine.split(' ');

        // Construct the binary trees from their string inputs
        const parsedTreeOne = buildTreeStructure(firstTreeString);
        const parsedTreeTwo = buildTreeStructure(secondTreeString);

        let finalOutcome; // Variable to hold the result of the tree operation

        // Determine which tree operation to perform based on the 'operationKind'
        if (operationKind === "u") {
            finalOutcome = combineTrees(parsedTreeOne, parsedTreeTwo); // Perform union operation
        } else if (operationKind === "i") {
            finalOutcome = findCommonParts(parsedTreeOne, parsedTreeTwo); // Perform intersection operation
        }
        // Output the string representation of the final tree structure to the console
        console.log(finalOutcome.representAsString());
    }
});