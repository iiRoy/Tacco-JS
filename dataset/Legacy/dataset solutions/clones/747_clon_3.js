const fs = require('fs');

function calculateOverValue(inputNum) {
    if (inputNum >= 10) {
        return inputNum - 10 + 1;
    }
    return inputNum;
}

const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputData.trim().split("\n");

const numEntries = parseInt(processedLines.shift(), 10);
const identifierChars = processedLines.shift().split("");
const someOtherValue = parseInt(processedLines.shift(), 10);
const numericOperands = processedLines.shift().split(" ").map(Number);

const operationMultipliers = [];
let runningTotalSum = 0;

identifierChars.forEach(function(charItem, charIndex) {
    const isEvenPosition = charIndex % 2 === 0;
    if (charItem === "*") {
        if (isEvenPosition) {
            operationMultipliers.push(1);
        } else {
            operationMultipliers.push(2);
        }
    } else {
        const digitValue = parseInt(charItem, 10);
        if (isEvenPosition) {
            runningTotalSum += digitValue;
        } else {
            runningTotalSum += calculateOverValue(digitValue * 2);
        }
    }
});

const dpTable = Array.from({ length: operationMultipliers.length + 1 }, () => Array(100).fill(0));

dpTable[0][0] = 1;

for (let multiplierIndex = 0; multiplierIndex < operationMultipliers.length; multiplierIndex++) {
    const currentMultiplierFactor = operationMultipliers[multiplierIndex];
    for (let operandIndex = 0; operandIndex < numericOperands.length; operandIndex++) {
        const currentOperandValue = numericOperands[operandIndex];
        for (let currentPossibleSum = 0; currentPossibleSum < 100; currentPossibleSum++) {
            if (dpTable[multiplierIndex][currentPossibleSum] > 0) {
                const calculatedProduct = currentOperandValue * currentMultiplierFactor;
                const adjustedProductValue = calculateOverValue(calculatedProduct);
                const nextSumCandidate = currentPossibleSum + adjustedProductValue;
                
                // Only consider sums that remain within the relevant range [0, 99]
                // as sums >= 100 are not checked in the final result calculation.
                if (nextSumCandidate < 100) {
                    dpTable[multiplierIndex + 1][nextSumCandidate] += dpTable[multiplierIndex][currentPossibleSum];
                }
            }
        }
    }
}

let finalResultCount = 0;
for (let finalSumCandidate = 0; finalSumCandidate < 100; finalSumCandidate++) {
    const combinedTotal = runningTotalSum + finalSumCandidate;
    if (combinedTotal % 10 === 0) {
        finalResultCount += dpTable[operationMultipliers.length][finalSumCandidate];
    }
}

console.log(finalResultCount);
