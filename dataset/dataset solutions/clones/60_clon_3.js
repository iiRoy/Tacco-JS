function parseInputToNumbers(rawContent) {
  const trimmedContent = rawContent.replace(/\n$/, '');
  const lines = trimmedContent.split('\n');
  const numbers = lines.map(Number);
  return numbers;
}

function calculateIterationTerm(currentIterationValue, iterationStep) {
  const squaredValue = currentIterationValue * currentIterationValue;
  return squaredValue * iterationStep;
}

(function(rawData) {
  const numericValues = parseInputToNumbers(rawData);
  const loopUpperLimit = 600;

  while (numericValues.length > 0) {
    const stepSize = numericValues.shift();
    let calculatedSum = 0;

    for (let currentVal = 0; currentVal < loopUpperLimit; currentVal = currentVal + stepSize) {
      const termToAdd = calculateIterationTerm(currentVal, stepSize);
      calculatedSum = calculatedSum + termToAdd;
    }
    console.log(calculatedSum);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
