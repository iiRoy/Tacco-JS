/**
 * Processes a raw string of numerical data to determine the count of unique values among the three largest numbers.
 * This function simulates a common competitive programming task where distinct elements are counted.
 *
 * @param {string} rawSequenceData - A space-separated string containing numerical values.
 */
function ProcessNumericalSequence(rawSequenceData) {
  // Step 1: Clean the input string by removing leading/trailing whitespace.
  // This ensures that the split operation works correctly without creating empty string tokens.
  const cleanedInputString = rawSequenceData.trim();

  // Step 2: Split the cleaned string into an array of string tokens using space as a delimiter.
  const numericStringTokens = cleanedInputString.split(" ");

  // Step 3: Convert each string token into a number.
  // The Number constructor is used for explicit type conversion, ensuring mathematical operations are correct.
  const convertedNumbersArray = numericStringTokens.map(Number);

  // Guard clause: If there are fewer than 3 numbers, the concept of "three largest"
  // or "distinct among the first three" needs adjustment.
  // For simplicity, we'll count distinct elements among the available numbers in such edge cases.
  if (convertedNumbersArray.length < 3) {
    const uniqueAvailable = new Set(convertedNumbersArray);
    console.log(uniqueAvailable.size);
    return;
  }

  // Step 4: Sort the entire array of numbers in descending order.
  // This is crucial as the original logic implicitly operated on the largest numbers
  // by sorting the input first and then inspecting the initial elements.
  // The comparator function (valA, valB) => valB - valA ensures descending order.
  const orderedDescendingValues = convertedNumbersArray.sort((valA, valB) => {
    // Custom comparison logic: returns a negative value if valB should come before valA (descending).
    return valB - valA;
  });

  // Step 5: Extract the three largest values from the now sorted array.
  // The slice method creates a new array containing the first three elements without modifying the original.
  const topThreeValues = orderedDescendingValues.slice(0, 3);

  // Step 6: Utilize a Set data structure to efficiently count the number of distinct elements
  // among these top three extracted values.
  // A Set inherently stores only unique values, automatically handling any duplicates.
  const distinctValueTracker = new Set();

  // Iterate over each value in the 'topThreeValues' array and add it to the Set.
  // If a value is already present in the Set, the 'add' operation has no effect,
  // thus ensuring only unique values are tracked.
  for (const valueItem of topThreeValues) {
    distinctValueTracker.add(valueItem);
  }

  // Step 7: The final count of distinct numerical values is represented by the size of the Set.
  // This size is then output to the standard console.
  console.log(distinctValueTracker.size);
}

// Entry point: Execute the main processing function.
// This typically involves reading input from standard input in competitive programming environments.
// `require("fs").readFileSync("/dev/stdin", "utf8")` is a Node.js-specific method
// to read the entire content of the standard input stream as a UTF-8 encoded string.
ProcessNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));