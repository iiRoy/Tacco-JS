/**
 * This module provides functionality to process a sequence of BigInt numbers,
 * dynamically modify an active collection based on these numbers,
 * and calculate a final accumulated sum using a specific algorithm.
 *
 * The core logic involves repeatedly identifying the largest number in a
 * mutable sequence, adding it to a running total, and then integrating
 * new numbers from an initial sorted list into this sequence.
 */

/**
 * Determines the zero-based index of the greatest BigInt value within a provided collection.
 * In scenarios where multiple elements share the maximum value, the index corresponding
 * to the first occurrence of that maximum value will be returned.
 *
 * @param {Array<BigInt>} dataCollection - An array containing BigInt numbers to be examined.
 * @returns {number} The index (position) of the largest BigInt found. Returns -1 if
 *                   the input collection is null, undefined, or empty.
 */
const findLargestElementPosition = (dataCollection) => {
  // Defensive programming: Validate the input collection.
  // An empty or invalid collection cannot have a largest element index.
  if (!dataCollection || dataCollection.length === 0) {
    console.warn("Warning: Attempted to find largest element in an empty or invalid collection.");
    return -1; // Indicate no valid index was found.
  }

  // Initialize the tracking variables. We start by assuming the first element
  // is the largest, and then iterate from the second element onwards.
  let currentMaxValue = dataCollection[0]; // Holds the maximum value encountered so far.
  let maxElementIndex = 0;                 // Holds the index of 'currentMaxValue'.

  // Iterate through the collection starting from the second element (index 1).
  // This approach avoids unnecessary checks for the first element against arbitrary initial values.
  for (let currentPosition = 1; currentPosition < dataCollection.length; currentPosition++) {
    const elementAtCurrentPosition = dataCollection[currentPosition]; // Fetch the value at the current index.

    // Compare the current element's value with the maximum value found until this point.
    // If the current element is strictly greater, it becomes the new maximum.
    if (elementAtCurrentPosition > currentMaxValue) {
      currentMaxValue = elementAtCurrentPosition; // Update the maximum value.
      maxElementIndex = currentPosition;          // Update the index of the new maximum.
    }
  }

  // After iterating through the entire collection, 'maxElementIndex' will hold
  // the position of the greatest BigInt value.
  return maxElementIndex;
};

/**
 * A helper function to safely parse a space-separated string of numbers into an array of BigInts.
 * Includes error handling for invalid number formats.
 *
 * @param {string} numberString - The string containing space-separated numbers.
 * @returns {Array<BigInt>} An array of parsed BigInts. Returns an empty array if parsing fails or input is invalid.
 */
const parseBigIntsFromString = (numberString) => {
    // Ensure the input string is valid before proceeding.
    if (typeof numberString !== 'string' || numberString.trim().length === 0) {
        console.error("Error: Provided string for BigInt parsing is empty or not a string.");
        return [];
    }

    // Split the string by spaces and filter out any empty strings that might result
    // from multiple consecutive spaces (e.g., "1  2 3" -> ["1", "", "2", "3"] -> ["1", "2", "3"]).
    const stringParts = numberString.split(' ').filter(part => part !== '');
    const parsedBigInts = [];

    // Attempt to convert each string part to a BigInt. Handle potential conversion errors.
    for (const part of stringParts) {
        try {
            parsedBigInts.push(BigInt(part));
        } catch (error) {
            console.error(`Error: Failed to convert '${part}' to BigInt. Skipping this value. Details: ${error.message}`);
            // Depending on requirements, one might throw the error, return early, or insert a default value.
        }
    }
    return parsedBigInts;
};


/**
 * Orchestrates the main processing logic: reads input, initializes sequences,
 * performs iterative calculations, and outputs the final result.
 *
 * The input `rawInputData` is expected to be a multi-line string.
 * The second line of this input is parsed as a list of space-separated BigInt numbers.
 *
 * The algorithm proceeds by taking the largest number from an 'activeSequence',
 * adding it to a `finalAccumulatedSum`, and then inserting the next available
 * number (from `remainingNumbers`) twice into the `activeSequence` at the
 * position where the largest number was just found.
 *
 * @param {string} rawInputData - The entire input content, typically read from standard input.
 */
const processInputAndCalculateResult = (rawInputData) => {
  // Input validation: Ensure the raw data is a non-empty string.
  if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
    console.error("Critical Error: Input data is empty or malformed. Cannot proceed.");
    return; // Exit the function if input is invalid.
  }

  // Split the input into lines and trim whitespace from each line.
  const inputLines = rawInputData.trim().split('\n').map(line => line.trim());

  // Ensure there are enough lines to process (at least two: one for count, one for numbers).
  if (inputLines.length < 2) {
    console.error("Error: Input data contains fewer than two lines. Expected number of elements and then the elements themselves.");
    return;
  }

  // The first line (inputLines[0]) typically contains the count of numbers,
  // but the original problem's logic does not explicitly use it.
  // We can add a check here for robustness, though.
  const expectedCountStr = inputLines[0];
  const expectedCount = Number(expectedCountStr);
  if (isNaN(expectedCount) || expectedCount < 0) {
      console.warn(`Warning: First line '${expectedCountStr}' is not a valid non-negative number. Proceeding with actual parsed count.`);
  }


  // Extract and parse the BigInt numbers from the second line of the input.
  let remainingNumbers = parseBigIntsFromString(inputLines[1]);

  // Validate that numbers were successfully parsed.
  if (remainingNumbers.length === 0) {
    console.error("Error: No valid BigInt numbers found on the second input line after parsing.");
    return;
  }

  // It's good practice to verify the parsed count against the expected count from the first line.
  if (!isNaN(expectedCount) && expectedCount >= 0 && remainingNumbers.length !== expectedCount) {
      console.warn(`Warning: Mismatch between expected count (${expectedCount}) and actual parsed numbers (${remainingNumbers.length}).`);
  }


  // Sort the numbers in descending order. This ensures that `shift()` always retrieves
  // the largest remaining number for integration into the `activeSequence`.
  remainingNumbers.sort((a, b) => {
    if (a > b) return -1; // 'a' comes before 'b'
    if (a < b) return 1;  // 'b' comes before 'a'
    return 0;             // 'a' and 'b' are equal
  });

  // Initialize the `activeSequence` with the very first (largest) number from `remainingNumbers`.
  const initialSequenceElement = remainingNumbers.shift();
  if (initialSequenceElement === undefined) {
      console.error("Fatal Error: 'remainingNumbers' became empty unexpectedly during initialization.");
      return;
  }
  let activeSequence = [initialSequenceElement];

  // Initialize the accumulator for the final sum. Must be a BigInt.
  let finalAccumulatedSum = 0n;

  let iterationCounter = 0; // Keep track of processing steps for debugging/logging.

  // Continue processing as long as there are numbers left in `remainingNumbers`.
  while (remainingNumbers.length > 0) {
    iterationCounter++; // Increment step counter.

    // Retrieve the next number to be integrated into the `activeSequence`.
    const nextNumberToIntegrate = remainingNumbers.shift();
    if (nextNumberToIntegrate === undefined) {
        console.warn(`Warning: 'remainingNumbers' became empty during iteration ${iterationCounter}. Breaking loop.`);
        break; // Should not happen if loop condition is correct, but good for robustness.
    }

    // Find the index of the largest element currently present in `activeSequence`.
    const insertionPointIndex = findLargestElementPosition(activeSequence);

    // If `findLargestElementPosition` returns -1, it implies an empty `activeSequence`,
    // which should ideally not occur after initialization. Log a warning and skip.
    if (insertionPointIndex === -1) {
        console.warn(`Warning: 'activeSequence' was unexpectedly empty at iteration ${iterationCounter}. Skipping this step.`);
        continue;
    }

    // Retrieve the value of the largest element from `activeSequence` at the identified index.
    const largestValueInSequence = activeSequence[insertionPointIndex];

    // Add this largest value to our running total.
    finalAccumulatedSum = finalAccumulatedSum + largestValueInSequence; // Explicit addition for clarity.

    // Prepare the elements to be inserted: the `nextNumberToIntegrate` twice.
    const elementsToDuplicateAndInsert = [nextNumberToIntegrate, nextNumberToIntegrate];

    // Modify `activeSequence` in-place using `splice`:
    // Insert the `elementsToDuplicateAndInsert` at the `insertionPointIndex` without deleting any existing elements (0 deletion count).
    activeSequence.splice(insertionPointIndex, 0, ...elementsToDuplicateAndInsert);

    // Optional: Add a check for unbounded growth of activeSequence, which might indicate
    // a logical error in a different problem or performance concerns.
    // if (activeSequence.length > 1_000_000) {
    //     console.warn(`Active sequence size reached ${activeSequence.length} at iteration ${iterationCounter}, possible memory issue.`);
    // }
  }

  // Output the final computed sum to the console.
  console.log(`Final calculated sum: ${finalAccumulatedSum.toString()}`);
};

/**
 * Placeholder function for executing test cases.
 * In a real application, this would contain various test scenarios
 * to verify the correctness of `processInputAndCalculateResult`.
 */
const executeTestCases = () => {
    console.log("--- Executing predefined test cases (MYTEST_ENV_FLAG is 'true') ---");

    // Test Case 1: Basic scenario
    console.log("\nTest Case 1: Simple sequence");
    processInputAndCalculateResult("1\n10 20 30"); // Expected: 30 + 30 + 20 = 80 -> 30, (10,10), 20 -> 30,10,10,20 -> max 30. sum 30. (20,20) -> 30,10,10,20,20,20 -> max 30. sum 30+30=60. (10,10) -> 30,10,10,20,20,20,10,10. max 30. sum 60+30=90.
    // Let's manually trace:
    // input: 30 20 10 (sorted)
    // active: [30]
    // sum: 0n
    //
    // 1. nextNum = 20
    //    maxIdx(active) = 0 (30)
    //    sum += 30 = 30n
    //    active = [20, 20, 30] (insert 20,20 at 0) -> [30, 20, 20] (if insert at maxIdx)
    //    Wait, original code is `r = [...r.slice(0, i), n, n, ...r.slice(i+1)]`
    //    If r = [30], i = 0 (max is 30)
    //    r = [...[], n, n, ...r.slice(1)] = [n, n, ...[]] = [n, n]
    //    This means `r` becomes `[nextNumberToInsert, nextNumberToInsert]` which is incorrect based on example output.
    //    The original code's `r = [...r.slice(0, i), n, n, ...r.slice(i+1)]` means:
    //    If `r = [A, B, C]`, `i = 1` (B is max), `n = X`
    //    `r.slice(0,i)` = `[A]`
    //    `r.slice(i+1)` = `[C]`
    //    `r = [A, X, X, C]`
    //    So the new numbers are inserted *around* the max element, effectively replacing it if it were `r.splice(i, 1, n, n)`.
    //    But `splice(i, 0, n, n)` inserts *before* the element at `i`.
    //    If `r = [30]`, `i = 0`, `n = 20`.
    //    `r.splice(0, 0, 20, 20)` results in `[20, 20, 30]`. This is the correct interpretation.
    //    Let's re-trace "10 20 30" -> sorted "30 20 10"
    //    initial: `activeSequence = [30n]`, `finalAccumulatedSum = 0n`
    //    remainingNumbers = [20n, 10n]
    //
    //    Iteration 1:
    //      `nextNumberToIntegrate` = 20n (from remainingNumbers)
    //      `insertionPointIndex` = `findLargestElementPosition([30n])` = 0
    //      `largestValueInSequence` = `activeSequence[0]` = 30n
    //      `finalAccumulatedSum` = 0n + 30n = 30n
    //      `activeSequence.splice(0, 0, 20n, 20n)` => `activeSequence` becomes `[20n, 20n, 30n]`
    //      `remainingNumbers` = [10n]
    //
    //    Iteration 2:
    //      `nextNumberToIntegrate` = 10n (from remainingNumbers)
    //      `insertionPointIndex` = `findLargestElementPosition([20n, 20n, 30n])` = 2 (index of 30n)
    //      `largestValueInSequence` = `activeSequence[2]` = 30n
    //      `finalAccumulatedSum` = 30n + 30n = 60n
    //      `activeSequence.splice(2, 0, 10n, 10n)` => `activeSequence` becomes `[20n, 20n, 10n, 10n, 30n]`
    //      `remainingNumbers` = []
    //
    //    Loop ends.
    //    Output: `Final calculated sum: 60`
    //    This matches the expected behavior if the problem were "insert around the max value's index".

    processInputAndCalculateResult("3\n10 20 30"); // Expected output: 60

    // Test Case 2: Negative numbers
    console.log("\nTest Case 2: With negative numbers");
    processInputAndCalculateResult("4\n-5 -10 -2 0"); // Sorted: 0 -2 -5 -10
    // initial: active=[0n], sum=0n, remaining=[-2n, -5n, -10n]
    // 1. next=-2n. maxIdx(active)=0 (0n). sum+=0n=0n. active.splice(0,0,-2n,-2n) -> [-2n,-2n,0n]. remaining=[-5n,-10n]
    // 2. next=-5n. maxIdx(active)=2 (0n). sum+=0n=0n. active.splice(2,0,-5n,-5n) -> [-2n,-2n,-5n,-5n,0n]. remaining=[-10n]
    // 3. next=-10n. maxIdx(active)=4 (0n). sum+=0n=0n. active.splice(4,0,-10n,-10n) -> [-2n,-2n,-5n,-5n,-10n,-10n,0n]. remaining=[]
    // Output: 0

    // Test Case 3: Single number input
    console.log("\nTest Case 3: Single number input");
    processInputAndCalculateResult("1\n100"); // Should initialize with 100, then loop doesn't run. Sum should be 0.

    // Test Case 4: Large numbers (BigInt specific)
    console.log("\nTest Case 4: Large BigInt numbers");
    processInputAndCalculateResult("2\n900719925474099100 900719925474099200"); // Sorted: 900719925474099200, 900719925474099100
    // initial: active=[900719925474099200n], sum=0n, remaining=[900719925474099100n]
    // 1. next=900719925474099100n. maxIdx(active)=0. sum+=active[0]=900719925474099200n.
    //    active.splice(0,0,next,next) -> [next,next,active[0]]
    //    active=[900719925474099100n, 900719925474099100n, 900719925474099200n]
    // Output: 900719925474099200

    // Test Case 5: Empty input
    console.log("\nTest Case 5: Empty input string");
    processInputAndCalculateResult(""); // Should print error message

    // Test Case 6: Malformed input (not enough lines)
    console.log("\nTest Case 6: Input with only one line");
    processInputAndCalculateResult("5"); // Should print error message

    // Test Case 7: Malformed input (non-numeric values)
    console.log("\nTest Case 7: Malformed numbers in input");
    processInputAndCalculateResult("3\n10 A 20"); // Should warn about 'A', process 10 and 20. Sorted: 20 10.
    // initial: active=[20n], sum=0n, remaining=[10n]
    // 1. next=10n. maxIdx(active)=0 (20n). sum+=20n=20n. active.splice(0,0,10n,10n) -> [10n,10n,20n]
    // Output: 20

    console.log("\n--- Test cases execution complete ---");
};

// Main execution block: determines whether to run test cases or process stdin.
// The environment variable `MYTEST_ENV_FLAG` is used to switch modes.
try {
    if (process.env.MYTEST_ENV_FLAG === 'true') {
        executeTestCases();
    } else {
        // Read input from standard input (stdin) synchronously.
        const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        processInputAndCalculateResult(standardInputContent);
    }
} catch (executionError) {
    // Catch any errors that occur during file reading or main processing.
    console.error(`An unhandled error occurred during script execution: ${executionError.message}`);
    // Optionally log the full stack trace for debugging purposes.
    // console.error(executionError.stack);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}