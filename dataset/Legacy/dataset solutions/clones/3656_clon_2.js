var inputData = []; // Array to hold lines read from standard input.
var readline = require('readline'); // Import the 'readline' module for interactive console input.

// Create an interface for reading input line by line.
var inputHandler = readline.createInterface({
    input: process.stdin,  // Specify standard input as the source.
    output: process.stdout // Specify standard output for any potential output (though not used by readline itself here).
});

// Attach an event listener for each 'line' event.
inputHandler.on('line', function (currentLine) {
    // When a line is received, add it to our inputData array.
    inputData.push(currentLine);
});

// Attach an event listener for the 'close' event, which fires when the input stream ends.
inputHandler.on('close', function () {
    // Take the first line from inputData, split it into an array of characters.
    var firstStringChars = inputData[0].split("");
    // Take the second line from inputData, split it into an array of characters.
    var secondStringChars = inputData[1].split("");

    // Loop through a number of rotations equal to the length of the second string.
    // This covers all possible unique rotations for comparison.
    for (var idx = 0; idx < secondStringChars.length; idx++) {
        // Check if the character array of the first string is strictly equal to the second string's character array.
        // Note: In JavaScript, `array1 === array2` checks if they are the *same object*, not if their contents are equal.
        // This condition will always be false as `firstStringChars` and `secondStringChars` are distinct array objects.
        if (firstStringChars === secondStringChars) {
            console.log("Yes"); // This line will never be reached due to the nature of array comparison.
            return (0); // Exit the program.
        }
        // Perform a rotation: remove the last character from the first string's array.
        var shiftedChar = firstStringChars.pop();
        // Add the removed character to the beginning of the first string's array.
        firstStringChars.unshift(shiftedChar);
    }
    // If the loop completes without the (unreachable) "Yes" condition being met, print "No".
    console.log("No");
});
