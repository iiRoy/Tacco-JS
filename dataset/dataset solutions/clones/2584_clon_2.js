'use strict';

// Primary function to handle the given input array
function processInput ( inputLines )
{
    // Extract numerical parameters from the first line, converting them to numbers
    const [ initialCount, iterations ] = inputLines[0] .split(' ') .map(Number);
    // Get the raw string sequence from the second line provided
    const originalString = inputLines[1];

    // Initialize a mutable sequence by reducing the original string
    let currentSequence = reduceSequence(originalString);
    // console.debug('Initial reduced sequence:', currentSequence); // Debugging output, now commented differently

    // Perform iterative modifications based on the 'iterations' parameter
    for ( let charIndex = 0; charIndex < iterations; charIndex++ )
    {
        // If the sequence becomes a single character, stop further processing
        if (currentSequence.length === 1) break;
        // Modify the sequence: keep the first character and remove the next two
        currentSequence = currentSequence[0] + currentSequence.slice(3);
        // console.debug('Sequence after iteration', charIndex + 1, ':', currentSequence); // Another debug line
    }
    // Calculate the final score by subtracting the length of the final sequence from the initial count
    const finalScore = initialCount - currentSequence.length;
    // Output the computed score to the standard console
    console.log(finalScore);
}

// Helper function to remove adjacent duplicate characters from a string
function reduceSequence(inputStr) {
  let currentLength = inputStr.length; // Store the current length of the string
  let processedStr = inputStr; // Use a mutable copy for modifications

  // Iterate through the string to find and remove adjacent duplicates
  for (let charIndex = 0; charIndex < currentLength;) {
    // Check if the current character is not the last and is identical to the next one
    if (charIndex !== currentLength - 1 && processedStr[charIndex] === processedStr[charIndex + 1]) {
      // Remove the duplicate pair: keep up to current char, then skip the next two
      processedStr = processedStr.slice(0, charIndex + 1) + processedStr.slice(charIndex + 2);
      currentLength--; // Decrease the effective length of the string
    } else {
      charIndex++; // Move to the next character if no duplicate is found
    }
  }
  return processedStr; // Return the modified string without adjacent duplicates
}

// Auxiliary function to calculate the score based on string reduction
function computeScore(initialString) {
  // The score is the difference between the initial length and the length after reduction
  return initialString.length - reduceSequence(initialString).length;
}

// Function to set up standard input processing
function startProcessing() {
  let receivedData = ""; // Buffer to accumulate input data
  // Resume the standard input stream
  process.stdin.resume();
  // Set the encoding for incoming data
  process.stdin.setEncoding("utf8");

  // Event listener for incoming data chunks
  process.stdin.on("data", chunk => {
    receivedData += chunk; // Append the chunk to the buffer
  });

  // Event listener for the end of the input stream
  process.stdin.on("end", () => {
    // Split the accumulated data by newlines and pass to the main processing function
    processInput(receivedData.split("\n"));
  });
}
// Initiate the standard input handling routine
startProcessing();