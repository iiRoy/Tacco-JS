function calculateMaxExpression(inputLines) {
  const firstInputLine = inputLines[0].trim();
  const stringParts = firstInputLine.split(" ");

  const [coeffA, divisorB, upperBoundN] = stringParts.map(strVal => Number(strVal));

  const INITIAL_MIN_RESULT = -100000000;
  let currentMaximumResult = INITIAL_MIN_RESULT;

  const computeExpressionValue = (a, b, x) => {
    const termOne = Math.floor(a * x / b);
    const termTwo = a * Math.floor(x / b);
    return termOne - termTwo;
  };

  if (upperBoundN > divisorB) {
    const loopStartOffset = upperBoundN - divisorB - 1;
    const iterationCount = divisorB + 2;

    for (let k = 0; k < iterationCount; k++) {
      const loopIndex = loopStartOffset + k;
      const expressionValue = computeExpressionValue(coeffA, divisorB, loopIndex);
      currentMaximumResult = Math.max(currentMaximumResult, expressionValue);
    }
  } else {
    currentMaximumResult = computeExpressionValue(coeffA, divisorB, upperBoundN);
  }

  console.log(currentMaximumResult);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInput = fileContent.trim().split("\n");
calculateMaxExpression(processedInput);
