// This script processes student score data from standard input to assign letter grades based on specific criteria.

// Import the file system module. Using 'const' for modules is a best practice.
const fileSystemModule = require('fs');

// Define a constant for the special line that signals the end of input data.
const END_OF_DATA_MARKER = '-1 -1 -1';

// An array to accumulate the final letter grades for all processed students.
const collectedFinalGrades = [];

/**
 * Utility function to safely parse a string of space-separated values into an array of integers.
 * @param {string} inputRowString - The string containing space-separated numeric values.
 * @returns {number[]} An array of parsed integer scores.
 *                     Returns an empty array or handles errors if parsing fails.
 */
function parseScoreStringIntoNumbers(inputRowString) {
    // Split the string by spaces and then convert each part to an integer using parseInt.
    // Using parseInt with radix 10 explicitly to avoid unexpected behavior with leading zeros.
    return inputRowString.split(' ').map(scorePart => parseInt(scorePart, 10));
}

/**
 * Calculates and returns the letter grade for a student based on their midterm, final, and retake scores.
 * The grading logic adheres to a specific set of rules.
 * @param {number} studentMidtermScore - The score obtained in the midterm exam.
 * @param {number} studentFinalScore - The score obtained in the final exam.
 * @param {number} studentRetakeScore - The score obtained in the retake exam (if applicable).
 * @returns {string} The computed letter grade ('A', 'B', 'C', 'D', 'F').
 */
function calculateStudentLetterEvaluation(studentMidtermScore, studentFinalScore, studentRetakeScore) {
    let assignedLetterGrade; // This variable will hold the determined grade.

    // Rule 1: If either midterm or final score is -1, the student automatically receives an 'F'.
    if (studentMidtermScore === -1 || studentFinalScore === -1) {
        assignedLetterGrade = 'F';
    } else {
        // Calculate the combined score from midterm and final exams.
        const aggregateExamScore = studentMidtermScore + studentFinalScore;

        // Apply grading rules based on the aggregate score.
        if (aggregateExamScore >= 80) {
            assignedLetterGrade = 'A';
        } else if (aggregateExamScore >= 65) {
            assignedLetterGrade = 'B';
        } else if (aggregateExamScore >= 50) {
            assignedLetterGrade = 'C';
        } else if (aggregateExamScore >= 30) {
            // Rule for scores between 30 and 49 (inclusive): retake score is considered.
            if (studentRetakeScore >= 50) {
                assignedLetterGrade = 'C'; // Retake score is sufficient to achieve a 'C'.
            } else {
                assignedLetterGrade = 'D'; // Retake score is not sufficient, resulting in a 'D'.
            }
        } else {
            // Rule: Any aggregate score below 30 results in an 'F'.
            assignedLetterGrade = 'F';
        }
    }
    return assignedLetterGrade;
}

// Attempt to read all content from standard input.
// A try-catch block is used to gracefully handle potential file reading errors.
let rawDataFromStdin = '';
try {
    rawDataFromStdin = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (ioError) {
    // Log the error and exit the process if input cannot be read.
    console.error("Failed to read input from /dev/stdin:", ioError.message);
    process.exit(1); // Indicate an error occurred.
}

// Pre-process the raw input:
// 1. Trim any leading/trailing whitespace from the entire content.
// 2. Split the content into an array of individual lines, handling various newline characters.
const individualDataLines = rawDataFromStdin.trim().split(/\n/g);

// Iterate through each line of the processed input data.
// Using a for...of loop for cleaner iteration over array elements.
for (const currentInputLine of individualDataLines) {
    // Check if the current line is the termination marker.
    if (currentInputLine === END_OF_DATA_MARKER) {
        // If the marker is found, stop processing further lines.
        break;
    }

    // Parse the current line to extract the three score values.
    const numericScoresArray = parseScoreStringIntoNumbers(currentInputLine);

    // Validate the number of scores extracted from the line.
    // Expecting exactly three scores: midterm, final, retake.
    if (numericScoresArray.length !== 3) {
        // If the line is malformed, log a warning and skip to the next line.
        // console.warn(`Skipping malformed data line: "${currentInputLine}". Expected 3 scores, got ${numericScoresArray.length}.`);
        continue;
    }

    // Use array destructuring to assign the parsed scores to descriptive variables.
    const [midtermExamValue, finalExamValue, retakeExamValue] = numericScoresArray;

    // Determine the letter grade for the current student using the dedicated function.
    const studentOverallGrade = calculateStudentLetterEvaluation(midtermExamValue, finalExamValue, retakeExamValue);

    // Add the calculated grade to our collection.
    collectedFinalGrades.push(studentOverallGrade);
}

// After processing all valid lines, output all collected grades.
// Each grade will be printed on a new line, matching the original output format.
console.log(collectedFinalGrades.join('\n'));