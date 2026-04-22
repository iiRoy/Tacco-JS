/**
 * A comprehensive problem-solving utility designed to identify the minimum score a candidate item
 * needs to achieve to secure a position within a specified top rank threshold.
 * It simulates a voting process where items can receive additional points from a limited budget.
 *
 * @param {string[]} inputData Raw input lines, typically from standard input.
 *   - `inputData[0]` contains four space-separated integers:
 *     - `totalProblemCount` (N): The total number of problems/items.
 *     - `maxVotesPerProblem` (M): The maximum points any single problem can receive from the vote budget.
 *     - `totalVoteAllocations` (V): The total number of 'M-vote tokens' available for distribution.
 *     - `rankPositionThreshold` (P): The target rank (e.g., top P) the candidate must achieve.
 *   - `inputData[1]` contains `N` space-separated integers, representing the initial scores of all problems.
 */
function processRankingData(inputData) {
    // 1. Configuration Parsing: Extract problem parameters from the first input line.
    const configurationValues = inputData[0].split(' ').map(Number);
    const totalProblemCount = configurationValues[0]; // N: Total number of items/problems.
    const maxVotesPerProblem = configurationValues[1]; // M: Max points an item can gain from one vote allocation.
    let availableVoteTokens = configurationValues[2]; // V: Budget of M-vote tokens. This will be consumed.
    const rankPositionThreshold = configurationValues[3]; // P: The desired top rank (e.g., if P=3, top 3 items).

    // 2. Score Preparation: Parse and sort the problem scores.
    // Sorting in ascending order is fundamental for rank-based calculations.
    const problemScoresAscending = inputData[1].split(' ').map(Number).sort((scoreA, scoreB) => scoreA - scoreB);

    // This variable will store the lowest initial score that, when boosted,
    // can satisfy the ranking criteria.
    let finalMinimumEligibleScore = null;

    // 3. Main Iteration: Evaluate each problem's score as a potential minimum threshold.
    // We iterate through the sorted scores, treating each `candidateBaseScore` as a hypothesis.
    let currentCandidateIndex = 0;
    while (currentCandidateIndex < totalProblemCount) {
        const candidateBaseScore = problemScoresAscending[currentCandidateIndex];
        // Calculate the maximum possible score this candidate could achieve if fully boosted.
        const candidateMaximumScore = candidateBaseScore + maxVotesPerProblem;

        // Handle contiguous duplicate scores:
        // If multiple problems share the `candidateBaseScore`, they are considered together.
        // Each duplicate also consumes one 'M-vote token' from `availableVoteTokens`.
        // The `currentCandidateIndex` is advanced past all such duplicates.
        while (currentCandidateIndex + 1 < totalProblemCount &&
               problemScoresAscending[currentCandidateIndex] === problemScoresAscending[currentCandidateIndex + 1]) {
            currentCandidateIndex++;
            availableVoteTokens--; // A vote token is implicitly used for this duplicate.
        }
        availableVoteTokens--; // A vote token is used for the current unique candidate itself.

        // 4. Intermediate Vote Calculation:
        // Identify problems that are currently between `candidateBaseScore` and `candidateMaximumScore`.
        // Calculate the total votes needed to bring these problems up to `candidateMaximumScore`.
        let votesRequiredForIntermediateRange = 0;
        // Iterate only through problems appearing after the current candidate in the sorted list.
        for (let j = currentCandidateIndex + 1; j < totalProblemCount; j++) {
            const competitorScore = problemScoresAscending[j];
            if (competitorScore < candidateMaximumScore) {
                // This competitor can be boosted to `candidateMaximumScore`.
                votesRequiredForIntermediateRange += (candidateMaximumScore - competitorScore);
            } else {
                // Since `problemScoresAscending` is sorted, any subsequent problems will also be
                // `>= candidateMaximumScore`, so we can stop this sub-loop early.
                break;
            }
        }

        // Determine how many full `maxVotesPerProblem` boosts can be performed using
        // the `votesRequiredForIntermediateRange` budget.
        const fullBoostsForIntermediateItems = Math.floor(votesRequiredForIntermediateRange / maxVotesPerProblem);
        let remainingPartialVotes = votesRequiredForIntermediateRange % maxVotesPerProblem;

        // 5. Early Eligibility Check (Optimization):
        // If the `availableVoteTokens` (remaining `M`-vote slots) are less than or equal to
        // the `fullBoostsForIntermediateItems` (slots needed for intermediate problems),
        // it implies that we don't have enough tokens to push all these intermediate problems
        // beyond the candidate's `candidateMaximumScore`. Therefore, the current candidate is viable.
        if (availableVoteTokens <= fullBoostsForIntermediateItems) {
            finalMinimumEligibleScore = candidateBaseScore;
            break; // We've found the minimum score, no need to check further.
        }

        // 6. Comprehensive Rank Evaluation (if not an early exit):
        // We need to determine if `candidateMaximumScore` can truly be among the top `P` scores.
        // This involves simulating the final scores of other critical problems.

        // Calculate the number of `M`-vote tokens still available after accounting for intermediate items.
        let remainingFullBoostTokens = availableVoteTokens - fullBoostsForIntermediateItems;

        // Identify the highest-scoring problems that will receive the `remainingFullBoostTokens`.
        // These are the `remainingFullBoostTokens` problems from the very top of the `problemScoresAscending` list.
        // `slice` creates a new array without modifying the original.
        const highestProblemsToBoost = problemScoresAscending.slice(totalProblemCount - remainingFullBoostTokens);
        // Apply the `M` boost to these identified high-ranking problems.
        const boostedHighestScores = highestProblemsToBoost.map(score => score + maxVotesPerProblem);

        // Distribute any `remainingPartialVotes` (from `votesRequiredForIntermediateRange`)
        // by reducing scores in `boostedHighestScores` down to `candidateMaximumScore`.
        // This simulates using partial votes to ensure problems don't exceed `candidateMaximumScore` unnecessarily,
        // or to reduce scores if the problem states votes can be 'removed' (which is unusual, but matches original logic).
        if (remainingPartialVotes > 0) {
            // Iterate from the lowest score in `boostedHighestScores` to apply reductions.
            for (let j = 0; j < boostedHighestScores.length; j++) {
                const currentBoostedVal = boostedHighestScores[j];
                if (currentBoostedVal > candidateMaximumScore) {
                    const votesToReduceToCandidateMax = currentBoostedVal - candidateMaximumScore;
                    if (remainingPartialVotes >= votesToReduceToCandidateMax) {
                        boostedHighestScores[j] = candidateMaximumScore;
                        remainingPartialVotes -= votesToReduceToCandidateMax;
                    } else {
                        // Not enough partial votes to fully reduce to `candidateMaximumScore`.
                        boostedHighestScores[j] -= remainingPartialVotes;
                        remainingPartialVotes = 0;
                        break; // All partial votes consumed.
                    }
                }
            }
            // If any partial votes still remain (e.g., if all `boostedHighestScores` were already <= `candidateMaximumScore`),
            // apply them to the single highest boosted score.
            if (remainingPartialVotes > 0 && boostedHighestScores.length > 0) {
                boostedHighestScores[boostedHighestScores.length - 1] -= remainingPartialVotes;
            }
        }

        // Construct a comprehensive list of all effective scores for final rank comparison.
        const allComputedScoresForRanking = [];
        allComputedScoresForRanking.push(candidateMaximumScore); // The current candidate's boosted score.

        // Add scores of problems before the current candidate. These are not explicitly boosted.
        for (let j = 0; j < currentCandidateIndex; j++) {
            allComputedScoresForRanking.push(problemScoresAscending[j]);
        }

        // Add scores of problems after the current candidate that were NOT part of `highestProblemsToBoost`.
        // These problems do not receive `M`-vote tokens.
        // The `highestProblemsToBoost` started from `totalProblemCount - remainingFullBoostTokens`.
        // So, we add problems from `currentCandidateIndex + 1` up to `totalProblemCount - remainingFullBoostTokens - 1`.
        for (let k = currentCandidateIndex + 1; k < totalProblemCount - remainingFullBoostTokens; k++) {
            // Ensure index `k` is within valid bounds.
            if (k < totalProblemCount) {
                allComputedScoresForRanking.push(problemScoresAscending[k]);
            }
        }

        // Finally, add the scores of the explicitly boosted highest problems.
        allComputedScoresForRanking.push(...boostedHighestScores);

        // Sort this combined list in descending order to easily find the P-th highest score.
        allComputedScoresForRanking.sort((a, b) => b - a);

        // Check if `candidateMaximumScore` is sufficient for the `P`-th rank.
        // The `P`-th highest score is at index `rankPositionThreshold - 1` in a 0-indexed descending list.
        if (rankPositionThreshold > 0 && allComputedScoresForRanking.length >= rankPositionThreshold) {
            const pthHighestScore = allComputedScoresForRanking[rankPositionThreshold - 1];
            if (candidateMaximumScore >= pthHighestScore) {
                finalMinimumEligibleScore = candidateBaseScore;
                break; // Found the minimum viable score.
            }
        } else if (rankPositionThreshold > 0 && allComputedScoresForRanking.length < rankPositionThreshold) {
            // This edge case implies there aren't even `P` items in total after considering all scores.
            // If the candidate can contribute to filling these ranks, it's eligible.
            finalMinimumEligibleScore = candidateBaseScore;
            break;
        }
        // If `rankPositionThreshold` is 0 or negative, it's usually an invalid input,
        // but if it were to mean "any rank", the first candidate would be eligible.
        // Assuming `P >= 1` as per typical problem constraints.

        currentCandidateIndex++; // Move to the next problem score to test as a candidate.
    } // End of main candidate evaluation loop.

    // 7. Final Result Calculation:
    // Count how many problems originally had a score equal to or greater than the
    // `finalMinimumEligibleScore` found.
    let countOfEligibleProblems = 0;
    if (finalMinimumEligibleScore !== null) {
        // Iterate through the sorted original scores to find the first problem
        // that meets or exceeds the `finalMinimumEligibleScore`.
        let firstEligibleProblemIndex = 0;
        for (let idx = 0; idx < totalProblemCount; idx++) {
            if (problemScoresAscending[idx] >= finalMinimumEligibleScore) {
                firstEligibleProblemIndex = idx;
                break;
            }
        }
        // The count of eligible problems is total items minus the index of the first eligible one.
        countOfEligibleProblems = totalProblemCount - firstEligibleProblemIndex;
    } else {
        // This scenario should ideally not occur if the problem guarantees a solution.
        // If no eligible score is found, the count is 0.
        countOfEligibleProblems = 0;
    }

    // Output the final count.
    console.log(countOfEligibleProblems);
}

// Standard input reading for competitive programming environments.
// processRankingData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));