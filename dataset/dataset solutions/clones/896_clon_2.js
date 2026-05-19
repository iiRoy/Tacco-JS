var rawData = require('fs') .readFileSync( '/dev/stdin', 'utf8' ); // Obtain raw data from standard input

// Trim any leading or trailing whitespace from the input string.
var processedString = rawData.trim();

// Iterate through the string, checking 8-character segments.
// The loop continues until there are at least 8 characters remaining to form a segment.
for ( var idx = 0; idx < processedString.length - 8; idx++ ) {
  // Extract an 8-character segment starting from the current index.
  // Each character is placed into an array.
  var charSegment = [
    processedString[idx],
    processedString[idx + 1],
    processedString[idx + 2],
    processedString[idx + 3],
    processedString[idx + 4],
    processedString[idx + 5],
    processedString[idx + 6],
    processedString[idx + 7]
  ];

  // Sort the characters in the segment alphabetically and then join them back into a string.
  var sortedSegment = charSegment.sort().join("");

  // Check if the sorted segment matches the target string "AADINNUY".
  if ( sortedSegment === "AADINNUY" ) {
    // If a match is found, replace the original 8-character segment with "AIZUNYAN".
    // This is done by concatenating the part of the string before the segment,
    // the replacement string, and the part of the string after the segment.
    processedString = processedString.slice(0, idx) + "AIZUNYAN" + processedString.slice(idx + 8, processedString.length);
    // Exit the loop immediately after the first replacement.
    break;
  }
}

// Output the final modified string to the console.
console.log(processedString);
