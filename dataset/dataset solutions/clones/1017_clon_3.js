var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var expressionTokens = rawInputContent.trim().split(' ');
var computationStack = [];

const retrieveNumericValue = () => {
  const poppedElement = computationStack.pop();
  return parseInt(poppedElement, 10);
};

const storeNumericValue = (valueToStore) => {
  computationStack.push(parseInt(valueToStore, 10));
};

const ADD_OPERATION_SYMBOL = '+';
const SUBTRACT_OPERATION_SYMBOL = '-';
const MULTIPLY_OPERATION_SYMBOL = '*';

expressionTokens.forEach(function(currentElement) {
  switch (currentElement) {
    case ADD_OPERATION_SYMBOL:
      const secondAddend = retrieveNumericValue();
      const firstAddend = retrieveNumericValue();
      const sumResult = firstAddend + secondAddend;
      computationStack.push(sumResult);
      break;
    case SUBTRACT_OPERATION_SYMBOL:
      const subtrahendValue = retrieveNumericValue();
      const minuendValue = retrieveNumericValue();
      const differenceResult = minuendValue - subtrahendValue;
      computationStack.push(differenceResult);
      break;
    case MULTIPLY_OPERATION_SYMBOL:
      const secondFactor = retrieveNumericValue();
      const firstFactor = retrieveNumericValue();
      const productResult = firstFactor * secondFactor;
      computationStack.push(productResult);
      break;
    default:
      storeNumericValue(currentElement);
      break;
  }
});

console.log(computationStack[0]);
