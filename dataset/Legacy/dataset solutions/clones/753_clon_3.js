const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let dataLines = fileContent.trim().split("\n");

const initialCount = parseInt(dataLines.shift(), 10);

const firstLineParts = dataLines.shift().split(" ");
const firstTerm = Number(firstLineParts[0]);
const commonDifference = Number(firstLineParts[1]);

const valueMap = {};

function ensureKeyMapped(mapObject, keyString) {
    if (!mapObject.hasOwnProperty(keyString)) {
        mapObject[keyString] = keyString;
    }
}

const operationCount = parseInt(dataLines.shift(), 10);

for (let opIdx = 0; opIdx < operationCount; opIdx++) {
    const currentOperationParts = dataLines.shift().split(" ");
    const operationType = currentOperationParts[0];
    const operandA = currentOperationParts[1];
    const operandB = currentOperationParts[2];

    ensureKeyMapped(valueMap, operandA);
    ensureKeyMapped(valueMap, operandB);

    const isSwapOperation = (operationType === "0");

    if (isSwapOperation) {
        const tempValue = valueMap[operandA];
        valueMap[operandA] = valueMap[operandB];
        valueMap[operandB] = tempValue;
    } else {
        valueMap[operandA] = valueMap[operandB];
    }
}

let finalIndex = parseInt(dataLines.shift(), 10);

const finalIndexAsString = String(finalIndex);
if (valueMap.hasOwnProperty(finalIndexAsString)) {
    finalIndex = Number(valueMap[finalIndexAsString]);
}

const resultValue = firstTerm + ((finalIndex - 1) * commonDifference);
console.log(resultValue);
