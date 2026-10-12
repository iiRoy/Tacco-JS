const processInput = (rawData) => {
  // Split the raw input string by spaces and convert each part to a number.
  const parsedValues = rawData.split(' ').map(currentVal => Number(currentVal));

  // Calculate the first adjusted number.
  const firstNumAdjusted = parsedValues[0] + 1;
  // Retrieve the second number from the parsed values.
  const secondNum = parsedValues[1];

  // Determine the upper bound for the loop iteration.
  const upperBound = firstNumAdjusted - secondNum + 1;

  // Initialize an accumulator for the sum.
  let totalAccumulator = 0;

  // Iterate from zero up to (but not including) the upper bound.
  for (let loopIndex = 0; loopIndex < upperBound; loopIndex++) {
    // Add the difference between the upper bound and the current index to the accumulator.
    totalAccumulator += upperBound - loopIndex;
  }

  // Output the final sum modulo a large prime number.
  console.log(totalAccumulator % (10 ** 9 + 7));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
