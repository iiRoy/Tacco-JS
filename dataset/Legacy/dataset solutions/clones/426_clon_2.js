var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineArray = (rawData.trim()).split("\n");

var scoreAccumulator = [];

for (var idx = 0; idx < lineArray.length; idx++) {
    // Check for the termination condition: if the accumulator is empty and the current line is "0 0"
    if (scoreAccumulator.length === 0 && lineArray[idx] === "0 0") {
        break; // Exit the processing loop
    }

    // If five scores have been collected in the accumulator
    if (scoreAccumulator.length === 5) {
        // Find the maximum score among the accumulated values
        var highestScore = scoreAccumulator.reduce(function(valA, valB) {
            return Math.max(valA, valB);
        });

        // Define an array of contestant labels
        var contestantLabels = "ABCDE".split("");

        // Determine the label corresponding to the highest score
        var resultLabel = contestantLabels[scoreAccumulator.indexOf(highestScore)];

        // Output the contestant label and their highest score
        console.log(resultLabel + " " + highestScore);

        // Reset the accumulator for the next set of scores
        scoreAccumulator = [];
    } else {
        // If fewer than five scores, parse the current line
        var currentScores = lineArray[idx].split(" ").map(Number);
        // Add the sum of the two numbers from the current line to the accumulator
        scoreAccumulator.push(currentScores[0] + currentScores[1]);
    }
}
