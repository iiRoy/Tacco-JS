/**
 * @param dataLines string[]
 */
function ProcessInput(dataLines) {
  // Parse the initial configuration numbers from the first line.
  const firstLineNumbers = dataLines[0].split(' ').map(Number);
  const numProblems = firstLineNumbers[0]; // Total number of problems
  const maxVotesPerProblem = firstLineNumbers[1]; // Max votes per problem
  const totalVotesAvailable = firstLineNumbers[2]; // Initial total votes
  const topRankThreshold = firstLineNumbers[3]; // P-th position threshold

  /**
   * All problem scores, parsed from the second line and sorted in ascending order.
   * @type number[]
   */
  const problemScores = dataLines[1].split(' ').map(Number).sort((val1, val2) => val1 - val2);

  /*
   * The core logic aims to find the minimum score a problem needs to achieve
   * to be among the top P problems, given M additional votes can be distributed.
   *
   * General approach:
   * 1. Start with the initial total votes.
   * 2. Iterate through each problem score (from lowest to highest).
   * 3. For each problem, assume it's the target problem we want to get into the top P.
   * 4. Distribute votes:
   *    a. Deduct votes for problems with the same score as the current target.
   *    b. Deduct one vote for the target problem itself.
   *    c. Distribute remaining votes to problems with scores higher than the target but less than (target_score + M).
   *    d. Distribute remaining votes to the highest-scoring problems.
   * 5. Check if the target problem, with its potential new score (original + M), can make it into the top P.
   * 6. The first problem found that satisfies this condition determines the minimum qualifying score.
   */

  let remainingVotes = totalVotesAvailable; // Votes left to distribute
  let currentProblemScore, maxPossibleScore, iteratedScore, remainderVotes, idx, votesForLowerScores, minQualifyingScore = null;

  // Iterate through the sorted problem scores to find the minimum qualifying score.
  for (let problemIndex = 0; problemIndex < problemScores.length; problemIndex++) {
    // Skip duplicate scores and decrement available votes for each skipped problem.
    while (problemScores[problemIndex] === problemScores[problemIndex + 1]) {
      problemIndex++;
      remainingVotes--;
    }
    remainingVotes--; // Deduct one vote for the current problem itself.

    // The current problem's original score.
    currentProblemScore = problemScores[problemIndex];
    // The maximum score this problem can achieve with M additional votes.
    maxPossibleScore = currentProblemScore + maxVotesPerProblem;

    remainderVotes = 0;
    // Calculate votes needed for problems with scores between currentProblemScore and maxPossibleScore.
    // NOTE: The original code uses 'k2' which is undefined. This will cause a ReferenceError.
    for (idx = problemIndex + 1; problemScores[idx] < k2; idx++) {
      remainderVotes += k2 - problemScores[idx];
    }
    votesForLowerScores = Math.floor(remainderVotes / maxVotesPerProblem);
    remainderVotes = remainderVotes % maxVotesPerProblem;

    if (remainingVotes <= votesForLowerScores) {
      // If all votes are used up by lower-scoring problems, the current problem's score is the max.
      minQualifyingScore = currentProblemScore;
      break;
    }

    // At this point, remainingVotes > votesForLowerScores.

    // Distribute remaining votes to the highest-scoring problems.
    // Slice the highest-scoring problems and add M to them.
    const adjustedScores = problemScores.slice(-(remainingVotes - votesForLowerScores)).map((iteratedScore) => iteratedScore + maxVotesPerProblem);

    // If there's a remainder from distributing votes to lower scores, apply it to adjustedScores.
    if (remainderVotes > 0) {
      for (idx = 0; idx < adjustedScores.length; idx++) {
        iteratedScore = adjustedScores[idx];
        // If subtracting remainderVotes makes it less than maxPossibleScore, cap it at maxPossibleScore.
        if (iteratedScore - remainderVotes < maxPossibleScore) {
          adjustedScores[idx] = maxPossibleScore;
          remainderVotes -= iteratedScore - maxPossibleScore;
        } else {
          // Otherwise, just subtract the remainder and we are done.
          adjustedScores[idx] -= remainderVotes;
          remainderVotes = 0;
          break;
        }
      }

      if (remainderVotes > 0) {
        // If remainder still exists, subtract from the last adjusted score.
        adjustedScores[adjustedScores.length - 1] -= remainderVotes;
      }
    }

    // Check if the current problem (with maxPossibleScore) can be in the top P.
    for (let rankIdx = 0; rankIdx < topRankThreshold; rankIdx++) {
      // NOTE: The original code uses 'veteds' which is undefined. This will cause a ReferenceError.
      let comparisonScore = (rankIdx < veteds.length)
        ? veteds[veteds.length - rankIdx - 1] // Compare with adjusted scores
        : problemScores[problemScores.length - rankIdx - 1]; // Compare with original scores

      if (maxPossibleScore >= comparisonScore) {
        minQualifyingScore = currentProblemScore;
        break;
      }
    }
    if (minQualifyingScore) {
      break; // Found the minimum qualifying score, exit main loop.
    }
  }

  // Adjust problemIndex back to the start of the block of identical scores.
  for (; problemIndex > 0; problemIndex--) {
    if (problemScores[problemIndex] !== problemScores[problemIndex - 1]) {
      break;
    }
  }

  // The final answer is the count of problems from this adjusted index to the end.
  const finalCount = problemScores.length - problemIndex;

  console.log(finalCount);
}

// Read input from standard input, process it, and call the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
