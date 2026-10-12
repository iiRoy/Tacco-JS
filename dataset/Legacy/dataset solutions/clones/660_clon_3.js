let rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
    rawData += dataChunk;
});
process.stdin.on('end', function() {
    const processedLines = rawData.split('\n');

    class BinaryNode {
        constructor() {
            this.leftChild = null;
            this.rightChild = null;
            this.parentNode = null;
        }

        attachLeft(nodeToAttach) {
            this.leftChild = nodeToAttach;
            if (nodeToAttach) {
                nodeToAttach.parentNode = this;
            }
        }

        attachRight(nodeToAttach) {
            this.rightChild = nodeToAttach;
            if (nodeToAttach) {
                nodeToAttach.parentNode = this;
            }
        }

        serializeTree() {
            const leftPart = this.leftChild === null ? '' : this.leftChild.serializeTree();
            const rightPart = this.rightChild === null ? '' : this.rightChild.serializeTree();
            return `(${leftPart},${rightPart})`;
        }
    }

    const buildTreeFromString = treeString => {
        const initialNode = new BinaryNode();
        let currentNode = initialNode;
        let commaEncountered = 0;

        if (!treeString || treeString.length === 0) {
            return null;
        }

        for (const charToken of treeString) {
            switch (charToken) {
                case "(":
                    const newChild = new BinaryNode();
                    if (commaEncountered === 0) {
                        currentNode.attachLeft(newChild);
                    } else {
                        currentNode.attachRight(newChild);
                    }
                    currentNode = newChild;
                    break;
                case ",":
                    commaEncountered = 1;
                    break;
                case ")":
                    if (currentNode.parentNode) {
                        currentNode = currentNode.parentNode;
                    }
                    commaEncountered = 0;
                    break;
            }
        }
        return initialNode.leftChild;
    };

    const createAndConditionallyAttach = (parent, childNode, isLeft) => {
        if (childNode !== null) {
            if (isLeft) {
                parent.attachLeft(childNode);
            } else {
                parent.attachRight(childNode);
            }
        }
    };

    const performUnion = (firstTree, secondTree) => {
        if (firstTree === null) return secondTree;
        if (secondTree === null) return firstTree;

        const resultNode = new BinaryNode();

        const leftUnionResult = performUnion(firstTree.leftChild, secondTree.leftChild);
        createAndConditionallyAttach(resultNode, leftUnionResult, true);

        const rightUnionResult = performUnion(firstTree.rightChild, secondTree.rightChild);
        createAndConditionallyAttach(resultNode, rightUnionResult, false);

        return resultNode;
    };

    const performIntersection = (firstTree, secondTree) => {
        if (firstTree === null || secondTree === null) return null;

        const resultNode = new BinaryNode();

        const leftIntersectionResult = performIntersection(firstTree.leftChild, secondTree.leftChild);
        createAndConditionallyAttach(resultNode, leftIntersectionResult, true);

        const rightIntersectionResult = performIntersection(firstTree.rightChild, secondTree.rightChild);
        createAndConditionallyAttach(resultNode, rightIntersectionResult, false);

        return resultNode;
    };

    const INPUT_DELIMITER = ' ';
    for (const currentInputLine of processedLines) {
        if (currentInputLine.trim() === '') continue;

        const [operationType, firstTreeString, secondTreeString] = currentInputLine.split(INPUT_DELIMITER);

        const treeOne = buildTreeFromString(firstTreeString);
        const treeTwo = buildTreeFromString(secondTreeString);

        let finalResultNode;

        const executeOperation = (opType, t1, t2) => {
            if (opType === "u") {
                return performUnion(t1, t2);
            } else if (opType === "i") {
                return performIntersection(t1, t2);
            }
            return null;
        };

        finalResultNode = executeOperation(operationType, treeOne, treeTwo);
    }
});
