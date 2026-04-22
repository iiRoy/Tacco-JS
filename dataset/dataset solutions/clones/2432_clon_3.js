// Function to process spatial data and calculate the average path length among all permutations.
function analyzePointRoutes(rawDataLines) {
  // Input validation: Ensure rawDataLines is an array and not empty
  if (!Array.isArray(rawDataLines) || rawDataLines.length === 0) {
    console.error("Error: No input data provided. Exiting analysis.");
    return;
  }

  // Determine the number of locations from the first line of input.
  const numLocationsStr = rawDataLines[0];
  const locationCount = parseInt(numLocationsStr, 10);

  // Basic validation for locationCount
  if (isNaN(locationCount) || locationCount <= 0) {
    console.error(`Error: Invalid or non-positive number of locations specified: "${numLocationsStr}". Exiting analysis.`);
    return;
  }
  if (rawDataLines.length < locationCount + 1) {
    console.error(`Error: Insufficient input lines. Expected ${locationCount + 1} but got ${rawDataLines.length}. Exiting analysis.`);
    return;
  }

  // Parse location coordinates from subsequent input lines.
  const spatialPoints = [];
  for (let i = 1; i <= locationCount; ++i) {
    const currentLine = rawDataLines[i];
    // Split the coordinates string and convert each part to a floating-point number.
    const pointCoords = currentLine.split(" ").map(coordStr => parseFloat(coordStr));

    // Basic validation for point coordinates
    if (pointCoords.length !== 2 || isNaN(pointCoords[0]) || isNaN(pointCoords[1])) {
      console.warn(`Warning: Skipping invalid point data on line ${i + 1} ("${currentLine}"). Expected two numbers.`);
      // For robust error handling, one might throw an error, use a default, or filter out this point.
      // For this clone, we'll proceed assuming valid data for the core logic as per original.
      // If a point is truly invalid, subsequent distance calculations might fail or produce NaNs.
    }
    spatialPoints.push(pointCoords);
  }

  // Pre-calculate and cache all pairwise Euclidean distances between locations.
  // Using a string key for the map (e.g., "0_1" for distance between point 0 and point 1).
  const distanceCache = {};
  for (let i = 0; i < locationCount; ++i) {
    for (let j = i + 1; j < locationCount; ++j) {
      const currentDistance = measurePointSeparation(spatialPoints[i], spatialPoints[j]);
      // Store distance symmetrically for easy lookup (e.g., "0_1" and "1_0" point to the same value).
      distanceCache[`${j}_${i}`] = distanceCache[`${i}_${j}`] = currentDistance;
    }
  }

  // Generate all possible permutations of routes through the locations.
  // This produces an array of arrays, where each inner array is a sequence of location indices.
  const allPossibleRoutes = enumerateAllPaths(locationCount);

  // Calculate the total combined length of all generated routes.
  let cumulativeRouteLength = 0.0; // Use float for sum initialization
  for (let k = 0; k < allPossibleRoutes.length; ++k) {
    const currentRoute = allPossibleRoutes[k];
    // Add the length of the current route to the overall total.
    cumulativeRouteLength += determinePathLength(distanceCache, currentRoute);
  }

  // Calculate the average route length by dividing the total length by the number of routes.
  const numberOfRoutes = allPossibleRoutes.length;
  if (numberOfRoutes === 0) { // Guard against division by zero if no routes were generated
    console.log("No routes could be generated for the given number of locations. Average is 0.");
    return;
  }
  const averageRouteLength = cumulativeRouteLength / numberOfRoutes;

  // Output the final computed average route length.
  console.log(averageRouteLength);
}

// Function to calculate the total length of a specific route (sequence of points).
function determinePathLength(distanceLookupMap, routeIndices) {
  let currentPathTotal = 0.0; // Initialize sum as a float

  // If the route has fewer than 2 points, its length is 0 as there are no segments.
  if (routeIndices.length < 2) {
    return currentPathTotal;
  }

  // Iterate through the route, summing the distances between consecutive points.
  for (let i = 0; i < routeIndices.length - 1; ++i) {
    const fromPointIndex = routeIndices[i];
    const toPointIndex = routeIndices[i + 1];
    const distanceKey = `${fromPointIndex}_${toPointIndex}`;

    // Look up the pre-calculated distance from the map.
    const segmentDistance = distanceLookupMap[distanceKey];

    // Add a check for undefined segmentDistance, though it should always exist
    // if distanceCache is properly populated and route indices are valid.
    if (segmentDistance === undefined) {
      console.warn(`Warning: Distance not found in cache for segment ${distanceKey}. Assuming 0 for this segment.`);
      // Depending on requirements, could throw an error or handle differently.
    } else {
      currentPathTotal += segmentDistance;
    }
  }
  return currentPathTotal;
}

// Function to compute the Euclidean distance between two 2D points.
function measurePointSeparation(point1, point2) {
  // Extract coordinates for clarity and reusability.
  const x1 = point1[0];
  const y1 = point1[1];
  const x2 = point2[0];
  const y2 = point2[1];

  // Calculate the difference in x-coordinates and y-coordinates.
  const deltaX = x1 - x2;
  const deltaY = y1 - y2;

  // Square the differences to handle both positive and negative values.
  const squaredDeltaX = Math.pow(deltaX, 2);
  const squaredDeltaY = Math.pow(deltaY, 2);

  // Sum the squared differences. This is the squared Euclidean distance.
  const sumOfSquares = squaredDeltaX + squaredDeltaY;

  // Return the square root of the sum of squares to get the final distance.
  return Math.sqrt(sumOfSquares);
}

// Recursive function to generate all possible permutations of indices from 0 to 'setLength - 1'.
function enumerateAllPaths(setLength) {
  const resultPermutations = []; // Array to store all generated permutations.

  // Base case: If there's only one element, return a list containing a single array with that element (index 0).
  if (setLength === 1) {
    return [[0]];
  }

  // Recursive step: Get all permutations for 'setLength - 1' elements.
  const subProblemPerms = enumerateAllPaths(setLength - 1);

  // The new element to insert into existing permutations is 'setLength - 1'.
  const elementToInsert = setLength - 1;

  // For each permutation from the sub-problem, insert the new element at all possible positions.
  // 'i' represents the insertion position, from the beginning to the end of the permutation.
  for (let i = 0; i < setLength; ++i) {
    for (let j = 0; j < subProblemPerms.length; ++j) {
      // Create a shallow copy of the base permutation to avoid modifying the original during insertion.
      const currentPermutationCopy = [...subProblemPerms[j]]; // Using spread syntax for array cloning

      // Insert the new element at the current position 'i'.
      currentPermutationCopy.splice(i, 0, elementToInsert);

      // Add the newly formed permutation to our results.
      resultPermutations.push(currentPermutationCopy);
    }
  }
  return resultPermutations;
}

// Main execution block: Read input from stdin and trigger the analysis.
// This block is wrapped in a try-catch for basic error handling during file operations.
try {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Split content by newlines and filter out any empty lines that might result from extra newlines.
  const inputLines = fileContent.split("\n").filter(line => line.trim() !== '');
  analyzePointRoutes(inputLines);
} catch (error) {
  console.error("An error occurred during input reading or processing:", error.message);
  // Depending on the application, more specific error handling or logging might be desired here.
  // For instance, checking error.code for specific FS errors.
}