const MODULO_CONSTANT = 1000000007;

function processInputData(rawInput) {
    const numericInputMatrix = parseAndConvertInput(rawInput);
    const [configRow] = numericInputMatrix;
    const [totalElements, combinationSize] = configRow;
    const dataValues = numericInputMatrix[1];

    const combinationIndices = generateCombinations(totalElements, combinationSize);

    let cumulativeResult = 0;
    for (let i = 0; i < combinationIndices.length; i++) {
        const currentPattern = combinationIndices[i];
        const patternValue = computeRangeDifference(dataValues, currentPattern);
        cumulativeResult = (cumulativeResult + patternValue) % MODULO_CONSTANT;
    }

    console.log(cumulativeResult);
}

function computeRangeDifference(dataArray, patternIndices) {
    if (patternIndices.length === 0) {
        return 0;
    }

    let minValue = dataArray[patternIndices[0] - 1];
    let maxValue = dataArray[patternIndices[0] - 1];

    for (let i = 1; i < patternIndices.length; i++) {
        const currentValue = dataArray[patternIndices[i] - 1];
        minValue = Math.min(minValue, currentValue);
        maxValue = Math.max(maxValue, currentValue);
    }
    return maxValue - minValue;
}

function parseAndConvertInput(rawInputString) {
    return rawInputString.split("\n").map(line =>
        line.split(" ").map(Number)
    );
}

function generateCombinations(totalElements, combinationSize) {
    const allGeneratedCombinations = [];
    const currentCombinationState = Array.from({ length: combinationSize }, (_, i) => i + 1);

    while (true) {
        allGeneratedCombinations.push([...currentCombinationState]);

        let rightmostChangableIndex = currentCombinationState.length - 1;
        while (rightmostChangableIndex >= 0 &&
               currentCombinationState[rightmostChangableIndex] === totalElements - (currentCombinationState.length - 1 - rightmostChangableIndex)) {
            rightmostChangableIndex--;
        }

        if (rightmostChangableIndex >= 0) {
            const baseValueForIncrement = currentCombinationState[rightmostChangableIndex];
            for (let i = rightmostChangableIndex; i < currentCombinationState.length; i++) {
                currentCombinationState[i] = baseValueForIncrement + (i - rightmostChangableIndex) + 1;
            }
        } else {
            break;
        }
    }
    return allGeneratedCombinations;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
