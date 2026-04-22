// This JavaScript script is designed to process student examination scores from standard input.
// It reads lines of space-separated numerical scores (midterm, final, retake) and
// calculates a final letter grade for each student based on a specific grading policy.
// The processing terminates upon encountering a specific sentinel line: "-1 -1 -1".

/**
 * Determines the final letter grade for a student based on their performance across
 * midterm, final, and potentially a retake examination.
 *
 * @param {number} midtermExaminationScore - The score obtained in the midterm exam.
 * @param {number} finalExaminationScore - The score obtained in the final exam.
 * @param {number} retakeExaminationScore - The score obtained in the retake exam, if applicable.
 * @returns {string} The calculated letter grade ("A", "B", "C", "D", "F").
 */
const determineStudentFinalGrade = (midtermExaminationScore, finalExaminationScore, retakeExaminationScore) => {
    // If a student's midterm or final score is explicitly -1, it signifies an automatic failure.
    // This could represent absence, disqualification, or an incomplete status.
    if (midtermExaminationScore === -1 || finalExaminationScore === -1) {
        return "F";
    }

    // Calculate the combined score from the midterm and final examinations.
    const overallCombinedScore = midtermExaminationScore + finalExaminationScore;

    // Apply the grading criteria sequentially, from highest to lowest possible grade.
    // Each condition checks if the student's combined score meets the threshold for a specific grade.
    if (overallCombinedScore >= 80) {
        return "A"; // Excellent performance.
    } else if (overallCombinedScore >= 65) {
        return "B"; // Good performance.
    } else if (overallCombinedScore >= 50) {
        return "C"; // Satisfactory performance.
    } else if (overallCombinedScore >= 30) {
        // For combined scores between 30 and 49, the retake score becomes a deciding factor.
        // A retake score of 50 or more can elevate the grade to a 'C'.
        if (retakeExaminationScore >= 50) {
            return "C"; // Improved to satisfactory with retake.
        } else {
            return "D"; // Passing, but barely, even with retake consideration.
        }
    } else {
        // If none of the above conditions are met, the combined score is less than 30,
        // resulting in an automatic failure.
        return "F";
    }
};

// A control flag to signal when the input processing loop should terminate.
let shouldTerminateInputProcessing = false;
// An optional counter to keep track of how many valid data lines have been processed.
let numberOfProcessedRecords = 0;

// Attach an event listener to the standard input stream to handle incoming data chunks.
process.stdin.on("data", (incomingDataBuffer) => {
    // Convert the incoming Buffer data to a string, remove leading/trailing whitespace,
    // and then split it into an array of individual lines based on newline characters.
    const rawInputLinesArray = String(incomingDataBuffer).trim().split("\n");

    // Iterate through each line extracted from the input chunk.
    for (const singleInputLine of rawInputLinesArray) {
        // If the termination flag has been set by a previous line, exit the loop immediately.
        if (shouldTerminateInputProcessing) {
            break;
        }

        // Skip any completely empty lines that might occur, for example, due to multiple newlines.
        if (singleInputLine.trim() === "") {
            continue;
        }

        // Increment the record counter for each non-empty line successfully considered for processing.
        numberOfProcessedRecords++;

        // Split the current line by spaces to get individual score components as strings.
        const scoreStringComponents = singleInputLine.split(" ");

        // Basic input validation: ensure that we have at least three components (midterm, final, retake).
        if (scoreStringComponents.length < 3) {
            // Log a warning or error for malformed lines and skip to the next.
            // console.warn(`Warning: Malformed input line (expected 3 scores): "${singleInputLine}"`);
            continue;
        }

        // Parse the string components into integer numbers. Use radix 10 for explicit decimal parsing.
        const parsedMidtermScore = parseInt(scoreStringComponents[0], 10);
        const parsedFinalScore = parseInt(scoreStringComponents[1], 10);
        const parsedRetakeScore = parseInt(scoreStringComponents[2], 10);

        // Further validation: check if parsing resulted in actual numbers.
        // If any score is not a valid number (NaN), skip this line.
        if (isNaN(parsedMidtermScore) || isNaN(parsedFinalScore) || isNaN(parsedRetakeScore)) {
            // console.warn(`Warning: Invalid numerical scores detected in line: "${singleInputLine}"`);
            continue;
        }

        // Check for the specific termination sequence: "-1 -1 -1".
        // This acts as a signal to cease further processing of input data.
        const isTerminationSequencePresent = (
            parsedMidtermScore === -1 &&
            parsedFinalScore === -1 &&
            parsedRetakeScore === -1
        );

        if (isTerminationSequencePresent) {
            shouldTerminateInputProcessing = true; // Set the flag to stop future iterations.
            break; // Exit the current loop over `rawInputLinesArray`.
        }

        // If no termination sequence was found, proceed to calculate and output the grade.
        const calculatedFinalGrade = determineStudentFinalGrade(
            parsedMidtermScore,
            parsedFinalScore,
            parsedRetakeScore
        );
        console.log(calculatedFinalGrade);
    }
});

// The `.resume()` call ensures that the standard input stream is set to flowing mode,
// allowing it to emit 'data' events when input is available. Without this, the stream
// might remain paused and not deliver any data.
process.stdin.resume();