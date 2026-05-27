let inputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/); // Obtain all input lines from standard input

const totalCases = inputLines.length; // Determine the total number of data sets to process

for (let caseIndex = 1; caseIndex < totalCases; caseIndex++) { // Iterate through each data set, starting from the second line
    let ballValues = inputLines[caseIndex].trim().split(/\s/); // Parse the string of ball values for the current case
    let currentPositions = [0, 0]; // Initialize two distinct positions for the course

    for (let ballIndex = 0; ballIndex < ballValues.length; ballIndex++) { // Process each individual ball in the current data set
        const currentBallValue = parseInt(ballValues[ballIndex], 10); // Convert the current ball's string representation to an integer

        // Calculate the difference between the current ball's value and each of the two course positions
        let positionDifferences = [(currentBallValue - currentPositions[0]), (currentBallValue - currentPositions[1])];

        // If both course positions are behind the current ball (i.e., both differences are negative),
        // it's impossible to place the ball, so output "NO" and stop processing this case.
        if ((positionDifferences[0] < 0) && (positionDifferences[1] < 0)) {
            console.log("NO");
            break; // Exit the inner loop for this case
        }

        // Decide which course position to update based on the differences.
        // If the first position's difference is less than or equal to the second's,
        // and the first position can be updated (difference is positive), update the first position.
        if ((positionDifferences[0] <= positionDifferences[1]) && (positionDifferences[0] > 0)) {
            currentPositions[0] = currentBallValue; // Update the first course position
        } else {
            currentPositions[1] = currentBallValue; // Otherwise, update the second course position
        }

        // If all 10 balls have been successfully processed (index 9 for 0-indexed array),
        // output "YES" as the arrangement is possible.
        if (ballIndex === 9) {
            console.log("YES");
        }
    }
}
