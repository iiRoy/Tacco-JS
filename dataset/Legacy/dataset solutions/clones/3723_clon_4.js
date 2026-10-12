function main(mainInput) {
  const numericValue = parseInt(mainInput);

  let digitSumResult = 0;
  let tempNumber = Math.abs(numericValue); // Handle negative numbers by summing digits of absolute value

  if (numericValue === 0) { // Special case for 0, as the loop won't run
    digitSumResult = 0;
  } else {
    while (tempNumber > 0) {
      const remainderDigit = tempNumber % 10;
      digitSumResult += remainderDigit;
      tempNumber = Math.floor(tempNumber / 10);
    }
  }

  // If digitSumResult is 0 (e.g., for input '0' or non-numeric input where parseInt yields 0),
  // the modulo operation `numericValue % 0` results in NaN.
  // `NaN === 0` is false.
  // The original code also produces NaN for `0 % 0` and `NaN == 0` is false.
  // So, `numericValue % digitSumResult === 0` correctly handles this.
  console.log(numericValue % digitSumResult === 0 ? 'Yes' : 'No');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
