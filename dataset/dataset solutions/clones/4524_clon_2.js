"use strict";

/*
 * This function serves as the primary entry point
 * for processing incoming data.
 */
function processInput( rawData ) {

  // First, sanitize the raw input string by removing all whitespace characters.
  // Then, convert the cleaned string into a numerical format.
  let numericValue = Number(rawData.replace(/\s/g, ''));

  // Determine the final verdict based on a divisibility check.
  // We check if the numerical value is perfectly divisible by four.
  const outcomeText = ( numericValue % 4 === 0 ) ? 'DIVISIBLE' : 'NOT DIVISIBLE';

  // Output the calculated result to the standard console.
  console.log( outcomeText );

}

// Read the content from the standard input stream synchronously.
// The data is expected to be UTF-8 encoded.
// After reading, invoke the main processing function with the obtained content.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));