// This function processes an array of strings to determine a specific count.
function ProcessInput(inputData) {
  // Parse the first line of input into numerical values.
  const parsedInitialValues = inputData[0].split(' ').map(Number);
  const problemCount = parsedInitialValues[0];
  const maxScoreIncrease = parsedInitialValues[1];
  const initialVotes = parsedInitialValues[2];
  const targetPosition = parsedInitialValues[3];

  // Parse the second line of input, convert to numbers, and sort in ascending order.
  const scoreList = inputData[1].split(' ').map(Number).sort((valA, valB) => valA - valB);

  // The core logic aims to find the minimum score a problem needs to achieve
  // to be ranked within the top 'targetPosition' after distributing 'initialVotes'.

  let currentVotes = initialVotes; // Votes available for distribution.
  let currentScore, potentialMaxScore, iteratedScore, voteRemainder, innerIdx, fullyBoostedCount, minQualifyingScore = void 0;

  // Iterate through each problem to determine if it can be a candidate for the target position.
  for (let outerIdx = 0x0; outerIdx < scoreList.length; outerIdx++) {
    // Skip consecutive problems with identical scores, decrementing votes for each skipped one.
    while (scoreList[outerIdx] === scoreList[outerIdx + 1]) {
      outerIdx++;
      currentVotes--;
    }
    currentVotes--; // Decrement votes for the current problem being evaluated.

    // Store the score of the current problem.
    currentScore = scoreList[outerIdx];
    // Calculate the maximum score this problem could potentially reach.
    potentialMaxScore = currentScore + maxScoreIncrease;

    voteRemainder = 0x0;
    // Calculate the total votes needed to bring problems with scores between currentScore and potentialMaxScore
    // up to potentialMaxScore.
    for (innerIdx = outerIdx + 1; scoreList[innerIdx] < potentialMaxScore; innerIdx++) {
      voteRemainder += potentialMaxScore - scoreList[innerIdx];
    }
    fullyBoostedCount = Math.floor(voteRemainder / maxScoreIncrease);
    voteRemainder = voteRemainder % maxScoreIncrease;

    if (currentVotes <= fullyBoostedCount) {
      // If all available votes are consumed by problems that can reach 'potentialMaxScore',
      // then 'currentScore' is the minimum score required.
      minQualifyingScore = currentScore;
      break;
    }

    // Distribute remaining votes to problems with higher scores that haven't been fully boosted yet.
    let modifiedScores = scoreList.slice(-(currentVotes - fullyBoostedCount)).map((iteratedScore) => iteratedScore + maxScoreIncrease);

    // If there's a fractional vote remainder from the previous step, apply it.
    if (voteRemainder > 0x0) {
      for (innerIdx = 0x0; innerIdx < modifiedScores.length; innerIdx++) {
        iteratedScore = modifiedScores[innerIdx];
        // If applying the remainder would make the score less than 'potentialMaxScore',
        // set it to 'potentialMaxScore' and adjust the remainder.
        if (iteratedScore - voteRemainder < potentialMaxScore) {
          modifiedScores[innerIdx] = potentialMaxScore;
          voteRemainder -= iteratedScore - potentialMaxScore;
        } else {
          // Otherwise, apply the remainder to the current score and stop.
          modifiedScores[innerIdx] -= voteRemainder;
          voteRemainder = 0x0;
          break;
        }
      }

      // If any remainder is still left, apply it to the last modified score.
      if (voteRemainder > 0x0) {
        modifiedScores[modifiedScores.length - 1.0] -= voteRemainder;
      }
    }

    // Check if the current problem, with its 'potentialMaxScore', can achieve the 'targetPosition'.
    for (let rankCheckIdx = 0x0; rankCheckIdx < targetPosition; rankCheckIdx++) {
      let comparisonValue = (rankCheckIdx < modifiedScores.length)
        ? modifiedScores[modifiedScores.length - rankCheckIdx - 1.0] // Compare against boosted scores.
        : scoreList[scoreList.length - rankCheckIdx - 1.0]; // Compare against original scores if not enough boosted problems.

      if (potentialMaxScore >= comparisonValue) {
        minQualifyingScore = currentScore;
        break;
      }
    }
    if (minQualifyingScore) {
      break; // If a qualifying score is found, exit the main loop.
    }
  }

  // Adjust the 'outerIdx' back to the first occurrence of the minimum qualifying score.
  for (; outerIdx > 0x0; outerIdx--) {
    if (scoreList[outerIdx] !== scoreList[outerIdx - 1.0]) {
      break;
    }
  }

  let finalResult = scoreList.length - outerIdx;

  console.log(finalResult);
}

// Read input from standard input, process it, and then call the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
