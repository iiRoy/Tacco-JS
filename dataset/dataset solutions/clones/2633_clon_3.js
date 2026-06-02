function parseInteger(valString) {
    return parseInt(valString, 10);
}

const mapToIntegers = (stringArray) => stringArray.map(parseInteger);

const findMinimumValue = (...inputNumbers) => {
    let currentMin = inputNumbers[0];
    for (let iterationIndex = 1; iterationIndex < inputNumbers.length; iterationIndex++) {
        if (inputNumbers[iterationIndex] < currentMin) {
            currentMin = inputNumbers[iterationIndex];
        }
    }
    return currentMin;
};

const findMaximumValue = (...inputNumbers) => {
    let currentMax = inputNumbers[0];
    for (let iterationIndex = 1; iterationIndex < inputNumbers.length; iterationIndex++) {
        if (inputNumbers[iterationIndex] > currentMax) {
            currentMax = inputNumbers[iterationIndex];
        }
    }
    return currentMax;
};

const computeGreatestCommonDivisor = (...inputNumbers) => {
    const euclideanAlgorithm = (firstNum, secondNum) => {
        while (secondNum !== 0) {
            const remainder = firstNum % secondNum;
            firstNum = secondNum;
            secondNum = remainder;
        }
        return firstNum;
    };

    let resultGcd = inputNumbers[0];
    for (let iterationIndex = 1; iterationIndex < inputNumbers.length; iterationIndex++) {
        resultGcd = euclideanAlgorithm(resultGcd, inputNumbers[iterationIndex]);
    }
    return resultGcd;
};

const calculateNextAverage = (arrayReference) => {
    const valueOne = arrayReference.shift();
    const valueTwo = arrayReference.shift();
    const sumOfTwoValues = valueOne + valueTwo;
    const computedAverage = sumOfTwoValues / 2;
    return computedAverage;
};

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));

function executeProcessing(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const parsedInputData = inputLines.map(lineContent => mapToIntegers(lineContent.split(' ')));

    const initialCount = parsedInputData[0][0];
    let valueSequence = parsedInputData[1];
    valueSequence.sort((a, b) => a - b);

    let currentResult = calculateNextAverage(valueSequence);

    while (valueSequence.length > 0) {
        valueSequence.push(currentResult);
        valueSequence.sort((a, b) => a - b);
        currentResult = calculateNextAverage(valueSequence);
    }

    console.log(currentResult);
    return 0;
}
