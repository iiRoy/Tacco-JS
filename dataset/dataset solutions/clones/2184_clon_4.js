function processInput(inputString) {
  const [upperBoundStr, targetNonZeroCountStr] = inputString.split('\n');
  const maxVal = Number(upperBoundStr);
  const requiredNonZeros = Number(targetNonZeroCountStr);

  const assessNumericPattern = (valueToCheck, criterionCount) => {
    let currentFigure = valueToCheck;
    let talliedNonZeros = 0;
    while (currentFigure > 0) {
      const remainder = currentFigure % 10;
      if (remainder !== 0) {
        talliedNonZeros++;
      }
      currentFigure = Math.floor(currentFigure / 10);
    }
    return talliedNonZeros === criterionCount;
  };

  const matchingNumbers = Array.from({ length: maxVal }, (_, index) => index + 1)
                               .filter(num => assessNumericPattern(num, requiredNonZeros));

  const finalTally = matchingNumbers.length;

  console.log(finalTally);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));