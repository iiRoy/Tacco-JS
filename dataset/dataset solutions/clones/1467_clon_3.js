process.stdin.on("data", function(inputChunkBuffer) {
    // Initialize total scores for two competing entities, Player A and Player B.
    // These variables will accumulate points based on match outcomes.
    let playerOneTotalScore = 0;
    let playerTwoTotalScore = 0;

    // Convert the incoming data buffer to a string representation.
    // Then, trim any leading/trailing whitespace and split the entire input
    // into an array of individual lines based on newline characters.
    const allInputLines = String(inputChunkBuffer).trim().split("\n");

    // In many competitive programming scenarios, the first line of input
    // contains metadata (like the number of test cases or matches)
    // which is not directly part of the data to be processed for scoring.
    // We skip this initial line and process only the subsequent lines
    // that contain the actual match results.
    const matchOutcomeLines = allInputLines.slice(1);

    // Iterate through each line representing a match outcome.
    // This loop processes each game result one by one to update player scores.
    for (const currentMatchDataLine of matchOutcomeLines) {
        // Before processing, ensure the line is not empty or just whitespace.
        // This acts as a basic validation step to prevent errors from malformed input.
        if (!currentMatchDataLine.trim()) {
            // If the line is empty, skip to the next iteration.
            continue;
        }

        // Split the current line by spaces to separate the scores of the two players.
        // It's assumed that each line contains two space-separated numerical values.
        const rawScores = currentMatchDataLine.split(" ");

        // Validate that exactly two scores were provided on the line.
        // If not, it indicates malformed input for this match.
        if (rawScores.length !== 2) {
            // Log a warning for debugging purposes and skip this invalid line.
            console.error("Error: Malformed match data line, expected two scores but got: " + rawScores.length + " in line: '" + currentMatchDataLine + "'");
            continue;
        }

        // Parse the string representations of scores into floating-point numbers.
        // Using parseFloat allows for potential decimal scores, although typical problems
        // might imply integer scores. It's safer for broader compatibility.
        const scoreForPlayerOne = parseFloat(rawScores[0]);
        const scoreForPlayerTwo = parseFloat(rawScores[1]);

        // Another validation step: check if the parsed scores are valid numbers.
        // If parsing results in NaN (Not a Number), it means the input was not numerical.
        if (isNaN(scoreForPlayerOne) || isNaN(scoreForPlayerTwo)) {
            // Log an error and skip the line if scores are not valid numbers.
            console.error("Error: Invalid numerical scores detected in line: '" + currentMatchDataLine + "'");
            continue;
        }

        // Apply the scoring logic based on the comparison of player scores.
        // This is a common pattern in sports or game scoring systems.
        if (scoreForPlayerOne === scoreForPlayerTwo) {
            // If scores are equal (a draw), both players receive 1 point.
            playerOneTotalScore += 1;
            playerTwoTotalScore += 1;
        } else if (scoreForPlayerOne > scoreForPlayerTwo) {
            // If Player One's score is higher, Player One receives 3 points.
            playerOneTotalScore += 3;
        } else { // This implies scoreForPlayerTwo > scoreForPlayerOne
            // If Player Two's score is higher, Player Two receives 3 points.
            playerTwoTotalScore += 3;
        }
    }

    // After processing all match outcome lines, print the final accumulated scores
    // for Player One and Player Two to standard output, separated by a space.
    console.log(playerOneTotalScore, playerTwoTotalScore);

}).resume(); // Ensure the standard input stream continues to be active and doesn't pause.