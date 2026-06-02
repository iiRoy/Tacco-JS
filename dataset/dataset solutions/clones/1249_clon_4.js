const fileSystem = require('fs');

const sourceText = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineEntries = sourceText.split("\n");

const operatorMap = {
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '/': (firstOperand, secondOperand) => Math.floor(firstOperand / secondOperand)
};

const processedOutput = lineEntries.reduce((accumulatorState, currentEntry) => {
    if (accumulatorState.completionFlag) {
        return accumulatorState;
    }

    const entryComponents = currentEntry.split(" ");
    const valueOne = Number(entryComponents[0]);
    const operationSymbol = entryComponents[1];
    const valueTwo = Number(entryComponents[2]);

    if (operationSymbol === "?") {
        return { resultCollection: accumulatorState.resultCollection, completionFlag: true };
    }

    const operationFunction = operatorMap[operationSymbol];
    if (operationFunction) {
        accumulatorState.resultCollection.push(operationFunction(valueOne, valueTwo));
    }

    return accumulatorState;
}, { resultCollection: [], completionFlag: false });

const finalResultString = processedOutput.resultCollection.join("\n");

console.log(finalResultString.trim());
