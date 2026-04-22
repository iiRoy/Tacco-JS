const executionParameters = {
    sourcePath: '/dev/stdin',
    lineSeparator: '\n',
    characterEncoding: 'utf8',
    errorMessages: {
        invalidInput: "Error: Input must consist of two valid integer numbers on separate lines.",
        fileRead: "Error: Could not read from the specified input source."
    }
};

const fileSystemUtility = require('fs');

let rawInputContent;
try {
    rawInputContent = fileSystemUtility.readFileSync(executionParameters.sourcePath, executionParameters.characterEncoding);
} catch (readError) {
    console.error(executionParameters.errorMessages.fileRead, readError.message);
    process.exit(1);
}

const inputLines = rawInputContent.split(executionParameters.lineSeparator)
                                   .map(line => line.trim())
                                   .filter(line => line.length > 0);

let operandOne, operandTwo;

if (inputLines.length < 2) {
    console.error(executionParameters.errorMessages.invalidInput);
    process.exit(1);
}

const parsedVal1 = Number(inputLines[0]);
const parsedVal2 = Number(inputLines[1]);

function isValidInteger(value) {
    return Number.isInteger(value);
}

if (!isValidInteger(parsedVal1) || !isValidInteger(parsedVal2)) {
    console.error(executionParameters.errorMessages.invalidInput);
    process.exit(1);
}

operandOne = parsedVal1;
operandTwo = parsedVal2;

if (operandOne < operandTwo) {
    let temporaryHolder = operandOne;
    operandOne = operandTwo;
    operandTwo = temporaryHolder;
}

let currentDividend = operandOne;
let currentDivisor = operandTwo;
let currentRemainder;

while (currentDivisor !== 0) {
    currentRemainder = currentDividend % currentDivisor;
    currentDividend = currentDivisor;
    currentDivisor = currentRemainder;
}

const finalCommonDivisor = currentDividend;

function displayComputationResult(result) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Calculated GCD: ${result}`);
}

displayComputationResult(finalCommonDivisor);