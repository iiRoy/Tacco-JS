function processInputData(rawInputText) {
  // Defensive programming: Ensure input is not null or empty before processing.
  if (!rawInputText || rawInputText.trim().length === 0) {
    console.error("Input data is empty or invalid. Terminating processing.");
    return []; // Return an empty array to signify no data was processed.
  }

  // Divide the entire input string into an array of lines.
  const parsedInputLines = rawInputText.split("\n");

  // Verify that there's at least one line for the initial configuration parameters.
  if (parsedInputLines.length === 0) {
    console.error("The input file contains no lines. Cannot extract initial parameters.");
    return [];
  }

  // Extract and convert the first line's space-separated values into numbers.
  const configurationValues = parsedInputLines[0].split(" ").map(Number);

  // Use destructuring assignment for clarity and rename variables.
  const [countAlphaEntities, countBetaEntities, totalQueryCount] = configurationValues;

  // Perform basic validation on the parsed numerical parameters.
  if (isNaN(countAlphaEntities) || isNaN(countBetaEntities) || isNaN(totalQueryCount) ||
      countAlphaEntities < 0 || countBetaEntities < 0 || totalQueryCount < 0) {
    console.error("One or more initial configuration parameters are invalid (not a non-negative number).");
    return [];
  }

  // Initialize a dynamic array to hold all coordinate-based entities.
  const coordinateEntities = [];
  // Keep track of the current line being read from the input.
  let currentInputLinePointer = 1;

  // --- Populating entities of the 'alpha' category ---
  let alphaEntityPopulated = 0;
  while (alphaEntityPopulated < countAlphaEntities) {
    // Ensure we don't try to read beyond the available input lines.
    if (currentInputLinePointer >= parsedInputLines.length) {
      console.warn(`Warning: Expected ${countAlphaEntities} Alpha entities, but only found ${alphaEntityPopulated} before end of input.`);
      break; // Exit loop if no more lines are available.
    }

    const currentCoordinateString = parsedInputLines[currentInputLinePointer];
    const numericCoordinate = Number(currentCoordinateString);

    // Validate the parsed coordinate value.
    if (isNaN(numericCoordinate)) {
        console.warn(`Skipping invalid coordinate entry '${currentCoordinateString}' for an Alpha entity.`);
    } else {
        // Add a new 'alpha' entity object to our collection.
        coordinateEntities.push({
            entityCategory: 'alpha', // Renamed 'type' to 'entityCategory', '1' to 'alpha'.
            spatialCoordinate: numericCoordinate, // Renamed 'place' to 'spatialCoordinate'.
            minOppositeCategoryDistance: Infinity // Renamed 'dis' to 'minOppositeCategoryDistance', used Infinity.
        });
    }
    alphaEntityPopulated++;
    currentInputLinePointer++;
  }

  // --- Populating entities of the 'beta' category ---
  let betaEntityPopulated = 0;
  while (betaEntityPopulated < countBetaEntities) {
    if (currentInputLinePointer >= parsedInputLines.length) {
      console.warn(`Warning: Expected ${countBetaEntities} Beta entities, but only found ${betaEntityPopulated} before end of input.`);
      break;
    }

    const currentCoordinateString = parsedInputLines[currentInputLinePointer];
    const numericCoordinate = Number(currentCoordinateString);

    if (isNaN(numericCoordinate)) {
        console.warn(`Skipping invalid coordinate entry '${currentCoordinateString}' for a Beta entity.`);
    } else {
        // Add a new 'beta' entity object.
        coordinateEntities.push({
            entityCategory: 'beta', // Renamed 'type' to 'entityCategory', '2' to 'beta'.
            spatialCoordinate: numericCoordinate,
            minOppositeCategoryDistance: Infinity
        });
    }
    betaEntityPopulated++;
    currentInputLinePointer++;
  }

  // Sort the entire collection of entities based on their spatial coordinate in ascending order.
  coordinateEntities.sort((itemOne, itemTwo) => itemOne.spatialCoordinate - itemTwo.spatialCoordinate);

  // Intermediate variables to keep track of the last encountered entity of each category
  // during the distance calculation pass.
  let lastEncounteredAlpha = null;
  let lastEncounteredBeta = null;

  // --- Calculate minimum distances to the opposite category for each entity ---
  // This loop performs a single pass to determine the distance to the *previous*
  // entity of the other type.
  for (let i = 0; i < coordinateEntities.length; i++) {
    const currentEntity = coordinateEntities[i];
    const currentEntityCoordinate = currentEntity.spatialCoordinate;

    if (currentEntity.entityCategory === 'alpha') {
      // If a 'beta' entity was previously seen, update distances.
      if (lastEncounteredBeta !== null) {
        const distanceToCurrentAlphaFromBeta = currentEntityCoordinate - lastEncounteredBeta.spatialCoordinate;
        // Update the 'beta' entity's distance.
        lastEncounteredBeta.minOppositeCategoryDistance = Math.min(
            lastEncounteredBeta.minOppositeCategoryDistance,
            distanceToCurrentAlphaFromBeta
        );
        // Update the current 'alpha' entity's distance.
        currentEntity.minOppositeCategoryDistance = distanceToCurrentAlphaFromBeta;
      }
      // Update the reference to the last seen 'alpha' entity.
      lastEncounteredAlpha = currentEntity;
    } else { // Current entity is 'beta'
      // If an 'alpha' entity was previously seen, update distances.
      if (lastEncounteredAlpha !== null) {
        const distanceToCurrentBetaFromAlpha = currentEntityCoordinate - lastEncounteredAlpha.spatialCoordinate;
        // Update the 'alpha' entity's distance.
        lastEncounteredAlpha.minOppositeCategoryDistance = Math.min(
            lastEncounteredAlpha.minOppositeCategoryDistance,
            distanceToCurrentBetaFromAlpha
        );
        // Update the current 'beta' entity's distance.
        currentEntity.minOppositeCategoryDistance = distanceToCurrentBetaFromAlpha;
      }
      // Update the reference to the last seen 'beta' entity.
      lastEncounteredBeta = currentEntity;
    }
  }

  // --- Process each query ---
  let processedQueryCount = 0;
  while (processedQueryCount < totalQueryCount) {
    if (currentInputLinePointer >= parsedInputLines.length) {
      console.warn(`Warning: Expected ${totalQueryCount} queries, but only processed ${processedQueryCount} before end of input.`);
      break;
    }

    const currentQueryCoordinateString = parsedInputLines[currentInputLinePointer];
    const queryLocationValue = Number(currentQueryCoordinateString);

    if (isNaN(queryLocationValue)) {
        console.warn(`Skipping invalid query coordinate '${currentQueryCoordinateString}'.`);
        processedQueryCount++;
        currentInputLinePointer++;
        continue; // Move to the next query.
    }

    // Utilize a helper function for binary search to find the approximate index.
    const approximateSearchResultIndex = findApproximateIndex(coordinateEntities, queryLocationValue);

    let finalCalculatedResult = 0; // The answer for the current query.

    // Handle scenarios where the entity list might be empty.
    if (coordinateEntities.length === 0) {
        // If no entities, there's no distance to calculate.
        finalCalculatedResult = 0;
    } else if (approximateSearchResultIndex < 0) {
      // The query coordinate is smaller than all entities in the list.
      // Consider only the first entity.
      const firstAvailableEntity = coordinateEntities[0];
      const distanceToFirstEntity = Math.abs(firstAvailableEntity.spatialCoordinate - queryLocationValue);
      finalCalculatedResult = distanceToFirstEntity + firstAvailableEntity.minOppositeCategoryDistance;
    } else if (approximateSearchResultIndex >= coordinateEntities.length - 1) {
      // The query coordinate is larger than or equal to the largest entity coordinate.
      // Consider only the last entity.
      const lastAvailableEntity = coordinateEntities[coordinateEntities.length - 1];
      const distanceToLastEntity = Math.abs(lastAvailableEntity.spatialCoordinate - queryLocationValue);
      finalCalculatedResult = distanceToLastEntity + lastAvailableEntity.minOppositeCategoryDistance;
    } else {
      // The query coordinate falls between two entities in the sorted list.
      const entityBeforeQuery = coordinateEntities[approximateSearchResultIndex];
      const entityAfterQuery = coordinateEntities[approximateSearchResultIndex + 1];

      // Calculate the total distance for the entity immediately before the query point.
      const candidateResultOne = Math.abs(entityBeforeQuery.spatialCoordinate - queryLocationValue) + entityBeforeQuery.minOppositeCategoryDistance;
      // Calculate the total distance for the entity immediately after the query point.
      const candidateResultTwo = Math.abs(entityAfterQuery.spatialCoordinate - queryLocationValue) + entityAfterQuery.minOppositeCategoryDistance;

      // The final result is the minimum of these two candidate calculations.
      finalCalculatedResult = Math.min(candidateResultOne, candidateResultTwo);
    }

    // Output the result for the current query.
    console.log(finalCalculatedResult);

    processedQueryCount++;
    currentInputLinePointer++;
  }

  // Although the caller in the original example doesn't use the return value,
  // we maintain the original function's signature by returning the processed list.
  return coordinateEntities;
}

/**
 * Performs a binary search on a sorted list of entities to find an approximate index.
 * The function aims to find the index `i` such that `sortedEntityList[i].spatialCoordinate`
 * is the largest coordinate less than or equal to `targetValue`.
 *
 * @param {Array<Object>} sortedEntityList - The list of entity objects, sorted by 'spatialCoordinate'.
 * @param {number} targetValue - The coordinate value to search for.
 * @returns {number} The index of the element, or -1 if `targetValue` is smaller than all elements,
 *                   or `sortedEntityList.length - 1` if `targetValue` is greater than or equal to the largest element.
 */
function findApproximateIndex(sortedEntityList, targetValue) {
  // Handle an empty list as an edge case.
  if (!sortedEntityList || sortedEntityList.length === 0) {
    return -1;
  }

  let searchLowerBound = 0;
  let searchUpperBound = sortedEntityList.length - 1; // Correct upper bound for 0-indexed array.

  let bestCandidateIndex = -1; // Stores the index of the largest element <= targetValue.

  // Standard binary search loop implementation.
  while (searchLowerBound <= searchUpperBound) {
    // Calculate the middle index, ensuring integer division.
    const midPointIndex = Math.floor((searchLowerBound + searchUpperBound) / 2);

    const currentEntityAtMid = sortedEntityList[midPointIndex];
    const midCoordinateValue = currentEntityAtMid.spatialCoordinate;

    if (midCoordinateValue === targetValue) {
      return midPointIndex; // Exact match found, return immediately.
    } else if (midCoordinateValue < targetValue) {
      // Current mid-point is less than target. This could be our answer,
      // but we try to find an even larger one in the right half.
      bestCandidateIndex = midPointIndex;
      searchLowerBound = midPointIndex + 1;
    } else { // midCoordinateValue > targetValue
      // Current mid-point is greater than target. Search in the left half.
      searchUpperBound = midPointIndex - 1;
    }
  }

  // After the loop, `bestCandidateIndex` will hold the index of the largest element
  // that is less than or equal to `targetValue`, or -1 if no such element exists
  // (i.e., `targetValue` is smaller than all elements in the list).
  return bestCandidateIndex;
}

// Standard competitive programming boilerplate to read input from stdin.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));