const fileSystemAccess = require('fs');

const rawInputStrings = fileSystemAccess
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(/\s+/);

// --- Type III Changes: Additions, deletions, updates, new logic, guard clauses ---

// Early exit if no input is provided. This enhances robustness.
if (!rawInputStrings || rawInputStrings.length === 0) {
  console.error("Input data is missing or empty. Please provide valid input.");
  process.exit(1); // Indicate an error occurred
}

// The initial element denotes the total number of data entries.
const totalEntries = parseInt(rawInputStrings[0], 10); // Explicitly specify radix 10 for safety.

// Validate the parsed entry count to ensure it's a positive integer.
if (isNaN(totalEntries) || totalEntries <= 0) {
  console.error("Invalid or non-positive number of entries specified in input.");
  process.exit(1);
}

// Allocate space for two distinct sequences of numbers.
// Using Array.from for initialization is an alternative to `new Array()`.
const primaryValueSequence = Array.from({ length: totalEntries });
const secondaryValueSequence = Array.from({ length: totalEntries });

// An index pointer to navigate through the `rawInputStrings` array,
// starting from the element immediately after `totalEntries`.
let currentInputReadIndex = 1;

// Iterate to populate the two sequences from the input stream.
// We use a standard for-loop for precise control over the input reading index.
for (let dataPairIndex = 0; dataPairIndex < totalEntries; ++dataPairIndex) {
  // Ensure that there are enough elements remaining in the input for the current pair.
  if (currentInputReadIndex + 1 >= rawInputStrings.length) {
    console.error(`Incomplete input: Expected ${totalEntries} pairs, but ran out of data at pair ${dataPairIndex + 1}.`);
    process.exit(1);
  }

  // Extract the string representations of the current pair of values.
  const primaryString = rawInputStrings[currentInputReadIndex++];
  const secondaryString = rawInputStrings[currentInputReadIndex++];

  // Convert the string values to integers.
  const parsedPrimaryVal = parseInt(primaryString, 10);
  const parsedSecondaryVal = parseInt(secondaryString, 10);

  // Validate that the parsed values are indeed numbers.
  if (isNaN(parsedPrimaryVal) || isNaN(parsedSecondaryVal)) {
    console.error(`Non-numeric data found at input position for pair ${dataPairIndex + 1}.`);
    process.exit(1);
  }

  // Assign the parsed integer values to their respective sequences.
  primaryValueSequence[dataPairIndex] = parsedPrimaryVal;
  secondaryValueSequence[dataPairIndex] = parsedSecondaryVal;
}

// A reusable comparison function for sorting numbers in ascending order.
const compareNumericValuesAscending = (valX, valY) => valX - valY;

// Sort both sequences numerically.
primaryValueSequence.sort(compareNumericValuesAscending);
secondaryValueSequence.sort(compareNumericValuesAscending);

// Variables to store the calculated median(s) or sums of medians.
let computedLowerBoundMedian;
let computedUpperBoundMedian;

// Determine if the total count of entries is even or odd using a bitwise operation.
const isTotalEntriesEven = !(totalEntries & 1); // !(N % 2)

// Conditional logic based on whether the total number of entries is even or odd.
if (isTotalEntriesEven) {
  // Scenario: Even number of entries.
  // The "median" for an even set is often derived from the two central elements.
  const firstMiddleElementIndex = (totalEntries / 2) - 1; // Index of the element just before the center
  const secondMiddleElementIndex = totalEntries / 2;      // Index of the element at the center

  // Calculate the sum of these two central elements for both sequences.
  computedLowerBoundMedian = primaryValueSequence[firstMiddleElementIndex] + primaryValueSequence[secondMiddleElementIndex];
  computedUpperBoundMedian = secondaryValueSequence[firstMiddleElementIndex] + secondaryValueSequence[secondMiddleElementIndex];

} else {
  // Scenario: Odd number of entries.
  // The median is simply the single element located precisely in the middle.
  const centralElementIndex = Math.floor(totalEntries / 2); // Integer division correctly identifies the middle index.

  // Retrieve the central element for both sequences.
  computedLowerBoundMedian = primaryValueSequence[centralElementIndex];
  computedUpperBoundMedian = secondaryValueSequence[centralElementIndex];
}

// The final result represents the count of integers within the inclusive range
// defined by the lower and upper median bounds.
const resultantRangeSize = (computedUpperBoundMedian - computedLowerBoundMedian) + 1;

// Output the final calculated range size to the standard output.
console.log(resultantRangeSize);