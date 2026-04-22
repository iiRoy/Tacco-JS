let rawDataBuffer = '';

process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', (receivedSegment) => {
    rawDataBuffer += receivedSegment;
});

process.stdin.on('end', () => {
    let processedLines = rawDataBuffer.split('\n');

    processedLines = processedLines.filter(line => line.trim().length > 0);

    if (processedLines.length === 0) {
        return;
    }

    class TreePart {
        constructor() {
            this.leftChild = null;
            this.rightChild = null;
            this.upLink = null;
        }

        setLeftChild(childNode) {
            this.leftChild = childNode;
            if (childNode instanceof TreePart) {
                childNode.upLink = this;
            }
        }

        setRightChild(childNode) {
            this.rightChild = childNode;
            if (childNode instanceof TreePart) {
                childNode.upLink = this;
            }
        }

        serializeStructure() {
            const leftBranchString = this.leftChild ? this.leftChild.serializeStructure() : '';
            const rightBranchString = this.rightChild ? this.rightChild.serializeStructure() : '';
            return `(${leftBranchString},${rightBranchString})`;
        }
    }

    const parseTreeStructure = (structureString) => {
        if (typeof structureString !== 'string' || structureString.length === 0) {
            return null;
        }

        const dummyRootContainer = new TreePart();
        let currentBranchReference = dummyRootContainer;
        let branchDirectionIndicator = 0;

        for (let charIndex = 0; charIndex < structureString.length; ++charIndex) {
            const currentSymbol = structureString[charIndex];

            if (currentSymbol === '(') {
                const newChildPart = new TreePart();
                if (branchDirectionIndicator === 0) {
                    currentBranchReference.setLeftChild(newChildPart);
                } else {
                    currentBranchReference.setRightChild(newChildPart);
                }
                currentBranchReference = newChildPart;
            }
            else if (currentSymbol === ',') {
                branchDirectionIndicator = 1;
            }
            else if (currentSymbol === ')') {
                if (currentBranchReference.upLink) {
                    currentBranchReference = currentBranchReference.upLink;
                }
                branchDirectionIndicator = 0;
            }
        }

        return dummyRootContainer.leftChild;
    };

    const combineNodes = (firstTreePart, secondTreePart) => {
        if (!firstTreePart && !secondTreePart) {
            return null;
        }
        if (!firstTreePart) {
            return secondTreePart;
        }
        if (!secondTreePart) {
            return firstTreePart;
        }

        const unionResultNode = new TreePart();

        const combinedLeftBranch = combineNodes(firstTreePart.leftChild, secondTreePart.leftChild);
        if (combinedLeftBranch) {
            unionResultNode.setLeftChild(combinedLeftBranch);
        }

        const combinedRightBranch = combineNodes(firstTreePart.rightChild, secondTreePart.rightChild);
        if (combinedRightBranch) {
            unionResultNode.setRightChild(combinedRightBranch);
        }

        return unionResultNode;
    };

    const findCommonParts = (leftOperand, rightOperand) => {
        if (!leftOperand || !rightOperand) {
            return null;
        }

        const commonNodeResult = new TreePart();

        const commonLeftBranch = findCommonParts(leftOperand.leftChild, rightOperand.leftChild);
        if (commonLeftBranch) {
            commonNodeResult.setLeftChild(commonLeftBranch);
        }

        const commonRightBranch = findCommonParts(leftOperand.rightChild, rightOperand.rightChild);
        if (commonRightBranch) {
            commonNodeResult.setRightChild(commonRightBranch);
        }
        
        return commonNodeResult;
    };

    const executeTreeOperation = (line) => {
        const lineSegments = line.split(' ');

        if (lineSegments.length !== 3) {
            console.error(`Error: Invalid input line format. Expected "type tree1 tree2", but received: "${line}". Skipping.`);
            return;
        }

        const [operationType, firstTreeString, secondTreeString] = lineSegments;

        const parsedTree1 = parseTreeStructure(firstTreeString);
        const parsedTree2 = parseTreeStructure(secondTreeString);

        let operationOutcome = null;

        switch (operationType) {
            case "u":
                operationOutcome = combineNodes(parsedTree1, parsedTree2);
                break;
            case "i":
                operationOutcome = findCommonParts(parsedTree1, parsedTree2);
                break;
            default:
                console.error(`Error: Unknown operation type "${operationType}" for line: "${line}". Skipping.`);
                return;
        }

        const finalOutputString = operationOutcome ? operationOutcome.serializeStructure() : "()";

        console.log(finalOutputString);
    };

    for (const currentLine of processedLines) {
        executeTreeOperation(currentLine);
    }
});