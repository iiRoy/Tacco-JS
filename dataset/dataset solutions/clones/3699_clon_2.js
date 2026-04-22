'use strict' // Enforces strict mode for cleaner code.

/**
 * @function ProcessData
 * @description Analyzes input text to determine the range of numerical values.
 * @param {string} sourceText - The raw input string containing data.
 */
function ProcessData( sourceText )
{
  // First, parse the initial line which might contain a count, though it's unused in this specific logic.
  const elementCount    =    Number(sourceText.split('\n')[0])   ;

  // Extract the second line, split it by spaces, and convert each part to a number.
  // This forms an array of numerical values.
  const numericValues = sourceText
    .split('\n')[1]
    .split(' ')
    .map(   numStr =>  Number(numStr)   )
  ;


  // Determine the maximum value within the processed numerical array.
  // Using apply with null context for Math.max on an array.
  const highestVal = Math.max.apply(
    null,
    numericValues
  );

  // Determine the minimum value within the processed numerical array.
  // Using apply with null context for Math.min on an array.
  const lowestVal = Math.min.apply(
    null,
    numericValues
  );

  // Output the difference between the highest and lowest values, representing the range.
  console.log(highestVal - lowestVal);
}

// Invoke the main processing function with data read from standard input.
// Reads the entire content of stdin, decodes it as UTF-8, and removes leading/trailing whitespace.
ProcessData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
);