// A helper utility function to safely parse a line of space-separated numerical values.
const parseNumericalLine = (lineContent) => lineContent.split(' ').map(Number);

/**
 * Orchestrates the process of determining how many problems can achieve
 * a specified rank threshold in a competitive programming contest,
 * given a set of problem scores and a pool of votes.
 *
 * This function reads contest parameters and problem scores, then iteratively
 * checks each problem as a potential lowest-scoring candidate that can still
 * achieve the target rank. It applies a vote distribution strategy
 * to simulate the contest outcome.
 *
 * @param {string[]} rawInputData - An array of strings received from standard input.
 *                                   - The first element (index 0) contains "N M V P"
 *                                     (total problems, max votes per problem, total available votes, target rank).
 *                                   - The second element (index 1) contains space-separated problem scores.
 * @returns {void} The final count of eligible problems is printed to standard output.
 */
function EvaluateContestEligibility(rawInputData) {
  // Input validation: Ensure the necessary data lines are present.
  if (!Array.isArray(rawInputData) || rawInputData.length < 2) {
    // In a competitive programming context, input format is usually guaranteed.
    // For robustness, an error message is included.
    console.error("Error: Input data is malformed or insufficient. Expected at least two lines.");
    return;
  }

  // Parse the core contest parameters from the first line.
  const contestMetrics = parseNumericalLine(rawInputData[0]);
  const totalProblemCount = contestMetrics[0];              // N: Total number of problems in the contest.
  const maxVotesPerProblemBoost = contestMetrics[1];        // M: Maximum votes that can be added to any single problem's score.
  let currentAvailableVotes = contestMetrics[2];            // V: Total votes initially available across all problems. (Mutable)
  const requiredRankThreshold = contestMetrics[3];          // P: A problem must be ranked within the top P positions to be eligible.

  // Parse all problem scores from the second line and sort them in ascending order.
  // This sorted list is crucial for efficiently determining rank and vote distribution.
  const problemScoresAscending = parseNumericalLine(rawInputData[1]).sort((scoreA, scoreB) => scoreA - scoreB);

  // Variable to store the lowest score a problem can have and still qualify.
  // Initialized to -1, indicating no qualifying score found yet.
  let minimumQualifyingScore = -1;

  // Iterate through each problem, starting from the lowest score,
  // to find the minimum score that can achieve the target rank.
  for (let candidateProblemIndex = 0; candidateProblemIndex < totalProblemCount; candidateProblemIndex++) {
    const candidateBaseScore = problemScoresAscending[candidateProblemIndex];

    // Store the original index to correctly calculate problems needing votes later.
    const initialCandidateScanIndex = candidateProblemIndex;

    // --- Vote Deduction for Duplicates and the Candidate Itself ---
    // If there are multiple problems with the same score as the current candidate,
    // they are considered together. Each effectively consumes one vote implicitly.
    while (candidateProblemIndex + 1 < totalProblemCount && problemScoresAscending[candidateProblemIndex + 1] === candidateBaseScore) {
      candidateProblemIndex++;
      currentAvailableVotes--; // Implicit vote for each duplicate.
    }
    currentAvailableVotes--; // One vote for the current distinct candidate problem.

    // If the available votes fall below zero at this stage, it's impossible for
    // this candidate (or any higher-scoring ones) to qualify.
    if (currentAvailableVotes < 0) {
      minimumQualifyingScore = candidateBaseScore; // This candidate is the highest score that *cannot* qualify fully.
      break; // Exit the loop, as higher scores won't help.
    }

    // Calculate the maximum possible score for the current candidate if it receives max votes.
    const candidateBoostedScore = candidateBaseScore + maxVotesPerProblemBoost;

    // --- Phase 1: Distribute votes to problems whose initial scores are between
    //             `candidateBaseScore` and `candidateBoostedScore`. ---
    // These problems need votes to reach at least `candidateBoostedScore` to not
    // outrank our candidate.
    let votesNeededToBoostIntermediates = 0;
    let problemsAffectedByBoostRange = 0; // Counts problems needing a boost to reach `candidateBoostedScore`.

    // Scan problems from *after* the current candidate (including any duplicates handled).
    for (let scannerIndex = initialCandidateScanIndex + 1; scannerIndex < totalProblemCount; scannerIndex++) {
      const scannedProblemScore = problemScoresAscending[scannerIndex];

      // If a problem's score is less than `candidateBoostedScore`, it needs votes.
      if (scannedProblemScore < candidateBoostedScore) {
        votesNeededToBoostIntermediates += (candidateBoostedScore - scannedProblemScore);
        problemsAffectedByBoostRange++;
      } else {
        // Since the array is sorted, if a problem is already at or above `candidateBoostedScore`,
        // all subsequent problems will also be, so we can stop scanning this range.
        break;
      }
    }

    // Calculate how many full `maxVotesPerProblemBoost` packages are consumed
    // by the `votesNeededToBoostIntermediates`.
    const fullVotePackagesConsumed = Math.floor(votesNeededToBoostIntermediates / maxVotesPerProblemBoost);
    // Calculate any remaining votes from `votesNeededToBoostIntermediates` that don't form a full package.
    let partialVotesRemainder = votesNeededToBoostIntermediates % maxVotesPerProblemBoost;

    // If `currentAvailableVotes` is less than or equal to `fullVotePackagesConsumed`,
    // it means we lack sufficient votes to even cover the problems needing to reach
    // `candidateBoostedScore`. Thus, this candidate cannot qualify.
    if (currentAvailableVotes <= fullVotePackagesConsumed) {
      minimumQualifyingScore = candidateBaseScore;
      break; // Exit the loop as this candidate and higher ones won't qualify.
    }
    // Deduct the votes used for full packages from the total pool.
    currentAvailableVotes -= fullVotePackagesConsumed;

    // --- Phase 2: Check if the candidate can achieve the `requiredRankThreshold` ---
    // This involves comparing `candidateBoostedScore` against the `P`-th highest score
    // after all votes are strategically distributed.

    // `currentAvailableVotes` now represents the votes remaining for general boosting.
    // `partialVotesRemainder` (from `votesNeededToBoostIntermediates % maxVotesPerProblemBoost`)
    // implies that these votes didn't fully boost a problem. The original code's complex
    // handling of `r` suggests these votes are effectively "lost" from the general boosting pool
    // for full `M` boosts. We account for this by reducing `currentAvailableVotes` by `partialVotesRemainder`.
    // A simplification for Type III: assume `partialVotesRemainder` votes are "less efficient"
    // and reduce the effective general boost by that amount.
    let effectiveGeneralBoostVotes = currentAvailableVotes - partialVotesRemainder;
    // Ensure `effectiveGeneralBoostVotes` doesn't become negative.
    if (effectiveGeneralBoostVotes < 0) {
      effectiveGeneralBoostVotes = 0;
    }

    // The core P-rank check:
    // We need to determine if `candidateBoostedScore` is greater than or equal to
    // the score of the `requiredRankThreshold`-th problem from the top, *after* considering
    // that `effectiveGeneralBoostVotes` problems (from the highest available scores) can be boosted.
    // This is equivalent to checking `candidateBoostedScore` against the problem
    // at index `totalProblemCount - requiredRankThreshold - effectiveGeneralBoostVotes`
    // in the sorted `problemScoresAscending` list.
    // We must ensure the `comparisonIndex` is valid (not out of bounds).
    const comparisonIndex = totalProblemCount - requiredRankThreshold - effectiveGeneralBoostVotes;

    // If `comparisonIndex` is negative, it implies we have enough 'boosting power'
    // to place our candidate trivially within the top `P` ranks.
    // Otherwise, we compare `candidateBoostedScore` with the score at `comparisonIndex`.
    // If `candidateBoostedScore` is greater than or equal to this threshold score,
    // then `candidateBaseScore` is a valid `minimumQualifyingScore`.
    if (comparisonIndex < 0 || candidateBoostedScore >= problemScoresAscending[comparisonIndex]) {
      minimumQualifyingScore = candidateBaseScore;
      break; // Found the minimum qualifying score, no need to check higher scores.
    }
  } // End of main loop for candidate problems.

  // If after the loop `minimumQualifyingScore` is still -1, it means no problem
  // could achieve the target rank under the given constraints.
  if (minimumQualifyingScore === -1) {
    console.log(0); // Output 0 as no problems can qualify.
    return;
  }

  // --- Final Result Calculation ---
  // Count the number of problems whose scores are greater than or equal to the
  // `minimumQualifyingScore`. These are all the problems that are eligible.
  let finalEligibleProblemCount = 0;
  for (let finalIndex = 0; finalIndex < totalProblemCount; finalIndex++) {
    if (problemScoresAscending[finalIndex] >= minimumQualifyingScore) {
      // All problems from `finalIndex` to the end of the array are eligible.
      finalEligibleProblemCount = totalProblemCount - finalIndex;
      break; // Optimization: no need to check further due to sorted array.
    }
  }

  // Output the final count of eligible problems.
  console.log(finalEligibleProblemCount);
}

// Standard competitive programming boilerplate:
// Reads input from standard input, processes it, and passes to the main function.
// `require("fs").readFileSync("/dev/stdin", "utf8")` reads the entire input file.
// `.trim()` removes leading/trailing whitespace.
// `.split("\n")` splits the input into an array of strings, one per line.
EvaluateContestEligibility(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));