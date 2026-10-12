process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  const [firstCoeff, secondCoeff, thirdCoeff, upperBoundary] = inputLines[0].split(" ").map(Number);

  function determineSolutionCount(remainingTarget, coefficientsArray, currentCoefficientIndex) {
    if (currentCoefficientIndex === coefficientsArray.length - 1) {
      const finalCoefficientValue = coefficientsArray[currentCoefficientIndex];
      if (remainingTarget >= 0 && remainingTarget % finalCoefficientValue === 0) {
        return 1;
      } else {
        return 0;
      }
    }

    let accumulatedSolutions = 0;
    const currentCoefficientValue = coefficientsArray[currentCoefficientIndex];

    for (let currentMultiplier = 0; currentCoefficientValue * currentMultiplier <= remainingTarget; currentMultiplier++) {
      accumulatedSolutions += determineSolutionCount(
        remainingTarget - currentCoefficientValue * currentMultiplier,
        coefficientsArray,
        currentCoefficientIndex + 1
      );
    }
    return accumulatedSolutions;
  }

  const coefficients = [firstCoeff, secondCoeff, thirdCoeff];
  const finalCount = determineSolutionCount(upperBoundary, coefficients, 0);

  console.log(finalCount);
});
