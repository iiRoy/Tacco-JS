const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const [firstOperand, secondOperand] = sourceContent
  .split(' ')
  .map(Number);

const comparisonOutcomeMap = {
  '-1': "a < b",
  '0': "a == b",
  '1': "a > b",
  'NaN': "a == b"
};

const outcomeKey = Math.sign(firstOperand - secondOperand);
console.log(comparisonOutcomeMap[outcomeKey]);
