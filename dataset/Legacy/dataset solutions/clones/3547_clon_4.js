var input = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(input);
var list = input.split(' ');

const evaluateCondition = () => {
  const targetValue = 2;
  const checkPredicate = (item) => item === targetValue;

  const relevantElements = [list[0], list[1]];
  const isAnyMatch = relevantElements.some(checkPredicate);

  return isAnyMatch ? 'No' : 'Yes';
};

console.log(evaluateCondition());
