let inputData = []; // Storage for incoming lines of text

const ioModule = require('readline'); // Import the readline module for input/output operations

const interfaceInstance = ioModule.createInterface({ // Create an interface for reading input
    input: process.stdin, // Standard input stream
    output: process.stdout, // Standard output stream
});

interfaceInstance.on('line', function (currentLine) { // Event listener for each line of input
    inputData.push(currentLine); // Add the received line to our data array
});

interfaceInstance.on("close", function () { // Event listener for when the input stream closes
    // Parse the first line of input to extract two numbers
    const firstNum = Number(inputData[0].split(" ")[0]); // Get the first number
    const secondNum = Number(inputData[0].split(" ")[1]); // Get the second number

    const difference = secondNum - firstNum; // Calculate the difference between the two numbers

    // Initialize an array to store cumulative sums, up to a certain limit
    const sumArray = Array(999).fill(0);

    // Loop to calculate cumulative sums and check for a condition
    for (let idx = 1; idx <= 999; idx++) {
        sumArray[idx] = sumArray[idx - 1] + idx; // Calculate the sum of integers from 1 to idx
        // If the calculated difference matches the current index, print a result and exit
        if (difference === idx) {
            console.log(sumArray[idx] - secondNum); // Output the specific calculated value
            return (0); // Terminate the program
        }
    }
});
