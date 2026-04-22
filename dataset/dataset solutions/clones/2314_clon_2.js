/**
 * @param lineData string[] - Array of input lines provided for processing.
 */
function ProcessInput(lineData) {
  /*
   * Numeric values extracted from the initial line of input.
   * @type number[]
   */
  const firstLineNumbers = lineData[0].split(' ').map(Number);
  const problemCount = firstLineNumbers[0];
  const maxVotesPerProblem = firstLineNumbers[1];
  const totalVotes = firstLineNumbers[2];
  const rankThreshold = firstLineNumbers[3];

  /*
   * Scores of all problems, parsed from the second input line and arranged in ascending order.
   * @type number[]
   */
  const sortedScores = lineData[1].split(' ').map(Number).sort((scoreA, scoreB) => scoreA - scoreB);

  /*
   *   Algorithm outline for determining the number of problems that can achieve a certain rank:
   *   1. The problem scores are initially sorted in ascending order.
   *   2. Iterate through each problem score, treating it as a potential candidate for the P-th rank.
   *   3. For each candidate score (let's call it 'currentProblemScore'), account for it and any identical scores,
   *      reducing the available votes accordingly.
   *   4. Calculate the maximum potential score the 'currentProblemScore' can reach (currentProblemScore + maxVotesPerProblem).
   *   5. Distribute votes to other problems: first, raise problems whose scores are between 'currentProblemScore'
   *      and its maximum potential score up to that maximum.
   *   6. If votes remain, distribute them to problems with higher scores, effectively lowering their final adjusted scores.
   *   7. Check if, after these adjustments, the 'currentProblemScore' (at its maximum potential)
   *      can satisfy the P-th rank criteria by comparing it against the P highest adjusted scores.
   *   8. The first 'currentProblemScore' found that satisfies the criteria is the answer.
   */

  let remainingVotes = totalVotes;
  let currentProblemScore;
  let targetProblemScoreCap;
  let otherProblemScore;
  let scoreDifferenceSum;
  let innerLoopIndex;
  let fullyVotedProblemsCount;
  let highestPossibleScore = null;
  let outerLoopIndex;
  let rankCheckIndex;
  let comparisonScore;
  let adjustedScores;
  let finalResult;

  // Iterate through each problem to find the minimum score that can potentially achieve the desired rank
  for (outerLoopIndex = 0; outerLoopIndex < sortedScores.length; outerLoopIndex++) {
    // Skip problems that have the same score as the current one, decrementing votes for each
    while (sortedScores[outerLoopIndex] === sortedScores[outerLoopIndex + 1]) {
      outerLoopIndex++;
      remainingVotes--;
    }
    remainingVotes--; // Dedicate one vote to the current candidate problem

    // Store the score of the current problem being evaluated
    currentProblemScore = sortedScores[outerLoopIndex];
    // Calculate the maximum possible score this problem could achieve with additional votes
    targetProblemScoreCap = currentProblemScore + maxVotesPerProblem;

    scoreDifferenceSum = 0;
    // Sum the score differences for problems whose scores are between currentProblemScore and targetProblemScoreCap
    for (innerLoopIndex = outerLoopIndex + 1; sortedScores[innerLoopIndex] < targetProblemScoreCap; innerLoopIndex++) {
      scoreDifferenceSum += targetProblemScoreCap - sortedScores[innerLoopIndex];
    }
    fullyVotedProblemsCount = Math.floor(scoreDifferenceSum / maxVotesPerProblem);
    scoreDifferenceSum = scoreDifferenceSum % maxVotesPerProblem;

    if (remainingVotes <= fullyVotedProblemsCount) {
      // If all available votes have been accounted for, the current problem's score is the maximum possible solution.
      highestPossibleScore = currentProblemScore;
      break; // Exit the main loop as the answer is found
    }

    // At this point, it's known that remainingVotes < sortedScores.length - (outerLoopIndex + 1)

    // Apply the remaining votes to problems with higher scores, starting from the largest,
    // which effectively lowers their standing relative to the current problem.
    adjustedScores = sortedScores.slice(-(remainingVotes - fullyVotedProblemsCount)).map((otherScore) => otherScore + maxVotesPerProblem);

    // If there's a partial vote amount remaining from the previous score difference calculation, apply it
    if (scoreDifferenceSum > 0) {
      for (innerLoopIndex = 0; innerLoopIndex < adjustedScores.length; innerLoopIndex++) {
        otherProblemScore = adjustedScores[innerLoopIndex];
        // If subtracting the remaining partial vote would make the score less than targetProblemScoreCap,
        // set it to targetProblemScoreCap and reduce the partial vote amount.
        if (otherProblemScore - scoreDifferenceSum < targetProblemScoreCap) {
          adjustedScores[innerLoopIndex] = targetProblemScoreCap;
          scoreDifferenceSum -= (otherProblemScore - targetProblemScoreCap);
        } else {
          // Otherwise, subtract the full partial vote amount from the current problem's score.
          adjustedScores[innerLoopIndex] -= scoreDifferenceSum;
          scoreDifferenceSum = 0;
          break; // All partial votes have been distributed
        }
      }

      if (scoreDifferenceSum > 0) {
        // If any partial vote amount still remains, apply it to the last problem in the adjusted list.
        adjustedScores[adjustedScores.length - 1] -= scoreDifferenceSum;
      }
    }

    // Check if the current problem, with its maximum potential score, can achieve the P-th rank.
    for (rankCheckIndex = 0; rankCheckIndex < rankThreshold; rankCheckIndex++) {
      comparisonScore = (rankCheckIndex < adjustedScores.length)
        ? adjustedScores[adjustedScores.length - rankCheckIndex - 1] // Compare with adjusted scores if available.
        : sortedScores[sortedScores.length - rankCheckIndex - 1]; // Otherwise, compare with original sorted scores.

      if (targetProblemScoreCap >= comparisonScore) {
        highestPossibleScore = currentProblemScore;
        break; // Found a suitable candidate, exit the rank check loop.
      }
    }
    if (highestPossibleScore) {
      break; // If a potential answer is found, exit the main iteration loop.
    }
  }

  // Adjust the outerLoopIndex back to the first occurrence of the highestPossibleScore.
  for (; outerLoopIndex > 0; outerLoopIndex--) {
    if (sortedScores[outerLoopIndex] !== sortedScores[outerLoopIndex - 1]) {
      break; // Stop when a score different from the highestPossibleScore is encountered.
    }
  }

  // The final result is the count of problems from this adjusted index to the end of the array.
  finalResult = sortedScores.length - outerLoopIndex;

  console.log(finalResult);
}

// Invoke the main processing function, reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));