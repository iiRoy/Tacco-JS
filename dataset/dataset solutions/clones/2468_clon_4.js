function processNumericalInput(sourceData) {
  const [firstOperand, secondOperand] = sourceData
    .split('\n')[0]
    .split(' ')
    .map(Number.parseInt)
    .slice(0, 2);

  const productResult = firstOperand * secondOperand;

  const withinBounds = (firstOperand <= 9 && secondOperand <= 9);

  const decisionFactor = withinBounds ? 1 : 0;

  const finalOutcome = (decisionFactor * productResult) + ((1 - decisionFactor) * -1);

  console.log(finalOutcome);
}

processNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));
