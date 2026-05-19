function ProcessInput(rawData) {
  // Divide the incoming text into individual lines
  const lineSegments = rawData.split("\n");

  // Parse the first line to get the number of elements
  const firstLineTokens = lineSegments[0].split(" ");
  const elementCount = Number.parseInt(firstLineTokens[0], 10);

  // Extract the array of number strings from the second line
  const numberStrings = lineSegments[1].split(" ");

  // Initialize loop counter and various flags/accumulators
  let idx = 0;
  let result = 0; // This variable appears to be unused in the original logic.
  let minAbsValue = 0;
  let minAbsIndex = 0;
  let totalAbsoluteSum = 0;
  let negativeCount = 0;
  let hasZeroFlag = 0; // 0 for false, 1 for true

  // First pass: Count negative numbers and check for zeros
  // This loop determines the parity of negative numbers and presence of zero.
  for (idx = 0; idx < elementCount; idx++) {
    const currentNum = Number.parseInt(numberStrings[idx], 10);
    if (currentNum < 0) {
      negativeCount += 1;
    }
    if (currentNum === 0) {
      hasZeroFlag = 1;
    }
  }

  // Conditional block: Find the element with the smallest absolute value
  // This is only relevant if there are no zeros AND an odd number of negatives.
  if (hasZeroFlag === 0 && (negativeCount % 2) !== 0) {
    minAbsValue = Math.abs(Number.parseInt(numberStrings[0], 10));
    minAbsIndex = 0;
    // Iterate from the second element to find the minimum absolute value
    for (idx = 1; idx < elementCount; idx++) {
      const currentAbs = Math.abs(Number.parseInt(numberStrings[idx], 10));
      if (minAbsValue > currentAbs) {
        minAbsValue = currentAbs;
        minAbsIndex = idx;
      }
    }
  }

  // Second pass: Calculate the final sum based on conditions
  // This loop computes the sum of absolute values, with a potential subtraction.
  for (idx = 0; idx < elementCount; idx++) {
    const currentNumAbs = Math.abs(Number.parseInt(numberStrings[idx], 10));
    // If there's a zero OR an even count of negatives, just sum all absolute values.
    if (hasZeroFlag === 1 || (negativeCount % 2) === 0) {
      totalAbsoluteSum = totalAbsoluteSum + currentNumAbs;
    } else {
      // If no zeros AND an odd count of negatives, subtract the smallest absolute value once.
      if (idx === minAbsIndex) {
        totalAbsoluteSum = totalAbsoluteSum - currentNumAbs;
      } else {
        totalAbsoluteSum = totalAbsoluteSum + currentNumAbs;
      }
    }
  }

  // Output the final calculated sum to the console.
  console.log(totalAbsoluteSum);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
