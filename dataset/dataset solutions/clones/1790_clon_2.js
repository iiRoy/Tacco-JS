'use strict';

// This function processes the provided input data to determine a specific outcome.
function ProcessInput(inputData) {
  // Split the raw input string into an array of lines, removing leading/trailing whitespace.
  const parsedLines = inputData.trim().split(/\r?\n/g);

  // Parse the first line to get the initial position and speed.
  const firstValues = parsedLines[0].split(' ').map(textVal => Number(textVal));
  const startPoint = firstValues[0];
  const speedOne = firstValues[1];

  // Parse the second line to get the target position and speed.
  const secondValues = parsedLines[1].split(' ').map(textVal => Number(textVal));
  const endPoint = secondValues[0];
  const speedTwo = secondValues[1];

  // Get the time limit from the third line.
  const timeLimit = parsedLines[2];

  // Initialize the outcome as 'NO'.
  let finalOutcome = 'NO';

  // Calculate the distance between the two points.
  const distanceGap = endPoint - startPoint;

  // Calculate the relative speed difference.
  const relativeSpeed = speedOne - speedTwo;

  // Determine if the first entity can reach or pass the second within the time limit.
  if (relativeSpeed * timeLimit > distanceGap) {
    finalOutcome = 'YES';
  }

  // Output the final determination.
  console.log(finalOutcome);
}

// Execute the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
