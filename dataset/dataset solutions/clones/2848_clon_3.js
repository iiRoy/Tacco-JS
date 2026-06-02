const parseAndSortNumbers = (lineContent) => {
    return lineContent.split(" ").map(Number).sort((a, b) => b - a);
};

const performOperationAndLog = (operand, currentAccumulator) => {
    console.log(`${operand} ${currentAccumulator}`);
    return operand - currentAccumulator;
};

function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const elementCount = parseInt(inputLines[0], 10);
    const orderedNumbers = parseAndSortNumbers(inputLines[1]);

    let totalSum = 0;
    for (let index = 0; index < elementCount; index++) {
        const currentHalfIndex = Math.floor(index / 2);
        if (index % 2 === 0) {
            totalSum += orderedNumbers[currentHalfIndex];
        } else {
            const reverseIndexOffset = elementCount - (currentHalfIndex + 1);
            totalSum -= orderedNumbers[reverseIndexOffset];
        }
    }
    console.log(totalSum);

    let currentCalculatedValue;
    let iterationStartIndex;
    let iterationEndCondition;

    if (elementCount % 2 === 0) {
        currentCalculatedValue = orderedNumbers[elementCount - 1];
        iterationStartIndex = 0;
        iterationEndCondition = elementCount - 1;
    } else {
        currentCalculatedValue = orderedNumbers[0];
        iterationStartIndex = 1;
        iterationEndCondition = elementCount;
    }

    for (let index = iterationStartIndex; index < iterationEndCondition; index++) {
        const currentHalfIndex = Math.floor(index / 2);
        let numberForCurrentStep;

        if (index % 2 === 0) {
            numberForCurrentStep = orderedNumbers[currentHalfIndex];
        } else {
            const reverseIndexOffset = elementCount - (currentHalfIndex + 1);
            numberForCurrentStep = orderedNumbers[reverseIndexOffset];
        }
        currentCalculatedValue = performOperationAndLog(numberForCurrentStep, currentCalculatedValue);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
