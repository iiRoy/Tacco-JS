function processNumbers(count, numberArray) {
  // Initialize variables for tracking the total sum and the largest value encountered.
  let totalSum = 0;
  let greatestValue = 0;

  // Iterate over each element in the provided array of numbers.
  numberArray.forEach((currentNum) => {
    // Check if the current number is greater than the previously recorded greatest value.
    if (greatestValue < currentNum) {
      // If so, update the greatest value.
      greatestValue = currentNum;
    }
    // Add the current number to the running total sum.
    totalSum += currentNum;
  });

  // Determine if the greatest value is less than the sum of all other numbers.
  // This is equivalent to checking if the greatest value is less than (totalSum - greatestValue).
  if (greatestValue < totalSum - greatestValue) {
    // If the condition holds, return 'Yes'.
    return 'Yes';
  }

  // Otherwise, return 'No'.
  return 'No';
}

function EntryFunction(rawData) {
  // The input string is split by newline characters to separate lines.
  // The first line typically contains metadata, and subsequent lines contain data.
  const lines = rawData.split('\n');

  // The first line (index 0) is parsed as the count of elements.
  // Although 'count' is passed to 'processNumbers', it's not used within that function's logic.
  const elementCount = lines[0];

  // The second line (index 1) contains space-separated numbers.
  // These are split into an array of strings, then mapped to actual Number types.
  const numericValues = lines[1].split(' ').map((val) => Number(val));

  // Call the core processing function with the extracted data and log its result to the console.
  console.log(processNumbers(elementCount, numericValues));
}

// This section should not be modified (it handles reading from standard input and invoking the main processing function).
EntryFunction(require("fs").readFileSync("/dev/stdin", "utf8"));
