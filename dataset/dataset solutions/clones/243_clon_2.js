var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data: trim whitespace and split into an array of lines.
var lineArray = (rawData.trim()).split("\n");

// Iterate over each line of input.
lineArray.forEach(function(currentLine) {
    // For each line, split by space and convert parts to numbers.
    var parsedNumbers = currentLine.split(" ").map(Number);

    // Initialize an array representing possible card values (1 through 10).
    var deckCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Filter the deck cards. This specific filter removes a card 'potentialCardToRemove'
    // only if it is equal to parsedNumbers[0] AND parsedNumbers[1] AND parsedNumbers[2].
    // This implies that all three initial cards must be identical for a card to be removed from the deck.
    deckCards = deckCards.filter(function(potentialCardToRemove) {
        return (potentialCardToRemove != parsedNumbers[0] || potentialCardToRemove != parsedNumbers[1] || potentialCardToRemove != parsedNumbers[2]);
    });

    // Initialize counters for scenarios where the total is 20 or less (stay)
    // and scenarios where it's more than 20 (must hit).
    var stayCount = 0;
    var hitCount = 0;

    // Iterate through the filtered deck cards to evaluate potential outcomes.
    deckCards.forEach(function(drawnCard) {
        // Check if the sum of the first two parsed numbers plus the drawn card is 20 or less.
        if ((parsedNumbers[0] + parsedNumbers[1] + drawnCard) <= 20) {
            stayCount++; // Increment stay count if total is 20 or less.
        } else {
            hitCount++; // Increment hit count if total is more than 20.
        }
    });

    // Output "YES" if the number of "stay" scenarios is greater than "hit" scenarios, otherwise "NO".
    console.log(stayCount > hitCount ? "YES" : "NO");
});
