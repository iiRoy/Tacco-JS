const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const parseNextInteger = (dataLines) => {
    return Number(dataLines.shift());
};

const parseNextNumbersLine = (dataLines) => {
    return dataLines.shift().split(" ").map(Number);
};

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
const inputLines = rawInputContent.trim().split("\n");

const initialSequenceLength = parseNextInteger(inputLines);
const [firstElement, differenceValue] = parseNextNumbersLine(inputLines);

const generateSequence = (length, start, diff) => {
    const sequenceElements = [];
    for (let currentIdx = 0; currentIdx < length; currentIdx++) {
        const termValue = start + (currentIdx * diff);
        sequenceElements.push(termValue);
    }
    return sequenceElements;
};

let dynamicSequence = generateSequence(initialSequenceLength, firstElement, differenceValue);

const totalOperationCount = parseNextInteger(inputLines);

const applySequenceOperation = (sequenceArray, operationDetails) => {
    const [opCode, targetPos, sourcePos] = operationDetails;
    const actualTargetIndex = targetPos - 1;
    const actualSourceIndex = sourcePos - 1;

    if (opCode === 0) {
        const tempHolder = sequenceArray[actualTargetIndex];
        sequenceArray[actualTargetIndex] = sequenceArray[actualSourceIndex];
        sequenceArray[actualSourceIndex] = tempHolder;
    } else {
        sequenceArray[actualTargetIndex] = sequenceArray[actualSourceIndex];
    }
};

for (let opCounter = 0; opCounter < totalOperationCount; opCounter++) {
    const currentOperationDetails = parseNextNumbersLine(inputLines);
    applySequenceOperation(dynamicSequence, currentOperationDetails);
}

const desiredOutputIndex = parseNextInteger(inputLines);
const finalResult = dynamicSequence[desiredOutputIndex - 1];

console.log(finalResult);
