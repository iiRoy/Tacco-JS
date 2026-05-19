'use strict';

/*
 * This function processes raw input data to calculate connection counts for cities.
 * It parses city information and road segments, then tallies connections.
 */
function processInputData(rawInputContent) {
  // Split the entire input string into individual lines.
  let inputLines = rawInputContent.split('\n');

  // The first line contains the number of cities. Extract and convert it.
  const numberOfCities = Number(inputLines[0].split(' ')[0]);

  // Initialize an array to store all individual road segments (nodes).
  const allRoadSegments = [];

  // Iterate over the input lines, skipping the first (city count) and the last (empty or EOF).
  inputLines.slice(1, -1).forEach((currentLine) => {
    // Split each road line into its two connected city identifiers.
    const segmentParts = currentLine.split(' ');
    // Add both city identifiers from the current road segment to the list.
    allRoadSegments.push(segmentParts[0]);
    allRoadSegments.push(segmentParts[1]);
  });

  // Create an array to store the connection count for each city, initialized to zero.
  // The size of the array is equal to the total number of cities.
  const cityConnectionCounts = [...Array(numberOfCities)].fill(0);

  // Loop through all collected road segment nodes.
  for (const segmentNode of allRoadSegments) {
    // Convert the node identifier to a number, subtract 1 for zero-based indexing,
    // and increment the connection count for that specific city.
    cityConnectionCounts[Number(segmentNode) - 1] += 1;
  }

  // Output the final connection counts, each on a new line.
  console.log(cityConnectionCounts.join('\n'));
}

// Read the entire content from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
