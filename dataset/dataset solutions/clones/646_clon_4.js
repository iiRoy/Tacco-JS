function processInputAndCompute(sourceText) {
  const numericValues = sourceText.match(/\S+/g).map(Number);

  const [
    initialQuantity,
    firstDivisor,
    firstMultiplier,
    secondDivisor,
    secondMultiplier
  ] = numericValues;

  const firstCalculationResult = Math.floor((initialQuantity + firstDivisor - 1) / firstDivisor) * firstMultiplier;

  const secondCalculationResult = Math.floor((initialQuantity + secondDivisor - 1) / secondDivisor) * secondMultiplier;

  console.log(Math.min(firstCalculationResult, secondCalculationResult));
}

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
