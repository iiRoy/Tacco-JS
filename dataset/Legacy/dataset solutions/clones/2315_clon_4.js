function processContestData(rawData) {
  const contestParameters = rawData[0].split(' ').map(Number);
  const totalProblemCount = contestParameters[0];
  const pointsPerVote = contestParameters[1];
  const problemsToVoteFor = contestParameters[2];
  const targetRankThreshold = contestParameters[3];

  const problemScores = rawData[1].split(' ').map(Number).sort((a, b) => a - b);

  // This helper function determines if a problem at a given index
  // in the sorted `problemScores` array can achieve a rank within `targetRankThreshold`.
  const checkEligibility = (candidateProblemIndex) => {
    const maxAchievableScore = problemScores[candidateProblemIndex] + pointsPerVote;

    // First condition: The problem at the (totalProblemCount - targetRankThreshold)-th position
    // (which is the lowest score among the top `targetRankThreshold` problems before any votes)
    // must not be strictly greater than `maxAchievableScore`.
    // If it is, then even with max votes, the candidate problem cannot make it into the top `targetRankThreshold`.
    if (problemScores[totalProblemCount - targetRankThreshold] > maxAchievableScore) {
      return false;
    }

    // Second condition: Check if there are enough votes to ensure the candidate problem
    // is among the top `targetRankThreshold` problems.
    // We assume the candidate problem and `targetRankThreshold - 1` other problems (the highest scoring ones)
    // will receive votes. This consumes `targetRankThreshold` votes.
    // The remaining `problemsToVoteFor - targetRankThreshold` votes can be used to boost
    // problems that are currently below the `targetRankThreshold`-th position.

    let cumulativeScoreDeficit = 0;
    // Iterate through problems that are *below* the initial `targetRankThreshold`-th position (from the top).
    // These are problems from index 0 up to `totalProblemCount - targetRankThreshold - 1`.
    for (let k = 0; k < totalProblemCount - targetRankThreshold; k++) {
      // For each such problem, calculate how many points it would need to reach `maxAchievableScore`.
      // We sum these deficits.
      cumulativeScoreDeficit += (maxAchievableScore - problemScores[k]);
    }

    // The total points that can be covered by the remaining votes
    // (each vote adds `pointsPerVote` points) must be greater than or equal to `cumulativeScoreDeficit`.
    // If `problemsToVoteFor < targetRankThreshold`, the right side will be negative or zero,
    // correctly indicating insufficient votes for the top `targetRankThreshold` problems.
    return cumulativeScoreDeficit <= (problemsToVoteFor - targetRankThreshold) * pointsPerVote;
  };

  let searchLowerBound = 0;
  let searchUpperBound = totalProblemCount - 1;
  let qualifyingProblemStartIdx = totalProblemCount - 1; // Initialize to the last problem (smallest possible answer)

  // Perform a binary search to find the smallest index `i`
  // such that `problemScores[i]` can be in the top `targetRankThreshold`.
  while (searchLowerBound <= searchUpperBound) {
    const searchMidPoint = Math.floor((searchLowerBound + searchUpperBound) / 2);
    if (checkEligibility(searchMidPoint)) {
      qualifyingProblemStartIdx = searchMidPoint; // This problem can qualify, try for an even smaller index
      searchUpperBound = searchMidPoint - 1;
    } else {
      searchLowerBound = searchMidPoint + 1; // This problem cannot qualify, need to check larger indices
    }
  }

  // The number of problems that can qualify is `totalProblemCount - qualifyingProblemStartIdx`.
  const finalEligibleCount = totalProblemCount - qualifyingProblemStartIdx;

  console.log(finalEligibleCount);
}

processContestData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
