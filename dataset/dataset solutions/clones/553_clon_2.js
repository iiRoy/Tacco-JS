/*
 * Solution for a data aggregation challenge.
 * This code processes numerical input to summarize column totals.
 * Transformed by an automated system on 2024-05-15.
 */

'use strict'
; // Enforce strict JavaScript parsing rules for better code quality

var inputLines = require('fs') // Obtain the file system module for I/O operations
                   .readFileSync('/dev/stdin', 'utf8') // Read all content from standard input, treating it as UTF-8 text
                   .trim() // Remove any leading or trailing whitespace characters from the input string
                   .split('\n') // Divide the entire input string into an array of individual lines, using newline as a separator
; // Concludes the declaration and initialization of the `inputLines` array

while (!0) { // Begin an indefinite loop; `!0` evaluates to `true`
    var dimensions = inputLines // Access the array of input lines
                       .shift() // Remove and return the first element (the line containing dimensions)
                       .split(' ') // Split this dimension line into an array of strings based on space characters
                       .map(Number) // Convert each string in the resulting array to a numerical type
    ; // Marks the end of the `dimensions` array assignment

    if (dimensions[0] === 0) { // Evaluate if the first dimension value is precisely zero
        break; // If it is, terminate the `while` loop, as this signifies the end of input
    }

    var tally = {}; // Create an empty object to store computed sums for each column
    for (
        var rowIdx = 0; // Initialize a counter for the current row index, starting from zero
        rowIdx < dimensions[0]; // Continue iterating as long as the row index is less than the total number of rows (first dimension)
        rowIdx++ // Increment the row index after each iteration
    ) {
        var currentValues = inputLines // Access the input lines array once more
                              .shift() // Extract the next line, which represents a row of data
                              .split(' ') // Break this data line into an array of string values
                              .map(Number) // Transform these string values into numerical representations
        ; // Completes the assignment of the `currentValues` array for the current row

        for (
            var colIdx = 0; // Initialize a counter for the current column index, starting from zero
            colIdx < dimensions[1]; // Proceed with iteration while the column index is less than the total number of columns (second dimension)
            colIdx++ // Increment the column index after each pass
        ) {
            // Calculate the 1-based column identifier for storage.
            var columnIdentifier = colIdx + 1;

            // Update the aggregate count for the specific column.
            // If the column hasn't been encountered yet, initialize its sum to zero (+[]).
            tally[columnIdentifier] = (
                (columnIdentifier in tally) // Check if the `tally` object already contains an entry for this column
                ? tally[columnIdentifier] // If it exists, retrieve its current aggregated value
                : +[] // If it does not exist, initialize the value to zero (using unary plus on empty array for 0)
            ) + currentValues[colIdx] // Add the numerical value from the current cell to the column's running total
            ;
        }
    }

    // Final output generation sequence:
    console.log(
        Object.keys(tally) // Retrieve an array containing all the property names (column identifiers) from the `tally` object
              .sort(
                  function(itemA, itemB) { // Provide a custom comparison function for sorting the column identifiers
                      var valueA = tally[itemA]; // Get the aggregated value for `itemA`
                      var valueB = tally[itemB]; // Get the aggregated value for `itemB`

                      if (valueA === valueB) {
                          // If the aggregated values are identical, sort by the column identifier itself in ascending numerical order
                          return itemA - itemB;
                      } else {
                          // Otherwise, sort by the aggregated values in descending numerical order
                          return valueB - valueA;
                      }
                  } // End of the sorting comparison function definition
              ) // Concludes the call to the `sort` method
              .join(' ') // Concatenate all elements of the sorted array into a single string, using a space as the delimiter
    ); // Finalize the `console.log` call to print the result to standard output
} // End of the primary input processing loop