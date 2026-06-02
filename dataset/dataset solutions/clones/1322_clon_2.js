var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input
var lineSegments = (rawData.trim()).split("\n"); // Process raw data into an array of distinct lines
var searchPattern = lineSegments[0]; // The initial line serves as the pattern to locate
var totalOccurrences = 0; // Initialize a counter for the total number of pattern matches

// Iterate through the processed lines, starting from the second element
for (let idx = 1; idx < lineSegments.length; idx++) {
  // If a specific termination string is encountered, halt further processing
  if (lineSegments[idx] === "END_OF_TEXT") {
    break;
  }

  // Calculate the number of times the pattern appears in the current line
  // This is done by splitting the line by the pattern and counting the resulting segments minus one.
  var currentLineMatches = (lineSegments[idx].split(searchPattern)).length - 1;

  // Accumulate the matches from the current line into the overall total
  totalOccurrences += currentLineMatches;
}

// Display the final accumulated count of pattern occurrences
console.log(totalOccurrences);
