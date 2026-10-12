'use strict'

// This function processes the incoming data to duplicate image lines.
function processInput(rawData) {
  // First, we clean up the raw input by trimming whitespace and splitting it into individual lines.
  let processedLines = rawData.trim().split('\n');

  // We then extract the actual image data, skipping the first line (which might be metadata or a header).
  const imageLines = processedLines.slice(1);

  // Initialize an array to hold our modified output.
  let outputBuffer = [];

  // Iterate through each line of the extracted image data.
  for (let lineIndex = 0; lineIndex < imageLines.length; lineIndex++) {
    // For every original image line, we add it to our buffer twice.
    outputBuffer.push(imageLines[lineIndex]);
    outputBuffer.push(imageLines[lineIndex]);
  }

  // Finally, join all the lines in the buffer back into a single string, separated by newlines, and print it.
  console.log(outputBuffer.join('\n'));
}

// Read the input from standard input and pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
