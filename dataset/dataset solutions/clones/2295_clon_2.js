'use strict';

// This immediately invoked function expression (IIFE) encapsulates the logic
// for processing input data and calculating results.
(function (rawData) {
  // First, the raw input string is cleaned up:
  // - `trim()` removes leading/trailing whitespace.
  // - `split(' ')` breaks the string into an array of substrings based on spaces.
  // - `map(currentStr => Number(currentStr))` converts each substring into a numerical value.
  // These numerical values are then destructured into three constants:
  // `firstVal`, `secondVal`, and `limitVal`.
  const [firstVal, secondVal, limitVal] = rawData.trim().split(' ').map(currentStr => Number(currentStr));

  // Calculate `remainingLimit`. This value represents a modified limit
  // that accounts for `firstVal`. It ensures the result is never negative.
  const remainingLimit = Math.max(0, limitVal - firstVal);

  // Finally, compute the two output values and print them to the console.
  // The first output is `firstVal` reduced by `limitVal`, capped at zero.
  // The second output is `secondVal` reduced by `remainingLimit`, also capped at zero.
  // These two calculated numbers are placed into an array, then joined by a space
  // to form the final output string.
  console.log([Math.max(firstVal - limitVal, 0), Math.max(secondVal - remainingLimit, 0)].join(' '));

  // The IIFE is immediately invoked. The argument for `rawData` is obtained
  // by synchronously reading the entire content of the standard input (`/dev/stdin`)
  // as a UTF-8 encoded string using Node.js's built-in `fs` module.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
