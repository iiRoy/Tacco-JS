const executeCalculation = (dataString) => {
  // Convert the trimmed input string to a BigInt for calculations
  const targetValue = BigInt(dataString.trim());

  // Outer loop for the first potential number, iterating from 0 to 99 (inclusive)
  for (let firstNum = 0n; firstNum < 100n; firstNum++) {
    // Inner loop for the second potential number, also from 0 to 99 (inclusive)
    for (let secondNum = 0n; secondNum < 100n; secondNum++) {
      // Check if the difference of their fifth powers matches the target value
      if (firstNum ** 5n - secondNum ** 5n === targetValue) {
        // If a match is found, print the numbers and terminate the function
        return console.log(`${firstNum} ${secondNum}`);
      }
      // Otherwise, check if the sum of their fifth powers matches the target value
      else if (firstNum ** 5n + secondNum ** 5n === targetValue) {
        // If this condition is met, print the first number and the negated second number, then exit
        return console.log(`${firstNum} ${-secondNum}`);
      }
    }
  }
};

// Conditional execution based on the 'MYTEST' environment variable
process.env.MYTEST
  ? (process.env.MYTEST === 'test' // Check if 'MYTEST' is specifically set to 'test'
      ? test() // If 'test', execute the 'test' function (assumed external)
      : executeCalculation(require('fs').readFileSync('dev/stdin', 'utf8')) // Otherwise, read from 'dev/stdin' and pass to the main function
    )
  : executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8')); // If 'MYTEST' is not set, read from '/dev/stdin' and execute
