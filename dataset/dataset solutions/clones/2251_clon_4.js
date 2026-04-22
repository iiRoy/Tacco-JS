function processSubmissionLog(rawLogData) {
  const logEntries = rawLogData.trim().split(/\r?\n/);

  const initialParamsLine = logEntries[0] || '';
  const initialParams = initialParamsLine.split(' ').map(Number);
  const numProblems = initialParams[0];
  const numRecords = initialParams[1];

  const submissionRecords = logEntries.slice(1)
    .filter(line => line.length > 0)
    .map(entry => {
      const parts = entry.split(' ');
      return { identifier: Number(parts[0]), outcome: parts[1] };
    });

  const finalResults = submissionRecords.reduce((stateAcc, currentSubmission) => {
    let currentProblemAttempts = stateAcc.wrongAnswerTallies;
    let successfulCount = stateAcc.totalSuccessfulChallenges;
    let accumulatedPenalties = stateAcc.overallPenaltyScore;
    let previousSuccessfulChallengeId = stateAcc.lastSuccessfulId;

    if (!currentProblemAttempts[currentSubmission.identifier]) {
      currentProblemAttempts[currentSubmission.identifier] = 0;
    }

    if (currentSubmission.outcome === 'AC') {
      if (currentSubmission.identifier !== previousSuccessfulChallengeId) {
        successfulCount++;
        accumulatedPenalties += currentProblemAttempts[currentSubmission.identifier];
        previousSuccessfulChallengeId = currentSubmission.identifier;
      }
    } else if (currentSubmission.outcome === 'WA') {
      currentProblemAttempts[currentSubmission.identifier]++;
    }

    return {
      totalSuccessfulChallenges: successfulCount,
      overallPenaltyScore: accumulatedPenalties,
      wrongAnswerTallies: currentProblemAttempts,
      lastSuccessfulId: previousSuccessfulChallengeId,
    };
  }, {
    totalSuccessfulChallenges: 0,
    overallPenaltyScore: 0,
    wrongAnswerTallies: {},
    lastSuccessfulId: 0,
  });

  console.log(`${finalResults.totalSuccessfulChallenges} ${finalResults.overallPenaltyScore}`);
}

processSubmissionLog(require("node:fs").readFileSync("/dev/stdin", "utf8"));