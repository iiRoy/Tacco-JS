// Module for file system operations
const fileSystemModule = require('fs');
let dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;
const dataBuffer = new Buffer(dataSize);
let processedBytes = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);
const incomingLines = dataBuffer.toString('utf8', 0, processedBytes).split('\n');
initiateProcessing();

function initiateProcessing ( ) {
  let linePointer = 0;
  let currentScenarioId = 1;

  while (true) {
    const capacityLimit = +incomingLines[linePointer++];
    // If the capacity limit is zero or invalid, terminate the loop
    if (!capacityLimit) {
      break;
    }

    const itemCount = +incomingLines[linePointer++];
    let previousDynamicProgression = new Int32Array(capacityLimit + 1); // Initialize DP array for prior state

    for (let itemIndex = itemCount; itemIndex--;) {
      const itemDetails = incomingLines[linePointer++].split(",");
      const itemValue = +itemDetails[0];
      const itemWeight = +itemDetails[1];

      let currentDynamicProgression = new Int32Array(capacityLimit + 1); // DP array for current state
      for (let currentCapacity = 1; currentCapacity <= capacityLimit; currentCapacity++) {
        // If current item's weight exceeds current capacity, cannot include it
        if (currentCapacity - itemWeight < 0) {
          currentDynamicProgression[currentCapacity] = previousDynamicProgression[currentCapacity];
        } else {
          // Choose between including the item or not
          currentDynamicProgression[currentCapacity] = findMaximum(
            previousDynamicProgression[currentCapacity - itemWeight] + itemValue,
            previousDynamicProgression[currentCapacity]
          );
        }
      }
      previousDynamicProgression = currentDynamicProgression; // Update DP state for next item
    }

    let optimalWeight = 1001; // Default large weight
    let maximumValue = 0;     // Default minimum value
    // Iterate through all possible weights to find the maximum value
    for (let capacityIterator = 0; capacityIterator <= capacityLimit; capacityIterator++) {
      if (previousDynamicProgression[capacityIterator] > maximumValue) {
        maximumValue = previousDynamicProgression[capacityIterator];
        optimalWeight = capacityIterator;
      }
    }
    
    // Output the results for the current test scenario
    console.log("Case " + currentScenarioId++ + ":\n" + maximumValue + "\n" + optimalWeight);
  }
}

function findMaximum (firstValue, secondValue) {
  return (firstValue > secondValue) ? firstValue : secondValue;
}