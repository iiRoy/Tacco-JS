function processInput(rawInput) {
  // Parse the incoming string data into an array of numbers.
  rawInput = rawInput.split("\n").map(Number);

  // Extract the first five numerical entries for processing.
  let numericValues = [
    rawInput[0],
    rawInput[1],
    rawInput[2],
    rawInput[3],
    rawInput[4],
  ];

  // Sort the collection based on a custom rule involving the last digit.
  numericValues.sort((valA, valB) => {
    // Determine the effective last digit for comparison.
    let lastDigitA = valA % 10;
    let lastDigitB = valB % 10;

    // If a number ends in 0, treat its last digit as 10 for sorting.
    if (lastDigitA === 0) {
      lastDigitA = 10;
    }
    if (lastDigitB === 0) {
      lastDigitB = 10;
    }

    // Sort in descending order based on these adjusted last digits.
    return Number(lastDigitB) - Number(lastDigitA);
  });

  // Initialize a variable to accumulate the final result.
  let totalResult = 0;

  // Iterate through the sorted numerical entries.
  for (let idx = 0; idx < numericValues.length; idx++) {
    // Calculate the ceiling of the current number divided by ten.
    let roundedUpValue = Math.ceil(numericValues[idx] / 10);

    // If it's the very last element in the array, add its original value.
    if (idx === numericValues.length - 1) {
      totalResult += numericValues[idx];
    }
    // For all other elements, add the rounded-up value multiplied by ten.
    else {
      totalResult += roundedUpValue * 10;
    }
  }

  // Output the computed total to the console.
  console.log(totalResult);
}

// Execute the main processing function by reading input from standard input.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
