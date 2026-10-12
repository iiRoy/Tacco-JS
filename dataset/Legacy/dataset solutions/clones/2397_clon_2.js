function ProcessInput(dataLines) {
  // Retrieve the specific modulus value from the initial data entry.
  const modulusVal = dataLines[0][1];

  // Process the array of numbers: convert strings to numbers,
  // then apply the modulo operation to each element.
  // @type {Array<number>}
  const numArr = dataLines[1].map(Number).map(element => element % modulusVal);

  // Compute the total count of sub-arrays that satisfy the condition.
  const finalCount = numArr.reduce((accumulatedSum, currentVal, currentIndex) => {
    // Initialize local variables for each starting position.
    let subArrayCount = 0;
    let currentRemainder = 0;

    // Iterate through sub-arrays starting from the current index.
    for (let loopIndex = currentIndex, subArrayLength = 1; loopIndex < numArr.length; loopIndex++, subArrayLength++) {
      // Update the running sum modulo the modulus value.
      currentRemainder = (currentRemainder + numArr[loopIndex]) % modulusVal;

      // Check if the current remainder matches the sub-array's length.
      if (currentRemainder === subArrayLength) {
        subArrayCount++; // Increment the counter if the condition is met.
      }
    }

    // Add the count from this starting point to the overall sum.
    return accumulatedSum + subArrayCount;
  }, 0); // The initial value for the accumulated sum is zero.

  // Display the final calculated count.
  console.log(finalCount);
}

// Read input from standard input, parse it, and then invoke the main processing function.
ProcessInput(
  require("fs")
    .readFileSync("/dev/stdin", "utf8") // Read the entire content of standard input as a UTF-8 string.
    .trim() // Remove any leading or trailing whitespace from the input.
    .split("\n") // Split the input string into an array of lines.
    .map(inputLine => inputLine.split(' ')) // For each line, split it by spaces into an array of strings.
);
