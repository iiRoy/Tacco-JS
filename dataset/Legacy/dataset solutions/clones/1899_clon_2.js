const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Parse the first line for the number of locations and connections
const [numLocations, numConnections] = rawData[0].split(' ').map(Number);

// Parse the second line for the heights of each location
const heightsData = rawData[1].split(' ').map(Number);

// Initialize an array to track if each location is a potential peak
const isPeakCandidate = new Array(numLocations).fill(true);

// Iterate through each connection to determine actual peaks
for (let connectionIndex = 0; connectionIndex < numConnections; connectionIndex++) {
  // Extract connected locations (0-indexed)
  const [locA, locB] = rawData[connectionIndex + 2].split(' ').map(valStr => Number(valStr) - 1);

  // Compare heights of connected locations
  if (heightsData[locA] < heightsData[locB]) {
    // If locA is lower, it cannot be a peak
    isPeakCandidate[locA] = false;
  } else if (heightsData[locB] < heightsData[locA]) {
    // If locB is lower, it cannot be a peak
    isPeakCandidate[locB] = false;
  } else {
    // If heights are equal, neither can be a peak
    isPeakCandidate[locA] = isPeakCandidate[locB] = false;
  }
}

// Count the number of locations that remain peak candidates
console.log(isPeakCandidate.filter(isCandidate => isCandidate).length);
