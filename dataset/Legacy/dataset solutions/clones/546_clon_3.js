var fileSystem = require('fs');
var rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const parseNumericLine = (lineString) => {
    // This function mimics the original behavior of splitting a line by space
    // and converting parts to numbers. It does not trim individual lines,
    // preserving how the original code handles potential leading/trailing
    // spaces within a line (e.g., " 1 2 " would result in [0, 1, 2, 0]).
    return lineString.split(" ").map(Number);
};

const processRoundScores = (currentScoreA, currentScoreB, valueOne, valueTwo) => {
    let updatedScoreA = currentScoreA;
    let updatedScoreB = currentScoreB;

    if (valueOne > valueTwo) {
        // If the first value is greater, add the sum of both values to player A's score.
        updatedScoreA += valueOne + valueTwo;
    } else if (valueOne < valueTwo) {
        // If the second value is greater, add the sum of both values to player B's score.
        updatedScoreB += valueOne + valueTwo;
    } else {
        // If both values are equal, player scores are reset to these values.
        updatedScoreA = valueOne;
        updatedScoreB = valueTwo;
    }
    return { newA: updatedScoreA, newB: updatedScoreB };
};

(function executeGameLogic() {
    // Trim the entire input block and split it into an array of lines.
    const inputLinesArray = rawInputData.trim().split("\n");

    // The first line contains the total number of game rounds.
    // Using Number() explicitly for type conversion.
    const totalGameRounds = Number(inputLinesArray.shift());

    let playerOneTotalScore = 0;
    let playerTwoTotalScore = 0;

    // Iterate through each game round.
    for (let roundCounter = 0; roundCounter < totalGameRounds; roundCounter++) {
        // Get the data line for the current round.
        const currentRoundInput = inputLinesArray.shift();

        // Parse the two numbers from the current round's input line.
        // Using array destructuring for clarity.
        const [firstRoundValue, secondRoundValue] = parseNumericLine(currentRoundInput);

        // Calculate the scores for the current round using the helper function.
        const roundResult = processRoundScores(
            playerOneTotalScore,
            playerTwoTotalScore,
            firstRoundValue,
            secondRoundValue
        );

        // Update the overall total scores for both players.
        playerOneTotalScore = roundResult.newA;
        playerTwoTotalScore = roundResult.newB;
    }

    // Define a constant for the space separator in the final output.
    const outputDelimiter = " ";

    // Print the final scores of player one and player two, separated by a space.
    console.log(playerOneTotalScore + outputDelimiter + playerTwoTotalScore);
})();
