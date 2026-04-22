const fileSystemModule = require('fs'); // Import the core file system module for input operations.

// Read the entire content from standard input, treating it as UTF-8 encoded text.
const rawInputStreamData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Split the monolithic input data into individual lines (records).
// Filter out any empty strings that might result from trailing newlines or multiple consecutive newlines,
// ensuring only meaningful data lines are processed.
let studentAssessmentRecords = rawInputStreamData.split('\n').filter(record => record.trim().length > 0);

/**
 * Determines the final letter grade for a student based on their exam scores.
 *
 * @param {number} primaryExamScore - The score from the midterm examination.
 * @param {number} secondaryExamScore - The score from the final examination.
 * @param {number} supplementaryExamScore - The score from the retake examination.
 * @returns {string} The calculated letter grade ('A', 'B', 'C', 'D', 'F'),
 *                   or a special 'STOP_PROCESSING' signal if the termination condition is met.
 */
function calculateFinalGrade(primaryExamScore, secondaryExamScore, supplementaryExamScore) {
    // Check for the global termination signal: all three scores are -1.
    if (primaryExamScore === -1 && secondaryExamScore === -1 && supplementaryExamScore === -1) {
        return 'STOP_PROCESSING'; // Signal to halt further input processing.
    }

    // If either the primary or secondary exam was missed (-1), the student automatically fails.
    if (primaryExamScore === -1 || secondaryExamScore === -1) {
        return 'F';
    }

    // Compute the combined score from the primary and secondary examinations.
    const cumulativeTestScore = primaryExamScore + secondaryExamScore;

    // Evaluate the grade based on the cumulative score and retake performance.
    if (cumulativeTestScore >= 80) {
        return 'A'; // Excellent performance.
    } else if (cumulativeTestScore >= 65) {
        return 'B'; // Good performance.
    } else if (cumulativeTestScore >= 50) {
        return 'C'; // Satisfactory performance.
    } else if (cumulativeTestScore >= 30) {
        // For scores between 30 and 49 (inclusive), the retake score is crucial.
        if (supplementaryExamScore >= 50) {
            return 'C'; // Retake improved the grade to satisfactory.
        } else {
            return 'D'; // Marginal pass without sufficient retake improvement.
        }
    } else {
        return 'F'; // Failing score, below the minimum threshold for a pass.
    }
}

// Loop through each student record retrieved from the input until no more records are available
// or a specific termination condition is encountered.
while (studentAssessmentRecords.length > 0) {
    // Extract the next line of score data and remove it from the list.
    const currentScoreLine = studentAssessmentRecords.shift();

    // Parse the space-separated string components into an array of numbers.
    // Use a regex for split to handle multiple spaces robustly.
    const numericalScores = currentScoreLine.split(/\s+/).map(Number);

    // Basic validation: ensure we have exactly three score values.
    // If not, it's malformed input for this problem; skip to the next record.
    if (numericalScores.length !== 3) {
        // Optionally, one could log an error here for debugging purposes.
        continue;
    }

    // Assign parsed numerical scores to descriptive variables.
    const scoreM = numericalScores[0]; // Represents the midterm score.
    const scoreF = numericalScores[1]; // Represents the final score.
    const scoreR = numericalScores[2]; // Represents the retake score.

    // Call the helper function to get the grade or termination signal.
    const computedOutcome = calculateFinalGrade(scoreM, scoreF, scoreR);

    // If the helper function signaled termination, break out of the processing loop.
    if (computedOutcome === 'STOP_PROCESSING') {
        break;
    }

    // Output the determined grade to standard output.
    console.log(computedOutcome);
}