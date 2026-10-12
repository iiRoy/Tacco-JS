function ProcessInput(inputDataString) {
  // This function takes a raw string input and processes it according to specific rules.
  // It then calculates and prints a final sum based on modified arrays.

  // Split the entire input string into an array of lines.
  let parsedLines = inputDataString.split("\n");

  // Extract the first two numeric values from the initial line.
  // The `- 0` idiom is used for explicit string-to-number conversion.
  const countFirst = parsedLines[0].split(" ")[0] - 0;
  const countSecond = parsedLines[0].split(" ")[1] - 0;

  // Process the second line of input:
  // 1. Split by space.
  // 2. Convert each part to a number.
  // 3. Sort the numbers in descending order.
  // 4. Keep only the first `countFirst` elements.
  let firstArray = parsedLines[1]
    .split(" ")
    .map((val) => val - 0)
    .sort((valA, valB) => valB - valA)
    .filter((val, idx) => idx < countFirst);

  // Process the third line of input similarly:
  // 1. Split by space.
  // 2. Convert each part to a number.
  // 3. Sort the numbers in descending order.
  // 4. Keep only the first `countSecond` elements.
  let secondArray = parsedLines[2]
    .split(" ")
    .map((val) => val - 0)
    .sort((valA, valB) => valB - valA)
    .filter((val, idx) => idx < countSecond);

  // Process the fourth line of input:
  // 1. Split by space.
  // 2. Convert each part to a number.
  // 3. Sort the numbers in descending order.
  let replacementArray = parsedLines[3]
    .split(" ")
    .map((val) => val - 0)
    .sort((valA, valB) => valB - valA);

  // Initialize index pointers to the last (smallest) elements of the sorted arrays.
  let firstIdx = firstArray.length - 1;
  let secondIdx = secondArray.length - 1;

  // Iterate through each value in the replacement array.
  for (let loopIndex = 0; loopIndex < replacementArray.length; loopIndex++) {
    const currentReplacement = replacementArray[loopIndex];

    // Determine if the current replacement value can replace an element in either array.
    // A replacement occurs if `currentReplacement` is greater than the smallest element
    // in `firstArray` (if `firstArray` is not exhausted) OR
    // if `currentReplacement` is greater than the smallest element
    // in `secondArray` (if `secondArray` is not exhausted).
    if (
      (currentReplacement > firstArray[firstIdx] && firstIdx >= 0) ||
      (currentReplacement > secondArray[secondIdx] && secondIdx >= 0)
    ) {
      // If `firstArray` is not exhausted AND its smallest element is less than
      // `secondArray`'s smallest element (or `secondArray` is exhausted),
      // replace in `firstArray`.
      if (firstIdx >= 0 && firstArray[firstIdx] < secondArray[secondIdx]) {
        firstArray[firstIdx] = currentReplacement;
        firstIdx--; // Move the pointer to the next smallest element in `firstArray`.
      }
      // Otherwise, if `secondArray` is not exhausted, replace in `secondArray`.
      else if (secondIdx >= 0) {
        secondArray[secondIdx] = currentReplacement;
        secondIdx--; // Move the pointer to the next smallest element in `secondArray`.
      }
    }
  }

  // Calculate the total sum of all elements in the modified `firstArray` and `secondArray`.
  let calculatedSum = 0;
  firstArray.forEach((itemVal) => (calculatedSum += itemVal));
  secondArray.forEach((itemVal) => (calculatedSum += itemVal));

  // Output the final computed sum to the console.
  console.log(calculatedSum);
}

// Read the entire content from standard input as a UTF-8 string
// and pass it to the `ProcessInput` function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
