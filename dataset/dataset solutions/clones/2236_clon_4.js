function processInputAndCompute(sourceText) {
  const [firstLine, secondLine, thirdLine] = sourceText.split('\n');

  const dimensionA = parseInt(firstLine, 10);
  const dimensionB = parseInt(secondLine, 10);
  const countItems = parseInt(thirdLine, 10);

  const potentialDivisors = [dimensionA, dimensionB];
  
  potentialDivisors.sort((val1, val2) => val2 - val1); 
  
  const effectiveDivisor = potentialDivisors[0];

  const finalResult = Math.ceil(countItems / effectiveDivisor);

  return finalResult;
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const computedValue = processInputAndCompute(inputData);
console.log(computedValue);
