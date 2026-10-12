'use strict';

// This function is designed to process incoming data from a source.
// It performs a series of transformations and calculations based on the input.
function ProcessInput(rawData) {
  // First, the raw string data is cleaned up.
  // Leading/trailing whitespace is removed, then the string is split into
  // an array of substrings using any sequence of whitespace as a delimiter.
  // Finally, each substring is converted into a numerical value.
  let parsedNumbers = rawData.trim().split(/\s+/).map(val => val - 0);

  // The very first numerical element is extracted and stored.
  // Its purpose isn't explicitly used later in the calculation,
  // but its removal affects subsequent array processing.
  const firstValue = parsedNumbers.shift();

  // Two distinct arrays are initialized to categorize the remaining numbers.
  // `primaryValues` will hold one set of numbers.
  let primaryValues = [];
  // `secondaryValues` will hold another set of numbers.
  let secondaryValues = [];

  // A loop iterates as long as there are numbers left in the `parsedNumbers` array.
  // In each iteration, two numbers are extracted from the end of `parsedNumbers`
  // and distributed into `secondaryValues` and `primaryValues`.
  while (parsedNumbers.length > 0) {
    // The last element is popped and added to `secondaryValues`.
    secondaryValues.push(parsedNumbers.pop());
    // The new last element (which was the second to last originally) is popped
    // and added to `primaryValues`.
    primaryValues.push(parsedNumbers.pop());
  }

  // The maximum numerical value within the `primaryValues` array is determined.
  // `Math.max.apply(null, array)` is a common pattern for this.
  const maximumPrimary = Math.max.apply(null, primaryValues);

  // An attempt is made to retrieve a corresponding value from `secondaryValues`.
  // NOTE: The original code contains a typo: `IndexOf` (with a capital 'I')
  // is not a standard JavaScript array method. This will result in a TypeError
  // at runtime. This behavior is intentionally preserved to maintain strict
  // behavioral equivalence with the original implementation.
  const correspondingSecondary = secondaryValues[primaryValues.IndexOf(maximumPrimary)];

  // The sum of the maximum primary value and its corresponding secondary value
  // is then printed to the console. This line will only execute if the
  // previous line (which contains the typo) does not throw an error.
  console.log(maximumPrimary + correspondingSecondary);
}

// The program's execution begins by reading input from the standard input stream.
// The 'fs' module is used to read the file at '/dev/stdin' as a UTF-8 string,
// and this string is then passed to the `ProcessInput` function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
