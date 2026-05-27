'use strict';

// Obtain all input lines from the standard input stream.
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Discard the initial line, which typically contains metadata like the total count of items.
inputLines.shift();

// Parse the second line of input to extract the elevation values for each peak.
// Each string value is converted into an integer.
const peakElevations = inputLines.shift().split(' ').map(valStr => parseInt(valStr, 10));

// Initialize an adjacency list structure to represent connections between peaks.
// The size of this structure corresponds to the total number of peaks.
const adjacencyLists = new Array(peakElevations.length).fill(null).map(_unused => {
  return []; // Each element is an empty array, ready to store indices of connected peaks.
});

// Iterate through the remaining input lines, each describing a connection between two peaks.
inputLines.forEach(connectionString => {
  // Split the connection string by space and convert the peak identifiers to 0-based integers.
  const parsedConnection = connectionString.split(' ').map(nodeStr => parseInt(nodeStr, 10) - 1);

  // Establish a bidirectional connection in the adjacency lists.
  // If peak A is connected to peak B, then peak B is also connected to peak A.
  adjacencyLists[parsedConnection[0]].push(parsedConnection[1]);
  adjacencyLists[parsedConnection[1]].push(parsedConnection[0]);
});

// Initialize a counter for peaks that meet the "good" criteria.
let goodPeaksCount = 0;

// Traverse through each peak's adjacency list to determine if it qualifies as a "good" peak.
adjacencyLists.forEach((neighborList, currentPeakIndex) => {
  let isGoodPeak = true; // Assume the current peak is good until proven otherwise.

  // Check if the current peak has any neighboring peaks.
  if (neighborList.length > 0) {
    // If neighbors exist, iterate through them.
    neighborList.forEach(neighborIndex => {
      // A peak is NOT "good" if its elevation is less than or equal to any of its neighbors' elevations.
      if (peakElevations[currentPeakIndex] <= peakElevations[neighborIndex]) {
        isGoodPeak = false; // Mark the current peak as not good.
      }
    });
  }

  // If, after checking all neighbors (or if there were no neighbors), the peak remains marked as good,
  // increment the total count of good peaks.
  if (isGoodPeak) {
    ++goodPeaksCount;
  }
});

// Output the final tally of "good" peaks to the console.
console.log(goodPeaksCount);
