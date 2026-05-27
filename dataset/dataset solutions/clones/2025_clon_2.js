"use strict";

const processInput = (inputData) => {
  // Normalize input string
  inputData = inputData.trim().split("\n");

  // Parse problem parameters
  const maxCircumference = parseInt(inputData[0].split(" ")[0]);
  const numPoints = parseInt(inputData[0].split(" ")[1]);
  const pointLocations = inputData[1].split(" ").map((valStr) => parseInt(valStr));

  let segmentLengths = []; // Array to store distances between points

  // Calculate lengths of segments between adjacent points
  for (let idx = 0; idx < numPoints; idx++) {
    let currentSegment;

    // Special handling for the last segment (wraps around)
    if (parseInt(idx) === numPoints - 1) {
      currentSegment = (maxCircumference - pointLocations[idx]) + pointLocations[0];
    } else {
      // Standard segment length
      currentSegment = pointLocations[parseInt(idx) + 1] - pointLocations[idx];
    }

    segmentLengths.push(currentSegment);
  }

  // Calculate the total length of all segments
  const totalLength = segmentLengths.reduce((accumulator, currentValue) => accumulator + currentValue);

  // The answer is the total length minus the longest segment
  let finalResult = totalLength - Math.max(...segmentLengths);

  // Output the computed result
  console.log(finalResult);
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
