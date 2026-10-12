function ProcessGame(gameData) {
    // Parse the input string into an array of numbers
    gameData = gameData.split(" ").map(currentValue => Number(currentValue));

    // Initialize the active player indicator
    // 1 typically represents player 1, 0 for player 2
    let activePlayer = 1;

    // Main game loop continues until a winner is determined
    while (true) {
        // Check which player's turn it is
        if (activePlayer === 1) {
            // Player 1's turn: reduce opponent's health
            gameData[2] -= gameData[1]; // Opponent's health (index 2) reduced by player 1's attack (index 1)

            // Check if opponent's health dropped to or below zero
            if (gameData[2] <= 0) {
                console.log("Yes"); // Player 1 wins
                break; // Exit the game loop
            }
        } else {
            // Player 2's turn: reduce player 1's health
            gameData[0] -= gameData[3]; // Player 1's health (index 0) reduced by player 2's attack (index 3)

            // Check if player 1's health dropped to or below zero
            if (gameData[0] <= 0) {
                console.log("No"); // Player 2 wins
                break; // Exit the game loop
            }
        }

        // Switch turns for the next iteration
        // If activePlayer was 1, it becomes 0; if it was 0, it becomes 1.
        activePlayer = (activePlayer === 1) ? 0 : 1;
    }
}

// Read input from standard input and pass it to the game processing function
ProcessGame(require("fs").readFileSync("/dev/stdin", "utf8"));
