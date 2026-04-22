// This module provides a function to calculate the maximum achievable profit
// by traversing a set of items arranged in a circular path.
// The problem involves optimizing profit based on item values and travel costs.
// A Type III clone means extensive structural and naming changes while preserving
// the core logic and overall functionality.

/**
 * Calculates the optimal profit achievable by collecting items along a circular path.
 * The path starts at position 0, can move clockwise or counter-clockwise,
 * and may involve turning back at certain points.
 *
 * @param {string} rawData - The input data as a string, typically from stdin.
 *                           Expected format:
 *                           Line 1: N C (N = number of items, C = total length of path)
 *                           Subsequent lines: x_i v_i (x_i = position of item i, v_i = value of item i)
 */
function CalculateOptimalPath(rawData) {
  // --- Input Processing and Validation ---
  if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
    // A simple guard clause for empty or invalid input string
    console.error("Input data is either empty, not a string, or contains only whitespace. Cannot proceed.");
    return;
  }

  const dataLines = rawData.split("\n");

  // Attempt to parse the first line for global parameters
  const paramsLine = dataLines[0].split(" ");
  const itemCount = parseInt(paramsLine[0], 10);
  const totalLength = parseInt(paramsLine[1], 10);

  // Validate parsed numerical parameters
  if (isNaN(itemCount) || itemCount <= 0 || isNaN(totalLength) || totalLength <= 0) {
    console.error(`Invalid item count (${itemCount}) or total length (${totalLength}) detected. Please check input format.`);
    return;
  }

  // Arrays to hold the parsed positions and values for each item
  const itemPositions = new Array(itemCount);
  const itemValues = new Array(itemCount);

  // Identify the last item index located before the halfway point of the total length.
  // This helps in splitting traversal strategies.
  let lastIndexBeforeMidpoint = -1;
  const halfTotalLength = totalLength / 2; // Pre-calculate for minor optimization

  // Populate item data arrays and determine `lastIndexBeforeMidpoint`
  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    const currentItemData = dataLines[currentIdx + 1].split(" ");
    itemPositions[currentIdx] = parseInt(currentItemData[0], 10);
    itemValues[currentIdx] = parseInt(currentItemData[1], 10);

    // Update the index if the current item is before the midpoint
    if (itemPositions[currentIdx] < halfTotalLength) {
      lastIndexBeforeMidpoint = currentIdx;
    }
  }

  let maximumAchievableProfit = 0; // Stores the highest profit found across all strategies
  let currentAccumulatedProfit = 0; // Tracks profit for the current traversal simulation

  // --- Strategy 1: Simple Unidirectional Clockwise Traversal ---
  // This calculates the profit if we only move from the origin (position 0)
  // to the rightmost item, collecting items along the way.
  // This establishes a baseline maximum profit.
  currentAccumulatedProfit = 0;
  for (let idx = 0; idx < itemCount; idx++) {
    // Calculate travel distance from the previous item (or origin for the first item)
    const travelDistance = (idx === 0) ? itemPositions[idx] : itemPositions[idx] - itemPositions[idx - 1];
    currentAccumulatedProfit += itemValues[idx] - travelDistance;
    maximumAchievableProfit = Math.max(maximumAchievableProfit, currentAccumulatedProfit);
  }

  // --- Strategy 2: Go Right, Return to Origin, Then Go Left (Clockwise & Counter-Clockwise Mix) ---
  // This strategy considers paths where we first travel clockwise up to a certain point (idxFromLeft),
  // return to the origin (position 0), and then start a counter-clockwise traversal from the
  // end of the circular path (position C) towards the items not yet visited on the right.
  for (let idxFromLeft = lastIndexBeforeMidpoint; idxFromLeft >= 0; idxFromLeft--) {
    let profitFromLeftSegment = 0; // Total value from items 0 to idxFromLeft
    let travelCostLeftSegment = 0;  // Total distance traveled from 0 to idxFromLeft

    // Accumulate profit and travel cost for the initial clockwise segment
    for (let subIdx = 0; subIdx <= idxFromLeft; subIdx++) {
      const segmentTravelDist = (subIdx === 0) ? itemPositions[subIdx] : itemPositions[subIdx] - itemPositions[subIdx - 1];
      profitFromLeftSegment += itemValues[subIdx];
      travelCostLeftSegment += segmentTravelDist;
    }

    // Calculate profit after visiting items 0 to idxFromLeft and returning to 0.
    // This forms the base profit for subsequent rightward traversal.
    currentAccumulatedProfit = profitFromLeftSegment - (travelCostLeftSegment + itemPositions[idxFromLeft]);
    maximumAchievableProfit = Math.max(maximumAchievableProfit, currentAccumulatedProfit); // Update max profit with this configuration

    // Now, from the origin, traverse counter-clockwise from the end of the path (C)
    // towards items with indices greater than idxFromLeft.
    for (let subIdx = itemCount - 1; subIdx > idxFromLeft; subIdx--) {
      // Calculate travel distance for this counter-clockwise segment
      const rightSegmentTravelDist = (subIdx === itemCount - 1) ? (totalLength - itemPositions[subIdx]) : (itemPositions[subIdx + 1] - itemPositions[subIdx]);
      currentAccumulatedProfit += itemValues[subIdx] - rightSegmentTravelDist;
      maximumAchievableProfit = Math.max(maximumAchievableProfit, currentAccumulatedProfit);
    }
  }

  // --- Strategy 3: Go Left, Return to End, Then Go Right (Counter-Clockwise & Clockwise Mix) ---
  // This strategy considers paths where we first travel counter-clockwise from position C
  // up to a certain point (idxFromRight), return to C, and then start a clockwise traversal
  // from the origin (position 0) towards the items not yet visited on the left.
  for (let idxFromRight = lastIndexBeforeMidpoint + 1; idxFromRight < itemCount; idxFromRight++) {
    let profitFromRightSegment = 0; // Total value from items N-1 down to idxFromRight
    let travelCostRightSegment = 0; // Total distance traveled from C to idxFromRight

    // Accumulate profit and travel cost for the initial counter-clockwise segment
    for (let subIdx = itemCount - 1; subIdx >= idxFromRight; subIdx--) {
      const segmentTravelDist = (subIdx === itemCount - 1) ? (totalLength - itemPositions[subIdx]) : (itemPositions[subIdx + 1] - itemPositions[subIdx]);
      profitFromRightSegment += itemValues[subIdx];
      travelCostRightSegment += segmentTravelDist;
    }

    // Calculate profit after visiting items N-1 down to idxFromRight and returning to C.
    // This forms the base profit for subsequent leftward traversal.
    currentAccumulatedProfit = profitFromRightSegment - (travelCostRightSegment + (totalLength - itemPositions[idxFromRight]));
    maximumAchievableProfit = Math.max(maximumAchievableProfit, currentAccumulatedProfit); // Update max profit with this configuration

    // Now, from the end of the path (C), traverse clockwise from the origin (0)
    // towards items with indices less than idxFromRight.
    for (let subIdx = 0; subIdx < idxFromRight; subIdx++) {
      // Calculate travel distance for this clockwise segment
      const leftSegmentTravelDist = (subIdx === 0) ? itemPositions[subIdx] : itemPositions[subIdx] - itemPositions[subIdx - 1];
      currentAccumulatedProfit += itemValues[subIdx] - leftSegmentTravelDist;
      maximumAchievableProfit = Math.max(maximumAchievableProfit, currentAccumulatedProfit);
    }
  }

  // Output the final maximum profit
  console.log('%s', maximumAchievableProfit);
}

// --- Debugging and Execution Environment Setup ---

// This function is intended for debugging within a browser environment
// where input can be provided via a text area.
function executeDebugSimulation(){
  const simulatedInput = document.getElementById("input").value;
  CalculateOptimalPath(simulatedInput);
}

// This block handles execution in a Node.js environment,
// typically used for competitive programming platforms.
// It reads input from standard input (/dev/stdin).
if (typeof require !== 'undefined' && require.main === module) {
  const fileSystem = require("fs");
  const standardInput = fileSystem.readFileSync("/dev/stdin", "utf8");
  CalculateOptimalPath(standardInput);
}