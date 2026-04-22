global.process.stdin.resume();
global.process.stdin.setEncoding('utf8');

let capturedInput = '';
let inputAcquisition = global.require('readline').createInterface({
  input: global.process.stdin,
  output: global.process.stdout
});

inputAcquisition.once('line', (dataLine) => {
  capturedInput = dataLine;
});

inputAcquisition.once('close', () => {
  let valueComponents = capturedInput.split(" ").map(global.Number);

  let redCoeff = valueComponents[0];
  let greenCoeff = valueComponents[1];
  let blueCoCoeff = valueComponents[2];
  let targetSum = valueComponents[3];

  // Replicate original code's infinite loop behavior if a coefficient is zero
  // and the remaining sum allows iteration.
  if (redCoeff === 0) {
    if (targetSum >= 0) {
      // Original code: `for (i = 0; 0 <= limit; i++)` -> infinite loop if limit >= 0
      while (true) {} // Hang the process
    } else {
      // Original code: `for (i = 0; 0 <= limit; i++)` -> loop condition is false, count remains 0.
      global.console.log(0);
      return;
    }
  }

  let totalSolutions = 0;

  // Calculate the maximum possible multiplier for the first coefficient
  // based on the overall target sum and the first coefficient value.
  let maximumFirstMultiplier = global.Math.floor(targetSum / redCoeff);
  if (maximumFirstMultiplier < 0) maximumFirstMultiplier = -1; // Ensure Array.from creates an empty array if no positive solutions

  // Generate an array of possible multipliers for the first coefficient (0 to maximum)
  let firstMultipliers = global.Array.from({ length: maximumFirstMultiplier + 1 }, (_, idx) => idx);

  // Use a functional reduction pattern to sum up solutions
  totalSolutions = firstMultipliers.reduce((accumulator, currentFirst) => {
    let remainingForSecondAndThird = targetSum - (redCoeff * currentFirst);

    // Replicate original code's inner loop infinite loop behavior if greenCoeff is zero
    // and the remaining sum allows iteration.
    if (greenCoeff === 0) {
      if (remainingForSecondAndThird >= 0) {
        // Original code: `for (j = 0; 0 <= (limit - r*i); j++)` -> infinite loop if (limit - r*i) >= 0
        while (true) {} // Hang the process
      } else {
        // No solutions for this currentFirst if remaining sum is negative.
        return accumulator;
      }
    }

    // Calculate the maximum possible multiplier for the second coefficient
    // based on the remaining sum and the second coefficient value.
    let maximumSecondMultiplier = global.Math.floor(remainingForSecondAndThird / greenCoeff);
    if (maximumSecondMultiplier < 0) maximumSecondMultiplier = -1; // Ensure empty array if no positive solutions

    // Generate an array of possible multipliers for the second coefficient
    let secondMultipliers = global.Array.from({ length: maximumSecondMultiplier + 1 }, (_, idx) => idx);

    // Filter these second multipliers based on the third coefficient condition
    let solutionsForCurrentFirst = secondMultipliers.filter(currentSecond => {
      let finalRemainder = remainingForSecondAndThird - (greenCoeff * currentSecond);
      // The original code checks `(value % b == 0)`. If `b` is 0, `value % 0` is `NaN`. `NaN == 0` is false.
      // This means if `blueCoCoeff` is 0, no `k` is considered valid. This behavior is preserved.
      return (finalRemainder % blueCoCoeff === 0);
    }).length; // Count the number of valid `currentSecond` values

    return accumulator + solutionsForCurrentFirst;
  }, 0); // Start the accumulator at zero

  global.console.log(totalSolutions);
});