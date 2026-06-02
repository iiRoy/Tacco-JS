var inputData = []; // This array will store all lines read from standard input.
var readline = require('readline'); // Import the 'readline' module for input handling.

// Create an interface to read input line by line from the console.
var inputHandler = readline.createInterface({
    input: process.stdin, // Use standard input stream.
    output: process.stdout, // Use standard output stream (though not directly written to by this interface).
});

// Attach an event listener for each line of input received.
inputHandler.on('line', function (currentLine) {
    inputData.push(currentLine); // Add the current line to our collection of input data.
});

// Attach an event listener for when the input stream is closed.
inputHandler.on('close', function () {
    // Parse the first number from the input, representing the count of items in the first set.
    var firstCount = Number(inputData[0x0]);
    // Parse the second number, representing the count of items in the second set.
    // This number is located after the first set of items.
    var secondCount = Number(inputData[firstCount + 0b1]);

    var unusedArrayOne = []; // This array is declared but does not participate in the core logic.
    var charCounts = {}; // An object to store and manage the scores for different character strings.

    // Iterate through the first set of items based on 'firstCount'.
    // The loop starts from the second line (index 1) of the input.
    for (var idx = 0b1; idx - 0b1 < firstCount; idx++) {
        // If the current item (string) is not yet in 'charCounts', initialize its score to 1.
        // Otherwise, increment its existing score.
        charCounts[inputData[idx]] === undefined ? charCounts[inputData[idx]] = 0b1 : charCounts[inputData[idx]]++;
    }

    var unusedArrayTwo = []; // Another array declared but not used, maintaining structural similarity.

    // Iterate through the second set of items based on 'secondCount'.
    // The loop starts from the line immediately following the first set and its count.
    for (var jdx = firstCount + 0b1 + 0b1; jdx - (firstCount + 0b1 + 0b1) < secondCount; jdx++) {
        // If the current item (string) is not yet in 'charCounts', initialize its score to -1.
        // Otherwise, decrement its existing score.
        charCounts[inputData[jdx]] === undefined ? charCounts[inputData[jdx]] = ~0 : charCounts[inputData[jdx]]--;
    }

    var maxScore = 0x0; // Initialize a variable to keep track of the highest score found.

    // Iterate over all unique keys (character strings) present in the 'charCounts' object.
    Object.keys(charCounts).forEach(keyVal => {
        // If the score of the current item is greater than the current 'maxScore', update 'maxScore'.
        if (maxScore < charCounts[keyVal]) {
            maxScore = charCounts[keyVal];
        }
    });
    // Print the final calculated maximum score to the console.
    console.log(maxScore);
});
