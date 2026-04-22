'use strict'; /* This directive enforces stricter parsing and error handling in the code. */

/**
 * Orchestrates the processing of supplied raw input data to calculate a specific geometric area.
 * @param {string} incomingData - The unprocessed string received, typically from standard input.
 */
const processGeomData = incomingData => {
  // First, segment the input string into individual lines, discarding any leading or trailing whitespace.
  const dataLines = incomingData.trim().split('\n');

  // Extract the initial dimensions (width, height) and the total number of operations from the very first line.
  // Each numerical component is parsed and assigned to its respective variable.
  let initialRectWidth = dataLines[0].split(' ').map(numStr => Number(numStr))[0];
  let initialRectHeight = dataLines[0].split(' ').map(numStr => Number(numStr))[1];
  let totalOperations = dataLines[0].split(' ').map(numStr => Number(numStr))[2];

  // Prepare separate arrays for X coordinates, Y coordinates, and the type of geometric operation.
  // These are derived from all subsequent lines of the input.
  let xCoordsList = dataLines.slice(1, dataLines.length).map(lineTxt => Number(lineTxt.split(' ')[0]));
  let yCoordsList = dataLines.slice(1, dataLines.length).map(lineTxt => Number(lineTxt.split(' ')[1]));
  let operationCodeList = dataLines.slice(1, dataLines.length).map(lineTxt => Number(lineTxt.split(' ')[2]));

  // Initialize the four corner points of the working rectangular region.
  // These points define the current boundaries: bottom-left, top-left, top-right, bottom-right.
  let boundaryPointsArray = [
    { xVal: 0, yVal: 0 },                                  // Point A: Represents the origin or bottom-left.
    { xVal: 0, yVal: initialRectHeight },                  // Point B: Represents the top-left.
    { xVal: initialRectWidth, yVal: initialRectHeight },  // Point C: Represents the top-right.
    { xVal: initialRectWidth, yVal: 0 }                   // Point D: Represents the bottom-right.
  ];

  // Iterate through each specified operation to dynamically adjust the rectangle's boundaries.
  // Each operation effectively "cuts" a portion of the current rectangular area.
  for (let currentOpIdx = 0; currentOpIdx < operationCodeList.length; currentOpIdx++) {
    let currentActionType = operationCodeList[currentOpIdx]; // Retrieve the specific type of the current operation.

    // Apply the necessary boundary modification based on the determined operation type.
    switch (currentActionType) {
      case 1: // Action 1: Restrict from the left (x < X_i), effectively moving the left boundary rightward.
        boundaryPointsArray[0].xVal = xCoordsList[currentOpIdx] > boundaryPointsArray[0].xVal ? xCoordsList[currentOpIdx] : boundaryPointsArray[0].xVal;
        boundaryPointsArray[1].xVal = xCoordsList[currentOpIdx] > boundaryPointsArray[1].xVal ? xCoordsList[currentOpIdx] : boundaryPointsArray[1].xVal;
        break;
      case 2: // Action 2: Restrict from the right (x > X_i), effectively moving the right boundary leftward.
        boundaryPointsArray[2].xVal = xCoordsList[currentOpIdx] < boundaryPointsArray[2].xVal ? xCoordsList[currentOpIdx] : boundaryPointsArray[2].xVal;
        boundaryPointsArray[3].xVal = xCoordsList[currentOpIdx] < boundaryPointsArray[3].xVal ? xCoordsList[currentOpIdx] : boundaryPointsArray[3].xVal;
        break;
      case 3: // Action 3: Restrict from the bottom (y < Y_i), effectively moving the bottom boundary upward.
        boundaryPointsArray[0].yVal = yCoordsList[currentOpIdx] > boundaryPointsArray[0].yVal ? yCoordsList[currentOpIdx] : boundaryPointsArray[0].yVal;
        boundaryPointsArray[3].yVal = yCoordsList[currentOpIdx] > boundaryPointsArray[3].yVal ? yCoordsList[currentOpIdx] : boundaryPointsArray[3].yVal;
        break;
      case 4: // Action 4: Restrict from the top (y > Y_i), effectively moving the top boundary downward.
        boundaryPointsArray[1].yVal = yCoordsList[currentOpIdx] < boundaryPointsArray[1].yVal ? yCoordsList[currentOpIdx] : boundaryPointsArray[1].yVal;
        boundaryPointsArray[2].yVal = yCoordsList[currentOpIdx] < boundaryPointsArray[2].yVal ? yCoordsList[currentOpIdx] : boundaryPointsArray[2].yVal;
        break;
    }
  }

  // Calculate the final dimensions of the rectangle.
  // IMPORTANT: The original implementation defines 'width' as (minX - maxX) and 'height' as (minY - maxY).
  // This means a 'normal' rectangle will yield negative values for these variables.
  const finalCalculatedWidth = boundaryPointsArray[0].xVal - boundaryPointsArray[2].xVal; // Resulting (min X - max X)
  const finalCalculatedHeigth = boundaryPointsArray[0].yVal - boundaryPointsArray[1].yVal; // Resulting (min Y - max Y)

  // Compute the raw area using these potentially negative dimensions.
  const currentAreaValue = finalCalculatedHeigth * finalCalculatedWidth;

  // Evaluate the conditions based on the original problem's specific output requirements.
  // If either calculated dimension (min-max) is negative (implying a valid, non-collapsed extent),
  // then the problem's logic dictates an output of zero.
  if (finalCalculatedWidth < 0 || finalCalculatedHeigth < 0) {
    console.log(0); // Output zero as per the problem's interpretation for a "normal" rectangle.
    return;         // Immediately exit the function.
  }

  // If both calculated dimensions (min-max) are non-negative, it signifies a collapsed
  // or inverted rectangle (minX >= maxX AND minY >= maxY). In this scenario,
  // the computed area (which will be >= 0) is the intended output.
  console.log(currentAreaValue >= 0 ? currentAreaValue : 0); // Output the calculated area, ensuring it's non-negative.
};

// Initiate the data processing by reading the entire content from standard input.
processGeomData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));