const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

let valueAStr = '';
let valueBStr = '';
let processingFirstNumber = true;

for (const character of sourceData) {
    if (character === ' ' && processingFirstNumber) {
        processingFirstNumber = false;
        continue;
    }
    if (processingFirstNumber) {
        valueAStr += character;
    } else {
        valueBStr += character;
    }
}

const operandAlpha = Number(valueAStr);
const operandBeta = Number(valueBStr);

const productComponent = operandAlpha * operandBeta;
const sumComponent = operandAlpha + operandBeta;
const computedOutcome = productComponent - sumComponent + 1;

console.log(computedOutcome);