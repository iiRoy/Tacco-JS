// This section defines configuration parameters for input processing.
// The commented line is for Windows-based systems, using a temporary file and CRLF.
// The active line is for Linux/Unix, reading from standard input with LF.
let settings = { sourcePath: '/dev/stdin', lineSeparator: '\n' };

// Read the entire file content synchronously, decode as ASCII, and split into an array of lines.
let inputLines = require('fs').readFileSync(settings.sourcePath, 'ascii')
  .split(settings.lineSeparator);

// Assign the first line to the primary string variable.
let mainString = inputLines[0];
// Assign the second line to the pattern string variable.
let searchPattern = inputLines[1];

// Iterate through the main string to find all occurrences of the search pattern.
// The loop continues as long as the pattern is found.
for (let currentIndex = mainString.indexOf(searchPattern, 0);
     currentIndex !== -1;
     currentIndex = mainString.indexOf(searchPattern, ++currentIndex)) {
  // Output the starting index of each match found.
  console.log(currentIndex);
}
