function calculateMajorityProbability(inputDataString) {
  // Define a constant for initializing probability values, ensuring floating-point consistency.
  const PROB_ZERO = 0.0;

  // Step 1: Parse the raw input string.
  // Trim any leading/trailing whitespace from the entire input, then split into individual lines.
  const processedLines = inputDataString.trim().split('\n');

  // Essential validation: Ensure there are at least two lines for configuration.
  if (processedLines.length < 2) {
    // In a production environment, this might throw an error or log a warning.
    // For competitive programming, input format is usually guaranteed.
    console.error("Input data is insufficient: requires at least two lines.");
    return "ERROR_INVALID_INPUT_FORMAT";
  }

  // Step 2: Extract the total number of trials (N) from the first line.
  // The first line contains space-separated values; we only need the first one.
  const firstConfigurationTokens = processedLines.shift().split(' ');
  const totalTrialsCount = parseInt(firstConfigurationTokens[0], 10);

  // Validate the extracted number of trials.
  if (isNaN(totalTrialsCount) || totalTrialsCount <= 0) {
    console.error("The number of trials must be a positive integer.");
    return "ERROR_INVALID_TRIAL_COUNT";
  }

  // Step 3: Parse the success probabilities for each trial from the second line.
  // Convert each string token to a floating-point number.
  const trialSuccessProbabilities = processedLines.shift().split(' ').map(token => Number.parseFloat(token));

  // Validate that the number of probabilities matches the expected trial count.
  if (trialSuccessProbabilities.length !== totalTrialsCount) {
    console.error(`Probability count mismatch: Expected ${totalTrialsCount}, got ${trialSuccessProbabilities.length}.`);
    return "ERROR_PROBABILITY_MISMATCH";
  }

  // Step 4: Initialize the dynamic programming table (DP matrix).
  // 'dpTable[i][j]' will store the probability of having exactly 'j' successes after 'i+1' trials.
  // Dimensions: 'totalTrialsCount' rows (for trials 0 to N-1) x 'totalTrialsCount + 1' columns (for 0 to N successes).
  const dpTable = Array.from({ length: totalTrialsCount }, () =>
    Array(totalTrialsCount + 1).fill(PROB_ZERO)
  );

  // Step 5: Establish the base cases for the first trial (index 0).
  // P(0 successes after 1st trial) = P(1st trial fails)
  // P(1 success after 1st trial) = P(1st trial succeeds)
  const probabilityOfFirstSuccess = trialSuccessProbabilities[0];
  const probabilityOfFirstFailure = 1.0 - probabilityOfFirstSuccess;

  dpTable[0][0] = probabilityOfFirstFailure;
  dpTable[0][1] = probabilityOfFirstSuccess;

  // Step 6: Populate the DP table iteratively.
  // Loop through each trial, starting from the second trial (index 1) up to the last trial (N-1).
  for (let currentTrialIndex = 0; currentTrialIndex < totalTrialsCount - 1; ++currentTrialIndex) {
    // Retrieve the success probability for the *next* trial.
    // `currentTrialIndex` corresponds to `i` in `dpTable[i]`, so `p[i+1]` is `trialSuccessProbabilities[currentTrialIndex + 1]`.
    const probNextTrialSucceeds = trialSuccessProbabilities[currentTrialIndex + 1];
    const probNextTrialFails = 1.0 - probNextTrialSucceeds;

    // Iterate through all possible success counts observed *up to the current trial*.
    // The maximum possible successes after `currentTrialIndex + 1` events is `currentTrialIndex + 1`.
    for (let successesAchieved = 0; successesAchieved <= currentTrialIndex + 1; ++successesAchieved) {
      // Optimization: Only process states with non-zero probability.
      // This can slightly improve performance by skipping impossible paths.
      if (dpTable[currentTrialIndex][successesAchieved] > PROB_ZERO) {
        const previousStateProbability = dpTable[currentTrialIndex][successesAchieved];

        // Scenario A: The (currentTrialIndex + 1)th trial succeeds.
        // Add its probability contribution to the state with one more success.
        dpTable[currentTrialIndex + 1][successesAchieved + 1] += previousStateProbability * probNextTrialSucceeds;

        // Scenario B: The (currentTrialIndex + 1)th trial fails.
        // Add its probability contribution to the state with the same number of successes.
        dpTable[currentTrialIndex + 1][successesAchieved] += previousStateProbability * probNextTrialFails;
      }
    }
  }

  // Step 7: Calculate the final probability of achieving a "majority" of successes.
  // A majority is defined as at least (N+1)/2 successes.
  // We need to sum probabilities from this threshold onwards in the last row of the DP table.
  const minimumSuccessesForMajority = Math.floor((totalTrialsCount + 1) / 2);
  const finalProbabilitiesRow = dpTable[totalTrialsCount - 1]; // This row contains probabilities after N trials.

  // Extract the relevant probabilities from the final row.
  const majorityProbabilitiesSlice = finalProbabilitiesRow.slice(minimumSuccessesForMajority);

  // Sum these probabilities to get the cumulative probability of majority success.
  const overallMajorityProbability = majorityProbabilitiesSlice.reduce((accumulator, currentProbability) =>
    accumulator + currentProbability, PROB_ZERO
  );

  // Format the result to a fixed number of decimal places for consistent output.
  return overallMajorityProbability.toFixed(10);
}

// The main execution block: reads input, processes it, and prints the result.
// It uses Node.js 'fs' module to read synchronous input from '/dev/stdin'.
console.log(calculateMajorityProbability(require('fs').readFileSync('/dev/stdin', 'utf8')));