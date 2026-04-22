'use strict';

/**
 * Executes the primary logic to determine the maximum achievable value
 * considering various travel strategies around a circular path.
 * @param {string} rawInputContent - The complete input data as a single string.
 */
function CalculateOptimalPath(rawInputContent) {
  // Process the incoming string into an array of numerical values.
  let numericData = rawInputContent
    .trim()
    .split(/\s+/)
    .map(currentStringItem => +currentStringItem);

  // Extract initial configuration parameters: number of locations and circuit length.
  const numberOfLocations = numericData.shift();
  const circuitLength = numericData.shift();

  // Initialize arrays to track movement and value collection when traversing clockwise.
  // 'forwardDistances' stores the cumulative distance from the origin for each location.
  let forwardDistances = [numericData[0]];
  // 'forwardCollectedValues' stores the cumulative value collected up to each location.
  let forwardCollectedValues = [numericData[1]];

  // Populate the clockwise arrays by iterating through the locations.
  for (let locationIndex = 1; locationIndex < numberOfLocations; locationIndex++) {
    forwardDistances[locationIndex] = numericData[2 * locationIndex];
    forwardCollectedValues[locationIndex] = forwardCollectedValues[locationIndex - 1] + numericData[2 * locationIndex + 1];
  }

  // Initialize arrays for tracking movement and value collection when traversing counter-clockwise.
  // 'backwardDistances' stores distances from the origin when moving counter-clockwise.
  let backwardDistances = [circuitLength - numericData[0]];
  // 'backwardCollectedValues' stores cumulative values, starting from the total and subtracting clockwise values.
  let backwardCollectedValues = [forwardCollectedValues[numberOfLocations - 1]];

  // Populate the counter-clockwise arrays. Note the reverse iteration for distances.
  for (let locationIndex = numberOfLocations - 1; locationIndex > 0; locationIndex--) {
    backwardDistances[locationIndex] = circuitLength - forwardDistances[locationIndex];
    backwardCollectedValues[locationIndex] = forwardCollectedValues[numberOfLocations - 1] - forwardCollectedValues[locationIndex - 1];
  }

  // Compute the net profit for a purely clockwise journey (total value minus total travel cost).
  let netProfitForwardOnly = forwardCollectedValues.map((valueSum, index) => valueSum - forwardDistances[index]);
  // Compute the net profit for a purely counter-clockwise journey.
  let netProfitBackwardOnly = backwardCollectedValues.map((valueSum, index) => valueSum - backwardDistances[index]);

  // Calculate the maximum net profit achievable at each point by only moving clockwise from the start.
  // This is a prefix maximum calculation.
  let maxNetProfitForward = netProfitForwardOnly.map((currentValue, index, entireSeries) =>
    (currentValue < entireSeries[index - 1]) ? entireSeries[index - 1] : currentValue
  );

  // Calculate the maximum net profit achievable at each point by only moving counter-clockwise from the start.
  // This is a suffix maximum calculation.
  let maxNetProfitBackward = [];
  maxNetProfitBackward[numberOfLocations - 1] = netProfitBackwardOnly[numberOfLocations - 1];
  for (let locationIndex = numberOfLocations - 2; locationIndex >= 0; locationIndex--) {
    maxNetProfitBackward[locationIndex] = Math.max(netProfitBackwardOnly[locationIndex], maxNetProfitBackward[locationIndex + 1]);
  }

  // Calculate profit for moving clockwise to a point, then reversing and moving counter-clockwise.
  // This accounts for the double travel cost to the turning point.
  let forwardThenBackwardProfit = netProfitForwardOnly.map((value, index) =>
    value - forwardDistances[index] + maxNetProfitBackward[index + 1]
  );
  // Special handling for the last location, where no further backward travel from the "next" point is possible.
  forwardThenBackwardProfit[numberOfLocations - 1] = netProfitForwardOnly[numberOfLocations - 1] - forwardDistances[numberOfLocations - 1] + 0;

  // Calculate profit for moving counter-clockwise to a point, then reversing and moving clockwise.
  let backwardThenForwardProfit = netProfitBackwardOnly.map((value, index) =>
    value - backwardDistances[index] + maxNetProfitForward[index - 1]
  );
  // Special handling for the first location, as there's no "previous" clockwise maximum.
  backwardThenForwardProfit[0] = -Infinity;

  // Aggregate all potential maximum profit scenarios, including the option of no travel (profit 0).
  let allPossibleOutcomes = [
    Math.max.apply(null, maxNetProfitForward),
    Math.max.apply(null, maxNetProfitBackward),
    Math.max.apply(null, forwardThenBackwardProfit),
    Math.max.apply(null, backwardThenForwardProfit),
    0, // Option to stay at origin with zero profit.
  ];

  // Display the overall maximum profit found.
  console.log(Math.max.apply(null, allPossibleOutcomes));
}

// Read the input from the standard input stream and invoke the main calculation function.
CalculateOptimalPath(require('fs').readFileSync('/dev/stdin', 'utf8'));