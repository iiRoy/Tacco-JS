function ProcessNumericStream(dataInputString) {
  // This function analyzes a sequence of numbers, identifying those
  // that appear an odd number of times within the processed subset.
  // It's designed to mimic a specific input parsing and processing pattern.

  // --- Input Parsing and Initial Data Preparation (Type III: Rewritten with robustness) ---
  // Step 1: Split the raw string into lines, convert to numbers, and filter out invalid entries.
  // .trim() is added for robustness against leading/trailing whitespace on lines.
  // .filter(!isNaN) handles potential empty strings or non-numeric lines, including trailing newlines resulting in NaN.
  let numericSequence = dataInputString
    .split("\n")
    .map(line => Number(line.trim()))
    .filter(val => !isNaN(val));

  // Type III: Add a guard clause for empty or invalid input streams.
  if (numericSequence.length === 0) {
    console.error("Error: Input stream is empty or contains no valid numbers after filtering.");
    return;
  }

  // Store the initial count value provided at the beginning of the stream.
  // This `initialCountIndicator` is often 'N' in competitive programming problems.
  const initialCountIndicator = numericSequence[0];

  // Type III: Add a guard clause for an invalid count indicator.
  if (typeof initialCountIndicator !== 'number' || initialCountIndicator <= 0) {
      console.error("Error: The first element, intended as an item count, is invalid or missing.");
      return;
  }

  // --- Mimicking Original Array Manipulations (Type III: Preserving specific behavior) ---
  // The original code performed specific in-place modifications to the input array:
  // 1. input.pop(): Removes the last element. If there was a trailing newline, this removes NaN.
  //    If not, it removes the last actual data item. This behavior is preserved.
  numericSequence.pop();

  // 2. input.shift(): Removes the first element, which is the 'N' value.
  numericSequence.shift();

  // At this point, `numericSequence` contains the actual data items to be processed,
  // excluding the initial count and the very last item from the original parsed list.

  // Type III: Add a guard clause if no processable data remains.
  if (numericSequence.length === 0) {
    console.log(0); // If no items left to process, the count of odd-frequency items is 0.
    return;
  }

  // --- Core Logic: Tracking Odd-Frequency Elements (Type III: Data structure change & refactor) ---
  // Instead of an array with `some()` and `splice()`, a Set offers O(1) average time complexity
  // for additions, deletions, and lookups, significantly improving performance for larger datasets.
  // This is a major structural change while preserving the functional outcome.

  // The original code initialized `now_j` with the first element and then removed it from `input`.
  // We mimic this by initializing our Set with the first element of the `numericSequence`.
  const uniqueElementParityTracker = new Set([numericSequence[0]]);

  // The remaining elements (from the second item onwards) are then iterated over.
  // Type III: Using `slice(1)` creates a new array for the remaining elements, avoiding
  // further in-place modifications to `numericSequence` during iteration.
  const subsequentDataPoints = numericSequence.slice(1);

  // Type III: Replaced `forEach` with `reduce` for a more functional approach to iteration.
  // The `reduce` method here updates the `uniqueElementParityTracker` Set directly.
  subsequentDataPoints.reduce((accumulatorSet, currentDataItem) => {
    // If the element is already in the set, it means it has appeared an even number of times
    // (it was added, now it's being removed).
    if (accumulatorSet.has(currentDataItem)) {
      accumulatorSet.delete(currentDataItem);
    }
    // If the element is not in the set, it means it has appeared an odd number of times
    // (it's being added).
    else {
      accumulatorSet.add(currentDataItem);
    }
    return accumulatorSet; // Pass the modified set to the next iteration.
  }, uniqueElementParityTracker); // The initial value for reduce is our pre-initialized Set.

  // --- Output Result ---
  // The final size of the set represents the count of numbers that appeared an odd number of times.
  console.log(uniqueElementParityTracker.size);
}

// --- Program Entry Point (Type II: Renamed external call) ---
// Reads input from standard input and passes it to the main processing function.
ProcessNumericStream(require("fs").readFileSync("/dev/stdin", "utf8"));