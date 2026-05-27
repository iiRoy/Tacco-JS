const fileSystem = require('fs');

const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const contentLines = rawContent.trim().split('\n');

const operatorFunctions = {
    '+': (current, operand) => current + operand,
    '-': (current, operand) => current - operand,
    '*': (current, operand) => current * operand,
    '/': (current, operand) => current / operand,
};

let calculationInstructions = [];
for (let index = 1; index < contentLines.length; index += 2) {
    const currentOperator = contentLines[index];
    if (currentOperator === '=') {
        break;
    }
    const currentOperand = Number(contentLines[index + 1]);
    calculationInstructions.push({ op: currentOperator, val: currentOperand });
}

const finalValue = calculationInstructions.reduce((accumulator, instruction) => {
    const performOperation = operatorFunctions[instruction.op];
    const intermediateResult = performOperation(accumulator, instruction.val);
    return Number(intermediateResult.toFixed(0));
}, Number(contentLines[0]));

console.log(finalValue);
