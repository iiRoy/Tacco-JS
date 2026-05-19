const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const inputTokens = rawInputContent.split(' ');

const operandA = Number(inputTokens[0]);
const operandB = Number(inputTokens[1]);
const operandC = Number(inputTokens[2]);
const operandD = Number(inputTokens[3]);

const productAB = operandA * operandB;
const productCD = operandC * operandD;

let maximumProductValue;

if (productAB > productCD) {
    maximumProductValue = productAB;
} else {
    maximumProductValue = productCD;
}

console.log(maximumProductValue);
