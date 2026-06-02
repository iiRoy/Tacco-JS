let rawInputData = '';

// Begin listening for incoming data from standard input.
process.stdin.resume();

// Set the character encoding for the input stream.
process.stdin.setEncoding('utf8');

// Accumulate data chunks as they arrive.
process.stdin.on('data', function(chunkSegment) {
    rawInputData += chunkSegment;
});

// Process all accumulated input once the stream ends.
process.stdin.on('end', function() {
    const processedLines = rawInputData.split('\n');

    // Defines a class for nodes within a binary tree structure.
    class BinaryTreeNode {
        constructor() {
            this.leftChild = null;
            this.rightChild = null;
            this.parentNode = null;
        }

        // Links a given node as the left child of the current node.
        attachLeft(childNode) {
            this.leftChild = childNode;
            childNode.parentNode = this;
        }

        // Links a given node as the right child of the current node.
        attachRight(childNode) {
            this.rightChild = childNode;
            childNode.parentNode = this;
        }

        // Provides a string representation of the node and its children.
        representAsString() {
            return `(${this.leftChild === null ? '' : this.leftChild.representAsString()},${this.rightChild === null ? '' : this.rightChild.representAsString()})`;
        }
    }

    // Constructs a binary tree from a string representation.
    const buildBinaryTree = treeStructureString => {
        const baseNode = new BinaryTreeNode();
        let currentTraversalNode = baseNode;
        let separatorFlag = 0; // 0 for left child, 1 for right child

        for (const charSymbol of treeStructureString) {
            if (charSymbol === "(") {
                const newNodeInstance = new BinaryTreeNode();
                if (separatorFlag === 0) {
                    currentTraversalNode.attachLeft(newNodeInstance);
                } else {
                    currentTraversalNode.attachRight(newNodeInstance);
                }
                currentTraversalNode = newNodeInstance;
            }
            if (charSymbol === ",") {
                separatorFlag = 1; // Switch to right child insertion
            }
            if (charSymbol === ")") {
                currentTraversalNode = currentTraversalNode.parentNode;
                separatorFlag = 0; // Reset to left child for parent's next child
            }
        }
        return baseNode.leftChild; // The actual root of the constructed tree
    };

    // Performs a union operation on two binary trees.
    const performUnionOperation = (firstTree, secondTree) => {
        const resultantNode = new BinaryTreeNode();

        if (firstTree === null) {
            return secondTree;
        }
        if (secondTree === null) {
            return firstTree;
        }

        let recursiveResult = performUnionOperation(firstTree.leftChild, secondTree.leftChild);
        if (recursiveResult !== null) {
            resultantNode.attachLeft(recursiveResult);
        }

        recursiveResult = performUnionOperation(firstTree.rightChild, secondTree.rightChild);
        if (recursiveResult !== null) {
            resultantNode.attachRight(recursiveResult);
        }

        return resultantNode;
    };

    // Performs an intersection operation on two binary trees.
    const performIntersectionOperation = (treeOne, treeTwo) => {
        const outputNode = new BinaryTreeNode();

        if (treeOne === null || treeTwo === null) {
            return null;
        }

        let subResult = performIntersectionOperation(treeOne.leftChild, treeTwo.leftChild);
        if (subResult !== null) {
            outputNode.attachLeft(subResult);
        }

        subResult = performIntersectionOperation(treeOne.rightChild, treeTwo.rightChild);
        if (subResult !== null) {
            outputNode.attachRight(subResult);
        }

        return outputNode;
    };

    // Iterate through each line of input to perform tree operations.
    for (const currentInputLine of processedLines) {
        const [operationType, firstTreeString, secondTreeString] = currentInputLine.split(' ');
        const parsedTreeOne = buildBinaryTree(firstTreeString);
        const parsedTreeTwo = buildBinaryTree(secondTreeString);

        let finalOperationResult;
        if (operationType === "u") {
            finalOperationResult = performUnionOperation(parsedTreeOne, parsedTreeTwo);
        } else if (operationType === "i") {
            finalOperationResult = performIntersectionOperation(parsedTreeOne, parsedTreeTwo);
        }
        // The original code does not output the result, so we maintain that behavior.
    }
});
