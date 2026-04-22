// This script reads two numerical values from standard input,
// then computes the ceiling of their division and displays the result.

let textualInput = require('fs').readFileSync('/dev/stdin', 'utf8');

  // First, remove any leading or trailing whitespace from the raw input string.
// Then, divide the string into an array of substrings using a space as a delimiter.
// Finally, convert each of these substrings into a numerical type.
const [ divisorVal , dividendVal ] = textualInput
    .trim()
      .split(" ")
        .map(Number)
;

/*
 * Calculate the ceiling of the second value divided by the first value.
 * This result is then printed to the standard output stream.
 */
console.log(
  Math.ceil(
    dividendVal
      /
    divisorVal
  )
);