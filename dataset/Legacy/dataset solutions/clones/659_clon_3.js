let inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});
process.stdin.on('end', function() {
    const processedInputLines = inputBuffer.split('\n');

    class BinaryTreeNode {
        constructor() {
            this.leftChild = null;
            this.rightChild = null;
            this.parentNode = null;
        }
        attachLeft(childNode) {
            this.leftChild = childNode;
            childNode.parentNode = this;
        }
        attachRight(childNode) {
            this.rightChild = childNode;
            childNode.parentNode = this;
        }
        toString() {
            const leftSubtreeString = this.leftChild ? this.leftChild.toString() : '';
            const rightSubtreeString = this.rightChild ? this.rightChild.toString() : '';
            return `(${leftSubtreeString},${rightSubtreeString})`;
        }
    }

    const buildTreeFromString = (inputString) => {
        const dummyRoot = new BinaryTreeNode(); // A temporary root to simplify initial node handling
        let currentTraversalNode = dummyRoot;
        let commaEncounteredFlag = 0; // 0 for left child, 1 for right child

        for (const charToken of inputString) {
            if (charToken === '(') {
                const newChildNode = new BinaryTreeNode();
                if (commaEncounteredFlag === 0) {
                    currentTraversalNode.attachLeft(newChildNode);
                } else {
                    currentTraversalNode.attachRight(newChildNode);
                }
                currentTraversalNode = newChildNode; // Descend into the new child
            } else if (charToken === ',') {
                commaEncounteredFlag = 1; // Mark that the next child should be right
            } else if (charToken === ')') {
                // Ascend to the parent node
                currentTraversalNode = currentTraversalNode.parentNode;
                commaEncounteredFlag = 0; // Reset for potential next sibling or parent's child
            }
        }
        // The actual tree structure is the left child of the dummy root
        return dummyRoot.leftChild;
    };

    const mergeTrees = (treeA, treeB) => {
        // Handle base cases where one or both trees are null
        if (treeA === null) {
            return treeB;
        }
        if (treeB === null) {
            return treeA;
        }

        const resultNode = new BinaryTreeNode();
        
        // Recursively merge left subtrees
        const mergedLeftSubtree = mergeTrees(treeA.leftChild, treeB.leftChild);
        if (mergedLeftSubtree !== null) {
            resultNode.attachLeft(mergedLeftSubtree);
        }

        // Recursively merge right subtrees
        const mergedRightSubtree = mergeTrees(treeA.rightChild, treeB.rightChild);
        if (mergedRightSubtree !== null) {
            resultNode.attachRight(mergedRightSubtree);
        }
        
        return resultNode;
    };

    const findCommonStructure = (treeA, treeB) => {
        // Base case: if either tree is null, there's no common structure
        if (treeA === null || treeB === null) {
            return null;
        }

        const resultNode = new BinaryTreeNode();
        
        // Recursively find common structure in left subtrees
        const commonLeftSubtree = findCommonStructure(treeA.leftChild, treeB.leftChild);
        if (commonLeftSubtree !== null) {
            resultNode.attachLeft(commonLeftSubtree);
        }

        // Recursively find common structure in right subtrees
        const commonRightSubtree = findCommonStructure(treeA.rightChild, treeB.rightChild);
        if (commonRightSubtree !== null) {
            resultNode.attachRight(commonRightSubtree);
        }
        
        return resultNode;
    };

    // Function to process a single line of input and perform the tree operation
    const executeTreeOperation = (lineContent) => {
        const lineSegments = lineContent.split(' ');
        const operationType = lineSegments[0];
        const firstTreeString = lineSegments[1];
        const secondTreeString = lineSegments[2];

        const treeOne = buildTreeFromString(firstTreeString);
        const treeTwo = buildTreeFromString(secondTreeString);

        let operationResultTree;

        if (operationType === "u") {
            operationResultTree = mergeTrees(treeOne, treeTwo);
        } else if (operationType === "i") {
            operationResultTree = findCommonStructure(treeOne, treeTwo);
        }
        
        return operationResultTree;
    };

    for (const currentLine of processedInputLines) {
        const finalOutputTree = executeTreeOperation(currentLine);
        console.log(finalOutputTree.toString());
    }
});
