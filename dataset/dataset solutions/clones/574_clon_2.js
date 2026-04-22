let dataStream = require('node:fs').readFileSync('/dev/stdin', 'utf-8'); // Obtain raw input from standard input stream.

let numericSequence = dataStream.trim().split('\n').map(Number); /* Process input:
                                                                 * 1. Remove leading/trailing whitespace.
                                                                 * 2. Split by newline characters.
                                                                 * 3. Convert each resulting string segment to a number.
                                                                 */

while (true) // Main processing loop, continues until a specific termination condition is met.
{
  let currentBlockSize = numericSequence.shift(); // Extract the size of the next data block from the sequence.

  if (currentBlockSize === 0) { // Terminate loop if the block size indicator is zero.
    break;
  }

  let processedValues = []; // Initialize an array to store processed values for the current block.

  let flipFlopState = false; // A boolean flag used to alternate logic within the upcoming iteration.

  for (let iterationIndex = 0; iterationIndex < currentBlockSize; ++iterationIndex) // Iterate through each item in the current data block.
  {
    const receivedValue = numericSequence.shift(); // Retrieve the next value from the input sequence.

    let currentPosition = iterationIndex; // Initialize a position counter for potential back-tracking operations.

    flipFlopState = !flipFlopState; // Toggle the state of the flip-flop flag for alternating behavior.

    if (flipFlopState) { // If the flip-flop state is currently true, append the value directly.
      processedValues.push(receivedValue);
    }
    else { // When the flip-flop state is false, apply more complex logic.
      if (processedValues.length > 0 && processedValues[processedValues.length - 1] === receivedValue) {
        // If the last processed value matches the current received value, append it.
        processedValues.push(receivedValue);
      }
      else { // If the last value does not match, or array is empty.
        processedValues.push(receivedValue); // Add the current value to the end of the array.

        currentPosition--; // Decrement the position to start checking previous elements.

        while (true) // Inner loop for back-tracking and modification of preceding elements.
        {
          if (currentPosition < 0 || processedValues[currentPosition] === receivedValue) {
            // Exit if array boundary is reached or a matching value is found during back-track.
            break;
          }
          else { // If no match is found and not out of bounds, overwrite the element.
            processedValues[currentPosition] = receivedValue; // Overwrite the element at the current back-tracked position.
            currentPosition--; // Move to the previous element in the array.
          }
        }
      }
    }
  }

  let zeroCount = 0; // Initialize a counter for zero values found in the final processed array.

  processedValues.forEach(function (valElement) { // Iterate through the final array of processed values.
    if (valElement === 0) { // Check if the current element is zero.
      zeroCount++; // Increment the counter if the value is indeed zero.
    }
  });

  console.log(zeroCount); // Output the total count of zeros for the current data block.
}