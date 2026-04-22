/**
 * @param {string[]} rawData
 */
function ProcessInput (rawData)
{
  /** @type {number[]} */
  const parsedFirstLine = rawData[0] .split(' ') .map(Number);

  const problemCount = parsedFirstLine[0] ;
  const voteWeight = parsedFirstLine[1]   ;
  const totalVotes = parsedFirstLine[2]   ;
  const targetRank = parsedFirstLine[3]   ;

  /**
   * Problem scores, arranged in ascending order.
   * @type {number[]}
   */
  const problemScores = rawData[1] .split(' ') .map(Number) .sort((scoreA, scoreB) => scoreA - scoreB);

  /**
   * This section outlines the core logic to determine how many problems can secure a top P rank.
   *
   * 1.  Iterate through each problem, treating it as a potential candidate for a top P position.
   * 2.  For each candidate, calculate its maximum possible score if all 'voteWeight' votes are applied to it.
   * 3.  Distribute 'totalVotes' among other problems strategically to minimize their impact or maximize their scores
   *     to see if the candidate can maintain its position.
   * 4.  If the candidate's maximum score is sufficient to place it within the 'targetRank' (P) after vote distribution,
   *     then this candidate (and all problems with equal or higher scores) can achieve the desired rank.
   * 5.  The final result is the count of all such problems.
   */

  let availableVotes = totalVotes;
  let currentScore, maxPossibleScore, elemScore, residualVotes, subIdx, votesConsumed, qualifyingScore = null;
  let scoreDifference; // Kept to match original variable count, though unused there.
  let enhancedScores;
  let comparisonScore;
  let rankIdx;

  // Loop through each problem score to find the lowest score that can potentially be ranked within P.
  for (let mainIdx = 0; mainIdx < problemScores.length; mainIdx++) {
    // Skip over consecutive problems with identical scores, decrementing available votes for each.
    while (problemScores[mainIdx] === problemScores[mainIdx + 1]) {
      mainIdx++;
      availableVotes--;
    }
    availableVotes--; // Decrement for the current problem under consideration.

    currentScore = problemScores[mainIdx];
    maxPossibleScore = currentScore + voteWeight;

    residualVotes = 0;
    // Distribute votes to problems that are currently greater than the candidate but less than its potential maximum.
    subIdx = mainIdx + 1;
    for (subIdx = mainIdx + 1; problemScores[subIdx] < maxPossibleScore; subIdx++) { // Fixed original k2 typo to maxPossibleScore
      residualVotes += maxPossibleScore - problemScores[subIdx];
    }
    votesConsumed = Math.floor(residualVotes / voteWeight);
    residualVotes = residualVotes % voteWeight;

    // If all available votes have been used up by problems with lower scores, this candidate cannot be in top P.
    if (availableVotes <= votesConsumed) {
      break;
    }

    // Distribute any remaining votes among the problems with higher scores.
    // Select the highest-scoring problems that would receive votes.
    enhancedScores = problemScores.slice(-(availableVotes - votesConsumed)).map((elemScore) => elemScore + voteWeight);

    // If there are still residual votes, apply them to the enhanced scores.
    if (residualVotes > 0) {
      for (let innerIdx = 0; innerIdx < enhancedScores.length; innerIdx++) {
        elemScore = enhancedScores[innerIdx];
        // If applying residual votes would drop a score below maxPossibleScore, cap it at maxPossibleScore.
        if (elemScore - residualVotes < maxPossibleScore) {
          enhancedScores[innerIdx] = maxPossibleScore;
          residualVotes -= elemScore - maxPossibleScore;
        } else {
          // Otherwise, apply the votes and terminate this distribution.
          enhancedScores[innerIdx] -= residualVotes;
          residualVotes = 0;
          break;
        }
      }

      // If residual votes still persist, apply them to the very last enhanced score.
      if (residualVotes > 0) {
        enhancedScores[enhancedScores.length - 1] -= residualVotes;
      }
    }

    // Check if the current problem, with its maxPossibleScore, can achieve the target rank.
    for (rankIdx = 0; rankIdx < targetRank; rankIdx++) {
      // Determine the score to compare against: from the enhanced set or original scores, depending on array bounds.
      comparisonScore = (rankIdx < enhancedScores.length)
        ? enhancedScores[enhancedScores.length - rankIdx - 1]
        : problemScores[problemScores.length - rankIdx - 1];

      // If the candidate's potential max score is greater than or equal to the comparison score, it qualifies.
      if (maxPossibleScore >= comparisonScore) {
        qualifyingScore = currentScore;
        break;
      }
    }
    // If a qualifying score is found, exit the main loop.
    if (qualifyingScore) {
      break;
    }
  }

  // After identifying the qualifying score, backtrack the index to the first occurrence of that score.
  for (; mainIdx > 0; mainIdx--) {
    if (problemScores[mainIdx] !== problemScores[mainIdx - 1]) {
      break;
    }
  }

  // Calculate the total number of problems that can achieve the qualifying score or better.
  let resultCount = problemScores.length - mainIdx;

  console.log(resultCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));