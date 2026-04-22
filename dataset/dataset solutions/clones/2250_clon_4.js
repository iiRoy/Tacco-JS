'use strict';
const processContestResults = (contestDataLines) => {
  const [totalChallenges, submissionQuantity] = contestDataLines[0]
    .split(' ')
    .map(Number);

  const submissionEntries = contestDataLines.slice(1, submissionQuantity + 1);

  const finalTally = submissionEntries.reduce((currentMetrics, submissionText) => {
    const [challengeIdentifier, outcomeType] = submissionText.split(' ');
    const zeroBasedChallengeId = Number(challengeIdentifier) - 1;

    const isChallengeAlreadyCompleted = currentMetrics.completedChallengesRegister.has(zeroBasedChallengeId);

    if (!isChallengeAlreadyCompleted) {
      if (outcomeType === 'WA') {
        currentMetrics.incorrectAttemptsBeforeCompletion++;
      } else if (outcomeType === 'AC') {
        currentMetrics.successfulCompletionsCounter++;
        currentMetrics.completedChallengesRegister.add(zeroBasedChallengeId);
      }
    }
    return currentMetrics;
  }, {
    completedChallengesRegister: new Set(),
    successfulCompletionsCounter: 0,
    incorrectAttemptsBeforeCompletion: 0
  });

  console.log(finalTally.successfulCompletionsCounter, finalTally.incorrectAttemptsBeforeCompletion);
};

processContestResults(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));