let rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawData += chunk;
});

const NEWLINE_DELIMITER = '\n';
const SPACE_DELIMITER = ' ';
const OPEN_PARENTHESIS = '(';
const CLOSE_PARENTHESIS = ')';
const COMMA_SEPARATOR_TOKEN = ',';
const UNION_OPERATION_CODE = 'u';
const INTERSECTION_OPERATION_CODE = 'i';

class BinaryNode {
    constructor(initialLeftChild = null, initialRightChild = null) {
        this.leftChild = initialLeftChild;
        this.rightChild = initialRightChild;
        this.parentNode = null;
    }

    static createNewEmptyNode() {
        return new BinaryNode();
    }

    assignChild(childNodeToAttach, isLeftPosition) {
        if (childNodeToAttach) {
            childNodeToAttach.parentNode = this;
            if (isLeftPosition) {
                this.leftChild = childNodeToAttach;
            } else {
                this.rightChild = childNodeToAttach;
            }
        }
    }

    toStructureString() {
        const leftSubtreeString = this.leftChild ? this.leftChild.toStructureString() : '';
        const rightSubtreeString = this.rightChild ? this.rightChild.toStructureString() : '';
        return `${OPEN_PARENTHESIS}${leftSubtreeString}${COMMA_SEPARATOR_TOKEN}${rightSubtreeString}${CLOSE_PARENTHESIS}`;
    }
}

const buildTreeFromPattern = (patternString) => {
    const temporaryRootContainer = BinaryNode.createNewEmptyNode();
    let currentTraversalNode = temporaryRootContainer;
    let isProcessingRightChild = false; // false for left, true for right

    for (const charToken of patternString) {
        switch (charToken) {
            case OPEN_PARENTHESIS:
                const newChildNode = BinaryNode.createNewEmptyNode();
                currentTraversalNode.assignChild(newChildNode, !isProcessingRightChild);
                currentTraversalNode = newChildNode;
                break;
            case COMMA_SEPARATOR_TOKEN:
                isProcessingRightChild = true;
                break;
            case CLOSE_PARENTHESIS:
                currentTraversalNode = currentTraversalNode.parentNode;
                isProcessingRightChild = false;
                break;
            default:
                // Ignore unexpected characters, assuming valid input patterns
                break;
        }
    }
    return temporaryRootContainer.leftChild;
};

const createNodeWithChildren = (leftResultNode, rightResultNode) => {
    const combinedNode = BinaryNode.createNewEmptyNode();
    combinedNode.assignChild(leftResultNode, true);
    combinedNode.assignChild(rightResultNode, false);
    return combinedNode;
};

const performUnionOperation = (nodeA, nodeB) => {
    if (nodeA === null) return nodeB;
    if (nodeB === null) return nodeA;

    const leftCombinedResult = performUnionOperation(nodeA.leftChild, nodeB.leftChild);
    const rightCombinedResult = performUnionOperation(nodeA.rightChild, nodeB.rightChild);

    return createNodeWithChildren(leftCombinedResult, rightCombinedResult);
};

const performIntersectionOperation = (nodeA, nodeB) => {
    if (nodeA === null || nodeB === null) return null;

    const leftIntersectedResult = performIntersectionOperation(nodeA.leftChild, nodeB.leftChild);
    const rightIntersectedResult = performIntersectionOperation(nodeA.rightChild, nodeB.rightChild);

    return createNodeWithChildren(leftIntersectedResult, rightIntersectedResult);
};

const parseInputLineDetails = (inputLine) => {
    const lineParts = inputLine.split(SPACE_DELIMITER);
    return {
        operationType: lineParts[0],
        firstPattern: lineParts[1],
        secondPattern: lineParts[2]
    };
};

const executeTreeComparison = (opType, treeOne, treeTwo) => {
    if (opType === UNION_OPERATION_CODE) {
        return performUnionOperation(treeOne, treeTwo);
    } else if (opType === INTERSECTION_OPERATION_CODE) {
        return performIntersectionOperation(treeOne, treeTwo);
    }
    return null;
};

process.stdin.on('end', function() {
    const processedLines = rawData.split(NEWLINE_DELIMITER);
    processedLines.pop();

    for (const currentLine of processedLines) {
        const { operationType, firstPattern, secondPattern } = parseInputLineDetails(currentLine);
        const parsedTreeOne = buildTreeFromPattern(firstPattern);
        const parsedTreeTwo = buildTreeFromPattern(secondPattern);

        const finalOperationResult = executeTreeComparison(operationType, parsedTreeOne, parsedTreeTwo);
        console.log(finalOperationResult.toStructureString());
    }
});
