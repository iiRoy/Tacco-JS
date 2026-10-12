function displayResult(outputMessage) {
    console.log(outputMessage);
}

function parseNumericInput(rawString) {
    const trimmedInput = rawString.trim();
    return parseInt(trimmedInput, 10);
}

function calculateDivisorCount(valueToExamine) {
    let currentDivisorCount = 0;
    for (let potentialDivisor = 1; potentialDivisor <= valueToExamine; potentialDivisor++) {
        if (valueToExamine % potentialDivisor === 0) {
            currentDivisorCount++;
        }
    }
    return currentDivisorCount;
}

function executeLogic(rawInputString) {
    const numericLimit = parseNumericInput(rawInputString);
    const REQUIRED_DIVISOR_COUNT = 8;

    let finalCount = 0;

    for (let currentNumber = 1; currentNumber <= numericLimit; currentNumber += 2) {
        const numberOfDivisors = calculateDivisorCount(currentNumber);

        if (numberOfDivisors === REQUIRED_DIVISOR_COUNT) {
            finalCount++;
        }
    }

    displayResult(finalCount);
}

executeLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
