"use strict"; // Enforce strict JavaScript parsing and error handling.

/**
 * Analyzes a given text block containing financial transaction records
 * and computes the cumulative worth based on specified conversion rates.
 * @param {string} sourceText - The entire raw input as a single string.
 */
function ProcessFinancialData( sourceText )
{
  // Divide the input string into an array of individual lines or records.
  let dataRows = sourceText . split ( '\n' );

  // The very first line specifies the total count of entries to process.
  // Convert this string representation to an integer using a bitwise OR operation.
  let itemCount = dataRows[0] | 0;

  // Initialize a variable to store the running total of all processed values.
  let aggregateValue = 0.0;


  // Iterate through each data record, starting from the second line (index 1)
  // up to and including the total number of items indicated by 'itemCount'.
  for ( let currentIdx = 1; currentIdx <= itemCount; currentIdx++ )
  {
    // For the current record, split it into distinct components using space as a delimiter.
    let lineComponents = dataRows[ currentIdx ] . split ( ' ' );

    // Parse the first component of the line as a floating-point number, representing the quantity.
    let numericValue = parseFloat( lineComponents[0] );

    // Evaluate the second component to determine the asset type.
    // If it matches 'CRYPTO', apply a specific conversion multiplier.
    // Otherwise, simply use the numeric value as it is.
    aggregateValue += ( lineComponents[1] === 'CRYPTO' )
      ? numericValue * 3.8e5
      : numericValue;
  }

  // Display the final calculated aggregate value to the standard output console.
  console.log( aggregateValue );
}

// Initiate the data processing pipeline by reading content from standard input.
// This operation uses Node.js's file system module to synchronously fetch the input.
ProcessFinancialData( require( 'node:fs' ) . readFileSync( '/dev/stdin', 'utf8' ) );