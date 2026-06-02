const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// This immediately invoked function expression processes the input data.
((inputContent) => {
  // Split the entire input string into an array of lines.
  const dataRows = inputContent.split("\n");

  // The first line contains the count of elements, converted to a number.
  const elementCount = dataRows[0] - 0;

  // The second line contains space-separated numbers, parsed into a numeric array.
  const numericSequence = dataRows[1].split(" ").map(Number);

  // Initialize variables for the first calculation path.
  let resultOne = 0;
  let currentTotal = 0;

  // First iteration: aiming for alternating signs starting with positive.
  for (let idx = 0; idx < elementCount; idx++) {
    // Determine if the current index is odd or even.
    const isOddIndex = idx % 2;

    // If the target is an even index (0, 2, 4...) and the sum is positive, or
    // if the target is an odd index (1, 3, 5...) and the sum is negative,
    // then the current element can be added directly.
    if (!isOddIndex & (currentTotal + numericSequence[idx] > 0)) {
      currentTotal += numericSequence[idx];
    } else if (isOddIndex & (currentTotal + numericSequence[idx] < 0)) {
      currentTotal += numericSequence[idx];
    } else {
      // If the condition is not met, we need to adjust the sum.
      // Calculate the absolute difference needed to make the sum either 1 (for even) or -1 (for odd).
      resultOne += Math.abs(
        currentTotal + numericSequence[idx] - (isOddIndex ? -1 : 1)
      );
      // Reset the sum to the target value (1 or -1).
      currentTotal = isOddIndex ? -1 : 1;
    }
  }

  // Initialize variables for the second calculation path.
  let resultTwo = 0;
  currentTotal = 0; // Reset the running total for the second pass.

  // Second iteration: aiming for alternating signs starting with negative.
  for (let idx = 0; idx < elementCount; idx++) {
    // Determine if the *next* index (effectively, the target sign) is odd or even.
    const isOddIndex = (idx + 1) % 2;

    // Similar logic as the first loop, but the 'isOddIndex' calculation differs.
    if (!isOddIndex & (currentTotal + numericSequence[idx] > 0)) {
      currentTotal += numericSequence[idx];
    } else if (isOddIndex & (currentTotal + numericSequence[idx] < 0)) {
      currentTotal += numericSequence[idx];
    } else {
      // Adjust the sum and count the operations.
      resultTwo += Math.abs(
        currentTotal + numericSequence[idx] - (isOddIndex ? -1 : 1)
      );
      currentTotal = isOddIndex ? -1 : 1;
    }
  }

  // Output the minimum number of operations required from the two paths.
  console.log(Math.min(resultOne, resultTwo));
})(rawData);
