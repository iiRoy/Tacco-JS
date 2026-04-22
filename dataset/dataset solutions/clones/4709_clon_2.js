// This specialized function is designed to process incoming game data
// to determine the winner of a card game based on specific card rankings.
function ProcessGameInput(gameDataString)
{
    // Split the entire input string by spaces to separate the two card values.
    // The result is an array of string-based card representations.
    const cardValuesStrArr = gameDataString.split(" ");

    // Convert the first player's card string into a numerical value.
    // Using 'let' to demonstrate a data type declaration variation.
    let firstPlayerCard = parseFloat(cardValuesStrArr[0]);

    // Convert the second player's card string into a numerical value.
    // Again, using 'let' for variable declaration.
    let secondPlayerCard = parseFloat(cardValuesStrArr[1]);

    // Establish the custom ranking order for the cards.
    // In this game, 2 is the lowest, and 1 (Ace) is the highest.
    const cardRankOrder = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1];

    // Determine the index (position) of the first player's card within the rank order list.
    // A lower index here implies a lower card value in this specific list.
    const firstPlayerRankIdx = cardRankOrder.indexOf(firstPlayerCard);

    // Determine the index (position) of the second player's card within the rank order list.
    const secondPlayerRankIdx = cardRankOrder.indexOf(secondPlayerCard);

    // Begin the conditional logic to ascertain the game's outcome.

    // If the first player's card has a numerically smaller rank index
    // (meaning it appears earlier in the 'cardRankOrder' array),
    // then the second player (Bob) is declared the winner.
    if (firstPlayerRankIdx < secondPlayerRankIdx)
    {
        console.log("Bob"); // Output the name of the winning player.
        return; // Exit the function immediately as the result is determined.
    }

    // Conversely, if the second player's card has a numerically smaller rank index,
    // then the first player (Alice) is the victor.
    if (secondPlayerRankIdx < firstPlayerRankIdx)
    {
        console.log("Alice"); // Output the name of the winning player.
        return; // Exit the function.
    }

    // Should neither of the above conditions be met, it implies that both players'
    // cards hold the exact same rank index, resulting in a draw.
    if (firstPlayerRankIdx === secondPlayerRankIdx)
    {
        console.log("Draw"); // Output that the game is a tie.
        return; // Exit the function.
    }
}

// Execute the card game logic by feeding it input read from the standard input stream.
ProcessGameInput( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;