const settings = {
    inputSource: '/dev/stdin', // Path to standard input for Linux systems
    lineSeparator: '\n'        // Newline character for splitting input
};

// Read input from the specified source, decode as ASCII, remove leading/trailing whitespace,
// then split into an array of strings based on the line separator.
let inputLines = require('fs').readFileSync(settings.inputSource, 'ascii')
    .trim()
    .split(settings.lineSeparator);

// Remove the first element from the array, as it's often a count or header not needed for processing.
inputLines.shift();

// Process each remaining line to calculate scores for two players.
// The 'reduce' method iterates through the match results, accumulating scores.
let finalScores = inputLines.reduce(function (accumulatedScores, currentMatch) {
    // Split the current match string into an array of individual scores (as strings).
    const matchScores = currentMatch.split(' ');

    // Compare the scores from the current match.
    if (matchScores[0] > matchScores[1]) {
        // If the first player's score is higher, add 3 points to their total.
        accumulatedScores[0] += 3;
    } else if (matchScores[0] !== matchScores[1]) {
        // If scores are different but the first player's isn't higher (meaning second player's is higher),
        // add 3 points to the second player's total.
        accumulatedScores[1] += 3;
    } else {
        // If the scores are equal (a draw), add 1 point to each player's total.
        accumulatedScores[0]++;
        accumulatedScores[1]++;
    }

    // Return the updated accumulated scores for the next iteration.
    return accumulatedScores;
}, [0, 0]); // Initialize accumulated scores for two players to zero.

// Output the final scores, joined by a space, to the console.
console.log(finalScores.join(' '));
