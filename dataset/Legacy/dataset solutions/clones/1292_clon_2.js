var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Reads the entire input from standard input as a UTF-8 string.
var dataRows = (rawData.trim()).split(/\n/g); // Cleans up the raw input by trimming whitespace and splitting it into an array of lines.

var gradeResult; // Declares a variable to hold the calculated grade for each student.

// Iterates through each line of student data provided in the input.
for (var idx = 0; idx < dataRows.length; idx++) {
    // Checks if the current line is the termination sentinel.
    if (dataRows[idx] === '-1 -1 -1') {
        break; // If the sentinel is found, exit the loop.
    }

    // Parses the current line: splits it by spaces and converts each part to a number.
    var parsedRow = dataRows[idx].split(' ').map(Number);

    // Assigns the numerical values from the parsed line to descriptive variables.
    var midtermScore = parsedRow[0]; // Represents the midterm exam score.
    var finalScore = parsedRow[1];   // Represents the final exam score.
    var retakeScore = parsedRow[2];  // Represents the retake exam score.

    // Determines the student's grade based on a series of conditional checks.
    if (midtermScore === -1 || finalScore === -1) {
        // If either midterm or final score is -1, the student automatically fails.
        gradeResult = 'F';
    } else if (80 <= midtermScore + finalScore) {
        // If the sum of midterm and final scores is 80 or greater, the grade is 'A'.
        gradeResult = 'A';
    } else if (65 <= midtermScore + finalScore) {
        // If the sum is 65 or greater (but less than 80), the grade is 'B'.
        gradeResult = 'B';
    } else if (50 <= midtermScore + finalScore) {
        // If the sum is 50 or greater (but less than 65), the grade is 'C'.
        gradeResult = 'C';
    } else if (30 <= midtermScore + finalScore) {
        // If the sum is 30 or greater (but less than 50), a special condition applies.
        if (50 <= retakeScore) {
            // If the retake score is 50 or greater, the grade is 'C'.
            gradeResult = 'C';
        } else {
            // Otherwise, if the retake score is less than 50, the grade is 'D'.
            gradeResult = 'D';
        }
    } else {
        // If the sum of midterm and final scores is less than 30, the grade is 'F'.
        gradeResult = 'F';
    }

    // Prints the determined grade for the current student to the console.
    console.log(gradeResult);
}
