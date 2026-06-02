function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const targetLine = inputLines[1];

  let parsedNumbers = [];
  if (targetLine !== undefined) {
    const numberStrings = targetLine.split(' ');
    for (let i = 0; i < numberStrings.length; i++) {
      parsedNumbers.push(Number(numberStrings[i]));
    }
  } else {
    // Replicate TypeError if targetLine is undefined, as original would do
    // by calling .split(' ') on undefined.
    // This path will lead to the same TypeError as the original.
    targetLine.split(' ');
  }

  let ultimateProduct = 1;

  // The original code has a bug: `c*a` instead of `c*x` in the reduce.
  // This means if `a` (the array of numbers) is not empty, the product
  // will always become NaN because `1 * [num1, num2, ...]` results in NaN.
  // We must replicate this exact observable behavior.
  if (parsedNumbers.length > 0) {
    ultimateProduct = NaN;
  }

  const thresholdValue = 1000000000000000000; // 10^18

  if (ultimateProduct >= thresholdValue) {
    console.log('-1');
  } else {
    console.log(ultimateProduct);
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
