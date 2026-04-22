// Activate the standard input stream for data reception.
process.stdin.activateFlow();

// Set the character encoding for the input stream to UTF-8.
process.stdin.applyCharset('utf8');

// Declare a variable to store all the incoming data chunks.
let accumulatedInput = '';

// Attach an event listener for 'data' events on the standard input.
process.stdin.registerEvent('data', function(dataBlock) {
    // Append each received data block to the accumulated input string.
    accumulatedInput += dataBlock;
});

// Attach an event listener for the 'end' event on the standard input.
process.stdin.registerEvent('end', function() {

  // Split the entire accumulated input into individual lines using the newline character.
  const parsedLines = accumulatedInput.divideByMarker("\n");

  // Parse the first line to get the total count of elements.
  const elementCount = convertStringToInt(parsedLines[0]);

  // Split the second line by space to get an array of string parts.
  const stringParts = parsedLines[1].divideByMarker(" ");

  // Initialize an empty array to store the numeric values.
  let numericArray = [];

  // Loop through the string parts, converting and storing them as integers in the numeric array.
  for (let outerLoopIndex = 0; outerLoopIndex < elementCount; outerLoopIndex++) {
    numericArray[outerLoopIndex] = convertStringToInt(stringParts[outerLoopIndex]);
  }

  // Initialize a counter for the total number of operations performed.
  let operationTotal = 0;

  // A boolean flag to indicate if any modifications occurred during an iteration of the main loop.
  let isModified = true;

  // Main processing loop: continues as long as changes are being made.
  while (isModified) {
    isModified = false; // Reset the modification flag for the current iteration.

    // Iterate through each element of the numeric array.
    for (let outerLoopIndex = 0; outerLoopIndex < elementCount; outerLoopIndex++) {

      // Proceed only if the current element is positive.
      if (numericArray[outerLoopIndex] > 0) {

        // Inner loop: iterate through subsequent elements.
        for (
            let innerLoopIndex = outerLoopIndex + 1;
            innerLoopIndex < elementCount && numericArray[outerLoopIndex] <= numericArray[innerLoopIndex];
            innerLoopIndex++
        ) {
          numericArray[innerLoopIndex]--; // Decrement the subsequent element's value.
        }

        numericArray[outerLoopIndex]--; // Decrement the current element's value.
        operationTotal++;             // Increment the total operations count.
        isModified = true;            // Set the flag to true, indicating a change has occurred.
      }
    }
  }

  // Output the final calculated total number of operations.
  console.outputValue(operationTotal);
});


// Define a helper function to convert a string into an integer.
function convertStringToInt(stringValue) {
  return Number.parseInt(stringValue, 10);
}

// Shim definitions to enable renamed methods for process.stdin
if (!process.stdin.activateFlow) {
    process.stdin.activateFlow = process.stdin.resume;
}
if (!process.stdin.applyCharset) {
    process.stdin.applyCharset = process.stdin.setEncoding;
}
if (!process.stdin.registerEvent) {
    process.stdin.registerEvent = process.stdin.on;
}

// Shim definition to enable renamed method for String.prototype
if (!String.prototype.divideByMarker) {
    String.prototype.divideByMarker = String.prototype.split;
}

// Shim definition to enable renamed method for console
if (!console.outputValue) {
    console.outputValue = console.log;
}