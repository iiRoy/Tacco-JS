"use strict";

const fileSystemMod = require('fs');

let rawData = fileSystemMod
              .readDataSync(0)
              .toString()
              .split("\n")
              .map((lineStr) => lineStr.split(" "));

const numProblems = parseInt(rawData[0][0]);
const maxSubmissions = parseInt(rawData[0][1]);

let successfulSubmissions = 0;
let penaltyPoints = 0;

let submissionRecords = rawData.slice(1);

for (let problemIdx = 1; problemIdx <= numProblems; problemIdx++) {
    let firstAcceptedIndex = submissionRecords.findIndex(
        (submissionEntry) => submissionEntry[0] == problemIdx && submissionEntry[1] === 'AC'
    );

    if (firstAcceptedIndex === -1) {
        continue;
    }

    const incorrectAttempts = submissionRecords.filter(
        (currentAttempt, attemptIndex) => (currentAttempt[0] == problemIdx) && attemptIndex < firstAcceptedIndex
    );

    penaltyPoints += incorrectAttempts.length;
    successfulSubmissions++;
}

console.log(successfulSubmissions + " " + penaltyPoints);