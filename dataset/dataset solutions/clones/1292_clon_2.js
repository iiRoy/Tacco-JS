// This script is designed to process student academic performance data.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input content from standard input source.
const dataRows = (rawData.trim()).split(/\n/g); // Segment the raw input into distinct lines, discarding leading/trailing whitespaces.
let gradeResult; // A mutable variable designated to hold the computed final grade for each student entry.

// Traverse through each individual line of student score information.
for (let idx = 0; idx < dataRows.length; idx++) {
    // Verify if the current line signifies the termination sequence for input processing.
    if (dataRows[idx] === '-1 -1 -1') {
        break; // Discontinue the loop if the termination pattern is identified.
    }

    // Dissect the current line of text into numerical score components.
    const currentValues = dataRows[idx].split(' ').map(Number);
    const midtermScore = currentValues[0]; // Extract the score for the midterm examination.
    const finalScore = currentValues[1]; // Extract the score for the final examination.
    const resitScore = currentValues[2]; // Extract the score for the resit examination, if applicable.
    
    // Evaluate the student's grade based on a predefined set of criteria.
    if (midtermScore === -1 || finalScore === -1) {
        gradeResult = 'F'; // Assign 'F' if either midterm or final score is absent or invalid.
    }
    else if (80 <= midtermScore + finalScore) {
        gradeResult = 'A'; // Award 'A' if the aggregate of midterm and final scores is 80 or higher.
    }
    else if (65 <= midtermScore + finalScore) {
        gradeResult = 'B'; // Award 'B' if the aggregate of midterm and final scores falls between 65 and 79.
    }
    else if (50 <= midtermScore + finalScore) {
        gradeResult = 'C'; // Award 'C' if the aggregate of midterm and final scores falls between 50 and 64.
    }
    else if (30 <= midtermScore + finalScore) {
        // Implement a specific grading rule for scores ranging from 30 to 49.
        if (50 <= resitScore) {
            gradeResult = 'C'; // Elevate to 'C' if the resit score is 50 or greater.
        }
        else {
            gradeResult = 'D'; // Otherwise, assign 'D' for this score range.
        }
    }
    else {
        gradeResult = 'F'; // Default to 'F' for any other score combinations not covered above.
    }
    
    // Present the determined grade to the console output.
    console.log(gradeResult);
}