"use strict";

function analyzeProblemSubmissions(submissionsList, acceptedStatusIdentifier) {
    let wasAccepted = false;
    let failedAttemptsCount = 0;
    for (const submissionOutcome of submissionsList) {
        if (submissionOutcome === acceptedStatusIdentifier) {
            wasAccepted = true;
            break;
        } else {
            failedAttemptsCount++;
        }
    }
    return { accepted: wasAccepted, wrongCount: failedAttemptsCount };
}

function processInput(rawData) {
  const NEWLINE_SEPARATOR = "\n";
  const FIELD_SEPARATOR = " ";
  const STATUS_SEPARATOR = ",";
  const ACCEPTED_STATUS_CODE = "AC";

  let inputLines = rawData.split(NEWLINE_SEPARATOR);

  const firstLineContent = inputLines.shift();
  const totalProblemEntries = parseInt(firstLineContent.split(FIELD_SEPARATOR)[1], 10);

  let problemSubmissionRecords = {};

  for(let entryIndex = 0; entryIndex < totalProblemEntries; entryIndex++){
    	const currentEntryLine = inputLines[entryIndex];
    	const [problemIdentifier, submissionResult] = currentEntryLine.split(FIELD_SEPARATOR);

    	if(problemSubmissionRecords[problemIdentifier] === undefined){
          problemSubmissionRecords[problemIdentifier] = submissionResult;
        } else {
          problemSubmissionRecords[problemIdentifier] += STATUS_SEPARATOR + submissionResult;
        }
  }

  let totalWrongAnswers = 0;
  let totalAcceptedSolutions = 0;

  const distinctProblemIdentifiers = Object.keys(problemSubmissionRecords);

  for(let problemIndex = 0; problemIndex < distinctProblemIdentifiers.length; problemIndex++){
      const currentProblemIdentifier = distinctProblemIdentifiers[problemIndex];
      const problemAttemptStatuses = problemSubmissionRecords[currentProblemIdentifier].split(STATUS_SEPARATOR);

      const analysisOutcome = analyzeProblemSubmissions(problemAttemptStatuses, ACCEPTED_STATUS_CODE);

      if(analysisOutcome.accepted) {
        totalAcceptedSolutions++;
      }
      totalWrongAnswers += analysisOutcome.wrongCount;
  }

  console.log(totalAcceptedSolutions + FIELD_SEPARATOR + totalWrongAnswers);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
