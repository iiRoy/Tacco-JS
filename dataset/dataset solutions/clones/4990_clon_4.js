function calculateAggregateValue(sourceText) {
  const [iterations, boundary, valOne, valTwo] = sourceText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(Number);

  const countForValOne = Math.min(iterations, boundary);
  const countForValTwo = iterations - countForValOne;

  const computedTotal = (countForValOne * valOne) + (countForValTwo * valTwo);

  return computedTotal;
}

const inputContent = require('node:fs').readFileSync(0, 'utf8');
const finalOutcome = calculateAggregateValue(inputContent);
console.log(finalOutcome);