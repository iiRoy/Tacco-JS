let allNumberPermutations = [];
let usedIndicesTracker = [false, false, false, false];

function generatePermutations(currentPermutation) {
    if (currentPermutation.length === 4) {
        allNumberPermutations.push([...currentPermutation]);
        return;
    }

    for (let idx = 0; idx < 4; idx++) {
        if (!usedIndicesTracker[idx]) {
            usedIndicesTracker[idx] = true;
            currentPermutation.push(idx);
            generatePermutations(currentPermutation);
            currentPermutation.pop();
            usedIndicesTracker[idx] = false;
        }
    }
}

generatePermutations([]);

const performCalculation = (operand1, operator, operand2) => {
    switch (operator) {
        case '+': return operand1 + operand2;
        case '-': return operand1 - operand2;
        case '*': return operand1 * operand2;
        default: throw new Error("Unsupported operation: " + operator);
    }
};

const evaluateWithPrecedence = (numbers, operators) => {
    let currentNumbers = [numbers[0]];
    let currentOperators = [];

    for (let i = 0; i < operators.length; i++) {
        const op = operators[i];
        const nextNum = numbers[i + 1];

        if (op === '*') {
            const lastNum = currentNumbers.pop();
            currentNumbers.push(performCalculation(lastNum, '*', nextNum));
        } else {
            currentNumbers.push(nextNum);
            currentOperators.push(op);
        }
    }

    let result = currentNumbers[0];
    for (let i = 0; i < currentOperators.length; i++) {
        result = performCalculation(result, currentOperators[i], currentNumbers[i + 1]);
    }
    return result;
};

const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

let inputLines = inputData.trim().split("\n");
const operationSymbols = ["+", "-", "*"];

while (true) {
    let currentLineData = inputLines.shift();
    if (currentLineData === "0 0 0 0") break;

    let currentNumbers = currentLineData.split(" ").map(Number);
    let foundExpressionString = "0";

    for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
        for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
            for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                if (foundExpressionString !== "0") break;

                const op1 = operationSymbols[opIdx1];
                const op2 = operationSymbols[opIdx2];
                const op3 = operationSymbols[opIdx3];

                allNumberPermutations.forEach(numberIndices => {
                    if (foundExpressionString !== "0") return;

                    const numA = currentNumbers[numberIndices[0]];
                    const numB = currentNumbers[numberIndices[1]];
                    const numC = currentNumbers[numberIndices[2]];
                    const numD = currentNumbers[numberIndices[3]];

                    let expressionValue;

                    // Pattern 1: A op1 B op2 C op3 D (standard precedence)
                    expressionValue = evaluateWithPrecedence([numA, numB, numC, numD], [op1, op2, op3]);
                    if (expressionValue === 10) {
                        foundExpressionString = `${numA}${op1}${numB}${op2}${numC}${op3}${numD}`;
                        return;
                    }

                    // Pattern 2: (A op1 B op2 C) op3 D
                    let innerGroup1Value = evaluateWithPrecedence([numA, numB, numC], [op1, op2]);
                    expressionValue = performCalculation(innerGroup1Value, op3, numD);
                    if (expressionValue === 10) {
                        foundExpressionString = `(${numA}${op1}${numB}${op2}${numC})${op3}${numD}`;
                        return;
                    }

                    // Pattern 3: (A op1 B) op2 (C op3 D)
                    let leftGroupValue = performCalculation(numA, op1, numB);
                    let rightGroupValue = performCalculation(numC, op3, numD);
                    expressionValue = performCalculation(leftGroupValue, op2, rightGroupValue);
                    if (expressionValue === 10) {
                        foundExpressionString = `(${numA}${op1}${numB})${op2}(${numC}${op3}${numD})`;
                        return;
                    }

                    // Pattern 4: ((A op1 B) op2 C) op3 D
                    let innermostGroupValue = performCalculation(numA, op1, numB);
                    let innerGroup2Value = performCalculation(innermostGroupValue, op2, numC);
                    expressionValue = performCalculation(innerGroup2Value, op3, numD);
                    if (expressionValue === 10) {
                        foundExpressionString = `((${numA}${op1}${numB})${op2}${numC})${op3}${numD}`;
                        return;
                    }
                });
            }
        }
    }

    if (foundExpressionString !== "0") {
        console.log(`(${foundExpressionString})`);
    } else {
        console.log(foundExpressionString);
    }
}
