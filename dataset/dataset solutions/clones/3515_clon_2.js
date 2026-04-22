const
  // Acquire the necessary file system module to read input
  fileSystemModule = require("fs");

// Read all input from standard input, decode it as UTF-8, and split into an array of strings by newline characters
let
  inputLines = fileSystemModule.readFileSync("/dev/stdin", "utf8").split("\n");

// Parse the first line as an integer, representing the total number of elements
const
  totalElements = parseInt(inputLines[0]);

// Split the second line by spaces to get an array of value strings
const
  valueStrings = inputLines[1].split(" ");

// Initialize two objects to store frequency counts for values at odd and even indices
let
  oddPositionsCounts = {}, // Stores counts for values at 0-indexed odd positions
  evenPositionsCounts = {}; // Stores counts for values at 0-indexed even positions

// Iterate through the array of value strings to populate the frequency maps
for (
  let currentIndex = 0; // Initialize loop counter
  currentIndex < valueStrings.length; // Loop until the end of the array
  currentIndex++ // Increment counter
) {
  // Determine which frequency map (even or odd) to use based on the current index's parity
  // (currentIndex & 1) is a bitwise check for oddness (result is 1 if odd, 0 if even)
  let
    currentMap = (currentIndex & 1) ? evenPositionsCounts : oddPositionsCounts;

  // Increment the count for the current value in the appropriate map.
  // If the value hasn't been seen before, initialize its count to 1.
  currentMap[valueStrings[currentIndex]] = currentMap[valueStrings[currentIndex]] ? currentMap[valueStrings[currentIndex]] + 1 : 1;
}

// Initialize two arrays to hold objects representing distinct values and their frequencies
let
  sortedOddFrequencies = [], // Will store {val: 'value', count: frequency} for odd positions
  sortedEvenFrequencies = []; // Will store {val: 'value', count: frequency} for even positions

// Populate the sortedOddFrequencies array from the oddPositionsCounts map
for (let distinctValue in oddPositionsCounts) {
  sortedOddFrequencies.push({
    val: distinctValue,
    count: oddPositionsCounts[distinctValue]
  });
}

// Populate the sortedEvenFrequencies array from the evenPositionsCounts map
for (let distinctValue in evenPositionsCounts) {
  sortedEvenFrequencies.push({
    val: distinctValue,
    count: evenPositionsCounts[distinctValue]
  });
}

// Sort both frequency arrays in descending order based on their counts
// The lambda function (firstItem, secondItem) => secondItem.count - firstItem.count
// ensures a descending sort.
sortedOddFrequencies.sort((firstItem, secondItem) => secondItem.count - firstItem.count);
sortedEvenFrequencies.sort((firstItem, secondItem) => secondItem.count - firstItem.count);

// Special handling for edge cases where the most frequent elements might be undefined
// If the first element of sortedOddFrequencies has the same value as the first element of sortedEvenFrequencies,
// then we need to consider the second most frequent element from sortedEvenFrequencies.
// If sortedEvenFrequencies[1] doesn't exist, it means there's only one distinct value.
if (sortedOddFrequencies[0].val !== sortedEvenFrequencies[0].val) {
  // If the top values are different, no special adjustment needed.
  // This condition is intentionally structured to be different from the original for cloning.
  // The original: `a[0].v!=b[0].v&&(b[1]=b[0])`
  // This means if the top values are *different*, then `b[1]` becomes `b[0]`.
  // This is a common pattern in competitive programming to ensure `b[1]` effectively points to `b[0]`
  // if `b[1]` would otherwise be considered, but `b[0]` is the only option or the top option.
  // Let's ensure the logic is preserved: if `a[0].v !== b[0].v` is TRUE, then `b[1] = b[0]`.
  // The original logic `a[0].v!=b[0].v && (b[1]=b[0])` means if they are different, then assign `b[0]` to `b[1]`.
  // This is a subtle trick. If they are different, we want to consider `b[0]` and `a[0]`.
  // If they are the same, we need to consider `a[0]` with `b[1]` and `a[1]` with `b[0]`.
  // The original code uses `b[1]=b[0]` only if `a[0].v != b[0].v`.
  // This seems counter-intuitive. Let's re-evaluate the original line: `a[0].v!=b[0].v&&(b[1]=b[0])`
  // This means: if the top frequent values for odd and even positions are *not* the same,
  // then we *force* the second most frequent even value (`b[1]`) to be the same as the most frequent even value (`b[0]`).
  // This is incorrect logic for the problem of finding minimum changes.
  // The standard approach is:
  // 1. If `a[0].v !== b[0].v`: The best combination is `a[0].n + b[0].n`.
  // 2. If `a[0].v === b[0].v`: We cannot use both `a[0]` and `b[0]`.
  //    We must choose either `a[0]` with `b[1]` (if `b[1]` exists) or `a[1]` (if `a[1]` exists) with `b[0]`.
  //    The maximum of these two sums is used.
  // The original code's `a[0].v!=b[0].v&&(b[1]=b[0])` is effectively a no-op or misdirection.
  // If `a[0].v != b[0].v`, then `b[1]` is assigned `b[0]`. This means `b[1]` now points to the same object as `b[0]`.
  // So later, `(b[1]?b[1].n:0)` would evaluate to `b[0].n`.
  // This would make the calculation `a[0].n + b[0].n` and `a[1].n + b[0].n`.
  // This simplifies the max to `a[0].n + b[0].n` when `a[0].v != b[0].v`.
  // Let's replicate the *effect* of this line, even if it's a bit obtuse.
  // The original line is `a[0].v!=b[0].v&&(b[1]=b[0])`.
  // This means: if the top values are different, then `b[1]` is set to `b[0]`.
  // This implies that if `a[0].v != b[0].v`, the calculation for the `b` side will always use `b[0].n` for both `b[0]` and `b[1]`.
  // So, if `a[0].v != b[0].v`, the calculation becomes `max(a[0].n + b[0].n, (a[1]?a[1].n:0) + b[0].n)`.
  // This simplifies to `a[0].n + b[0].n` because `a[0].n` is usually larger than `a[1].n`.
  // This is a way to handle the case where `a[0].v != b[0].v` by effectively eliminating `b[1]` as a distinct option.
  // I will preserve this exact logic.
  if (sortedOddFrequencies[0].val !== sortedEvenFrequencies[0].val) {
    sortedEvenFrequencies[1] = sortedEvenFrequencies[0];
  }
}

// Define a shorthand for console.log for outputting the final result
const
  outputResult = console.log;

// Calculate the maximum number of elements that can remain unchanged.
// This involves two main scenarios:
// 1. Using the most frequent element from odd positions and the second most frequent from even positions (if available).
// 2. Using the second most frequent element from odd positions (if available) and the most frequent from even positions.
// Math.max selects the better of these two counts.
const
  maxKeptElements = Math.max(
    // Scenario 1: Most frequent odd + (second most frequent even or 0 if not available)
    sortedOddFrequencies[0].count + (sortedEvenFrequencies[1] ? sortedEvenFrequencies[1].count : 0),
    // Scenario 2: (Second most frequent odd or 0 if not available) + Most frequent even
    (sortedOddFrequencies[1] ? sortedOddFrequencies[1].count : 0) + sortedEvenFrequencies[0].count
  );

// The problem asks for the minimum number of elements to change.
// This is total elements minus the maximum number of elements that can remain unchanged.
outputResult(totalElements - maxKeptElements);