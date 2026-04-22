const processInputAndCalculateScores = (sourceDataText) => {
  // Step 1: Prepare the raw input by removing leading/trailing whitespace
  // and splitting it into individual lines for easier processing.
  const cleanedInputLines = sourceDataText.trim().split('\n');

  // Retrieve the total number of data rounds from the very first line.
  const numberOfSimulationRounds = Number(cleanedInputLines[0]);

  // Implement a guard clause for malformed or insufficient input.
  // If the number of rounds is not a positive integer, or
  // if there aren't enough lines to match the declared number of rounds,
  // we cannot proceed safely.
  if (isNaN(numberOfSimulationRounds) || numberOfSimulationRounds <= 0 || cleanedInputLines.length < numberOfSimulationRounds + 1) {
    console.error("Critical Error: Input format invalid. Expected a positive integer for round count followed by corresponding data lines.");
    return; // Terminate execution as input is unusable.
  }

  // Step 2: Pre-parse all the round-specific parameters from the input lines.
  // This creates a structured array of objects, making subsequent iteration cleaner.
  const simulationRoundParameters = [];
  for (let roundIndex = 1; roundIndex <= numberOfSimulationRounds; ++roundIndex) {
    const currentDataLine = cleanedInputLines[roundIndex];
    const stringFactors = currentDataLine.split(' '); // Split the line by space.

    const currentRoundTrustFactor = Number(stringFactors[0]);
    const currentRoundApprovalFactor = Number(stringFactors[1]);

    // Additional validation for individual round factors.
    // Ensure they are positive numbers; otherwise, it indicates a problem with input.
    if (isNaN(currentRoundTrustFactor) || isNaN(currentRoundApprovalFactor) || currentRoundTrustFactor <= 0 || currentRoundApprovalFactor <= 0) {
      console.error(`Data Error: Skipping round ${roundIndex} due to invalid or non-positive factors: "${currentDataLine}"`);
      return; // Critical error, stop processing.
    }

    simulationRoundParameters.push({
      roundTrustRequirement: currentRoundTrustFactor,
      roundApprovalRequirement: currentRoundApprovalFactor,
    });
  }

  // Step 3: Initialize the running totals for Trust and Approval scores.
  // These values will be progressively updated over the simulation rounds.
  let currentTrustScore = 1;
  let currentApprovalScore = 1;

  // Step 4: Execute the main simulation loop for each defined round.
  // In each round, we adjust the scores to meet the new minimum requirements.
  for (let iterationCounter = 0; iterationCounter < numberOfSimulationRounds; ++iterationCounter) {
    const { roundTrustRequirement, roundApprovalRequirement } = simulationRoundParameters[iterationCounter];

    // Calculate the minimum multiplier needed to satisfy the Trust requirement.
    // Math.ceil ensures we always round up to meet or exceed the current score.
    const minimumTrustMultiplier = Math.ceil(currentTrustScore / roundTrustRequirement);

    // Calculate the minimum multiplier needed to satisfy the Approval requirement.
    const minimumApprovalMultiplier = Math.ceil(currentApprovalScore / roundApprovalRequirement);

    // Determine the overall scaling factor for this iteration.
    // This factor must be large enough to satisfy both trust and approval requirements simultaneously.
    let effectiveScalingFactor;
    if (minimumTrustMultiplier > minimumApprovalMultiplier) {
      effectiveScalingFactor = minimumTrustMultiplier;
    } else {
      effectiveScalingFactor = minimumApprovalMultiplier;
    }

    // A defensive check: if the scaling factor is non-positive, it suggests an
    // unexpected state (e.g., zero or negative factors in input, though handled above).
    if (effectiveScalingFactor <= 0) {
      console.warn(`Warning: Non-positive scaling factor (${effectiveScalingFactor}) encountered in round ${iterationCounter + 1}. Scores might not update as expected.`);
      continue; // Skip score update for this potentially problematic round.
    }

    // Update the current accumulated scores using the calculated scaling factor.
    currentTrustScore = roundTrustRequirement * effectiveScalingFactor;
    currentApprovalScore = roundApprovalRequirement * effectiveScalingFactor;
  }

  // Step 5: Compute and display the final combined score.
  // This is the sum of the accumulated Trust and Approval scores after all rounds.
  const finalAggregatedScore = currentApprovalScore + currentTrustScore;
  console.log(finalAggregatedScore);
};

// Entry point for script execution in a Node.js environment.
// It reads the entire standard input and passes it to our primary processing function.
const fileSystemModule = require('fs');
const standardInputFileDescriptor = '/dev/stdin';
const dataFileEncoding = 'utf8';

try {
  const rawInputContent = fileSystemModule.readFileSync(standardInputFileDescriptor, dataFileEncoding);
  processInputAndCalculateScores(rawInputContent);
} catch (ioError) {
  console.error("Input/Output Error: Could not read from standard input or process data.", ioError.message);
  // Indicate a failure in script execution.
  process.exit(1);
}