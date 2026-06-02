function parseInputData(rawInputString) {
    const lines = rawInputString.split("\n");
    const elementCount = parseInt(lines[0], 10);
    const numericValues = lines[1].split(" ").map(valStr => parseInt(valStr, 10));
    return { elementCount, numericValues };
}

function handleFirstElementZeroSum(currentSum, nextValueInArray) {
    let adjustedSumValue;
    let operationsIncrement = 0;

    if (nextValueInArray >= 0) {
        let targetSum = -(nextValueInArray - 1);
        if (targetSum === 0) {
            targetSum = -1;
        }
        adjustedSumValue = targetSum;
        operationsIncrement = Math.abs(targetSum);
    } else {
        let targetSum = (Math.abs(nextValueInArray) - 1);
        if (targetSum === 0) {
            targetSum = 1;
        }
        adjustedSumValue = targetSum;
        operationsIncrement = targetSum;
    }
    return { adjustedSum: adjustedSumValue, opsIncrement: operationsIncrement };
}

function adjustForAlternatingSign(currentSum, previousSumInHistory) {
    let newSumValue = currentSum;
    let operationsIncrement = 0;

    if (previousSumInHistory > 0) {
        if (newSumValue >= 0) {
            operationsIncrement = newSumValue + 1;
            newSumValue -= operationsIncrement;
        }
    } else {
        if (newSumValue <= 0) {
            operationsIncrement = Math.abs(newSumValue) + 1;
            newSumValue += operationsIncrement;
        }
    }
    return { adjustedSum: newSumValue, opsIncrement: operationsIncrement };
}

function calculateOperations(inputString) {
    const { elementCount: numElements, numericValues: dataElements } = parseInputData(inputString);

    let currentAccumulatedSum = 0;
    let totalModificationCount = 0;
    const historicalAccumulatedSums = [];

    for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
        currentAccumulatedSum += dataElements[elementIndex];

        if (elementIndex === 0) {
            if (currentAccumulatedSum === 0) {
                const { adjustedSum, opsIncrement } = handleFirstElementZeroSum(currentAccumulatedSum, dataElements[elementIndex + 1]);
                currentAccumulatedSum = adjustedSum;
                totalModificationCount += opsIncrement;
            }
        } else {
            const previousSumFromHistory = historicalAccumulatedSums[elementIndex - 1];
            const { adjustedSum, opsIncrement } = adjustForAlternatingSign(currentAccumulatedSum, previousSumFromHistory);
            currentAccumulatedSum = adjustedSum;
            totalModificationCount += opsIncrement;
        }
        historicalAccumulatedSums.push(currentAccumulatedSum);
    }
    console.log(totalModificationCount);
}

calculateOperations(require("fs").readFileSync("/dev/stdin", "utf8"));
