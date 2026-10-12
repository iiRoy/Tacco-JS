'use strict';

function processInputData(rawData) {
    const ACCEPTED_STATUS = 'AC';
    const WRONG_ANSWER_STATUS = 'WA';

    const cleanedInput = rawData.trim();
    const inputLines = cleanedInput.split('\n');

    const firstLine = inputLines[0];
    const initialParameters = firstLine.split(' ').map(s => Number(s));

    const totalProblemCount = initialParameters[0]; // Corresponds to N
    const totalSubmissionCount = initialParameters[1]; // Corresponds to M

    const submissionEntryStrings = inputLines.slice(1);

    // Helper function to parse a single submission string into an object
    const extractSubmissionDetails = (submissionString) => {
        const parts = submissionString.split(' ');
        return {
            problemIdentifier: Number(parts[0]),
            submissionOutcome: parts[1]
        };
    };

    const processedSubmissions = submissionEntryStrings.map(extractSubmissionDetails);

    let successfullyAcceptedProblems = 0;
    let totalPenaltyTime = 0;
    let lastProcessedAcProblemId = 0; // Tracks the ID of the last problem that resulted in an AC and was counted

    // This object stores the count of Wrong Answers (WA) for each problem ID.
    // Key: problem ID, Value: accumulated count of WAs for that problem.
    let problemWrongAnswerCounts = {};

    for (const currentSubmission of processedSubmissions) {
        const problemId = currentSubmission.problemIdentifier;
        const submissionResult = currentSubmission.submissionOutcome;

        // Initialize the WA count for this problem if it's encountered for the first time
        if (problemWrongAnswerCounts[problemId] === undefined) {
            problemWrongAnswerCounts[problemId] = 0;
        }

        // Logic for Accepted (AC) submissions
        if (submissionResult === ACCEPTED_STATUS) {
            // The original logic counts an AC if its problem ID is different from the
            // problem ID of the *last* submission that was counted as an AC.
            // This means a problem can be counted multiple times if other problems
            // are accepted in between. This exact behavior is preserved.
            if (lastProcessedAcProblemId !== problemId) {
                successfullyAcceptedProblems++;
                totalPenaltyTime += problemWrongAnswerCounts[problemId];
                lastProcessedAcProblemId = problemId;
            }
        }
        // Logic for Wrong Answer (WA) submissions
        else if (submissionResult === WRONG_ANSWER_STATUS) {
            problemWrongAnswerCounts[problemId]++;
        }
    }

    console.log(`${successfullyAcceptedProblems} ${totalPenaltyTime}`);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
