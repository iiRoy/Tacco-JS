var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input string is processed to create an array of individual lines.
var lineSegments = rawData.trim().split("\n");

// This loop continues to process lines until a specific termination sequence is encountered.
while (true) {
    // Retrieve the first line from the array and remove it.
    var currentLine = lineSegments.shift();

    // Check if the current line matches the termination pattern.
    if (currentLine === "-1 -1 -1") {
        break; // Exit the processing loop.
    }

    // Parse the current line, splitting it by spaces and converting each part to a number.
    var numericValues = currentLine.split(" ").map(Number);

    // Assign the parsed numeric values to descriptive variables.
    var midtermScore = numericValues[0]; // Score from the midterm exam.
    var finalScore = numericValues[1];   // Score from the final exam.
    var resitScore = numericValues[2];   // Score from the resit exam.

    // Initialize the student's grade to 'F' (Fail).
    var gradeResult = "F";

    // Evaluate the student's scores to determine the appropriate letter grade.
    if (midtermScore === -1 || finalScore === -1) {
        // If either the midterm or final score is missing, the grade is automatically 'F'.
        gradeResult = "F";
    } else if (midtermScore + finalScore >= 80) {
        // If the sum of midterm and final scores is 80 or more, the grade is 'A'.
        gradeResult = "A";
    } else if (midtermScore + finalScore >= 65) {
        // If the sum is 65 or more, the grade is 'B'.
        gradeResult = "B";
    } else if (midtermScore + finalScore >= 50) {
        // If the sum is 50 or more, the grade is 'C'.
        gradeResult = "C";
    } else if (midtermScore + finalScore >= 30 && resitScore >= 50) {
        // If the sum is 30 or more AND the resit score is 50 or more, the grade is 'C'.
        gradeResult = "C";
    } else if (midtermScore + finalScore >= 30) {
        // If the sum is 30 or more (but resit was not sufficient), the grade is 'D'.
        gradeResult = "D";
    }
    // If none of the above conditions are met, gradeResult remains "F".

    // Output the determined grade to the console.
    console.log(gradeResult);
}
