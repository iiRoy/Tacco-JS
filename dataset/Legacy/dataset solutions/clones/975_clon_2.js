const processingOptions = {
  sourcePath: '/dev/stdin', // Specifies the input file location
  lineSeparator: '\n'       // Defines the character sequence for new lines
};

// Reads the entire content of the specified file using 'ascii' encoding.
// The content is then split into an array of strings, using the defined line separator,
// and limited to a maximum of two resulting parts.
let fileContentParts = require('fs').readFileSync(processingOptions.sourcePath, 'ascii')
  .split(processingOptions.lineSeparator, 2);

// The first segment of the file content is assigned as the main text.
const mainText = fileContentParts[0];
// The second segment is assigned as the substring to search for.
const substringToFind = fileContentParts[1];

// The array holding the file content parts is no longer needed,
// so its reference is cleared to potentially free up memory.
fileContentParts = null;

// Initializes a variable to track the current position in the main text
// from which to start the search.
let currentPosition = 0;
// An array to store all the starting indices where the substring is found.
const foundStartIndices = [];

// Continuously searches for the substring within the main text.
// The search begins at 'currentPosition' and updates 'currentPosition'
// with the index of the next occurrence found.
while ((currentPosition = mainText.indexOf(substringToFind, currentPosition)) !== -1) {
  // If an occurrence is found, its starting index is added to the results array.
  foundStartIndices.push(currentPosition);
  // The search position is then advanced by one character to allow for
  // finding overlapping occurrences of the substring.
  currentPosition++;
}

// Prints each found index on a new line to the console.
console.log(foundStartIndices.join('\n'));
