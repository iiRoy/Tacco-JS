const processInputLine = (lineContent, offsetValue = 0) => {
  // Helper function to parse a string line into an array of numbers,
  // applying an optional offset for 0-indexing.
  return lineContent.split(' ').map(stringVal => Number(stringVal) + offsetValue);
};

// Retrieve all raw data lines from the standard input stream.
// .trim() is added to handle potential leading/trailing whitespace or empty lines.
const allInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line contains the total number of locations and the number of road connections.
const [totalLocations, numberOfRoads] = processInputLine(allInputData[0]);

// The second line provides the elevation data for each location.
const locationElevations = processInputLine(allInputData[1]);

// Initialize an array to track which locations are potential peak candidates.
// Initially, all locations are considered potential peaks.
// Using a loop for initialization instead of Array.fill() as a structural change.
const candidatePeaks = new Array(totalLocations);
for (let currentLocIndex = 0; currentLocIndex < totalLocations; currentLocIndex++) {
  candidatePeaks[currentLocIndex] = true;
}

// Iterate through each road connection to update the peak candidates status.
// A location is disqualified as a peak if an adjacent location has an equal or higher elevation.
for (let roadIterator = 0; roadIterator < numberOfRoads; roadIterator++) {
  // Parse the current road connection line.
  // The original input uses 1-based indexing, so we subtract 1 to get 0-based indices.
  const [firstEndpoint, secondEndpoint] = processInputLine(allInputData[roadIterator + 2], -1);

  // Fetch the elevations of the two connected locations.
  const elevationOfFirst = locationElevations[firstEndpoint];
  const elevationOfSecond = locationElevations[secondEndpoint];

  // Apply the peak disqualification logic:
  // If the first endpoint's elevation is less than or equal to the second,
  // then the first endpoint cannot be a peak.
  if (elevationOfFirst <= elevationOfSecond) {
    candidatePeaks[firstEndpoint] = false;
  }
  // If the second endpoint's elevation is less than or equal to the first,
  // then the second endpoint cannot be a peak.
  // This separate check correctly handles cases where elevations are equal (both become false)
  // or one is strictly lower (only that one becomes false).
  if (elevationOfSecond <= elevationOfFirst) {
    candidatePeaks[secondEndpoint] = false;
  }
}

// Count the total number of locations that remain as valid peaks.
// Using a simple loop with a counter instead of Array.filter().length for a structural change.
let finalPeakCount = 0;
for (let checkIndex = 0; checkIndex < totalLocations; checkIndex++) {
  if (candidatePeaks[checkIndex]) {
    finalPeakCount++;
  }
}

// Output the final tally of good peaks.
console.log(finalPeakCount);