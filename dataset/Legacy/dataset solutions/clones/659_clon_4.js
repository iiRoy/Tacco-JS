let allInputs = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
    allInputs += dataChunk;
});
process.stdin.on('end', function() {
    const inputLines = allInputs.split('\n');

    // Tree representation: [leftChild, rightChild]
    // null represents an empty branch.

    const parseTreeString = (inputString) => {
        if (inputString.length === 0) {
            return null;
        }

        let nodeStack = []; // Stores references to parent arrays
        let currentBranch = null; // The root of the tree being built
        let isLeftChild = true; // Flag to determine if we're assigning to left or right

        for (const char of inputString) {
            if (char === '(') {
                const newNode = [null, null]; // Create a new node (array)
                if (currentBranch === null) {
                    currentBranch = newNode; // This is the very first node
                } else {
                    // Assign the new node to the current parent's left or right child
                    const parentNode = nodeStack[nodeStack.length - 1];
                    if (isLeftChild) {
                        parentNode[0] = newNode;
                    } else {
                        parentNode[1] = newNode;
                    }
                }
                nodeStack.push(newNode); // Push the new node onto the stack as the current parent
                isLeftChild = true; // A new node always starts with its left child
            } else if (char === ',') {
                isLeftChild = false; // Switch to processing the right child
            } else if (char === ')') {
                nodeStack.pop(); // Go up to the parent node
            }
        }
        return currentBranch;
    };

    const uniteTrees = (treeA, treeB) => {
        if (treeA === null) {
            return treeB;
        }
        if (treeB === null) {
            return treeA;
        }

        const leftResult = uniteTrees(treeA[0], treeB[0]);
        const rightResult = uniteTrees(treeA[1], treeB[1]);

        return [leftResult, rightResult];
    };

    const intersectTrees = (treeA, treeB) => {
        if (treeA === null || treeB === null) {
            return null;
        }

        const leftResult = intersectTrees(treeA[0], treeB[0]);
        const rightResult = intersectTrees(treeA[1], treeB[1]);

        // The original implementation always creates a node if both inputs are non-null,
        // even if both children are null. So we return a new array here.
        return [leftResult, rightResult];
    };

    const renderTree = (currentTree) => {
        if (currentTree === null) {
            return '';
        }
        const leftPart = renderTree(currentTree[0]);
        const rightPart = renderTree(currentTree[1]);
        return `(${leftPart},${rightPart})`;
    };

    for (const currentInput of inputLines) {
        const [operationType, treeStringOne, treeStringTwo] = currentInput.split(' ');
        const treeOne = parseTreeString(treeStringOne);
        const treeTwo = parseTreeString(treeStringTwo);

        let resultTree;
        if (operationType === "u") {
            resultTree = uniteTrees(treeOne, treeTwo);
        } else if (operationType === "i") {
            resultTree = intersectTrees(treeOne, treeTwo);
        }
        console.log(renderTree(resultTree));
    }
});
