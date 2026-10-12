var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input
var lineBuffer = rawData.trim().split("\n"); // Process raw data: remove leading/trailing whitespace and split into individual lines

while (true) { // Begin an infinite loop to process each line of input
    var currentLine = lineBuffer.shift(); // Extract the first line from the buffer for processing

    // Check if the current line is the termination sentinel
    if (currentLine === "-1 -1 -1") {
        break; // Exit the loop if the sentinel is encountered
    }

    // Parse the scores from the current line
    var scoreArray = currentLine.split(" ").map(Number);

    // Assign individual scores to descriptive variables
    var midtermScore = scoreArray[0];
    var finalScore = scoreArray[1];
    var retakeScore = scoreArray[2];

    var gradeResult = "F"; // Initialize the grade to 'F' by default

    // Evaluate grading conditions based on the scores
    if (midtermScore === -1 && finalScore === -1) {
        gradeResult = "F"; // If both midterm and final are -1, the grade is 'F'
    } else if (midtermScore + finalScore >= 80) {
        gradeResult = "A"; // Sum of midterm and final scores 80 or more results in 'A'
    } else if (midtermScore + finalScore >= 65) {
        gradeResult = "B"; // Sum of midterm and final scores 65 or more results in 'B'
    } else if (midtermScore + finalScore >= 50) {
        gradeResult = "C"; // Sum of midterm and final scores 50 or more results in 'C'
    } else if (midtermScore + finalScore >= 30 && retakeScore >= 50) {
        gradeResult = "C"; // Sum of midterm and final scores 30 or more, AND retake score 50 or more, results in 'C'
    } else if (midtermScore + finalScore >= 30) {
        gradeResult = "D"; // Sum of midterm and final scores 30 or more (but less than 50, and retake less than 50) results in 'D'
    }

    console.log(gradeResult); // Output the determined grade for the current set of scores
}
