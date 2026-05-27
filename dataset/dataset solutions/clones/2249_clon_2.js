"use strict"; // Enforce strict mode for cleaner code and better error handling

// Import the Node.js file system module to interact with the file system,
// specifically for reading standard input.
const fileSystemUtility = require('fs');

// Read all data from standard input (file descriptor 0),
// convert the buffer to a string, split it into an array of lines by newline characters,
// and then for each line, split it into an array of tokens by space characters.
// This results in an array of arrays, where each inner array represents the parsed tokens of a line.
let submissionRecords = fileSystemUtility.readFileSync(0).toString().split("\n").map((lineContent) => lineContent.split(" "));

// Parse the total number of problems (N) and total number of submissions (M)
// from the first line of the input data.
// N is the first element of the first line, M is the second.
const totalProblemCount = parseInt(submissionRecords[0][0]);
const totalSubmissionCount = parseInt(submissionRecords[0][1]); // This variable is read but not used further in the logic.

// Initialize counters for the number of problems successfully solved
// and the total penalty points accumulated.
let problemsSolved = 0;
let accumulatedPenalties = 0;

// Remove the first line from the submission records, as it contained N and M
// and is no longer needed for processing individual submissions.
submissionRecords = submissionRecords.slice(1);

// Iterate through each problem, identified by its 1-indexed ID, from 1 up to N.
for (let currentProblemIdentifier = 1; currentProblemIdentifier <= totalProblemCount; currentProblemIdentifier++) {

    // Find the index of the very first 'Accepted' (AC) submission for the current problem.
    // Each 'record' is an array like ['problemId', 'status'].
    let firstAcceptedAttemptIndex = submissionRecords.findIndex((record) => {
        // Compare the problem ID (converted to integer) and the submission status.
        return parseInt(record[0]) === currentProblemIdentifier && record[1] === 'AC';
    });

    // If no 'AC' submission was found for the current problem,
    // it means this problem was not solved. Skip to the next problem.
    if (firstAcceptedAttemptIndex === -1) {
        continue;
    }

    // If an 'AC' submission was found, this problem is considered solved.
    // Now, calculate the penalty points for this solved problem.
    // Penalties are incurred for all submissions for this problem that occurred
    // *before* the first 'AC' submission.
    const priorFailedSubmissions = submissionRecords.filter((submissionItem, submissionPosition) => {
        // Filter for submissions belonging to the current problem and occurring before the first 'AC'.
        return parseInt(submissionItem[0]) === currentProblemIdentifier && submissionPosition < firstAcceptedAttemptIndex;
    });

    // Add the number of prior failed submissions for this problem to the total penalty count.
    accumulatedPenalties += priorFailedSubmissions.length;

    // Increment the count of successfully solved problems.
    problemsSolved++;
}

// Output the final results: the total number of problems solved
// and the total accumulated penalty points, separated by a space.
console.log(problemsSolved + " " + accumulatedPenalties);
