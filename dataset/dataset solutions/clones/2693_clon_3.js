const evaluateSequenceArrangement = (rawDataString) => {
  // Ensure the provided data is a string and remove any leading/trailing whitespace.
  const cleanedData = String(rawDataString).trim();

  // Split the cleaned data into individual lines for processing.
  const lineSegments = cleanedData.split('\n');

  // Guard clause: Validate that we have at least two lines of input.
  // The first line typically contains the count (which we'll implicitly handle),
  // and the second line contains the actual sequence.
  if (lineSegments.length < 2) {
    // If input is malformed, it cannot be sorted correctly.
    // In competitive programming, this scenario might not be tested, but as a Type III
    // change, adding robustness is key.
    // For this context, we'll assume failure.
    return 'NO';
  }

  // Parse the numerical sequence from the second line.
  // We use Number() for parsing, which can result in NaN for non-numeric strings.
  // A helper variable for the raw string elements.
  const rawNumberStrings = lineSegments[1].split(' ');
  const initialArrangement = rawNumberStrings.map(strVal => {
    const parsedNum = Number(strVal);
    // Another validation: Check if any parsed value is not a number.
    if (Number.isNaN(parsedNum)) {
      // If invalid numerical data is found, the sequence is malformed.
      return 'INVALID_NUM_FOUND'; // Use a sentinel value
    }
    return parsedNum;
  });

  // Check for any invalid numbers detected during parsing.
  if (initialArrangement.includes('INVALID_NUM_FOUND')) {
      return 'NO'; // Indicate failure due to malformed numeric data.
  }

  // Determine the total number of elements in the array.
  // We are implicitly using the array's length instead of parsing N from the first line.
  const totalElementsPresent = initialArrangement.length;

  // Create a sorted reference array by copying the original and then sorting it.
  // Using the spread operator for a shallow copy before sorting.
  const sortedReference = [...initialArrangement].sort((valA, valB) => {
    // Standard numeric ascending order comparison.
    return valA - valB;
  });

  // Initialize a counter for the number of elements that are not in their sorted position.
  let misplacedItemsCount = 0;

  // Iterate through both arrays to compare elements at corresponding positions.
  for (let currentPosition = 0; currentPosition < totalElementsPresent; ++currentPosition) {
    // If an element in the initial arrangement does not match its sorted counterpart,
    // increment the discrepancy counter.
    if (initialArrangement[currentPosition] !== sortedReference[currentPosition]) {
      misplacedItemsCount++;
    }
  }

  // Based on the count of misplaced items, determine the final outcome.
  // The problem implies that if 0 or 2 items are misplaced, it's a 'YES' scenario.
  // A count of 0 means the array is already sorted.
  // A count of 2 means exactly two elements are swapped, which can be fixed with one swap.
  let finalDecision;
  if (misplacedItemsCount === 0 || misplacedItemsCount === 2) {
    finalDecision = 'YES';
  } else {
    finalDecision = 'NO';
  }

  return finalDecision;
};

// This immediately invoked function expression handles reading input and logging the result.
(() => {
  // Attempt to read input from standard input, typically used in online judges.
  // This part is environment-specific.
  const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

  // Call our primary function with the read content.
  const resultOutcome = evaluateSequenceArrangement(standardInputContent);

  // Output the final decision to standard output.
  console.log(resultOutcome);
})();