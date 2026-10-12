const fileSystem = require('fs');

const ERROR_CODE_OUTPUT = -1;

const processInputConstraints = (digitCount, constraintList) => {
    let currentDigitArr = Array.from({ length: digitCount }, () => null);

    for (const { position, value } of constraintList) {
        if (currentDigitArr[position] !== null && currentDigitArr[position] !== value) {
            return ERROR_CODE_OUTPUT;
        }
        currentDigitArr[position] = value;
    }
    return currentDigitArr;
};

const finalizeNumberRepresentation = (processedDigits, digitCount) => {
    if (processedDigits === ERROR_CODE_OUTPUT) {
        return ERROR_CODE_OUTPUT;
    }

    if (digitCount >= 2) {
        if (processedDigits[0] === 0) {
            return ERROR_CODE_OUTPUT;
        }
        if (processedDigits[0] === null) {
            return ERROR_CODE_OUTPUT;
        }
        return processedDigits.map(digit => (digit === null ? 0 : digit));
    } else {
        if (processedDigits[0] === null) {
            return [0];
        }
        return processedDigits;
    }
};

const executeSolution = (inputData) => {
    const inputLines = inputData.split('\n');

    const [digitCount, constraintCount] = inputLines.shift().split(' ').map(Number);

    const parsedConstraints = inputLines.slice(0, constraintCount).map(line => {
        const [sIndex, digitValue] = line.split(' ').map(Number);
        return { position: sIndex - 1, value: digitValue };
    });

    const intermediateDigits = processInputConstraints(digitCount, parsedConstraints);

    const finalDigitArray = finalizeNumberRepresentation(intermediateDigits, digitCount);

    if (finalDigitArray === ERROR_CODE_OUTPUT) {
        console.log(ERROR_CODE_OUTPUT);
    } else {
        console.log(finalDigitArray.join(''));
    }
};

executeSolution(fileSystem.readFileSync('/dev/stdin', 'utf8'));
