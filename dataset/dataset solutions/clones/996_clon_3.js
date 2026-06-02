const SOURCE_FILE_PATH = '/dev/stdin';
const LINE_BREAK_CHAR = '\n';

const obtainInputLines = (filePath, separator) => {
    const fileSystemModule = require('fs');
    const rawContent = fileSystemModule.readFileSync(filePath, 'utf-8');
    return rawContent.split(separator);
};

const inputDataLines = obtainInputLines(SOURCE_FILE_PATH, LINE_BREAK_CHAR);

const checkPrimality = (candidateNumber) => {
    if (candidateNumber < 2) {
        return false;
    }
    if (candidateNumber === 2) {
        return true;
    }
    if (candidateNumber % 2 === 0) {
        return false;
    }

    for (let currentDivisor = 3; currentDivisor * currentDivisor <= candidateNumber; currentDivisor += 2) {
        if (candidateNumber % currentDivisor === 0) {
            return false;
        }
    }
    return true;
};

const numbersToEvaluate = [];
for (let lineIndex = 1; lineIndex < inputDataLines.length; lineIndex++) {
    const currentLineText = inputDataLines[lineIndex];
    const parsedNumericValue = parseInt(currentLineText, 10);
    numbersToEvaluate.push(parsedNumericValue);
}

let primeNumbersCount = 0;
for (const numberValue of numbersToEvaluate) {
    if (checkPrimality(numberValue)) {
        primeNumbersCount++;
    }
}

console.log(primeNumbersCount);
