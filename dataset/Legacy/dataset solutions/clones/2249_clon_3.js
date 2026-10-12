"use strict";
const fileSystemModule = require('fs');

const ACCEPTED_STATUS_CODE = 'AC';

function parseSubmissionLine(lineContent) {
    const parts = lineContent.split(" ");
    return {
        problemIdentifier: parseInt(parts[0], 10),
        submissionStatus: parts[1]
    };
}

const rawInputContent = fileSystemModule.readFileSync(0).toString();
const allInputLines = rawInputContent.split("\n");

const configLineParts = allInputLines[0].split(" ");
const numberOfProblems = parseInt(configLineParts[0], 10);
const numberOfSubmissions = parseInt(configLineParts[1], 10);

const processedSubmissions = allInputLines.slice(1).map(parseSubmissionLine);

let overallCorrectCount = 0;
let overallPenaltyCount = 0;

function evaluateProblemOutcome(currentProblemId, allRecords) {
    let problemSolved = false;
    let problemPenalties = 0;

    const firstAcceptedSubmissionIndex = allRecords.findIndex(
        (recordEntry) => recordEntry.problemIdentifier === currentProblemId && recordEntry.submissionStatus === ACCEPTED_STATUS_CODE
    );

    if (firstAcceptedSubmissionIndex === -1) {
        return { isSolved: false, penaltiesForProblem: 0 };
    }

    problemSolved = true;

    const incorrectAttemptsBeforeAC = allRecords.filter(
        (recordEntry, recordIdx) =>
            recordEntry.problemIdentifier === currentProblemId &&
            recordIdx < firstAcceptedSubmissionIndex
    );

    problemPenalties = incorrectAttemptsBeforeAC.length;

    return { isSolved: problemSolved, penaltiesForProblem: problemPenalties };
}

for (let pId = 1; pId <= numberOfProblems; pId++) {
    const problemResult = evaluateProblemOutcome(pId, processedSubmissions);

    if (problemResult.isSolved) {
        overallCorrectCount++;
        overallPenaltyCount += problemResult.penaltiesForProblem;
    }
}

console.log(overallCorrectCount + " " + overallPenaltyCount);
