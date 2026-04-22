const AssignmentOption = Object.freeze({
  NONE: 0,
  HORIZONTAL: 1,
  VERTICAL: 2
});

/**
 * Evaluates the total financial expenditure for a specific configuration of city points
 * and their chosen infrastructure assignments.
 * This calculation determines the shortest effective distance for each point to an assigned axis.
 *
 * @param {object} configData - Contains `totalCityPoints` (count), `cityLayout` (array of point objects),
 *                              and `currentInfrastructureAllocations` (array of AssignmentOption).
 * @returns {number} The cumulative expense for the given setup.
 */
function evaluateInfrastructureExpense(configData) {
  const { totalCityPoints, cityLayout, currentInfrastructureAllocations } = configData;
  const individualCityCosts = new Array(totalCityPoints).fill(0); // Holds cost for each city point

  // Phase 1: Determine initial costs for each city point based on its proximity to the origin (0,0).
  // These are baseline costs which may be reduced if an axis is later assigned to cover them.
  for (let currentPointIndex = 0; currentPointIndex < totalCityPoints; ++currentPointIndex) {
    const pointDetails = cityLayout[currentPointIndex];
    const absCoordX = Math.abs(pointDetails.xCoord);
    const absCoordY = Math.abs(pointDetails.yCoord);
    individualCityCosts[currentPointIndex] = Math.min(absCoordX, absCoordY) * pointDetails.impactFactor;
  }

  // Create a mutable copy of the city points for sorting by X-coordinate.
  const sortedByX = [...cityLayout];
  sortedByX.sort((a, b) => a.xCoord - b.xCoord);

  let lastVerticalLinePoint = -1; // Index in `sortedByX` of the last point assigned a vertical line.
  // Phase 2: Iterate through X-sorted points (left-to-right) to account for vertical line coverage.
  // A point assigned `VERTICAL` effectively places a vertical line, potentially reducing costs for other points.
  for (let k = 0; k < totalCityPoints; ++k) {
    const currentSortedPoint = sortedByX[k];
    const originalPosition = currentSortedPoint.initialIndex;
    const allocationType = currentInfrastructureAllocations[originalPosition];

    if (allocationType === AssignmentOption.VERTICAL) {
      lastVerticalLinePoint = k;
      individualCityCosts[originalPosition] = 0; // Point on the assigned line incurs no additional cost for this axis.
    } else if (lastVerticalLinePoint !== -1) {
      // If a vertical line was previously placed, check if it reduces the current point's cost.
      const coveringLinePoint = sortedByX[lastVerticalLinePoint];
      const distanceToLine = Math.abs(currentSortedPoint.xCoord - coveringLinePoint.xCoord) * currentSortedPoint.impactFactor;
      individualCityCosts[originalPosition] = Math.min(individualCityCosts[originalPosition], distanceToLine);
    }
  }

  lastVerticalLinePoint = -1; // Reset for the right-to-left pass.
  // Phase 3: Iterate through X-sorted points (right-to-left) for further vertical line coverage optimization.
  for (let k = totalCityPoints - 1; k >= 0; --k) {
    const currentSortedPoint = sortedByX[k];
    const originalPosition = currentSortedPoint.initialIndex;
    const allocationType = currentInfrastructureAllocations[originalPosition];

    if (allocationType === AssignmentOption.VERTICAL) {
      lastVerticalLinePoint = k;
      // Cost should already be 0 if it was set in the left-to-right pass, but confirming.
      individualCityCosts[originalPosition] = 0;
    } else if (lastVerticalLinePoint !== -1) {
      const coveringLinePoint = sortedByX[lastVerticalLinePoint];
      const distanceToLine = Math.abs(currentSortedPoint.xCoord - coveringLinePoint.xCoord) * currentSortedPoint.impactFactor;
      individualCityCosts[originalPosition] = Math.min(individualCityCosts[originalPosition], distanceToLine);
    }
  }

  // Create another mutable copy for sorting by Y-coordinate.
  const sortedByY = [...cityLayout];
  sortedByY.sort((a, b) => a.yCoord - b.yCoord);

  let lastHorizontalLinePoint = -1; // Index in `sortedByY` of the last point assigned a horizontal line.
  // Phase 4: Iterate through Y-sorted points (bottom-to-top) to account for horizontal line coverage.
  // A point assigned `HORIZONTAL` effectively places a horizontal line.
  for (let k = 0; k < totalCityPoints; ++k) {
    const currentSortedPoint = sortedByY[k];
    const originalPosition = currentSortedPoint.initialIndex;
    const allocationType = currentInfrastructureAllocations[originalPosition];

    if (allocationType === AssignmentOption.HORIZONTAL) {
      lastHorizontalLinePoint = k;
      individualCityCosts[originalPosition] = 0;
    } else if (lastHorizontalLinePoint !== -1) {
      const coveringLinePoint = sortedByY[lastHorizontalLinePoint];
      const distanceToLine = Math.abs(currentSortedPoint.yCoord - coveringLinePoint.yCoord) * currentSortedPoint.impactFactor;
      individualCityCosts[originalPosition] = Math.min(individualCityCosts[originalPosition], distanceToLine);
    }
  }

  lastHorizontalLinePoint = -1; // Reset for the top-to-bottom pass.
  // Phase 5: Iterate through Y-sorted points (top-to-bottom) for further horizontal line coverage optimization.
  for (let k = totalCityPoints - 1; k >= 0; --k) {
    const currentSortedPoint = sortedByY[k];
    const originalPosition = currentSortedPoint.initialIndex;
    const allocationType = currentInfrastructureAllocations[originalPosition];

    if (allocationType === AssignmentOption.HORIZONTAL) {
      lastHorizontalLinePoint = k;
      individualCityCosts[originalPosition] = 0;
    } else if (lastHorizontalLinePoint !== -1) {
      const coveringLinePoint = sortedByY[lastHorizontalLinePoint];
      const distanceToLine = Math.abs(currentSortedPoint.yCoord - coveringLinePoint.yCoord) * currentSortedPoint.impactFactor;
      individualCityCosts[originalPosition] = Math.min(individualCityCosts[originalPosition], distanceToLine);
    }
  }

  // Sum up all individual city point costs to compute the final total expenditure.
  const finalTotalExpense = individualCityCosts.reduce((total, current) => total + current, 0);
  return finalTotalExpense;
}

/**
 * Recursively generates and evaluates all possible combinations of axis assignments for city points.
 * It employs a backtracking strategy to explore assigning each point to no axis, an X-axis, or a Y-axis.
 *
 * @param {number} processingIndex - The index of the city point currently undergoing assignment consideration.
 * @param {number} activeAxisCount - The current tally of city points that have been assigned to either an X or Y axis.
 * @param {object} applicationState - A mutable object holding shared state for the recursive calls:
 *   - `totalCityPoints`: Total number of city points.
 *   - `allCityPointsData`: Array containing details for all city points.
 *   - `currentAssignmentConfiguration`: Array representing the axis assignment choice for each point.
 *   - `minimumCostPerAssignedAxisCount`: Array to store the overall minimum cost for each possible `activeAxisCount`.
 */
function exploreAssignmentRecursively(processingIndex, activeAxisCount, applicationState) {
  const { totalCityPoints, allCityPointsData, currentAssignmentConfiguration, minimumCostPerAssignedAxisCount } = applicationState;

  // Termination condition: All city points have been processed for assignment.
  if (processingIndex === totalCityPoints) {
    // Calculate the cost for the completed assignment configuration.
    const calculatedConfigurationCost = evaluateInfrastructureExpense({
      totalCityPoints: totalCityPoints,
      cityLayout: allCityPointsData,
      currentInfrastructureAllocations: currentAssignmentConfiguration
    });

    // Update the global minimum cost if this configuration is cheaper for the current `activeAxisCount`.
    minimumCostPerAssignedAxisCount[activeAxisCount] = Math.min(
      minimumCostPerAssignedAxisCount[activeAxisCount],
      calculatedConfigurationCost
    );
    return;
  }

  // Recursive steps: Explore each of the three assignment options for the current city point.

  // Option 1: This city point is not directly assigned to an axis.
  // Its coverage will come from the closest existing axis or its distance to origin.
  currentAssignmentConfiguration[processingIndex] = AssignmentOption.NONE;
  exploreAssignmentRecursively(processingIndex + 1, activeAxisCount, applicationState);

  // Option 2: This city point is assigned to an X-axis (meaning a horizontal line passes through it).
  currentAssignmentConfiguration[processingIndex] = AssignmentOption.HORIZONTAL;
  exploreAssignmentRecursively(processingIndex + 1, activeAxisCount + 1, applicationState);

  // Option 3: This city point is assigned to a Y-axis (meaning a vertical line passes through it).
  currentAssignmentConfiguration[processingIndex] = AssignmentOption.VERTICAL;
  exploreAssignmentRecursively(processingIndex + 1, activeAxisCount + 1, applicationState);
}

/**
 * Manages the overall process of finding the optimal minimum cost for each possible count
 * of assigned axes, from zero up to the total number of city points.
 *
 * @param {object} inputDetails - An object containing `pointQuantity` (total points)
 *                                and `pointCoordinates` (array of city point objects).
 * @returns {number[]} An array where the element at index `k` represents the minimum cost
 *                     when exactly `k` axes are utilized.
 */
function calculateOptimalCostsForAllAxisCounts(inputDetails) {
  const { pointQuantity, pointCoordinates } = inputDetails;

  // Initialize an array to store the best cost found for each possible number of assigned axes.
  // `Number.MAX_SAFE_INTEGER` ensures any calculated cost will be considered smaller.
  const bestCostsPerAxisCount = Array(pointQuantity + 1).fill(Number.MAX_SAFE_INTEGER);

  // Initialize an array to track the current axis assignment for each point during the recursive search.
  const temporaryAssignmentChoices = Array(pointQuantity);

  // Consolidate the necessary data into a single context object for easier passing to recursive calls.
  const recursiveContext = {
    totalCityPoints: pointQuantity,
    allCityPointsData: pointCoordinates,
    currentAssignmentConfiguration: temporaryAssignmentChoices,
    minimumCostPerAssignedAxisCount: bestCostsPerAxisCount,
  };

  // Initiate the recursive exploration process starting from the first city point (index 0)
  // with an initial count of zero assigned axes.
  exploreAssignmentRecursively(0, 0, recursiveContext);

  return bestCostsPerAxisCount;
}

/**
 * Main entry point for the solution. Handles input parsing, core logic execution, and output formatting.
 *
 * @param {string} rawInputContent - The complete input data received as a single string.
 */
function executeSolution(rawInputContent) {
  const inputLines = rawInputContent.trim().split('\n');
  const parseInteger = (str) => parseInt(str, 10);

  // Basic input validation: ensure input is not empty.
  if (!inputLines || inputLines.length === 0) {
    console.error("Input processing error: No data lines provided.");
    return;
  }

  // Extract the total number of city points (N) from the first line.
  const numberOfPoints = parseInteger(inputLines[0]);

  // Validate the parsed number of points.
  if (isNaN(numberOfPoints) || numberOfPoints < 0 || numberOfPoints > 15) { // Adding an upper bound typical for N in competitive programming with 3^N complexity
    console.error(`Input validation error: Invalid or out-of-range number of points (N=${numberOfPoints}). Expected 0-15.`);
    return;
  }

  const cityPointDetails = [];
  // Parse the coordinates (x, y) and impact factor (p) for each city point.
  for (let pIndex = 0; pIndex < numberOfPoints; ++pIndex) {
    const pointLine = inputLines[pIndex + 1];
    if (!pointLine) {
        console.error(`Input processing error: Missing data for point ${pIndex + 1}.`);
        return;
    }
    const parts = pointLine.split(' ').map(parseInteger);

    // Validate each point's data format.
    if (parts.length !== 3 || parts.some(isNaN)) {
      console.error(`Input validation error: Malformed data for point on line ${pIndex + 2}.`);
      return;
    }

    cityPointDetails.push({
      xCoord: parts[0],
      yCoord: parts[1],
      impactFactor: parts[2],
      initialIndex: pIndex, // Store original index for consistent referencing after sorting.
    });
  }

  // Invoke the core algorithm to determine the optimal costs.
  const finalOptimalResults = calculateOptimalCostsForAllAxisCounts({
    pointQuantity: numberOfPoints,
    pointCoordinates: cityPointDetails
  });

  // Output the computed minimum costs, each on a new line.
  console.log(finalOptimalResults.join('\n'));
}

// Standard Node.js entry point check.
// This block ensures the code runs when executed directly, not when imported as a module.
if (require.main === module) {
  const fileSystemModule = require('fs');
  const standardInputPath = "/dev/stdin"; // Typical path for standard input in competitive programming environments.

  try {
    // Read all input from stdin synchronously.
    const inputBufferContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
    executeSolution(inputBufferContent);
  } catch (operationError) {
    console.error("Critical error: Unable to read from standard input:", operationError.message);
    // Optionally, provide a fallback or exit gracefully.
    process.exit(1);
  }
}