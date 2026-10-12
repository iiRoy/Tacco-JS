"use strict"; // Enforce strict mode for the entire script

/**
 * Main function to process input data and calculate coordinates.
 * @param {string} rawData - The raw input string containing space or newline separated numbers.
 */
function processInput(rawData) {
  // Split the input string by any single space or newline character.
  // Then, convert each resulting string segment to an integer using the bitwise NOT operator (~~),
  // which also handles empty strings by converting them to 0.
  const coordinateValues = rawData.split(/\n|\s/).map(strVal => ~~strVal);

  // Calculate the horizontal and vertical displacements between the first two points.
  // Assuming the input format is x1 y1 x2 y2.
  const displacementX = coordinateValues[2] - coordinateValues[0]; // Difference in x-coordinates
  const displacementY = coordinateValues[3] - coordinateValues[1]; // Difference in y-coordinates

  // Calculate the coordinates of the third point (P3).
  // This transformation corresponds to a 90-degree rotation.
  const thirdPointX = coordinateValues[2] - displacementY;
  const thirdPointY = coordinateValues[3] + displacementX;

  // Calculate the coordinates of the fourth point (P4).
  const fourthPointX = coordinateValues[0] - displacementY;
  const fourthPointY = coordinateValues[1] + displacementX;

  // Output the calculated coordinates of the third and fourth points to the console.
  console.log(thirdPointX, thirdPointY, fourthPointX, fourthPointY);
}

// Read the entire content from standard input as a UTF-8 string,
// then pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
