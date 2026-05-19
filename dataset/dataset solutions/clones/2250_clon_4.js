'use strict';

const processSubmissionRecords = (submissionEntries) => {
  const tally = {
    acceptedCount: 0,
    wrongAttemptCount: 0,
    completedProblems: new Set()
  };

  return submissionEntries.reduce((currentTally, entryLine) => {
    const [problemIdentifier, outcomeStatus] = entryLine.split(' ');
    const problemIndex = Number(problemIdentifier) - 1;

    if (!currentTally.completedProblems.has(problemIndex)) {
      if (outcomeStatus === 'WA') {
        currentTally.wrongAttemptCount++;
      } else if (outcomeStatus === 'AC') {
        currentTally.acceptedCount++;
        currentTally.completedProblems.add(problemIndex);
      }
    }
    return currentTally;
  }, tally);
};

const applicationEntry = (rawDataContent) => {
  const allLines = rawDataContent.split('\n');
  const [totalProblems, totalSubmissions] = allLines[0].split(' ').map(Number);
  const submissionDataLines = allLines.slice(1, totalSubmissions + 1);

  const finalSummary = processSubmissionRecords(submissionDataLines);

  console.log(finalSummary.acceptedCount, finalSummary.wrongAttemptCount);
};

applicationEntry(require("fs").readFileSync("/dev/stdin", "utf8"));
