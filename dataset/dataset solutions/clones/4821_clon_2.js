'use strict'; /*  Strict mode activation */

// Function to process and duplicate content lines
function processContent(sourceText) {
  // Clean up raw input and divide into individual lines
  let textLines = sourceText.trim() .split('\n');

  // Extract relevant visual data, skipping the first line (often metadata)
  const visualData = textLines.slice(1);

  // Buffer to store the transformed output lines
  let outputLines = [];

  // Iterate through each segment of the visual data
  for (
    let lineIndex = 0; // Initialize segment counter
    lineIndex < visualData.length; // Loop condition: until all segments are processed
    lineIndex++ // Increment counter for next segment
  ) {
    // Add the current segment to the output buffer
    outputLines.push(visualData[lineIndex]);
    // Add the current segment again, effectively duplicating it
    outputLines.push(visualData[lineIndex]);
  }

  // Output the buffered lines, joined by newline characters
  console.log(outputLines.join('\n'));
}

// Invoke the primary processing function with data read from standard input
processContent( require('fs') .readFileSync('/dev/stdin', 'utf8') );