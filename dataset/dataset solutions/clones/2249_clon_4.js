"use strict";
const fileSystemAccess = require('fs');

const rawEntryData = fileSystemAccess.readFileSync(0).toString().split("\n").map(line => line.split(" "));

const totalProblems = Number(rawEntryData[0][0]);
const totalSubmissions = Number(rawEntryData[0][1]); // This variable is parsed but not utilized in the core logic

const submissionRecords = rawEntryData.slice(1);

// Group all submission records by their problem identifier
const problemActivityLog = new Map();

submissionRecords.forEach(submissionDatum => {
    const problemIdentifier = Number(submissionDatum[0]);
    const submissionState = submissionDatum[1];
    
    if (!problemActivityLog.has(problemIdentifier)) {
        problemActivityLog.set(problemIdentifier, []);
    }
    problemActivityLog.get(problemIdentifier).push({ identifier: problemIdentifier, state: submissionState });
});

// Calculate the final success count and total penalty points
const initialTally = { solvedCount: 0, totalMisdemeanors: 0 };

const finalOutcome = Array.from({ length: totalProblems }, (_, index) => index + 1) // Generate an array of problem IDs from 1 to totalProblems
    .reduce((accumulator, currentProblemIdentifier) => {
        const problemSubmissions = problemActivityLog.get(currentProblemIdentifier) || [];

        const firstSuccessfulAttemptIndex = problemSubmissions.findIndex(entry => entry.state === 'AC');

        if (firstSuccessfulAttemptIndex !== -1) {
            accumulator.solvedCount++;
            const errorsBeforeSuccess = problemSubmissions.slice(0, firstSuccessfulAttemptIndex)
                                                          .filter(entry => entry.state !== 'AC');
            accumulator.totalMisdemeanors += errorsBeforeSuccess.length;
        }
        return accumulator;
    }, initialTally);

console.log(finalOutcome.solvedCount + " " + finalOutcome.totalMisdemeanors);