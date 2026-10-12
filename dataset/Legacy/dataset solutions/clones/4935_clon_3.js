'use strict';

// Helper function to determine eligibility for 'b' type challengers
function checkBChallengerEligibility(currentRank, previousBCount, totalCapacityLimit) {
  // The original condition was: i + 1 < a[1] + a[2] && i + 1 < foreigner
  // This translates to: currentRank < totalCapacityLimit && currentRank < previousBCount
  // This means the current challenger's rank must be less than the overall capacity
  // AND less than the count of 'b' challengers that appeared before it.
  return currentRank < totalCapacityLimit && currentRank < previousBCount;
}

function processContest(rawData) {
  const lines = rawData.trim().split('\n');
  // Parse the configuration parameters from the first line
  // configParams[0] is N (total challengers), configParams[1] is A (capacity for 'a'), configParams[2] is B (capacity for 'b')
  const configParams = lines[0].split(' ').map(valStr => Number(valStr));
  const contestants = lines[1].split('');

  // Calculate the combined capacity for 'a' and 'b' challengers
  const totalCapacityLimit = configParams[1] + configParams[2];

  // This array will store the 'Yes\n' or 'No\n' status for each contestant.
  // Although logged immediately, keeping the array mirrors the original structure.
  const passStatusRecords = [];

  for (let idx = 0; idx < contestants.length; idx++) {
    const currentContestantType = contestants[idx];
    const currentRank = idx + 1; // 1-based rank for the current challenger

    let eligibilityOutcome = 'No\n'; // Default outcome for any challenger

    if (currentContestantType === 'a') {
      // 'a' challengers pass if their rank is within the total capacity
      if (currentRank < totalCapacityLimit) {
        eligibilityOutcome = 'Yes\n';
      }
    } else if (currentContestantType === 'b') {
      // For 'b' challengers, we need to count previous 'b's
      let previousBCount = 0;
      for (let innerIdx = 0; innerIdx < idx; innerIdx++) {
        if (contestants[innerIdx] === 'b') {
          previousBCount++;
        }
      }

      // Use the helper function to determine eligibility based on specific 'b' rules
      if (checkBChallengerEligibility(currentRank, previousBCount, totalCapacityLimit)) {
        eligibilityOutcome = 'Yes\n';
      }
      // The original logic implicitly resets 'foreigner' for each 'b' by re-calculating it.
      // This is handled by 'previousBCount' being a local variable within this block.
    }
    // If currentContestantType is neither 'a' nor 'b', eligibilityOutcome remains 'No\n'

    passStatusRecords[idx] = eligibilityOutcome;
    console.log(eligibilityOutcome); // Log the result immediately as per original behavior
  }
}

processContest(require("fs").readFileSync("/dev/stdin", "utf8"));
