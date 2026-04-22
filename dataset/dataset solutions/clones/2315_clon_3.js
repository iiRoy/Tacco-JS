function assessCompetitionOutcomes(competitionInputLines) {
  // Validate initial input structure.
  if (!competitionInputLines || competitionInputLines.length < 2) {
    console.error("Input data is incomplete or invalid. Expected at least two lines.");
    return;
  }

  // Parse global competition parameters from the first line.
  const setupNumericValues = competitionInputLines[0].split(' ').map(Number);
  const totalItemCount = setupNumericValues[0]; // Represents N
  const maxVotesPerItem = setupNumericValues[1]; // Represents M
  const totalSelectableCandidates = setupNumericValues[2]; // Represents V
  const targetTopRank = setupNumericValues[3]; // Represents P

  // Parse and sort the initial scores of all items in ascending order.
  const initialScoresSorted = competitionInputLines[1].split(' ').map(Number).sort((scoreA, scoreB) => scoreA - scoreB);

  // Add guard clauses for critical parameters (Type III addition).
  if (targetTopRank <= 0 || targetTopRank > totalItemCount) {
    console.log(0); // If target rank is invalid, no item can qualify.
    return;
  }
  if (totalSelectableCandidates < targetTopRank) {
    // If we can't even select enough items to reach the target rank, no item qualifies.
    console.log(0);
    return;
  }

  let lowestQualifyingScoreFound = -1; // Placeholder for the score of the lowest-ranked item that can reach targetTopRank.

  // `remainingSelectionsTracker` counts how many items from the `totalSelectableCandidates` pool
  // are yet to be accounted for (either by being the current item, a duplicate, or a higher-ranked item).
  let remainingSelectionsTracker = totalSelectableCandidates;

  // Iterate through each item, from lowest score to highest, to find the threshold.
  for (let currentCandidateIndex = 0; currentCandidateIndex < initialScoresSorted.length; ++currentCandidateIndex) {
    const currentCandidateBaseScore = initialScoresSorted[currentCandidateIndex];

    // Skip over items that have identical scores to the current one.
    // These duplicates are implicitly covered if the current item qualifies.
    while (currentCandidateIndex + 1 < initialScoresSorted.length && initialScoresSorted[currentCandidateIndex] === initialScoresSorted[currentCandidateIndex + 1]) {
      currentCandidateIndex++;
      remainingSelectionsTracker--; // Each duplicate reduces the pool of candidates we need to select.
    }
    remainingSelectionsTracker--; // The current candidate itself takes one slot from the pool.

    // Calculate the maximum score this current candidate could achieve with `maxVotesPerItem`.
    const potentialMaxScoreForCurrent = currentCandidateBaseScore + maxVotesPerItem;

    let accumulatedVotesForGaps = 0;
    // Calculate votes needed to bring up items between `currentCandidateBaseScore` and `potentialMaxScoreForCurrent`.
    // These items are higher than the current candidate but could be boosted to its potential max score.
    for (let higherItemIdx = currentCandidateIndex + 1; higherItemIdx < initialScoresSorted.length; ++higherItemIdx) {
      const scoreOfHigherItem = initialScoresSorted[higherItemIdx];
      if (scoreOfHigherItem >= potentialMaxScoreForCurrent) {
        break; // Stop if items are already at or above the potential max score.
      }
      accumulatedVotesForGaps += (potentialMaxScoreForCurrent - scoreOfHigherItem);
    }
    
    // Determine how many items can be completely covered by `maxVotesPerItem` from the accumulated votes.
    const itemsCoveredByFullBoosts = (accumulatedVotesForGaps / maxVotesPerItem) | 0; // Bitwise OR for floor division.
    let leftoverVotesFromGaps = accumulatedVotesForGaps % maxVotesPerItem;

    // If the remaining selections are less than or equal to the items we can cover by bulk votes,
    // it implies that the current item can indeed reach the target rank.
    // All necessary higher items are either already high enough or can be boosted within `totalSelectableCandidates`.
    if (remainingSelectionsTracker <= itemsCoveredByFullBoosts) {
      lowestQualifyingScoreFound = currentCandidateBaseScore;
      break; // Found the lowest possible qualifying score, no need to check further.
    }

    // Calculate how many distinct higher-scoring items must be selected and boosted with full votes.
    const numberOfDistinctHigherItemsToBoost = remainingSelectionsTracker - itemsCoveredByFullBoosts;

    // Ensure `slice` doesn't get a negative argument, which would reverse its behavior.
    const actualSliceCount = Math.max(0, numberOfDistinctHigherItemsToBoost);
    
    // Get the scores of these highest-ranked items and apply `maxVotesPerItem` to them.
    // This creates a hypothetical list of boosted scores for comparison.
    const boostedScoresOfTopSelections = initialScoresSorted.slice(-actualSliceCount).map(score => score + maxVotesPerItem);

    // If there are `leftoverVotesFromGaps`, distribute them among the `boostedScoresOfTopSelections`.
    // This might reduce some of their boosted scores from `score + maxVotesPerItem`.
    if (leftoverVotesFromGaps > 0) {
      for (let boostElementIdx = 0; boostElementIdx < boostedScoresOfTopSelections.length; ++boostElementIdx) {
        let currentBoostedElementScore = boostedScoresOfTopSelections[boostElementIdx];
        // If subtracting leftover votes would drop the score below `potentialMaxScoreForCurrent`, cap it.
        if (currentBoostedElementScore - leftoverVotesFromGaps < potentialMaxScoreForCurrent) {
          boostedScoresOfTopSelections[boostElementIdx] = potentialMaxScoreForCurrent;
          leftoverVotesFromGaps -= (currentBoostedElementScore - potentialMaxScoreForCurrent);
        } else {
          boostedScoresOfTopSelections[boostElementIdx] -= leftoverVotesFromGaps;
          leftoverVotesFromGaps = 0; // All votes used.
          break;
        }
      }
      // If votes still remain after iterating, subtract from the highest score (last element).
      if (leftoverVotesFromGaps > 0 && boostedScoresOfTopSelections.length > 0) {
        boostedScoresOfTopSelections[boostedScoresOfTopSelections.length - 1] -= leftoverVotesFromGaps;
      }
    }

    // Now, verify if the current candidate, with its `potentialMaxScoreForCurrent`,
    // can be ranked within the `targetTopRank` position among all items.
    let canCurrentCandidateQualify = true;
    for (let rankPositionOffset = 0; rankPositionOffset < targetTopRank; ++rankPositionOffset) {
      let scoreAtThisRank;
      const effectiveIndexFromEnd = initialScoresSorted.length - 1 - rankPositionOffset;

      if (rankPositionOffset < boostedScoresOfTopSelections.length) {
        // Compare against the adjusted scores of the highest `numberOfDistinctHigherItemsToBoost` items.
        // These are sorted, so `boostedScoresOfTopSelections[length - 1 - offset]` gets the `offset`-th highest.
        scoreAtThisRank = boostedScoresOfTopSelections[boostedScoresOfTopSelections.length - 1 - rankPositionOffset];
      } else {
        // If we've exhausted the boosted items, compare against original scores of even higher items.
        scoreAtThisRank = initialScoresSorted[effectiveIndexFromEnd];
      }

      // If any item at a higher rank position has a score greater than our current candidate's potential max,
      // then the current candidate cannot achieve the `targetTopRank`.
      if (potentialMaxScoreForCurrent < scoreAtThisRank) {
        canCurrentCandidateQualify = false;
        break;
      }
    }

    if (canCurrentCandidateQualify) {
      lowestQualifyingScoreFound = currentCandidateBaseScore;
      break; // Found the threshold, exit loop.
    }
  }

  // If no qualifying score was found, it means even the highest-scoring items cannot reach the `targetTopRank`.
  if (lowestQualifyingScoreFound === -1) {
      console.log(0);
      return;
  }

  // After finding the lowest score that can qualify, count all items that are at least as good.
  // The `currentCandidateIndex` might be positioned at the end of a block of identical scores.
  // We need to backtrack to the first occurrence of this score to count all items with it.
  let finalMatchingStartingIndex = currentCandidateIndex;
  while (finalMatchingStartingIndex > 0 && initialScoresSorted[finalMatchingStartingIndex] === initialScoresSorted[finalMatchingStartingIndex - 1]) {
    finalMatchingStartingIndex--;
  }

  const finalCountOfQualifyingItems = initialScoresSorted.length - finalMatchingStartingIndex;
  console.log(finalCountOfQualifyingItems);
}

// Standard competitive programming input handling.
const rawInputDataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
assessCompetitionOutcomes(rawInputDataLines);