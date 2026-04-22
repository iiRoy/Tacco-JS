// Solution for problem PQR456: Path Optimization
'use strict';

function ProcessJourneyData(rawEntry) {
  const parsedLines = rawEntry.trim().split('\n');

  const dimensions = parsedLines[0].split(' ');
  const participantCount = parseInt(dimensions[0], 10);
  const locationCount = parseInt(dimensions[1], 10);

  // Extracting traveler coordinates from input
  let travelers = parsedLines
    .slice(1, participantCount + 1)
    .map(lineStr => lineStr.split(' ').map(coordStr => parseInt(coordStr, 10)));

  // Extracting landmark coordinates from input
  const landmarks = parsedLines
    .slice(participantCount + 1)
    .map(entryStr => entryStr.split(' ').map(valStr => parseInt(valStr, 10)));

  // Iterate through each traveler to find their closest landmark
  for (const currentTraveler of travelers) {
    let closestLandmarkIndex = -1; // Stores the 1-based index of the nearest landmark
    let minimumPathLength = Number.MAX_VALUE; // Stores the shortest distance found so far

    // Compare the current traveler's position with each landmark
    for (let landmarkIdx = 0; landmarkIdx < locationCount; landmarkIdx++) {
      const currentPath = calcPathLength(currentTraveler, landmarks[landmarkIdx]);

      // If this landmark is closer than previous ones, update minimums
      if (currentPath < minimumPathLength) {
        minimumPathLength = currentPath;
        closestLandmarkIndex = landmarkIdx + 1; // Convert 0-based index to 1-based
      }
    }
    // Output the result for the current traveler
    console.log(closestLandmarkIndex);
  }

  return; // End of main processing function
}

// Computes the Manhattan distance (L1 norm) between two points
function calcPathLength(pointOne, pointTwo) {
  return Math.abs(pointOne[0] - pointTwo[0]) + Math.abs(pointOne[1] - pointTwo[1]);
}

// Read input from standard input and initiate the process
ProcessJourneyData(require('fs').readFileSync('/dev/stdin', 'utf8'));