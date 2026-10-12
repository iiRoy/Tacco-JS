var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input
var cardList = rawData.split("\n"); // Divide the input into an array of lines
cardList.shift(); // Discard the initial line, which might contain a count
var suitSymbols = "SHCD".split(""); // Define the array of suit characters
var missingCardsOutput = ""; // Initialize a string to store cards that are not present

// Iterate through each suit
for (var suitIndex = 0; suitIndex < 4; suitIndex++) {
    // Iterate through each rank for the current suit
    for (var rankValue = 1; rankValue <= 13; rankValue++) {
        // Construct the full card string, e.g., "S 1"
        var currentCardString = suitSymbols[suitIndex] + " " + rankValue;
        // Check if the constructed card is missing from the input list
        if (cardList.indexOf(currentCardString) === -1) {
            missingCardsOutput += currentCardString + "\n"; // Append the missing card to the output string
        }
    }
}

// If there are any missing cards, print them to the console
if (missingCardsOutput !== "") {
    console.log(missingCardsOutput.trim()); // Output the collected missing cards, removing any trailing newline
}
