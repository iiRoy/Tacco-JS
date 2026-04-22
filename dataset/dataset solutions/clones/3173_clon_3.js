const inputBuffer = [];

let totalItems;
let targetA, targetB, targetC;
let itemLengths;
let minCostOverall = Infinity; // Stores the lowest cost found across all combinations

// Utilize the 'readline' module for stream-based input processing.
const ioModule = require("readline");
const ioInterface = ioModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Capture each line of input as it arrives.
ioInterface.on('line', (lineContent) => {
  inputBuffer.push(lineContent);
});

// Execute main logic once all input lines have been received.
ioInterface.on('close', () => {
  // Validate if any input was provided.
  if (inputBuffer.length === 0) {
    console.error("Input stream was empty. Cannot proceed.");
    return;
  }

  // Process the very first line, containing global parameters.
  const firstLineSegment = inputBuffer.shift();
  const parsedInitialValues = firstLineSegment.split(" ").map(entry => parseInt(entry, 10));

  // Ensure sufficient parameters were parsed from the first line.
  if (parsedInitialValues.length < 4) {
    console.error("Missing critical parameters (N, A, B, C) in the first input line.");
    return;
  }

  // Destructure the initial values for clarity.
  [totalItems, targetA, targetB, targetC] = parsedInitialValues;

  // Initialize the array that will hold the lengths of individual bamboo pieces.
  itemLengths = new Array(totalItems);

  // Populate the bamboo length array from the subsequent input lines.
  for (let idx = 0; idx < totalItems; idx++) {
    const currentBambooLine = inputBuffer[idx];
    // Add a robust check for potentially missing lines, although typically not expected in contest scenarios.
    if (currentBambooLine === undefined) {
        console.warn(`Data mismatch: Expected ${totalItems} bamboo lengths, but line ${idx+2} is missing.`);
        itemLengths[idx] = 0; // Assign a default/neutral value in case of missing data.
    } else {
        itemLengths[idx] = parseInt(currentBambooLine, 10);
    }
  }

  // Kick off the recursive exploration process.
  // The 'assignmentRecord' array will track which group each bamboo piece belongs to.
  const assignmentRecord = Array(totalItems).fill(-1); // -1 signifies unassigned initially.
  exploreCombinations(0, assignmentRecord);

  // Display the final minimum cost found.
  console.log(minCostOverall);
});

/**
 * A recursive function to explore all possible ways to assign bamboo pieces to groups.
 * Each bamboo can be assigned to group A (0), B (1), C (2), or be discarded (3).
 *
 * @param {number} currentBambooIndex - The zero-based index of the bamboo piece currently being considered.
 * @param {number[]} assignmentRecord - An array where assignmentRecord[i] stores the group assignment for bamboo i.
 */
function exploreCombinations(currentBambooIndex, assignmentRecord) {
  // Base case: If all bamboo pieces have been assigned, evaluate the current configuration.
  if (currentBambooIndex === totalItems) {
    calculateAndCompareCost(assignmentRecord);
    return; // No return value is needed as it updates a global variable.
  }

  // Define the four possible assignment options for each bamboo piece.
  const allocationChoices = [0, 1, 2, 3]; // 0: A, 1: B, 2: C, 3: Discard

  // Recursively try each allocation choice for the current bamboo piece.
  for (const choice of allocationChoices) {
    assignmentRecord[currentBambooIndex] = choice; // Assign the current bamboo.
    exploreCombinations(currentBambooIndex + 1, assignmentRecord); // Move to the next bamboo.
  }
}

/**
 * Computes the total cost for a specific bamboo assignment configuration.
 * Updates the global 'minCostOverall' if a more efficient configuration is found.
 *
 * @param {number[]} finalAssignmentRecord - The complete and final assignment for all bamboo pieces.
 */
function calculateAndCompareCost(finalAssignmentRecord) {
  let groupALenSum = 0;
  let groupBLenSum = 0;
  let groupCLenSum = 0;

  let groupAElementCount = 0;
  let groupBElementCount = 0;
  let groupCElementCount = 0;

  // Iterate through each bamboo piece to sum lengths and count elements per group.
  for (let itemIdx = 0; itemIdx < totalItems; itemIdx++) {
    const currentItemLength = itemLengths[itemIdx];

    // Skip processing if the bamboo piece has a non-positive length.
    if (currentItemLength <= 0) {
        continue;
    }

    // Distribute bamboo lengths and counts based on their assignment.
    switch (finalAssignmentRecord[itemIdx]) {
      case 0: // Assigned to group A
        groupALenSum += currentItemLength;
        groupAElementCount++;
        break;
      case 1: // Assigned to group B
        groupBLenSum += currentItemLength;
        groupBElementCount++;
        break;
      case 2: // Assigned to group C
        groupCLenSum += currentItemLength;
        groupCElementCount++;
        break;
      case 3: // Explicitly discarded, incurs no length or count.
        break;
      default:
        // This case should ideally not be hit if assignments are always within 0-3.
        // Can be used for debugging unexpected assignment values.
        console.warn(`Unexpected assignment value encountered: ${finalAssignmentRecord[itemIdx]}`);
        break;
    }
  }

  // Guard Clause: An assignment is only valid if all three target groups (A, B, C) have at least one bamboo piece.
  // Assuming bamboo lengths are positive, checking sum > 0 is equivalent to count > 0.
  const areAllTargetGroupsPopulated = groupALenSum > 0 && groupBLenSum > 0 && groupCLenSum > 0;

  if (!areAllTargetGroupsPopulated) {
    return; // Invalidate this combination, as it doesn't meet the criteria.
  }

  // Calculate the cost associated with merging multiple bamboo pieces.
  // The first piece in each group is "free"; subsequent pieces cost 10 MP each to merge.
  const mergeCostA = Math.max(0, groupAElementCount - 1) * 10;
  const mergeCostB = Math.max(0, groupBElementCount - 1) * 10;
  const mergeCostC = Math.max(0, groupCElementCount - 1) * 10;
  const totalMergeOperationCost = mergeCostA + mergeCostB + mergeCostC;

  // Calculate the cost based on the absolute differences from the target lengths.
  const lengthAdjustmentCost = Math.abs(targetA - groupALenSum) +
                               Math.abs(targetB - groupBLenSum) +
                               Math.abs(targetC - groupCLenSum);

  // Sum up all cost components for the current assignment.
  const currentConfigurationTotalCost = lengthAdjustmentCost + totalMergeOperationCost;

  // Update the overall minimum cost if this configuration is superior.
  if (currentConfigurationTotalCost < minCostOverall) {
    minCostOverall = currentConfigurationTotalCost;
  }
}