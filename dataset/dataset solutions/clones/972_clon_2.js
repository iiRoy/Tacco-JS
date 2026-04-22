// A set of execution parameters for the script
let runtimeOptions = { source: '/dev/stdin', lineBreak: '\u000A' };

// Fetch the file content as a series of rows
let inputData = require('fs').readFileSync(
    runtimeOptions.source,
    'utf8' // Altered encoding type from 'ascii'
  )
  .split(runtimeOptions.lineBreak);

// Extract the primary string and the pattern to locate within it
let mainText = inputData[0];
let searchQuery = inputData[1];

// Loop through the main text to find all occurrences of the search pattern
for (
  let currentMatchIndex = mainText.indexOf(searchQuery, 0);
  currentMatchIndex !== -1;
  currentMatchIndex = mainText.indexOf(searchQuery, currentMatchIndex + 1)
) {
  // Display the starting position of each discovered match
  console.log(currentMatchIndex);
}