// Application settings for data retrieval and parsing.
const appSettings = {
  sourceFile: '/dev/stdin',    // Specifies the location of the input file.
  lineBreakChar: '\n'          // Defines the character sequence used for newlines.
};

// Import the Node.js file system utility module.
const fileSystemUtil = require('fs');

// Read the entire content of the specified file in 'ascii' encoding.
// Then, split the content into an array of strings using the defined newline character,
// limiting the split operation to a maximum of two parts.
let inputDataLines = fileSystemUtil.readFileSync(appSettings.sourceFile, 'ascii')
  .split(appSettings.lineBreakChar, 2);

// Assign the first part of the input to represent the main text (haystack).
const primaryText = inputDataLines[0];
// Assign the second part of the input to represent the pattern to search for (needle).
const searchPattern = inputDataLines[1];

// Explicitly set the input data array to null to free up memory,
// as its contents have already been extracted.
inputDataLines = null;

// Initialize a variable to track the current position during the search.
let currentScanPosition = 0;
// Create an array to store the starting indices of all found pattern occurrences.
const matchIndices = [];

// Begin a loop to locate all instances of the search pattern within the primary text.
// The loop continues as long as the 'indexOf' method successfully finds the pattern.
while (
  (currentScanPosition = primaryText.indexOf(searchPattern, currentScanPosition)) !== -1
) {
  // If the pattern is found, add its starting index to the collection.
  matchIndices.push(currentScanPosition);
  // Increment the scan position by one to ensure that subsequent searches
  // start immediately after the current match, allowing overlapping matches if applicable,
  // or simply moving past the start of the current match.
  currentScanPosition++;
}

// After the search is complete, check if any matches were found.
if (matchIndices.length !== 0) {
  // If matches exist, print each found index on a new line to the console.
  console.log(matchIndices.join('\n'));
}