'use strict';

// This function processes raw input to calculate a specific area.
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  const parsedLines = rawData.split('\n');

  // Extract the second line, split it by spaces, sort in descending order,
  // and store as an array of rod lengths (strings).
  const rodLengths = parsedLines[1].split(' ').sort().reverse();

  // Initialize an array to store lengths of matched pairs.
  const matchedPairs = [];

  // Initialize the variable to hold the final calculated area.
  let finalArea = 0;
  // A boolean flag to track if the first rod of a potential pair has been found.
  let foundFirstPair = false;

  // Iterate through the rod lengths array.
  for (let idx = 0; idx < rodLengths.length; idx++) {
    // Get the current rod length.
    const currentRod = rodLengths[idx];
    // Get the next three rod lengths, checking for array bounds.
    const nextRod = rodLengths[idx + 1] ? rodLengths[idx + 1] : null;
    const thirdRod = rodLengths[idx + 2] ? rodLengths[idx + 2] : null;
    const fourthRod = rodLengths[idx + 3] ? rodLengths[idx + 3] : null;

    // Check for a special case: four identical rods.
    if (currentRod === nextRod && currentRod === thirdRod && currentRod === fourthRod) {
      // If four identical rods are found, calculate area as (rod * rod) and break.
      finalArea = parseInt(currentRod * fourthRod, 10);
      break;
    }

    // Check for a pair of identical rods.
    if (currentRod === nextRod && !foundFirstPair) {
      // If a pair is found and it's the first one we're tracking, add it to matchedPairs.
      matchedPairs.push(currentRod);
      // Set the flag to true to indicate we've found the first part of a pair.
      foundFirstPair = true;
    } else {
      // If no pair, or if we're looking for the second pair, reset the flag.
      foundFirstPair = false;
    }

    // If two matched pairs have been found.
    if (matchedPairs.length === 2) {
      // Calculate the area using the two matched lengths and break.
      finalArea = parseInt(matchedPairs[0] * matchedPairs[1], 10);
      break;
    }
  }

  // Output the calculated final area to the console.
  console.log(finalArea);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
