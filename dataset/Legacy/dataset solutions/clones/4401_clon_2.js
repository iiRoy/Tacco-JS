'use strict';

// This function processes the raw input to determine the maximum possible area
// of a rectangle that can be formed from given plank lengths.
function ProcessInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const lines = rawData.split('\n');

  // Extract the second line, which contains space-separated plank lengths.
  // Split these lengths, sort them in descending order, and store them.
  const woodenPlanks = lines[1].split(' ').sort().reverse();

  // An array to store the lengths of the two sides of the rectangle.
  const rectangleDimensions = [];

  // A variable to keep track of the last plank length processed,
  // to avoid redundant calculations for identical consecutive planks.
  let lastProcessedPlank = 0;

  // Iterate through each plank length available in the sorted list.
  for (let plankLength of woodenPlanks) {
    // If the current plank length is the same as the one we just processed,
    // skip to the next iteration to avoid duplicate work.
    if (plankLength === lastProcessedPlank) {
      continue;
    }
    // Update the tracker with the current plank length.
    lastProcessedPlank = plankLength;

    // Count how many times this specific plank length appears in the full list.
    const countOfSamePlank = woodenPlanks.filter((individualPlank) => plankLength === individualPlank).length;

    // If there are four or more planks of this length, we can use two of them
    // to form both sides of the rectangle (a square).
    if (countOfSamePlank >= 4) {
      rectangleDimensions.push(plankLength);
      rectangleDimensions.push(plankLength);
      // Since we've found two sides, we can stop searching.
      break;
    }
    // If there are two or more planks of this length (and it's not 1 or 3,
    // which is a redundant check given the `countOfSamePlank >= 2` condition),
    // we can use one plank of this length as a side.
    else if (countOfSamePlank >= 2 && (countOfSamePlank != 1 || countOfSamePlank != 3)) {
      rectangleDimensions.push(plankLength);
    }

    // If we have successfully identified two sides for our rectangle,
    // we can terminate the loop early.
    if (rectangleDimensions.length === 2) {
      break;
    }
  }

  // After the loop, check if we managed to find two valid side lengths.
  if (rectangleDimensions.length === 2) {
    // If yes, calculate and print the area of the rectangle.
    console.log(rectangleDimensions[0] * rectangleDimensions[1]);
  } else {
    // If not, it means no rectangle could be formed, so print 0.
    console.log(0);
  }
}

// Read the entire input from standard input (e.g., /dev/stdin) as a UTF-8 string,
// and then pass it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
