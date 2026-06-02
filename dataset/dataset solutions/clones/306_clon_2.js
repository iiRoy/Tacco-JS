let processedValues = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(/\s/);

// This program calculates a specific value based on two numbers from standard input.
console.log(
  Math.floor(
    (processedValues[0] * processedValues[1]) / 0.000003305785
  ) / 1000000
);
