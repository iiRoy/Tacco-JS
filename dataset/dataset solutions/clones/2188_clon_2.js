process.stdin.resume();
process.stdin.setEncoding("utf8");

// This section initializes the input handling mechanism.
// It sets up a way to read lines from standard input.

var inputData = []; // Array to store all incoming lines of text.

var inputProcessor = require("readline").createInterface({
    input: process.stdin, // Source for reading input.
    output: process.stdout // Destination for output (not directly used for problem solution, but part of interface setup).
});

// Event listener for each line received from standard input.
inputProcessor.on("line", (currentLine) => {
    inputData.push(currentLine); // Add the current line to our collection.
});

// Event listener for when the input stream closes.
// This is where the main logic of the program executes.
inputProcessor.on("close", () => {
    // Process the first line of input.
    // It's expected to contain two space-separated numbers.
    var parsedValues = inputData[0].split(" ");

    // Convert the string parts to numerical values.
    var firstValue = Number(parsedValues[0]);
    var secondValue = Number(parsedValues[1]);

    // Check if the first number is perfectly divisible by the second number.
    if (firstValue % secondValue === 0) {
        // If it is, print the first number.
        console.log(firstValue);
    } else if (firstValue % secondValue !== 0) {
        // If it's not perfectly divisible, decrement the second number by one.
        secondValue = secondValue - 1;
        // Then, print the modified second number.
        console.log(secondValue);
    }
});
