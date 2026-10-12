const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const [firstOperand, secondOperand] = fileContent.split('\n').map(Number);
console.log(Math.pow(firstOperand, 2) - secondOperand);
