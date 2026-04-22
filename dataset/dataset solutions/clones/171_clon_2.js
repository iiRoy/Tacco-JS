// Module for file system operations
var fileSystemMod = require('fs')
,    dataSize     =  fileSystemMod.fstatSync(process.stdin.fd).size
,    dataBuffer   = Buffer.alloc(dataSize)
,    octetsRead   = fileSystemMod.readSync(
  process.stdin.fd,
  dataBuffer,
  0,
  dataSize,
  0
)
,    processedLines = dataBuffer.toString('utf8', 0, octetsRead).split('\n');

// Start the main execution flow
executeProgram();


/**
 * Core logic for processing multiple test cases
 * utilizing dynamic programming for optimization.
 */
function executeProgram()
{
  let lineIndex = 0; // Tracks the current line number in processedLines
  let currentCaseNum = 1; // Counter for test cases

  // Loop indefinitely until a specific termination condition is met
  while(true) {
    // Read the maximum capacity for the current knapsack problem
    const capacityLimit = +processedLines[lineIndex++];

    // If capacityLimit is zero or falsy, it's the end of input
    if(!capacityLimit) {
      break;
    }

    // Read the number of items available for the current case
    const itemCount = +processedLines[lineIndex++];

    // Initialize the previous dynamic programming array (dp table for previous item)
    // Using Int32Array for potentially larger values than Int16Array
    let previousDynamicArray = new Int32Array(capacityLimit + 1);

    // Iterate through each item, processing them one by one
    for(let idx = itemCount; idx--;) {
      // Parse item details (value and weight) from the input line
      const itemDetails = processedLines[lineIndex++].split(",");
      const itemValue = +itemDetails[0];
      const itemWeight = +itemDetails[1];

      // Initialize the current dynamic programming array for this item
      let currentDynamicArray = new Int32Array(capacityLimit + 1);

      // Fill the current DP array based on the previous one
      for(let currentWeight = 1; currentWeight <= capacityLimit; currentWeight++) {
        const prevDynVal = previousDynamicArray[currentWeight];
        currentDynamicArray[currentWeight] = prevDynVal; // Option: don't take the current item

        // If the current item's weight allows for taking it
        if(currentWeight - itemWeight >= 0) {
          // Compare taking the item vs. not taking it, update with the maximum value
          currentDynamicArray[currentWeight] = findLarger(
            previousDynamicArray[currentWeight - itemWeight] + itemValue,
            prevDynVal
          );
        }
      }
      // Update the previous DP array for the next iteration
      previousDynamicArray = currentDynamicArray;
    }

    // After processing all items, find the optimal result
    let optimalWeight = 1001; // Initialize with a value outside typical range
    let maxAchievedValue = 0; // Stores the maximum value found

    // Iterate through the final DP array to find the best combination
    for(let loopCounter = 0; loopCounter <= capacityLimit; loopCounter++) {
      const prevDynIdxVal = previousDynamicArray[loopCounter];
      if(prevDynIdxVal > maxAchievedValue) {
        maxAchievedValue = prevDynIdxVal;
        optimalWeight = loopCounter;
      }
    }

    // Output the results for the current test case
    console.log("Case " + currentCaseNum++ + ":\n" + maxAchievedValue + "\n" + optimalWeight);
  }
}

/**
 * Returns the larger of two numbers using bitwise operations.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The larger of valA and valB.
 */
function findLarger(valA, valB) {
  var difference = valA - valB;
  return valA - (difference & (difference >> 31));
}