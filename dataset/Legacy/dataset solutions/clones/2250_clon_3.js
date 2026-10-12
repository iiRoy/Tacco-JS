'use strict';

const parseInteger = (inputString) => parseInt(inputString, 10);

const processContestData = (rawDataLines) => {
  const contestParameters = rawDataLines[0].split(' ').map(parseInteger);
  const totalProblems = contestParameters[0];
  const totalSubmissions = contestParameters[1];

  const problemAcceptanceStatus = Array(totalProblems).fill(0);
  
  let totalWrongAttempts = 0;
  let successfullyAcceptedProblems = 0;

  for (let currentSubmissionIdx = 0; currentSubmissionIdx < totalSubmissions; currentSubmissionIdx++) {
    const submissionDetailsLine = rawDataLines[currentSubmissionIdx + 1];
    const submissionParts = submissionDetailsLine.split(' ');
    
    const problemIdZeroIndexed = parseInteger(submissionParts[0]) - 1;
    const submissionOutcome = submissionParts[1];

    if (problemAcceptanceStatus[problemIdZeroIndexed] === 0) {
      if (submissionOutcome === 'WA') {
        totalWrongAttempts++;
      } else if (submissionOutcome === 'AC') {
        successfullyAcceptedProblems++;
        problemAcceptanceStatus[problemIdZeroIndexed] = 1;
      }
    }
  }

  console.log(successfullyAcceptedProblems, totalWrongAttempts);
};

processContestData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
