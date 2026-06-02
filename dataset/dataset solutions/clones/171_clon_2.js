// Core module for file system operations
var fs = require('fs');

// Determine the size of the standard input stream
var dataLength = fs.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
var inputBuffer = new Buffer(dataLength);

// Read data from standard input into the buffer
var actualBytesRead = fs.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);

// Convert the buffer content to a UTF-8 string and split it into lines
var parsedLines = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Begin program execution
executeProgram();

/**
 * Main function to process input cases and calculate optimal values.
 */
function executeProgram() {
  // Index for reading lines from the parsed input array
  let lineIndex = 0;
  // Counter for the current test case number
  let currentCaseNumber = 1;

  // Loop indefinitely until a termination condition is met
  for (;;) {
    // Read the maximum allowed weight for the current case
    let maximumCapacity = +parsedLines[lineIndex++];

    // If maximumCapacity is zero, it signifies the end of input
    if (!maximumCapacity) {
      break; // Exit the loop
    }

    // Read the number of items (treasures) for the current case
    let itemCount = +parsedLines[lineIndex++];

    // Initialize the dynamic programming array for the previous iteration
    // This array stores the maximum value achievable for each weight up to maximumCapacity
    let previousDynamicProgrammingArray = new Int16Array(maximumCapacity + 1);

    // Iterate through each item (treasure)
    for (let itemIterator = itemCount; itemIterator > 0; itemIterator--) {
      // Parse item details: value and weight
      let currentItemData = parsedLines[lineIndex++].split(",");
      let itemValue = +currentItemData[0];
      let itemWeight = +currentItemData[1];

      // Create a new DP array for the current iteration
      let currentDynamicProgrammingArray = new Int16Array(maximumCapacity + 1);

      // Fill the current DP array
      for (let capacityIterator = 1; capacityIterator <= maximumCapacity; capacityIterator++) {
        // Get the value from the previous DP array for the current capacity
        let previousValueAtCapacity = previousDynamicProgrammingArray[capacityIterator];
        // Initialize current DP value with the previous one (meaning, don't take the current item)
        currentDynamicProgrammingArray[capacityIterator] = previousValueAtCapacity;

        // Check if the current item can fit
        if (capacityIterator - itemWeight >= 0) {
          // Calculate value if the current item is taken
          let valueIfTaken = previousDynamicProgrammingArray[capacityIterator - itemWeight] + itemValue;
          // Update the current DP value if taking the item yields a higher value
          currentDynamicProgrammingArray[capacityIterator] = determineLarger(valueIfTaken, previousValueAtCapacity);
        }
      }
      // Update the previous DP array for the next item iteration
      previousDynamicProgrammingArray = currentDynamicProgrammingArray;
    }

    // After processing all items, find the optimal weight and value
    let finalWeight = 1001; // Initialize with a value outside expected range
    let finalValue = 0;     // Initialize with zero

    // Iterate through the final DP array to find the maximum value and its corresponding weight
    for (let capacityIterator = 0; capacityIterator <= maximumCapacity; capacityIterator++) {
      let valueAtIndex = previousDynamicProgrammingArray[capacityIterator];
      if (valueAtIndex > finalValue) {
        finalValue = valueAtIndex;
        finalWeight = capacityIterator;
      }
    }

    // Output the results for the current case
    console.log("Case " + currentCaseNumber++ + ":\n" + finalValue + "\n" + finalWeight);
  }
}

/**
 * Custom function to find the maximum of two numbers using bitwise operations.
 * This is a Type II clone of the original 'max' function.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The larger of the two numbers.
 */
function determineLarger(valA, valB) {
  // Calculate the difference between the two values
  let difference = valA - valB;
  // Use bitwise operations to determine the sign of the difference
  // (difference >> 31) will be -1 if difference is negative, 0 if positive/zero
  // This effectively creates a mask to select either valA or valB
  return valA - (difference & (difference >> 31));
}
