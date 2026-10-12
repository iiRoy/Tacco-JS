const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input data is trimmed of leading/trailing whitespace and then split into an array of lines.
let lineArray = rawData.trim().split("\n");

// This array will temporarily store the sum of pairs for each candidate (A, B, C, D).
let scoreAccumulator = [];

// Iterate through each line of the input array.
for (let idx = 0; idx < lineArray.length; idx++) {
    // Check for the termination condition: if the accumulator is empty and the current line is "0 0".
    if (scoreAccumulator.length === 0 && lineArray[idx] === "0 0") {
        break; // Exit the processing loop.
    }

    // If four scores have been collected, it's time to process them.
    if (scoreAccumulator.length === 4) {
        // Find the maximum score among the four accumulated scores.
        const highestScore = scoreAccumulator.reduce(function(valA, valB) {
            return Math.max(valA, valB);
        });

        // Define the labels for the candidates.
        const candidateLabels = "ABCD".split("");

        // Determine the label corresponding to the highest score.
        const resultLabel = candidateLabels[scoreAccumulator.indexOf(highestScore)];

        // Output the winning candidate's label and their highest score.
        console.log(resultLabel + " " + highestScore);

        // Reset the accumulator to prepare for the next set of four candidates.
        scoreAccumulator = [];
    } else {
        // If fewer than four scores are accumulated, parse the current line.
        // Split the line by space, convert the parts to numbers, and sum them.
        const currentPair = lineArray[idx].split(" ").map(Number);
        scoreAccumulator.push(currentPair[0] + currentPair[1]);
    }
}
