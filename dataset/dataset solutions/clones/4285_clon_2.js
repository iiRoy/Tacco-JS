process.stdin.resume(); // Activate standard input stream
process.stdin.setEncoding('utf8'); // Set character encoding for input

// Array to store all incoming lines from standard input
let inputData = [];

// Initialize a readline interface for handling input and output
const inputHandler = require('readline').createInterface({
  input: process.stdin,  // Use standard input as the source
  output: process.stdout // Use standard output for any prompts (though not used here)
});

// Event listener for each line of input received
inputHandler.on('line', (currentLine) => {
  inputData.push(currentLine); // Add the current line to our data array
});

// Event listener for when the input stream closes
inputHandler.on('close', () => {
    // Extract the first line, which represents the total number of elements
    const totalElements = inputData[0];

    // Extract the second line, split it by spaces, and convert each part to a number
    const numberSequence = inputData[1].split(" ").map(itemValue => itemValue - 0);

    // Count how many numbers in the sequence are even
    const evenCount = numberSequence.filter(itemValue => itemValue % 2 === 0).length;

    // Calculate and print the final result based on the formula: 3^N - 2^count_of_evens
    console.log(Math.pow(3, totalElements) - Math.pow(2, evenCount));
});
