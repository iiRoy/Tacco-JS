const sysAccess = require('node:fs');
const fullText = sysAccess.readFileSync('/dev/stdin', 'utf8');
const lineSet = fullText.trim().split("\n");

let linePointer = 0;

const getInteger = () => Number(lineSet[linePointer++]);

const getTuple = () => lineSet[linePointer++].split(" ").map(Number);

const sequenceLength = getInteger();
const [firstTerm, differenceTerm] = getTuple();

const initialValues = Array.from({ length: sequenceLength }, (_, idx) => firstTerm + idx * differenceTerm);

const operationCount = getInteger();

const transformations = [];
for (let i = 0; i < operationCount; i++) {
    transformations.push(getTuple());
}

const operationHandlers = new Map();

operationHandlers.set(0, (currentArray, indexA, indexB) => {
    const tempVal = currentArray[indexA];
    currentArray[indexA] = currentArray[indexB];
    currentArray[indexB] = tempVal;
    return currentArray;
});

operationHandlers.set(1, (currentArray, targetIndex, sourceIndex) => {
    currentArray[targetIndex] = currentArray[sourceIndex];
    return currentArray;
});

const finalCollection = transformations.reduce((accumulatingArray, operationTuple) => {
    const [operationDirective, operandOne, operandTwo] = operationTuple;
    const handlerKey = (operationDirective === 0) ? 0 : 1;
    const operationFunction = operationHandlers.get(handlerKey);

    return operationFunction(accumulatingArray, operandOne - 1, operandTwo - 1);
}, initialValues);

const targetIndex = getInteger();
console.log(finalCollection[targetIndex - 1]);