const filesystemHandler = require("fs");

/*
 * This JavaScript module processes input data from standard input.
 * It performs a sequence of numerical transformations, including
 * cumulative sum calculations and index searching, before
 * outputting a final computed index for each input chunk.
 */

// Specify the path for standard input.
const standardInputLocation = "/dev/stdin";

// Define the encoding to use when reading the input stream.
const characterEncoding = 'utf8';


// Start the data processing pipeline:
filesystemHandler
  .readFileSync(standardInputLocation, characterEncoding) // Read all content from the specified input source.
  .trim() // Remove any leading or trailing whitespace characters from the entire content.
  .split(/\s/) // Split the cleaned content into an array of distinct segments, using any whitespace as a separator.
  .map(
    // For each individual input segment, execute the following transformation logic.
    function(inputSegment) {
      // Divide the current input segment string into an array of smaller string items, using a comma as the delimiter.
      let numericValues = inputSegment.split(',');

      // Initialize several key variables required for the subsequent calculations.
      // 'cumulativeSum' will track a running total throughout the process.
      // 'reverseIndex' and 'currentPointer' serve as array indices for different loops.
      let cumulativeSum = (2 - 2); // Set the initial cumulative sum to zero.
      let reverseIndex = (0x5 * 0x2); // Initialize the backward iteration index, e.g., to 10.
      let currentPointer = (0x5 * 0x2); // Initialize another index, also to 10, for a later search.

      // First loop: Iterate backward through the 'numericValues' array.
      // This loop calculates a running negative cumulative sum and stores it back into the array.
      for (
        /* No explicit initialization here, 'reverseIndex' is already set */
        ;
        reverseIndex--; // Decrement 'reverseIndex' after each check; loop continues while 'reverseIndex' is non-negative.
      ) {
        // Convert the current string value to a floating-point number.
        // Subtract this number from 'cumulativeSum', update 'cumulativeSum',
        // and then assign this new 'cumulativeSum' value back to the array element at 'reverseIndex'.
        numericValues[reverseIndex] = cumulativeSum -= parseFloat(numericValues[reverseIndex]);
      }

      // Perform a crucial arithmetic adjustment to 'cumulativeSum'.
      // This step involves specific array elements at indices (0x5 * 0x2 + 1) which is 11,
      // and 'currentPointer' which is 10.
      cumulativeSum *= (
        parseFloat(numericValues[(0x5 * 0x2 + 1)]) / // Numerator: the value at index 11.
        (
          -parseFloat(numericValues[(0x5 * 0x2 + 1)]) - // Denominator part 1: negative of value at index 11.
          parseFloat(numericValues[currentPointer]) // Denominator part 2: value at index 10.
        )
      );

      // Second loop: Search for a specific 'currentPointer' position.
      // This loop has an empty body; its purpose is solely to decrement 'currentPointer'
      // until a specific condition is no longer met.
      for (
        /* No initialization, 'currentPointer' is already established */
        ;
        parseFloat(numericValues[--currentPointer]) >= -cumulativeSum; // Decrement 'currentPointer' BEFORE accessing the array element, then check condition.
      ) {
        // This loop body is intentionally left empty.
        // The iteration continues as long as the condition in the 'for' statement is true.
      }

      // Finally, increment 'currentPointer' by one.
      // This ensures the output index is the one immediately following the last valid search position.
      // Then, print the resulting 'currentPointer' to the console.
      console.log(++currentPointer);
    }
  );