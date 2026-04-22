function ProcessGameResult(gameDataParam) {
    // Split the input string into an array of card representations
    let cardStringsArray = gameDataParam.split(' ');

    // Parse the first card's value from the array
    let firstCardValue = parseInt(cardStringsArray[0], 10);
    // Parse the second card's value from the array
    let secondCardValue = parseInt(cardStringsArray[1], 10);

    // If the first card is an Ace (represented by 1), elevate its value to 14
    if (firstCardValue === 1) {
        firstCardValue = 14;
    }

    // If the second card is an Ace, elevate its value to 14 for comparison
    if (secondCardValue === 1) {
        secondCardValue = 14;
    }

    // Compare the numerical values of the two cards to determine the winner
    if (firstCardValue > secondCardValue) {
        console.log("Alice"); // First player wins
    } else if (firstCardValue < secondCardValue) {
        console.log("Bob"); // Second player wins
    } else if (firstCardValue === secondCardValue) {
        console.log("Draw"); // It's a tie
    }
}

// Read game input from standard input and pass it to the processing function
ProcessGameResult(require("fs").readFileSync("/dev/stdin", "utf8"));