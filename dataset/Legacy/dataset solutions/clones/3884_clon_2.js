"use strict";

function ProcessInput(dataSource) {
  // Initialize a data parser instance
  let dataParserInstance = new DataStreamProcessor(dataSource);

  // Read problem parameters: item count and total track length
  let itemCount = dataParserInstance.readInteger(),
      trackLength = dataParserInstance.readInteger();

  // Allocate arrays for item positions and their associated values
  let itemPositions = new Array(itemCount + 1);
  itemPositions[0] = 0; // Starting position is always zero

  let itemValues = new Array(itemCount + 1);
  itemValues[0] = 0; // Starting value is always zero

  // Populate positions and values for each item from the input stream
  for (let currentItemIndex = 1; currentItemIndex <= itemCount; currentItemIndex++) {
    itemPositions[currentItemIndex] = dataParserInstance.readInteger();
    itemValues[currentItemIndex] = dataParserInstance.readInteger();
  }

  // Add the total track length as a final "position" for calculation purposes
  itemPositions.push(trackLength);

  // --- Calculate profits for movements in the primary (e.g., clockwise) direction ---

  // Array to store cumulative profits when moving from the start (left to right)
  let forwardProfits = new Array(itemCount + 1);
  forwardProfits[0] = 0.0; // Profit at the starting point is zero

  for (let itemIndex = 1; itemIndex <= itemCount; itemIndex++) {
    // Calculate profit: previous profit + current item value - distance traveled since last stop
    forwardProfits[itemIndex] = forwardProfits[itemIndex - 1] + itemValues[itemIndex] - (itemPositions[itemIndex] - itemPositions[itemIndex - 1]);
  }

  // Array to store cumulative profits when moving from the end backwards (right to left)
  let backwardProfits = new Array(itemCount + 1);
  backwardProfits[itemCount] = 0; // No profit if starting at the last item and not moving

  for (let revIndex = itemCount - 1; revIndex >= 0; revIndex--) {
    // Calculate profit: profit from next stop + value of next item - distance traveled to get to next item
    backwardProfits[revIndex] = backwardProfits[revIndex + 1] + itemValues[revIndex + 1] - (itemPositions[revIndex + 2] - itemPositions[revIndex + 1]);
  }

  // Initialize the maximum profit found so far to a very small numerical value
  let overallMaxGain = Number.NEGATIVE_INFINITY; // Using NEGATIVE_INFINITY for robustness

  // First pass: consider only moving forward to a point and stopping
  for (let currentPoint = 0; currentPoint <= itemCount; currentPoint++) {
    overallMaxGain = Math.max(overallMaxGain, forwardProfits[currentPoint]);

    // Second pass: consider moving forward to a point, then returning from some later point
    for (let returnPoint = currentPoint; returnPoint < itemCount; returnPoint++) {
      // Calculate a potential gain: forward profit - distance to current point + backward profit from return point
      let potentialGain = forwardProfits[currentPoint] - itemPositions[currentPoint] + backwardProfits[returnPoint];
      overallMaxGain = Math.max(overallMaxGain, potentialGain);
    }
  }

  // --- Prepare for and calculate profits for movements in the secondary (e.g., counter-clockwise) direction ---

  // Re-map item positions for the reverse direction: C - X[n]
  for (let posIndex = 0; posIndex < itemPositions.length; posIndex++) {
    itemPositions[posIndex] = trackLength - itemPositions[posIndex];
  }
  // Reverse the order of item positions array
  itemPositions.reverse();

  // Adjust item values for the reverse direction: remove first, add zero, then reverse
  itemValues.shift(); // Remove the initial zero at index 0
  itemValues.push(0); // Add a zero at the end for the new "start"
  itemValues.reverse(); // Reverse the array to align with new positions

  // Re-calculate forward profits for the reversed scenario
  forwardProfits[0] = 0.0;
  for (let currentPointIndex = 1; currentPointIndex <= itemCount; currentPointIndex++) {
    forwardProfits[currentPointIndex] = forwardProfits[currentPointIndex - 1] + itemValues[currentPointIndex] - (itemPositions[currentPointIndex] - itemPositions[currentPointIndex - 1]);
  }

  // Re-calculate backward profits for the reversed scenario
  backwardProfits[itemCount] = 0;
  for (let reverseScanIndex = itemCount - 1; reverseScanIndex >= 0; reverseScanIndex--) {
    backwardProfits[reverseScanIndex] = backwardProfits[reverseScanIndex + 1] + itemValues[reverseScanIndex + 1] - (itemPositions[reverseScanIndex + 2] - itemPositions[reverseScanIndex + 1]);
  }

  // Update the overall maximum profit with results from the reversed scenario
  for (let currentStop = 0; currentStop <= itemCount; currentStop++) {
    overallMaxGain = Math.max(overallMaxGain, forwardProfits[currentStop]);
    for (let secondaryStop = currentStop; secondaryStop < itemCount; secondaryStop++) {
      let combinedGain = forwardProfits[currentStop] - itemPositions[currentStop] + backwardProfits[secondaryStop];
      overallMaxGain = Math.max(overallMaxGain, combinedGain);
    }
  }

  // Output the final maximum profit calculated
  console.log(overallMaxGain);
}

class DataStreamProcessor {
  constructor(inputSourceData) {
    if (typeof inputSourceData === 'undefined') {
      throw new Error('Input source argument cannot be omitted!');
    }
    this.dataPointer = 0; // Current position in the data elements array
    this.dataElements = inputSourceData.split(/\n|\s/); // Split input by newlines or spaces
  }

  readInteger() {
    // Retrieve the next data element and convert it to a number (integer)
    return Number(this.dataElements[this.dataPointer++]);
  }

  readIntegerArray(arraySize) {
    if (typeof arraySize === 'undefined' || arraySize < 1) {
      throw new Error('Array size argument must be a positive integer!');
    }
    let resultArray = new Array(arraySize);
    for (let arrayElementIndex = 0; arrayElementIndex < arraySize; arrayElementIndex++) {
      resultArray[arrayElementIndex] = this.readInteger();
    }
    return resultArray;
  }

  readString() {
    // Retrieve the next data element as a string
    return this.dataElements[this.dataPointer++];
  }

  readStringArray(arrayLength) {
    if (typeof arrayLength === 'undefined' || arrayLength < 1) {
      throw new Error('Array length argument must be a positive integer!');
    }
    let stringCollection = new Array(arrayLength);
    for (let collectionIndex = 0; collectionIndex < arrayLength; collectionIndex++) {
      stringCollection[collectionIndex] = this.readString();
    }
    return stringCollection;
  }
}

// Check if the script is running in a Node.js-like environment (not a browser)
if (typeof globalThis.window === "undefined") {
  // If so, read input from standard input and pass to the main processing function
  ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
}