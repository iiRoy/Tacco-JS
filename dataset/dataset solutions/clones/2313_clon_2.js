/**
 * @param {Array<string>} rawDataLines - Input lines as an array of strings for processing.
 */
function ProcessContestData(rawDataLines) {
  /* @type {Array<number>} */
  const firstLineNumbers = rawDataLines[0].split(' ').map(Number);

  const problemCount = firstLineNumbers[0];
  const maxVotesPerProblem = firstLineNumbers[1];
  const totalVotesAvailable = firstLineNumbers[2];
  const targetRank = firstLineNumbers[3];

  /**
   * Problem scores, initially parsed and then sorted in ascending order.
   * @type {Array<number>}
   */
  const problemScoresSorted = rawDataLines[1]
    .split(' ')
    .map(Number)
    .sort((scoreA, scoreB) => scoreA - scoreB);

  /*
   * Comprehensive strategy for determining the lowest qualifying score:
   * 1. Begin by arranging all problem scores in an increasing sequence.
   * 2. Systematically examine each problem's score as a potential threshold for qualification.
   * 3. When considering a specific problem, decrement the available votes for any other problems
   *    that share an identical score to prevent redundant vote counting.
   * 4. Further reduce the vote count by one, explicitly allocating a vote to the current problem.
   * 5. Compute the theoretical maximum score the current problem could achieve, given the
   *    `maxVotesPerProblem` constraint.
   * 6. Allocate any remaining votes to problems whose scores fall between the current problem's
   *    initial score and its calculated theoretical maximum. The goal is to elevate these
   *    intermediate scores up to the theoretical maximum.
   * 7. If the entire pool of `totalVotesAvailable` is expended during this distribution phase,
   *    the current problem's score is identified as a potential minimum passing score.
   * 8. Should votes still be available, they are then directed towards the problems with the
   *    highest existing scores, ensuring they too can potentially reach their maximum possible scores.
   * 9. Evaluate if the current problem, having achieved its potential maximum score, can secure
   *    a position within the top `targetRank` in the overall standings.
   * 10. The first problem score that successfully meets this ranking criterion is established
   *     as the definitive minimum score required for selection.
   */

  let remainingVotes = totalVotesAvailable;
  let currentProblemScore, targetProblemScoreUpperLimit, iteratedScore, voteDeficit, innerLoopIndex, fullyDistributedVotes;
  let foundMinPassingScore = null;

  // Initiate the search for the lowest score that allows a problem to be selected.
  for (let outerLoopIndex = 0; outerLoopIndex < problemScoresSorted.length; outerLoopIndex++) {
    // Advance the index and decrease available votes for problems with identical scores.
    while (problemScoresSorted[outerLoopIndex] === problemScoresSorted[outerLoopIndex + 1]) {
      outerLoopIndex++;
      remainingVotes--;
    }
    remainingVotes--; // Allocate one vote to the problem currently under evaluation.

    // Store the base score of the problem in focus.
    currentProblemScore = problemScoresSorted[outerLoopIndex];
    // Determine the highest attainable score for this problem.
    targetProblemScoreUpperLimit = currentProblemScore + maxVotesPerProblem;

    voteDeficit = 0;
    // Tally the votes needed to bring problems between the current and the target upper limit.
    for (innerLoopIndex = outerLoopIndex + 1; problemScoresSorted[innerLoopIndex] < targetProblemScoreUpperLimit; innerLoopIndex++) {
      voteDeficit += targetProblemScoreUpperLimit - problemScoresSorted[innerLoopIndex];
    }

    fullyDistributedVotes = Math.floor(voteDeficit / maxVotesPerProblem);
    voteDeficit = voteDeficit % maxVotesPerProblem;

    if (remainingVotes <= fullyDistributedVotes) {
      // If all votes are consumed at this stage, this problem is a guaranteed qualifier.
      foundMinPassingScore = currentProblemScore;
      break;
    }

    // At this juncture, remainingVotes exceeds fullyDistributedVotes.

    // Construct a new array of scores for problems considered "enhanced" by remaining votes.
    const enhancedScores = problemScoresSorted
      .slice(-(remainingVotes - fullyDistributedVotes))
      .map((singleScore) => singleScore + maxVotesPerProblem);

    // If there's an outstanding partial vote deficit, apply it to the enhanced scores.
    if (voteDeficit > 0) {
      for (innerLoopIndex = 0; innerLoopIndex < enhancedScores.length; innerLoopIndex++) {
        iteratedScore = enhancedScores[innerLoopIndex];
        // If applying the deficit would drop a score below the target upper limit,
        // cap it at the target upper limit and adjust the deficit.
        if (iteratedScore - voteDeficit < targetProblemScoreUpperLimit) {
          enhancedScores[innerLoopIndex] = targetProblemScoreUpperLimit;
          voteDeficit -= iteratedScore - targetProblemScoreUpperLimit;
        } else {
          // Otherwise, directly subtract the deficit from the score and finalize.
          enhancedScores[innerLoopIndex] -= voteDeficit;
          voteDeficit = 0;
          break;
        }
      }

      if (voteDeficit > 0) {
        // If any deficit persists, apply it to the very last enhanced score.
        enhancedScores[enhancedScores.length - 1] -= voteDeficit;
      }
    }

    let rankCheckIndex;
    for (rankCheckIndex = 0; rankCheckIndex < targetRank; rankCheckIndex++) {
      let comparisonScore;
      // Determine the score to compare against, prioritizing enhanced scores.
      if (rankCheckIndex < enhancedScores.length) {
        comparisonScore = enhancedScores[enhancedScores.length - rankCheckIndex - 1];
      } else {
        comparisonScore = problemScoresSorted[problemScoresSorted.length - rankCheckIndex - 1];
      }

      if (targetProblemScoreUpperLimit >= comparisonScore) {
        foundMinPassingScore = currentProblemScore;
        break;
      }
    }
    if (foundMinPassingScore) {
      break;
    }
  }

  // Rewind the outer loop index to identify the first instance of the minimum score.
  for (; outerLoopIndex > 0; outerLoopIndex--) {
    if (problemScoresSorted[outerLoopIndex] !== problemScoresSorted[outerLoopIndex - 1]) {
      break;
    }
  }

  const finalResultCount = problemScoresSorted.length - outerLoopIndex;

  console.log(finalResultCount);
}

ProcessContestData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));