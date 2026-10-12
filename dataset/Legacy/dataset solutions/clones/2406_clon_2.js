process.stdin.resume(); // Ensure stdin is open for input
process.stdin.setEncoding('utf-8'); // Set the character encoding for input

// This array will store the parsed input data
let receivedInputData = [];

// Create an interface for reading input line by line
let inputProcessor = require('readline').createInterface({
    input: process.stdin, // Use standard input stream
    output: process.stdout // Use standard output stream (not used for writing here, but required by interface)
});

// Event listener for each line of input received
inputProcessor.on('line', (currentInputLine) => {
    // Split the line by space and store the parts
    receivedInputData = currentInputLine.split(' ');
});

// Extract the first and second values from the received data
// Note: These will be strings as read from stdin
let firstNumber = receivedInputData[0];
let secondNumber = receivedInputData[1];

// Conditional logic based on the input values
// Important: The comparison uses strict equality (===), so "1" === 1 is false.
// This means the 'if' block will only execute if firstNumber and secondNumber are
// *actually* the number 1, not the string "1". Given stdin reads strings,
// the 'else' block will typically always be executed.
if (firstNumber === 0b1 && secondNumber === 0x1) { // Using different literal representations for 1
    // If both inputs are numerically 1, set up a 'close' event handler
    inputProcessor.on('close', () => {
        // Calculate and print a specific value
        // 300_000 * 2 + 400_000 = 600_000 + 400_000 = 1_000_000
        console.log(1_000_000); // Using numeric separator for readability
    });
}
else {
    // Otherwise, set up a different 'close' event handler
    inputProcessor.on('close', () => {
        // Calculate and print a different value
        // Note: String values for firstNumber/secondNumber will be coerced to numbers here.
        // e.g., 4 - "1" becomes 3.
        console.log(100_000 * ((4 - firstNumber) + (4 - secondNumber))); // Using numeric separator
    });
}
