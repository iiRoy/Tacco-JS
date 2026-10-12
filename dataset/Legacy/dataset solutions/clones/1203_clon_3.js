const fileSystemModule = require('fs');
const fileData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const firstOperandValue = 2;
const secondOperandValue = 3;

function calculateBitwiseXOR(operandA, operandB) {
    return operandA ^ operandB;
}

const finalCalculatedResult = calculateBitwiseXOR(firstOperandValue, secondOperandValue);

console.log(finalCalculatedResult);
