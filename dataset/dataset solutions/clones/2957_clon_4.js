const initialData = require('fs').readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(/\s+/)
  .map(Number);

const upperLimit = initialData[0];
const comparisonValue = initialData[1];

const resultAggregate = Array.from({ length: upperLimit }, (_, idx) => idx + 1)
  .reduce((currentTotal, currentVal) => {
    const requiredPower = Math.max(
      0,
      Math.ceil(Math.log2(comparisonValue / currentVal))
    );
    const fractionalComponent = 1 / Math.pow(2, requiredPower);
    return currentTotal + (1 / upperLimit) * fractionalComponent;
  }, 0);

console.log(resultAggregate);