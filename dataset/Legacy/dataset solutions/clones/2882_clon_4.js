class InputProcessor {
    constructor(sourceContent) {
        this.lineSegments = sourceContent.trim().split("\n");
        this.currentLinePointer = 0;
        this.currentTokenBuffer = [];
    }

    retrieveToken(asString = false) {
        while (this.currentTokenBuffer.length === 0 && this.currentLinePointer < this.lineSegments.length) {
            this.currentTokenBuffer = this.lineSegments[this.currentLinePointer++].split(" ");
        }
        if (this.currentTokenBuffer.length === 0) {
            return undefined;
        }
        const extractedToken = this.currentTokenBuffer.shift();
        return asString ? extractedToken : Number(extractedToken);
    }

    retrieveLine(asStrings = false) {
        if (this.currentLinePointer >= this.lineSegments.length) {
            return undefined;
        }
        const lineElements = this.lineSegments[this.currentLinePointer++].split(" ");
        return asStrings ? lineElements : lineElements.map(Number);
    }

    retrieveMatrix(numRows, asStrings = false) {
        const resultMatrix = [];
        for (let i = 0; i < numRows; i++) {
            if (this.currentLinePointer >= this.lineSegments.length) {
                break;
            }
            const rowElements = this.lineSegments[this.currentLinePointer++].split(" ");
            resultMatrix.push(asStrings ? rowElements : rowElements.map(Number));
        }
        return resultMatrix;
    }

    retrieveVector(numElements, asStrings = false) {
        const resultVector = [];
        for (let i = 0; i < numElements; i++) {
            if (this.currentLinePointer >= this.lineSegments.length) {
                break;
            }
            const element = this.lineSegments[this.currentLinePointer++];
            resultVector.push(asStrings ? element : Number(element));
        }
        return resultVector;
    }
}

const createInputSource = (sourceContent) => {
    return new InputProcessor(sourceContent);
};

function generateMultiArray(initialValExpr) {
    const allArgs = arguments;
    let dimensionCount = allArgs.length;
    let arrayCreationString = "Array(allArgs[" + --dimensionCount + "]).fill(0).map(element => {return " + initialValExpr + ";})";
    while (--dimensionCount) {
        arrayCreationString = "Array(allArgs[" + dimensionCount + "]).fill(0).map(element => " + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

const inputData = createInputSource(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(performCalculation());

function performCalculation() {
    const itemCount = inputData.retrieveToken();
    const thresholdValue = inputData.retrieveToken();
    const rawItemDetails = inputData.retrieveMatrix(itemCount);

    const processedItems = rawItemDetails.map(entry => {
        const [baseCount, unitCostA, unitCostB] = entry;
        const derivedCostForThreshold = (thresholdValue - baseCount) * unitCostB;
        const initialContribution = baseCount * unitCostA;
        return {
            baseCount,
            unitCostA,
            unitCostB,
            derivedCostForThreshold,
            initialContribution,
            totalCostForFullThreshold: initialContribution + derivedCostForThreshold
        };
    });

    const totalInitialContribution = processedItems.reduce((accumulator, item) => accumulator + item.initialContribution, 0);

    processedItems.sort((itemA, itemB) => itemB.derivedCostForThreshold - itemA.derivedCostForThreshold);

    let highBound = itemCount * thresholdValue;
    let lowBound = -1;

    while (highBound - lowBound > 1) {
        const currentMidpoint = Math.floor((highBound + lowBound) / 2);
        let currentAccumulatedValue = totalInitialContribution;
        let remainingBudget = currentMidpoint;
        let currentItemPointer = 0;

        while (currentItemPointer < processedItems.length && remainingBudget > 0 && currentAccumulatedValue > 0) {
            const currentItem = processedItems[currentItemPointer];

            if (thresholdValue <= remainingBudget) {
                currentAccumulatedValue -= currentItem.totalCostForFullThreshold;
                remainingBudget -= thresholdValue;
                currentItemPointer++;
            } else {
                let tempAccumulatedValue = currentAccumulatedValue;
                let lastInnerCalculatedValue = tempAccumulatedValue;
                let innerLoopItemIndex = currentItemPointer;

                while (innerLoopItemIndex < processedItems.length && tempAccumulatedValue > 0) {
                    const innerItem = processedItems[innerLoopItemIndex];
                    let iterationValue = tempAccumulatedValue;

                    if (remainingBudget < innerItem.baseCount) {
                        iterationValue -= innerItem.unitCostA * remainingBudget;
                    } else {
                        iterationValue -= innerItem.initialContribution + (remainingBudget - innerItem.baseCount) * innerItem.unitCostB;
                    }
                    lastInnerCalculatedValue = iterationValue;
                    innerLoopItemIndex++;
                }
                currentAccumulatedValue = lastInnerCalculatedValue;
                currentItemPointer = innerLoopItemIndex;
            }
        }

        if (currentAccumulatedValue > 0) {
            lowBound = currentMidpoint;
        } else {
            highBound = currentMidpoint;
        }
    }
    return highBound;
}
