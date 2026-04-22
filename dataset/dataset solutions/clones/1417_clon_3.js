const fileSystemModule = require('fs');

// Define a constant for the standard input path, ensuring readability and maintainability.
const standardInputPath = '/dev/stdin';

// Read all raw input data from the specified path.
// The data is converted to a string using UTF-8 encoding for proper character handling.
const completeInputBuffer = fileSystemModule.readFileSync(standardInputPath).toString('utf8');

// Process the raw input: first, remove any leading/trailing whitespace,
// then split the entire buffer into an array of individual lines.
// Each line is expected to contain a student's score record.
const studentScoreRecords = completeInputBuffer
    .trim()
    .split('\n');

// Initialize an index to iterate through the student score records.
let recordIndex = 0;

// Begin processing each student record in a controlled loop.
// The loop continues as long as there are records to process.
while (recordIndex < studentScoreRecords.length) {
    // Retrieve the current line of data representing a student's scores.
    const currentScoreEntry = studentScoreRecords[recordIndex];

    // Check for a specific termination signal. If encountered,
    // it signifies the end of valid input, and the loop is exited.
    if (currentScoreEntry === "-1 -1 -1") {
        break;
    }

    // Parse the scores from the current entry string.
    // The string is split by spaces, and each resulting part is converted to a number.
    const individualScores = currentScoreEntry.split(' ').map(scorePart => Number(scorePart));

    // Implement a guard clause to validate the input format.
    // If an entry does not contain exactly three scores, it's considered invalid.
    // An error message is logged, and the processing skips to the next record.
    if (individualScores.length !== 3) {
        console.error('Error: Invalid score entry format encountered. Skipping record:', currentScoreEntry);
        recordIndex++;
        continue; // Move to the next iteration of the loop.
    }

    // Assign descriptive variable names to each score component for clarity.
    const midtermExaminationScore = individualScores[0];
    const finalExaminationScore = individualScores[1];
    const supplementaryExaminationScore = individualScores[2];

    // Calculate the combined score from the primary assessments.
    const combinedAssessmentScore = midtermExaminationScore + finalExaminationScore;

    // Initialize the student's grade to 'F' as a default.
    let assignedGrade = 'F';

    // Determine if the student had an invalid attempt (e.g., missed an exam).
    const isInvalidAttempt = (midtermExaminationScore === -1 || finalExaminationScore === -1);

    // Apply grading logic based on the calculated scores and attempt validity.
    if (isInvalidAttempt) {
        // If either the midterm or final exam was missed, the student automatically receives an 'F'.
        assignedGrade = 'F';
    } else if (combinedAssessmentScore >= 80) {
        // Students with a high combined score receive an 'A'.
        assignedGrade = 'A';
    } else if (combinedAssessmentScore >= 65) {
        // Students with a very good combined score receive a 'B'.
        assignedGrade = 'B';
    } else if (combinedAssessmentScore >= 50) {
        // Students with a satisfactory combined score receive a 'C'.
        assignedGrade = 'C';
    } else if (combinedAssessmentScore >= 30) {
        // For students with a marginal combined score (30-49),
        // check if their supplementary exam score qualifies them for a 'C'.
        if (supplementaryExaminationScore >= 50) {
            assignedGrade = 'C'; // An adequate supplementary score upgrades the grade to 'C'.
        } else {
            assignedGrade = 'D'; // Otherwise, the grade is a 'D'.
        }
    }
    // If none of the above conditions are met (meaning combinedAssessmentScore is less than 30
    // and it was not an invalid attempt), the assignedGrade remains the default 'F'.

    // Output the final determined grade for the current student.
    console.log(assignedGrade);

    // Increment the index to proceed to the next student record in the buffer.
    recordIndex++;
}

// The script concludes after all records have been processed or the termination signal is found.