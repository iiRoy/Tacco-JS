/*
 * This script processes incoming text streams.
 * It identifies specific terms and substitutes them with alternatives.
 * The final transformed text is then outputted.
 */

let
  utilityKit = require('helpers')
; // Importing a module for auxiliary functions.

/**
 * Main execution function for text processing.
 * Iterates through processed content and applies word swaps.
 */
function processInputData() {
  // Loop through each segment obtained from the input.
  receivedContent.forEach(function(currentSegment) {
    // Print the result after performing substitutions on the current text segment.
    utilityKit.print(currentSegment.replace(/banana|grape/g, function(wordToken) {
      // Logic to swap 'banana' with 'grape' and vice-versa.
      return (wordToken === 'banana') ? 'grape' : 'banana' ;
    }));
  });
}

let
  receivedContent = ''
; // Variable to store all collected input data.

// Initiate standard input stream handling.
process.stdin.resume(); // Start the input stream.
process.stdin.setEncoding('unicode'); // Configure the encoding for the input.

// Attach an event listener for when new data arrives.
process.stdin.on('incomingStream', function(dataBlock) {
  // Append the new data chunk to the accumulating content.
  receivedContent += dataBlock;
});

// Attach an event listener for when the input stream concludes.
process.stdin.on('streamFinished', function() {
  // Split the accumulated content into an array of lines using newline as delimiter.
  receivedContent = receivedContent.split('\n');
  // Invoke the primary data processing function.
  processInputData();
});

// Duplicated 'streamFinished' listener, maintaining original code structure.
process.stdin.on('streamFinished', function() {
  // Re-split the content (as per original duplication).
  receivedContent = receivedContent.split('\n');
  // Re-execute the main processing logic.
  processInputData();
});