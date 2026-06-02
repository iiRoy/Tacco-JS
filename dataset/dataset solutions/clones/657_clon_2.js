let rawInputData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks
process.stdin.on('data', function(dataSegment) {
    rawInputData += dataSegment; // Accumulate all input data
});

// Event listener for end of input stream
process.stdin.on('end', function() {
    // Split the accumulated input into individual lines
    const processedLines = rawInputData.split('\n');
    // Remove the last empty line if present (common with stdin)
    processedLines.pop();

    /**
     * Represents a node in a binary tree structure.
     * Each node can have a left child, a right child, and a parent.
     */
    class BinaryNode {
        constructor() {
            this.leftChild = null;  // Reference to the left child node
            this.rightChild = null; // Reference to the right child node
            this.parentNode = null; // Reference to the parent node
        }

        /**
         * Attaches a given node as the left child of the current node.
         * Also sets the parent of the child node.
         * @param {BinaryNode} childNode - The node to be inserted as the left child.
         */
        attachLeft(childNode) {
            this.leftChild = childNode;
            childNode.parentNode = this;
        }

        /**
         * Attaches a given node as the right child of the current node.
         * Also sets the parent of the child node.
         * @param {BinaryNode} childNode - The node to be inserted as the right child.
         */
        attachRight(childNode) {
            this.rightChild = childNode;
            childNode.parentNode = this;
        }

        /**
         * Returns a string representation of the node's children structure.
         * This is used for printing the tree.
         * @returns {string} - A string like "(left_child_str,right_child_str)".
         */
        toStructureString() {
            const leftPart = this.leftChild === null ? '' : this.leftChild.toStructureString();
            const rightPart = this.rightChild === null ? '' : this.rightChild.toStructureString();
            return `(${leftPart},${rightPart})`;
        }
    }

    /**
     * Parses a string representation of a binary tree and constructs the tree.
     * The string format is like "(left,right)".
     * @param {string} inputString - The string to parse.
     * @returns {BinaryNode} - The root node of the constructed tree.
     */
    const buildBinaryTree = (inputString) => {
        const baseNode = new BinaryNode(); // A dummy root to hold the actual tree
        let currentNode = baseNode;        // Pointer to the current node being processed
        let commaEncountered = 0;          // Flag to distinguish left/right child insertion

        // Iterate over each character in the input string
        for (const charSymbol of inputString) {
            if (charSymbol === "(") {
                const newNode = new BinaryNode();
                if (commaEncountered === 0) {
                    currentNode.attachLeft(newNode); // Insert as left child
                } else {
                    currentNode.attachRight(newNode); // Insert as right child
                }
                currentNode = newNode; // Move down to the new child
            }
            if (charSymbol === ",") {
                commaEncountered = 1; // Next child will be a right child
            }
            if (charSymbol === ")") {
                currentNode = currentNode.parentNode; // Move up to the parent
                commaEncountered = 0; // Reset for next sibling or parent's next child
            }
        }
        return baseNode.leftChild; // The actual root of the tree is the left child of the dummy root
    };

    /**
     * Computes the union of two binary trees.
     * The union includes nodes present in either tree at corresponding positions.
     * @param {BinaryNode} firstTree - The first tree.
     * @param {BinaryNode} secondTree - The second tree.
     * @returns {BinaryNode} - The root of the resulting union tree.
     */
    const combineTrees = (firstTree, secondTree) => {
        const resultNode = new BinaryNode(); // Create a new node for the result

        // Base cases: if one tree is null, return the other
        if (firstTree === null) return secondTree;
        if (secondTree === null) return firstTree;

        // Recursively compute union for left children
        let recursiveResult = combineTrees(firstTree.leftChild, secondTree.leftChild);
        if (recursiveResult !== null) {
            resultNode.attachLeft(recursiveResult);
        }

        // Recursively compute union for right children
        recursiveResult = combineTrees(firstTree.rightChild, secondTree.rightChild);
        if (recursiveResult !== null) {
            resultNode.attachRight(recursiveResult);
        }

        return resultNode; // Return the constructed union node
    };

    /**
     * Computes the intersection of two binary trees.
     * The intersection includes nodes present in both trees at corresponding positions.
     * @param {BinaryNode} treeA - The first tree.
     * @param {BinaryNode} treeB - The second tree.
     * @returns {BinaryNode} - The root of the resulting intersection tree, or null if no common nodes.
     */
    const findCommonNodes = (treeA, treeB) => {
        // If either tree is null, there's no intersection at this position
        if (treeA === null || treeB === null) return null;

        const commonNode = new BinaryNode(); // Create a new node for the intersection result

        // Recursively compute intersection for left children
        let subResult = findCommonNodes(treeA.leftChild, treeB.leftChild);
        if (subResult !== null) {
            commonNode.attachLeft(subResult);
        }

        // Recursively compute intersection for right children
        subResult = findCommonNodes(treeA.rightChild, treeB.rightChild);
        if (subResult !== null) {
            commonNode.attachRight(subResult);
        }

        return commonNode; // Return the constructed intersection node
    };

    // Process each line of input
    for (const currentLine of processedLines) {
        // Destructure the line into operation type and two tree strings
        const [operationType, firstTreeString, secondTreeString] = currentLine.split(' ');

        // Build the binary trees from their string representations
        const parsedTreeOne = buildBinaryTree(firstTreeString);
        const parsedTreeTwo = buildBinaryTree(secondTreeString);

        let finalResultTree; // Variable to hold the result of the operation

        // Perform union or intersection based on the operation type
        if (operationType === "u") {
            finalResultTree = combineTrees(parsedTreeOne, parsedTreeTwo);
        } else if (operationType === "i") {
            finalResultTree = findCommonNodes(parsedTreeOne, parsedTreeTwo);
        }

        // Print the string representation of the resulting tree
        console.log(finalResultTree.toStructureString());
    }
});
