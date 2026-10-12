// This module contains functions for processing location data and queries.

/**
 * Processes raw input data to calculate minimum distances for various queries.
 * @param {string} rawInputData - The complete input string, typically from stdin.
 * @returns {Array<Object>} An array of location records after initial processing.
 */
function processLocationQueries(rawInputData) {
  // Divide the incoming raw data into separate lines.
  const dataLines = rawInputData.split("\n");

  // Extract the initial configuration parameters from the first line.
  const configValues = dataLines[0].split(" ");
  const countOfFirstType = Number(configValues[0]); // Number of locations of the first category.
  const countOfSecondType = Number(configValues[1]); // Number of locations of the second category.
  const numberOfQueries = Number(configValues[2]); // Total number of queries to execute.

  // Initialize a collection to hold all location entries.
  const allLocationEntries = [];
  let currentLinePointer = 1; // Pointer to the current line being read in dataLines.

  // Populate the collection with locations of the first type.
  for (let k = 0; k < countOfFirstType; k++, currentLinePointer++) {
    allLocationEntries.push({
      category: 1, // Designates the first category.
      coordinate: Number(dataLines[currentLinePointer]), // The spatial coordinate of the location.
      minimumReach: Number.MAX_VALUE // Initialized to a very large value, representing infinite distance.
    });
  }

  // Populate the collection with locations of the second type.
  for (let k = 0; k < countOfSecondType; k++, currentLinePointer++) {
    allLocationEntries.push({
      category: 2, // Designates the second category.
      coordinate: Number(dataLines[currentLinePointer]), // The spatial coordinate.
      minimumReach: Number.MAX_VALUE // Initialized minimum reach.
    });
  }

  // Arrange all location entries in ascending order based on their coordinates.
  allLocationEntries.sort((entryOne, entryTwo) => entryOne.coordinate - entryTwo.coordinate);

  let previousCategoryOne; // Keeps track of the most recently encountered category 1 location.
  let previousCategoryTwo; // Keeps track of the most recently encountered category 2 location.

  // Iterate through the sorted entries to compute initial minimum reaches between different categories.
  allLocationEntries.forEach(currentEntry => {
    if (currentEntry.category === 1) {
      // If the current entry is of category 1.
      if (previousCategoryTwo) {
        // If a category 2 entry was previously observed.
        previousCategoryTwo.minimumReach = Math.min(previousCategoryTwo.minimumReach, currentEntry.coordinate - previousCategoryTwo.coordinate);
        currentEntry.minimumReach = currentEntry.coordinate - previousCategoryTwo.coordinate;
      }
      previousCategoryOne = currentEntry; // Update the last seen category 1 entry.
    } else {
      // If the current entry is of category 2.
      if (previousCategoryOne) {
        // If a category 1 entry was previously observed.
        previousCategoryOne.minimumReach = Math.min(previousCategoryOne.minimumReach, currentEntry.coordinate - previousCategoryOne.coordinate);
        currentEntry.minimumReach = currentEntry.coordinate - previousCategoryOne.coordinate;
      }
      previousCategoryTwo = currentEntry; // Update the last seen category 2 entry.
    }
  });

  // Process each individual query.
  for (let k = 0; k < numberOfQueries; k++, currentLinePointer++) {
    const queryCoordinate = Number(dataLines[currentLinePointer]); // The coordinate for the current query.
    const relevantIndex = findNearestEntryIndex(allLocationEntries, queryCoordinate); // Find the index of the closest location entry.
    let finalCalculatedDistance = 0; // Variable to store the computed minimum total distance.

    // Determine the final calculated distance based on the relevant index.
    if (relevantIndex < 0) {
      // If the query coordinate is before the first location entry.
      finalCalculatedDistance = Math.abs(allLocationEntries[0].coordinate - queryCoordinate) + allLocationEntries[0].minimumReach;
    } else if (relevantIndex >= allLocationEntries.length - 1) {
      // If the query coordinate is at or after the last location entry.
      finalCalculatedDistance = Math.abs(allLocationEntries[allLocationEntries.length - 1].coordinate - queryCoordinate) + allLocationEntries[allLocationEntries.length - 1].minimumReach;
    } else {
      // If the query coordinate falls between two location entries, consider both.
      finalCalculatedDistance = Math.min(
        Math.abs(allLocationEntries[relevantIndex].coordinate - queryCoordinate) + allLocationEntries[relevantIndex].minimumReach,
        Math.abs(allLocationEntries[relevantIndex + 1].coordinate - queryCoordinate) + allLocationEntries[relevantIndex + 1].minimumReach
      );
    }
    console.log(finalCalculatedDistance); // Output the result for the current query.
  }
  return allLocationEntries; // Return the modified collection of location entries.
}

/**
 * Performs a binary search to locate the index of the entry whose coordinate is
 * just less than or equal to the specified target coordinate.
 * @param {Array<Object>} sortedEntries - An array of location entries, sorted by coordinate.
 * @param {number} targetCoordinate - The coordinate to search for.
 * @returns {number} The index of the closest entry, or -1 if target is before the first.
 */
function findNearestEntryIndex(sortedEntries, targetCoordinate) {
  let lowerBound = 0; // The lowest possible index for the search range.
  let upperBound = sortedEntries.length; // The highest possible index (exclusive) for the search range.
  let middlePoint = ~~((lowerBound + upperBound) / 2); // Calculate the integer midpoint.

  // Execute the binary search loop.
  while (lowerBound < upperBound) {
    if (sortedEntries[middlePoint].coordinate > targetCoordinate) {
      upperBound = middlePoint - 1; // Adjust the upper bound if the midpoint coordinate is too high.
    } else {
      lowerBound = middlePoint + 1; // Adjust the lower bound if the midpoint coordinate is too low or equal.
    }
    middlePoint = ~~((lowerBound + upperBound) / 2); // Recalculate the midpoint.
  }
  // After the loop, adjust the middlePoint if it points to an element greater than the target.
  if (sortedEntries[middlePoint] && sortedEntries[middlePoint].coordinate > targetCoordinate) {
    return middlePoint - 1;
  } else {
    return middlePoint;
  }
}

// Invoke the primary processing function with input read from standard input.
processLocationQueries(require('fs').readFileSync('/dev/stdin', 'utf8'));
