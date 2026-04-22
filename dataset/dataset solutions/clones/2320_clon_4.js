const calculateRemainingValue = (sourceText) => {
  const allNumbers = sourceText.match(/-?\d+/g);
  const firstTwoNumbers = allNumbers.slice(0, 2).map(Number);

  const result = firstTwoNumbers.reduce((currentSum, numberToSubtract) => {
    return currentSum - numberToSubtract;
  }, 6);

  return result;
};

const rawSystemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(calculateRemainingValue(rawSystemInput));