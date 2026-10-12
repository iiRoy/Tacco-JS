const source = require('fs').readFileSync('/dev/stdin', 'utf8');
const cells = source.trim().split(/\s/);

const measuredArea = [0, 1].reduce((value, position) => value * cells[position], 1);
const conversionUnit = Number('0.000003305785');

function integerNotGreaterThan(value) {
  if (!Number.isFinite(value) || value === 0) return value;

  const towardZero = Math.trunc(value);
  return value < 0 && towardZero !== value ? towardZero - 1 : towardZero;
}

const wholeConvertedUnits = integerNotGreaterThan(measuredArea / conversionUnit);
console.log(wholeConvertedUnits / Number('1000000'));
