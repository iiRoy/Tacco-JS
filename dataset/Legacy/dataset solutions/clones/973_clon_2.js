const appSettings = { input: '/dev/stdin', newline: '\n' }; // Configuration for input source and line endings

// Read the entire file content synchronously and split it into an array of lines.
// We are interested in only the first two lines for this operation.
let rawInputSegments = require('fs').readFileSync(appSettings.input, 'ascii')
  .split(appSettings.newline, 2);

// Assign the first line as the main text and the second as the pattern to search for.
let primaryText = rawInputSegments[0];
let searchTarget = rawInputSegments[1];

// Release the memory occupied by the raw input array as it's no longer needed.
rawInputSegments = null;

// Initialize the starting position for the search and an array to store the indices of found occurrences.
let currentSearchPosition = 0;
let foundOccurrences = [];

// Loop through the primary text to find all occurrences of the search pattern.
// The search continues as long as the pattern is found.
while ((currentSearchPosition = primaryText.indexOf(searchTarget, currentSearchPosition)) !== -1) {
  // Store the starting index of each found occurrence.
  foundOccurrences.push(currentSearchPosition);
  // Advance the search position by one to find potentially overlapping occurrences.
  currentSearchPosition++;
}

// If any occurrences were found, print their indices, each on a new line.
if (foundOccurrences.length > 0) {
  console.log(foundOccurrences.join('\n'));
}
