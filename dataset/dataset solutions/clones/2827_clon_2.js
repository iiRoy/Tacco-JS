'use strict';

// This function processes the raw input string to calculate area and check a condition.
const ProcessInput = (rawData) => {
  // Split the input string into lines and remove leading/trailing whitespace.
  let parsedLines = rawData.trim().split('\n');

  // Parse the first line to extract width, height, and coordinates.
  // The values are expected to be space-separated numbers.
  let dimensionsAndCoords = parsedLines[0].split(' ').map(Number);

  // Extract individual values from the parsed array.
  let widthVal = dimensionsAndCoords[0];
  let heightVal = dimensionsAndCoords[1];
  let xCoord = dimensionsAndCoords[2];
  let yCoord = dimensionsAndCoords[3];

  // Calculate the area of the rectangle divided by two.
  let areaResult = (widthVal * heightVal) / 2;

  // Initialize a flag to determine if the given coordinates are the center.
  let isCenter = 0;

  // Calculate the center coordinates of the rectangle.
  let centerX = widthVal / 2;
  let centerY = heightVal / 2;

  // Check if the provided x and y coordinates match the calculated center.
  if (centerX === xCoord && centerY === yCoord) {
    isCenter = 1; // Set flag to 1 if it's the center.
  }

  // Output the calculated half-area and the center flag.
  console.log(areaResult, isCenter);
};

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
