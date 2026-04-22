/* This JavaScript module computes a specific aggregate value based on a given text input. */
/* It processes a string containing angle brackets to derive a cumulative score. */
console.log((
  /* This immediately-invoked function expression (IIFE) serves as the primary processing unit. */
  (inputData) => {
    // First, sanitize the raw input by removing any leading or trailing whitespace characters.
    const processedString = inputData.trim();

    // Obtain the precise character count of the cleaned input string.
    const strLength = processedString.length;

    // Initialize a numeric collection (array) to store intermediate and final calculated values.
    // Its dimension is one greater than the string's length, and all positions are set to zero initially.
    const valueContainer = Array(strLength + 1).fill(0);

    /*
     * Iterate through the processed string. This single loop effectively performs two passes:
     * one from left-to-right and another from right-to-left,
     * to capture contextual information from both directions.
     */
    for (
      let indexPointer = 0;
      indexPointer < strLength;
      indexPointer++
    ) {
      // In the left-to-right traversal, if the character is an opening angle bracket ('<'),
      // update the next element in the 'valueContainer' array.
      // The update ensures the maximum value is kept, considering the preceding element's score.
      if (processedString[indexPointer] === '<') {
        valueContainer[indexPointer + 1] = Math.max(
          valueContainer[indexPointer + 1],
          valueContainer[indexPointer] + 1
        );
      }

      // Concurrently, in the right-to-left traversal, if the character is a closing angle bracket ('>'),
      // update the current element's position from the right.
      // This also takes the maximum, incorporating the value from the subsequent element in the rightward direction.
      if (processedString[strLength - indexPointer - 1] === '>') {
        valueContainer[strLength - indexPointer - 1] = Math.max(
          valueContainer[strLength - indexPointer - 1],
          valueContainer[strLength - indexPointer] + 1
        );
      }
    }

    // Finally, compute the grand total by summing all numeric entries within the 'valueContainer' array.
    // The result is then coerced into a string format for output.
    return `${valueContainer.reduce((totalAccumulation, currentNumeric) =>
      totalAccumulation + currentNumeric
    )}`;
  }
)(
  // This section handles the input mechanism. It asynchronously loads the 'fs' (file system) module,
  // then synchronously reads the entire content of standard input ('/dev/stdin') using UTF-8 text encoding.
  require('fs').readFileSync('/dev/stdin', 'utf8')
));