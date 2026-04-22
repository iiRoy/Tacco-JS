'use strict';

const processInputData = (rawData) => {
  // Normalize the input string by trimming whitespace and splitting into individual lines.
  rawData = rawData.trim().split('\n');

  // Parse the first line to extract program parameters.
  const lineOneElements = rawData[0].split(' ');
  const itemCount = Number(lineOneElements[0]); // Number of primary entities.
  const anchorCount = Number(lineOneElements[1]); // Number of reference anchor points.

  // Extract the sections of the input array corresponding to entities and anchors.
  let entityPositions = rawData.slice(1, itemCount + 1);
  let anchorLocations = rawData.slice(itemCount + 1, anchorCount + itemCount + 1);

  // Define a utility function to convert a space-separated string of numbers into a coordinate object.
  const convertToPointObject = (coordinateString) => {
    const numericalParts = coordinateString.split(' ').map(stringPart => Number(stringPart));
    return {
      xPos: numericalParts[0], // Horizontal coordinate.
      yPos: numericalParts[1]  // Vertical coordinate.
    };
  };

  // Transform raw string arrays into arrays of structured coordinate objects.
  entityPositions = entityPositions.map(convertToPointObject);
  anchorLocations = anchorLocations.map(convertToPointObject);

  // Initialize an array to store the indices of the closest anchor for each entity.
  let nearestAnchorIndices = [];

  // Iterate over each entity to find its closest anchor location.
  entityPositions.forEach((currentEntity, entityIdx) => {
    let shortestPath = 1000000000; // Initialize with a very large value.
    let bestMatchIndex = 0;        // Index of the anchor point found to be closest so far.

    // Compare the current entity against all available anchor locations.
    anchorLocations.forEach((singleAnchor, anchorIdx) => {
      // Calculate the Manhattan distance (L1 distance) between the entity and the anchor.
      let currentPathDistance = Math.abs(currentEntity.xPos - singleAnchor.xPos) + Math.abs(currentEntity.yPos - singleAnchor.yPos);

      // If the current anchor is closer than any previously found.
      if (currentPathDistance < shortestPath) {
        shortestPath = currentPathDistance; // Update the shortest distance.
        bestMatchIndex = anchorIdx;         // Record the index of this closer anchor.
      }
    });

    // Store the determined closest anchor index for the current entity.
    nearestAnchorIndices.push(bestMatchIndex);
  });

  // Output the 1-based indices of the closest anchors to the console.
  nearestAnchorIndices.forEach(resultIndex => console.log(resultIndex + 1));
};

// Execute the main processing function with data read from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));