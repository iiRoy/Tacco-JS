const { readFileSync: fileReader } = require('node:fs');
const standardInputPath = '/dev/stdin';

function prepareData(rawData) {
    const rawContent = rawData.toString().trim();
    const separatedParts = rawContent.split(' ');
    const typedElements = [];
    for (const dataPiece of separatedParts) {
        const numericalValue = Number(dataPiece);
        if (!Number.isNaN(numericalValue)) {
            typedElements.push(numericalValue);
        } else {
            typedElements.push(dataPiece);
        }
    }
    return typedElements;
}

function checkOperands(firstOperand, secondOperand, operationSymbol) {
    return (typeof firstOperand === 'number' && typeof secondOperand === 'number' && typeof operationSymbol === 'string');
}

function executeOperation(operandX, operandY, symbol) {
    const operationRegistry = {
        '+': () => operandX + operandY,
        '-': () => operandX - operandY,
        '*': () => operandX * operandY
    };
    const selectedOperation = operationRegistry[symbol];
    return selectedOperation ? selectedOperation() : undefined;
}

function processSequence(initialItems) {
    let currentList = initialItems;

    while (currentList.length !== 1) {
        const nextIterationList = [];
        let cursorPosition = 0;
        const currentListSize = currentList.length;

        while (cursorPosition < currentListSize) {
            const elementA = currentList[cursorPosition];
            const elementB = currentList[cursorPosition + 1];
            const elementC = currentList[cursorPosition + 2];

            if (checkOperands(elementA, elementB, elementC)) {
                nextIterationList.push(executeOperation(elementA, elementB, elementC));
                cursorPosition += 3;
            } else {
                if (typeof elementC !== 'undefined') nextIterationList.push(elementC);
                if (typeof elementB !== 'undefined') nextIterationList.push(elementB);
                if (typeof elementA !== 'undefined') nextIterationList.push(elementA);
                cursorPosition += 3;
            }
        }
        currentList = nextIterationList;
    }
    console.log(currentList[0]);
}

const preparedArguments = prepareData(fileReader(standardInputPath, 'utf8'));
processSequence(preparedArguments);