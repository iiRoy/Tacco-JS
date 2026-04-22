const fileSystemAccessor = require('fs');
const acquiredContent = fileSystemAccessor.readFileSync('/dev/stdin', 'utf8');

const primaryEntry = acquiredContent.trim().split('\n')[0];
const numericalElements = primaryEntry.split(' ');

const firstOperand = Number(numericalElements[0]);
const secondOperand = parseFloat(numericalElements[1]);

const finalComputation = firstOperand + (secondOperand / 2);

console.log(finalComputation);