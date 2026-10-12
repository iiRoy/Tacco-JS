let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input stream

const lineArray = rawData.trim().split('\n'); // Split the raw input into an array of lines, removing leading/trailing whitespace
let scoreBuffer = []; // Initialize an empty array to temporarily store calculated sums

for (let idx = 0; idx < lineArray.length; idx++) { // Iterate through each line in the processed input array
    // Check for the termination condition: if the buffer is empty and the current line is "0 0"
    if (scoreBuffer.length === 0 && lineArray[idx] === "0 0") {
        break; // Exit the loop if the termination condition is met
    }

    // Parse the current line: split by space, then convert each part to a number
    const numPair = lineArray[idx].split(' ').map(Number);
    // Calculate the sum of the two numbers and add it to the score buffer
    scoreBuffer.push(numPair[0] + numPair[1]);

    // If the score buffer has accumulated 5 scores
    if (scoreBuffer.length === 5) {
        // Find the maximum score within the current buffer using the reduce method
        const highestScore = scoreBuffer.reduce(function(val1, val2) {
            return Math.max(val1, val2); // Return the larger of the two values
        });

        // Define an array of labels corresponding to the player positions
        const playerLabels = "ABCDE".split('');
        // Determine the label of the player with the highest score
        const winnerLabel = playerLabels[scoreBuffer.indexOf(highestScore)];

        // Output the winner's label and their highest score
        console.log(winnerLabel + " " + highestScore);

        scoreBuffer = []; // Clear the score buffer to prepare for the next set of 5 scores
    }
}
