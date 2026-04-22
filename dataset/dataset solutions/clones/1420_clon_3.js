const fileSystemModule = require('fs');

// Configuration constants for input and grading logic
const STANDARD_INPUT_PATH = '/dev/stdin';
const TEXT_FILE_ENCODING = 'utf8';
const LINE_BREAK_CHARACTER = '\n';
const END_OF_INPUT_SIGNAL = "-1 -1 -1";
const SCORE_COMPONENT_SEPARATOR = " ";

// Grade boundary definitions
const GRADE_A_MIN_COMBINED_SCORE = 80;
const GRADE_B_MIN_COMBINED_SCORE = 65;
const GRADE_C_MIN_COMBINED_SCORE_PRIMARY = 50;
const GRADE_D_MIN_COMBINED_SCORE = 30;
const GRADE_C_MIN_RESIT_SCORE = 50;
const DEFAULT_FAILURE_GRADE_LETTER = "F";

/**
 * Reads the entire content from the specified file path.
 * @param {string} filePath - The path to the input file.
 * @param {string} encoding - The character encoding for reading the file.
 * @returns {string} The raw content of the file.
 */
function acquireRawInput(filePath, encoding) {
    return fileSystemModule.readFileSync(filePath, encoding);
}

/**
 * Processes a queue of score records, calculates grades, and outputs them.
 * The processing stops upon encountering a predefined termination sequence.
 * @param {string[]} scoreRecordQueue - An array of strings, where each string represents a student's scores.
 */
function evaluateAndDisplayGrades(scoreRecordQueue) {
    let studentRecordCount = 0; // A counter for processed records

    // Begin an indefinite loop to process records until a break condition is met
    for (;;) {
        // Extract the next record string from the beginning of the queue
        const currentStudentRecordLine = scoreRecordQueue.shift();

        // Check for termination conditions: either the queue is exhausted (undefined)
        // or the specific termination signal is encountered.
        if (currentStudentRecordLine === undefined || currentStudentRecordLine === END_OF_INPUT_SIGNAL) {
            // console.log(`Processing complete. Total records processed: ${studentRecordCount}.`); // Optional debug
            break; // Exit the loop
        }

        studentRecordCount++; // Increment the counter for a valid record

        // Split the record string into individual score components
        const individualScoreStrings = currentStudentRecordLine.split(SCORE_COMPONENT_SEPARATOR);

        // Basic validation: ensure we have exactly three score components
        if (individualScoreStrings.length !== 3) {
            // console.warn(`Skipping invalid record format (expected 3 scores): "${currentStudentRecordLine}"`); // Optional warning
            continue; // Move to the next record if the format is incorrect
        }

        // Parse each score string into a numerical value
        const midtermExaminationScore = Number(individualScoreStrings[0]);
        const finalExaminationScore = Number(individualScoreStrings[1]);
        const resitExaminationScore = Number(individualScoreStrings[2]);

        // Initialize the student's grade with the default failing grade
        let studentCalculatedGrade = DEFAULT_FAILURE_GRADE_LETTER;

        // Special condition: if both primary exams are marked as absent (-1)
        const isStudentAbsentFromAllExams = (midtermExaminationScore === -1 && finalExaminationScore === -1);

        if (isStudentAbsentFromAllExams) {
            studentCalculatedGrade = DEFAULT_FAILURE_GRADE_LETTER;
        } else {
            // Calculate the sum of midterm and final examination scores
            const totalPrimaryExamScore = midtermExaminationScore + finalExaminationScore;

            // Apply the grading rubric based on the combined score and resit score
            if (totalPrimaryExamScore >= GRADE_A_MIN_COMBINED_SCORE) {
                studentCalculatedGrade = "A";
            } else if (totalPrimaryExamScore >= GRADE_B_MIN_COMBINED_SCORE) {
                studentCalculatedGrade = "B";
            } else if (totalPrimaryExamScore >= GRADE_C_MIN_COMBINED_SCORE_PRIMARY) {
                studentCalculatedGrade = "C";
            } else if (totalPrimaryExamScore >= GRADE_D_MIN_COMBINED_SCORE && resitExaminationScore >= GRADE_C_MIN_RESIT_SCORE) {
                // Specific rule: a lower combined score can still yield a 'C' if resit is high
                studentCalculatedGrade = "C";
            } else if (totalPrimaryExamScore >= GRADE_D_MIN_COMBINED_SCORE) {
                studentCalculatedGrade = "D";
            }
            // If none of the above conditions are met, the grade remains 'F' as initialized.
        }

        // Output the determined grade for the current student record
        console.log(studentCalculatedGrade);
    }
}

// --- Main execution flow ---

// Step 1: Read all content from the standard input
const rawInputContent = acquireRawInput(STANDARD_INPUT_PATH, TEXT_FILE_ENCODING);

// Step 2: Prepare the input by trimming any leading/trailing whitespace
// and then splitting it into an array of individual lines.
const processedInputLines = rawInputContent
                                .trim()
                                .split(LINE_BREAK_CHARACTER);

// Step 3: Initiate the grade evaluation process using the prepared lines
evaluateAndDisplayGrades(processedInputLines);