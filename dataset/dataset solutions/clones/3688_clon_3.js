const parseInteger = (stringValue) => parseInt(stringValue, 10);
const parseIntegerArray = (stringArray) => stringArray.map(item => parseInteger(item));
const calculateAbsoluteValue = (numberValue) => numberValue > 0 ? numberValue : -numberValue;

function findMinimum() {
    let allArguments = arguments;
    let currentMinimum = allArguments[0];
    for (let i = 1; i < allArguments.length; i++) {
        if (allArguments[i] < currentMinimum) {
            currentMinimum = allArguments[i];
        }
    }
    return currentMinimum;
}

function findMaximum() {
    let allArguments = arguments;
    let currentMaximum = allArguments[0];
    for (let i = 1; i < allArguments.length; i++) {
        if (allArguments[i] > currentMaximum) {
            currentMaximum = allArguments[i];
        }
    }
    return currentMaximum;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInputData(rawData) {
    const inputComponents = rawData.split(' ');

    const componentN = inputComponents[0];
    const componentM = inputComponents[1];
    const componentD = inputComponents[2];

    const firstNumericValue = parseInteger(componentN);
    const secondNumericValue = parseInteger(componentM);
    const thirdNumericValue = parseInteger(componentD);

    const termForNumeratorA = firstNumericValue - thirdNumericValue;
    const termForNumeratorB = secondNumericValue - 1;
    const computedNumerator = termForNumeratorA * termForNumeratorB;

    const computedDenominator = firstNumericValue * firstNumericValue;

    let finalProbabilityResult = computedNumerator / computedDenominator;

    if (thirdNumericValue !== 0) {
        finalProbabilityResult = finalProbabilityResult * 2;
    }

    console.log(finalProbabilityResult);
}
