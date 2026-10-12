function getInputLines() {
    // This function reads input from standard input and splits it into an array of lines.
    var inputData = require("fs").readFileSync("/dev/stdin", "utf8");
    return inputData.split(/\n\r?/); // Split by newline, handling both Unix and Windows line endings.
}

function generateSequence(startVal, endVal) {
    // Creates an array of numbers from startVal to endVal, inclusive.
    var resultArray = [];
    for (var counter = startVal; counter <= endVal; counter++) {
        resultArray.push(counter);
    }
    return resultArray;
}

// Initialize a complete deck of cards, represented as an object where keys are suits
// and values are arrays of card numbers (1 to 13).
var cardDeck = {
    S: generateSequence(1, 13), // Spades
    H: generateSequence(1, 13), // Hearts
    C: generateSequence(1, 13), // Clubs
    D: generateSequence(1, 13)  // Diamonds
};

// Read input, skip the first line (which is usually the count of cards),
// and process each subsequent line to remove cards from our 'deck'.
getInputLines().slice(1).forEach(function(inputLine) {
    // Split each line into suit and card number.
    var parsedLine = inputLine.split(' ');
    // Remove the specified card from the deck.
    // The card number is 1-indexed, so we subtract 1 for array access.
    delete cardDeck[parsedLine[0]][+parsedLine[1] - 1];
});

// Iterate through each suit in the modified deck.
for (var suitKey in cardDeck) {
    // Filter out the 'deleted' (undefined) entries,
    // then format the remaining card numbers with their suit,
    // and finally join them with newlines for output.
    console.log(cardDeck[suitKey].filter(function(cardValue) {
        return cardValue; // Keep only defined values.
    }).map(function(cardNumber) {
        return suitKey + ' ' + cardNumber; // Format as "SUIT NUMBER".
    }).join("\n"));
}
