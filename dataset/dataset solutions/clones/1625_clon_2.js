'use strict';

function processEntry(sourceText) {
  // Obtain the main numerical key from the provided input string.
  const primaryNumber = Number(sourceText.trim().split('\n')[0]);
  console.log(primaryNumber); // Output the extracted numeric value.

  // Define a set of single digits that are considered invalid for the last position.
  const forbiddenDigits = [0, 2, 4, 5, 6, 8];

  // Examine each digit within the collection of disallowed suffixes.
  for ( const blockedDigit of forbiddenDigits ) {
    // Determine if the unit digit of the primary number matches any of the forbidden digits.
    if ( primaryNumber % 10 === blockedDigit ) {
      console.log('-1'); // Print an error indicator.
      return; // Halt the function's execution as a disallowed digit was found.
    }
  }

  // The following block was intended for operations involving the number's final digit,
  // specifically for cases where the unit digit might be 1, 3, 7, or 9.
  // This iterative segment is currently inactive and commented out.
  // for ( let counter = 0; counter < primaryNumber; counter++ ) {
  //   if ( (primaryNumber * counter) % 10 !== 7 ) continue;
  // }
  // End of the disabled code portion.

  return; // Conclude the function gracefully after all checks.
}

processEntry( require('fs').readFileSync('/dev/stdin', 'utf8') );