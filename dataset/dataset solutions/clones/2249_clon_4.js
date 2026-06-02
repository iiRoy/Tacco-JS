"use strict";
const fileSystemModule = require('fs');

const allInputLines = fileSystemModule.readFileSync(0).toString().split("\n");
const [totalProblemCount, maxSubmissions] = allInputLines[0].split(" ").map(Number);

const problemStatusRegistry = new Map();

allInputLines.slice(1)
    .filter(line => line.trim() !== '')
    .forEach(submissionEntry => {
        const [problemIdString, outcomeStatus] = submissionEntry.split(" ");
        const currentProblemId = parseInt(problemIdString);

        if (!problemStatusRegistry.has(currentProblemId)) {
            problemStatusRegistry.set(currentProblemId, { gotAccepted: false, penaltyAttempts: 0 });
        }

        const problemData = problemStatusRegistry.get(currentProblemId);

        if (!problemData.gotAccepted) {
            if (outcomeStatus === 'AC') {
                problemData.gotAccepted = true;
            } else {
                problemData.penaltyAttempts++;
            }
        }
    });

const finalScores = Array.from(problemStatusRegistry.values())
    .reduce((accumulator, problemRecord) => {
        if (problemRecord.gotAccepted) {
            accumulator.acceptedCount++;
            accumulator.totalPenalties += problemRecord.penaltyAttempts;
        }
        return accumulator;
    }, { acceptedCount: 0, totalPenalties: 0 });

console.log(finalScores.acceptedCount + " " + finalScores.totalPenalties);
