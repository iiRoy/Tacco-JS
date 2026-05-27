// This script processes input data to analyze reachability between various points.
const processInput = (rawData) => {
  // First, parse the incoming raw string data.
  // It's split by newlines, then each line by spaces, and all values are converted to numbers.
  let parsedData = rawData.split(/\n/).map(lineContent => lineContent.split(/\s/).map(strVal => +strVal));

  // The initial element of the first line specifies the total count of entities (cities).
  let entityCount = parsedData[0x0][0x0];

  // Extract the coordinate data for each entity.
  // This data spans from the second line up to the (entityCount + 1)-th line.
  let entityCoordinates = parsedData.slice(0x1, entityCount + 0x1);

  // Initialize an array to store the computed lengths of reachable paths for each starting entity.
  let pathLengths = [];

  // Iterate through each entity, treating it as a potential starting point for reachability analysis.
  for (let initialEntityIndex = 0x0; initialEntityIndex < entityCount; initialEntityIndex++) {
    // For each starting entity, create a dynamic list to track all entities reachable from it.
    // This list will expand as new connections are discovered.
    let discoveredEntities = [];
    discoveredEntities[0x0] = initialEntityIndex; // The starting entity is always reachable from itself.

    // Employ a breadth-first-search-like mechanism.
    // The 'for...in' loop iterates over the indices of 'discoveredEntities'.
    // Crucially, 'discoveredEntities' can be modified (grow) during this iteration,
    // allowing newly added entities to be processed in subsequent loop cycles.
    for (let currentEntityKey in discoveredEntities) {
      // Determine all entities that are "comparable" to the entity currently being examined.
      // Comparability is defined by a specific coordinate relationship (dominance).
      let newlyConnected = findComparableEntities(discoveredEntities[currentEntityKey], entityCoordinates);

      // Integrate these newly found comparable entities into our 'discoveredEntities' list.
      // The 'addUniqueEntities' function ensures that no duplicates are added.
      addUniqueEntities(discoveredEntities, newlyConnected);
    }

    // After exploring all reachable entities from the 'initialEntityIndex',
    // record the total number of unique entities found.
    pathLengths[initialEntityIndex] = discoveredEntities.length;
  }

  // Output the final results. Each calculated path length is printed on a new line.
  console.log(pathLengths.join("\n"));
};

// Invoke the primary processing function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string to serve as input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Determines which entities are "comparable" to a specified entity based on their coordinates.
 * An entity is considered comparable if it either strictly dominates the reference entity
 * or is strictly dominated by it across both coordinate dimensions.
 *
 * @param {number} referenceEntityIdx - The index of the entity against which others are compared.
 * @param {Array<Array<number>>} allEntityData - A comprehensive array containing all entity coordinates.
 * @returns {Array<number>} An array comprising the indices of all entities found to be comparable.
 */
function findComparableEntities(referenceEntityIdx, allEntityData) {
  let comparableIndices = []; // This array will accumulate indices of comparable entities.

  // Iterate through every entity in the dataset to assess its comparability.
  for (let candidateEntityIdx in allEntityData) {
    // Extract the X and Y coordinates for both the reference and candidate entities.
    const refX = allEntityData[referenceEntityIdx][0x0];
    const refY = allEntityData[referenceEntityIdx][0x1];
    const candX = allEntityData[candidateEntityIdx][0x0];
    const candY = allEntityData[candidateEntityIdx][0x1];

    // Apply the comparability condition:
    // (Reference dominates Candidate) OR (Candidate dominates Reference)
    if ((refX > candX && refY > candY) || (refX < candX && refY < candY)) {
      comparableIndices.push(candidateEntityIdx); // If comparable, add its index to the list.
    }
  }
  return comparableIndices; // Return the collection of comparable entity indices.
}

/**
 * Incorporates unique entity indices from a source array into a destination array.
 * This function directly modifies the 'destinationArray' by adding new, distinct elements.
 *
 * @param {Array<number>} destinationArray - The array that will receive new unique indices.
 * @param {Array<number>} sourceIndices - An array of entity indices that are candidates for addition.
 * @returns {Array<number>} The 'destinationArray' after potential modifications.
 */
function addUniqueEntities(destinationArray, sourceIndices) {
  // Traverse through each potential entity index provided in the 'sourceIndices'.
  for (let potentialEntity of sourceIndices) {
    // Check if the 'potentialEntity' is already present in the 'destinationArray'.
    // Using bitwise NOT (~) on 0 results in -1, which is equivalent to `=== -1`.
    if (destinationArray.indexOf(potentialEntity) === ~0) {
      destinationArray.push(potentialEntity); // If not present, add it to the destination.
    }
  }
  return destinationArray; // Return the updated array.
}
