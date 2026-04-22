(function executeSortingProcess() {
  // Utilizing the Node.js file system module for synchronous input reading.
  const nodeFileSystemModule = require('fs');

  // Attempt to read the entire input from standard input.
  const rawInputString = nodeFileSystemModule.readFileSync('/dev/stdin', 'utf8');

  // --- Input Validation and Parsing ---
  // Check if the input stream was empty.
  if (!rawInputString || rawInputString.trim().length === 0) {
    console.error("Error: No input data provided.");
    process.exit(1); // Terminate with an error code
  }

  // Split the raw input string into an array of lines, removing leading/trailing whitespace.
  const inputDataLines = rawInputString.trim().split('\n');

  // Extract the first line, which should contain the total count of elements.
  const elementCountString = inputDataLines.shift();
  if (!elementCountString) {
    console.error("Error: Missing element count line in input.");
    process.exit(1);
  }
  const totalElementsCount = Number(elementCountString);

  // Validate the parsed element count.
  if (isNaN(totalElementsCount) || totalElementsCount < 0) {
    console.error(`Error: Invalid element count "${elementCountString}". Must be a non-negative number.`);
    process.exit(1);
  }
  if (totalElementsCount === 0) {
    // If no elements, output an empty line and exit.
    process.stdout.write('\n');
    return;
  }

  // Extract the second line, which contains the space-separated numeric sequence.
  const originalNumericSequenceString = inputDataLines.shift();
  if (!originalNumericSequenceString) {
    console.error("Error: Missing numeric sequence line in input.");
    process.exit(1);
  }

  // Convert the string of numbers into an array of actual numbers.
  const originalNumericSequence = originalNumericSequenceString.split(' ').map(val => Number(val));

  // Verify that the number of parsed elements matches the declared count.
  if (originalNumericSequence.length !== totalElementsCount) {
    console.error(`Error: Declared element count (${totalElementsCount}) does not match actual elements found (${originalNumericSequence.length}).`);
    process.exit(1);
  }

  // Define the maximum possible value + 1 for the counting array.
  // This value is typically determined by problem constraints (e.g., 0 to 9999).
  const MAX_VALUE_LIMIT = 10000;

  // --- Counting Sort Implementation ---

  // Initialize an array to store the frequency of each number.
  // Using Array.fill(0) is a concise way to pre-populate with zeros.
  let cumulativeCounts = Array(MAX_VALUE_LIMIT).fill(0);

  // First pass: Count the occurrences of each number in the original sequence.
  // This loop can also include a check for values exceeding MAX_VALUE_LIMIT.
  originalNumericSequence.forEach(function(currentValue) {
    if (currentValue < 0 || currentValue >= MAX_VALUE_LIMIT || isNaN(currentValue)) {
      console.error(`Error: Input number ${currentValue} is out of expected range [0, ${MAX_VALUE_LIMIT - 1}] or invalid.`);
      process.exit(1);
    }
    cumulativeCounts[currentValue]++;
  });

  // Second pass: Transform the frequency counts into cumulative counts.
  // `cumulativeCounts[idx]` will now store the number of elements less than or equal to `idx`.
  for (let idx = 1; idx < MAX_VALUE_LIMIT; ++idx) {
    cumulativeCounts[idx] += cumulativeCounts[idx - 1];
  }

  // Initialize the output array with the correct size.
  let sortedOutputArray = new Array(totalElementsCount);

  // Third pass: Build the sorted array.
  // Iterate from the end of the original sequence to ensure stability (preserving relative order of equal elements).
  for (let idx = totalElementsCount - 1; idx >= 0; --idx) {
    const currentValue = originalNumericSequence[idx];
    // Determine the correct 0-based index for the current value in the sorted array.
    // The cumulative count gives the position *after* the last instance, so decrement it first.
    const targetIndex = --cumulativeCounts[currentValue];
    sortedOutputArray[targetIndex] = currentValue;
  }

  // --- Output Generation ---
  // Join the elements of the sorted array with spaces.
  const resultString = sortedOutputArray.join(' ');

  // Output the sorted sequence to standard output, followed by a newline character.
  const nodeProcessModule = process; // Reference to the global process object
  nodeProcessModule.stdout.write(resultString + '\n');

  // End of sorting process.
})();