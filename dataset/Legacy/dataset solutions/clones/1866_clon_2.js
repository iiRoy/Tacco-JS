const processInput = inputData => {
  // This section parses the incoming string data.
  const [firstVal, secondVal, thirdVal, limitVal] = inputData.trim().split(' ').reduce((accumulator, currentElement) => {
    accumulator.push(parseInt(currentElement)); // Convert each string part to an integer.
    return accumulator; // Accumulate the parsed numbers.
  }, []); // Start with an empty array for accumulation.

  // Evaluate different scenarios based on the parsed numerical values.
  if (firstVal >= limitVal) {
    console.log(limitVal); // If the first value is sufficient, output the limit.
  } else if (secondVal >= limitVal - firstVal) {
    console.log(firstVal); // If the second value covers the remaining, output the first value.
  } else {
    // Otherwise, calculate a specific difference and output it.
    console.log(firstVal - (limitVal - firstVal - secondVal));
  }
};

// Execute the main processing function by reading from standard input.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
