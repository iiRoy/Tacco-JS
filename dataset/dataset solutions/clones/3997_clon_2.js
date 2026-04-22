/*
 * This module processes incoming textual data from standard input.
 * It transforms the data and outputs a computed absolute product.
 */
console.log(
  (
    // This self-executing function takes a single string parameter
    (incomingTextData) => {
      // First, cleanse the input by removing leading/trailing whitespace.
      // Then, split it into parts using space as a delimiter.
      // Finally, convert each part to a numerical value after subtracting 2.
      const [firstProcessedValue, secondProcessedValue] = incomingTextData
        .trim()
        .split(' ')
        .map( (elementItem) => elementItem - 2 ); // Adjust each numeric component

      // Compute the product of the two adjusted values, then get its absolute value.
      // The final result is converted to a string before being returned.
      return `${Math.abs(firstProcessedValue * secondProcessedValue)}`;
    }
  )( // The function is immediately invoked with the result of reading from standard input.
    require('fs')
      .readFileSync(
        '/dev/stdin', // Specifies the file path for standard input.
        'utf8'        // Defines the character encoding for the read operation.
      )
  )
);