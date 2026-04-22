let inputBufferAccumulator = '';

process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataSegment) {
    inputBufferAccumulator += dataSegment;
});

process.stdin.on('end', function() {
    const processedInputLines = inputBufferAccumulator.split('\n').filter(line => line.trim() !== '');

    class BinaryTreeNode {
        constructor() {
            this.leftChildRef = null;
            this.rightChildRef = null;
            this.parentLink = null;
        }

        setLeftChild(newChildNode) {
            this.leftChildRef = newChildNode;
            if (newChildNode instanceof BinaryTreeNode) {
                newChildNode.parentLink = this;
            }
        }

        setRightChild(newChildNode) {
            this.rightChildRef = newChildNode;
            if (newChildNode instanceof BinaryTreeNode) {
                newChildNode.parentLink = this;
            }
        }

        serializeTreeStructure() {
            const leftPart = this.leftChildRef ? this.leftChildRef.serializeTreeStructure() : '';
            const rightPart = this.rightChildRef ? this.rightChildRef.serializeTreeStructure() : '';
            return `(${leftPart},${rightPart})`;
        }
    }

    const buildTreeFromRepresentation = (serializedTreeString) => {
        if (!serializedTreeString || serializedTreeString.length === 0) {
            return null;
        }

        const virtualRootNode = new BinaryTreeNode();
        let currentTraversalNode = virtualRootNode;
        let isRightChildContext = false;

        for (const currentChar of serializedTreeString) {
            switch (currentChar) {
                case '(':
                    const newTreeNode = new BinaryTreeNode();
                    if (!isRightChildContext) {
                        currentTraversalNode.setLeftChild(newTreeNode);
                    } else {
                        currentTraversalNode.setRightChild(newTreeNode);
                        isRightChildContext = false;
                    }
                    currentTraversalNode = newTreeNode;
                    break;
                case ',':
                    isRightChildContext = true;
                    break;
                case ')':
                    if (currentTraversalNode.parentLink) {
                        currentTraversalNode = currentTraversalNode.parentLink;
                    } else {
                        console.warn("Malformed tree string: attempting to ascend from virtual root.");
                    }
                    isRightChildContext = false;
                    break;
                default:
                    console.warn(`Unexpected character encountered during tree parsing: '${currentChar}'`);
                    break;
            }
        }
        return virtualRootNode.leftChildRef;
    };

    const performUnion = (treeOne, treeTwo) => {
        if (treeOne === null && treeTwo === null) {
            return null;
        }
        if (treeOne === null) {
            return treeTwo;
        }
        if (treeTwo === null) {
            return treeOne;
        }

        const unionNode = new BinaryTreeNode();

        const unionLeft = performUnion(treeOne.leftChildRef, treeTwo.leftChildRef);
        if (unionLeft !== null) {
            unionNode.setLeftChild(unionLeft);
        }

        const unionRight = performUnion(treeOne.rightChildRef, treeTwo.rightChildRef);
        if (unionRight !== null) {
            unionNode.setRightChild(unionRight);
        }

        return unionNode;
    };

    const performIntersection = (treeOne, treeTwo) => {
        if (treeOne === null || treeTwo === null) {
            return null;
        }

        const intersectionNode = new BinaryTreeNode();

        const intersectionLeft = performIntersection(treeOne.leftChildRef, treeTwo.leftChildRef);
        if (intersectionLeft !== null) {
            intersectionNode.setLeftChild(intersectionLeft);
        }

        const intersectionRight = performIntersection(treeOne.rightChildRef, treeTwo.rightChildRef);
        if (intersectionRight !== null) {
            intersectionNode.setRightChild(intersectionRight);
        }

        return intersectionNode;
    };

    for (const currentLineData of processedInputLines) {
        const [operationIdentifier, firstTreeString, secondTreeString] = currentLineData.split(' ');

        const parsedTreeA = buildTreeFromRepresentation(firstTreeString);
        const parsedTreeB = buildTreeFromRepresentation(secondTreeString);

        let operationResultTree = null;

        switch (operationIdentifier) {
            case "u":
                operationResultTree = performUnion(parsedTreeA, parsedTreeB);
                break;
            case "i":
                operationResultTree = performIntersection(parsedTreeA, parsedTreeB);
                break;
            default:
                console.error(`Error: Unknown operation identifier '${operationIdentifier}' for line: ${currentLineData}`);
                continue;
        }

        if (operationResultTree !== null) {
            console.log(operationResultTree.serializeTreeStructure());
        } else {
            console.log("()"); // Output for an empty or null resulting tree
        }
    }
});