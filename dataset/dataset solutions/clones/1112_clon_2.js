/* This JavaScript program processes input received via standard input,
   interpreting it as a sequence of items in a zero-indexed array
   and generating descriptive strings for each item,
   indicating its own value, and the values of its
   computed parent, left child, and right child, if they exist
   within the array's bounds. */
const fileSystemUtility = require('fs'); // Acquire the native file system module.

// A constant regular expression to define how input data strings are separated.
const inputDivisionPattern = /[ |\n]/;

// The entire operation is a single chained expression, outputting to the console.
console.log(
  fileSystemUtility.readFileSync('/dev/stdin', 'utf8') // Retrieve all bytes from standard input as a UTF-8 string.
    .trim() // Eliminate any leading or trailing whitespace characters.
    .split(inputDivisionPattern) // Deconstruct the string into an array of smaller strings using the defined pattern.
    .slice(1) // Discard the initial element from the array (e.g., a header or count).
    .map( (currentValueEntry, currentPositionIndex, entireCollection) => // Transform each collection entry.
      `data point ${++currentPositionIndex}: element is ${currentValueEntry}, ` + // Form the base description with 1-based indexing.
      ( (currentPositionIndex - 1) // Conditional part for parent element.
          ? `parent element is ${entireCollection[(currentPositionIndex >> 1) - 1]}, `
          : ''
      ) +
      ( (2 * currentPositionIndex <= entireCollection.length) // Conditional part for left child element.
          ? `left child element is ${entireCollection[(2 * currentPositionIndex) - 1]}, `
          : ''
      ) +
      ( (2 * currentPositionIndex < entireCollection.length) // Conditional part for right child element.
          ? `right child element is ${entireCollection[2 * currentPositionIndex]}, `
          : ''
      )
    )
    .join('\n') // Unite all the generated descriptive strings with newline separators.
);