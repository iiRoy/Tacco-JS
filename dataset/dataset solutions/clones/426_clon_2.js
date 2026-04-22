// This script processes numerical input lines from the standard input stream.
var sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8'); // Retrieve raw input data

// The raw input string is first trimmed, then divided into an array of individual lines.
let lineBuffer = (sourceData.trim()).split("\n");

// An array to temporarily store computed numerical values.
const scoreAccumulator = [];

// Begin iterating through each entry in the processed input line buffer.
for (let currentIdx = 0; currentIdx < lineBuffer.length; currentIdx++)
{
    // A specific condition to terminate processing: an empty accumulator combined with a "0 0" line.
    if (scoreAccumulator.length === 0 && lineBuffer[currentIdx] === "0 0") {
        break; // Stop further execution if the termination sequence is encountered.
    }

    // If exactly five scores have been collected, proceed to evaluate them.
    if (scoreAccumulator.length === 5)
    {
        // Compute the highest numerical value present within the current set of scores.
        const highestScore = scoreAccumulator.reduce(function(firstVal, secondVal) {
            return Math.max(firstVal, secondVal);
        });

        // Define a sequence of character labels corresponding to potential score positions.
        const gradeLabels = "ABCDE".split("");

        // Identify the character label associated with the determined highest score.
        const resultLabel = gradeLabels[scoreAccumulator.indexOf(highestScore)];

        // Output the identified label alongside its corresponding highest score.
        console.log(resultLabel + " " + highestScore);

        // Reset the accumulator by clearing all its contents, preparing for the next batch.
        scoreAccumulator.length = 0;
    }
    else
    {
        // For other cases, parse the current input line into two distinct numbers.
        const currentNumbers = lineBuffer[currentIdx].split(" ").map(Number);

        // Compute the sum of these two numbers and append it to the accumulator.
        scoreAccumulator.push(currentNumbers[0] + currentNumbers[1]);
    }
}