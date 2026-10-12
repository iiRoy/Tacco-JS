var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from standard input
var lineSegments = (rawData.trim()).split("\n"); // Process raw input: remove whitespace, then split into an array of lines
var numIterations = lineSegments.shift() - 0; // Extract the first line as the count for subsequent iterations, converting it to a number
var scoreOne = 0; // Initialize the first player's score
var scoreTwo = 0; // Initialize the second player's score

// Iterate through the remaining lines based on the extracted count
for (var idx = 0; idx < numIterations; idx++) {
    var currentLine = lineSegments.shift(); // Retrieve the next line from the array
    var parsedValues = currentLine.split(" ").map(Number); // Split the current line by space and convert each part to a numeric value

    // Evaluate the relationship between the two numbers and update scores accordingly
    if (parsedValues[0] > parsedValues[1]) {
        scoreOne += parsedValues[0] + parsedValues[1]; // If the first value is greater, add the sum to score one
    }
    if (parsedValues[0] < parsedValues[1]) {
        scoreTwo += parsedValues[0] + parsedValues[1]; // If the second value is greater, add the sum to score two
    }
    if (parsedValues[0] == parsedValues[1]) {
        scoreOne = parsedValues[0]; // If values are equal, score one takes the first value
        scoreTwo = parsedValues[1]; // And score two takes the second value
    }
}

// Display the final calculated scores, separated by a space
console.log(scoreOne + " " + scoreTwo);
