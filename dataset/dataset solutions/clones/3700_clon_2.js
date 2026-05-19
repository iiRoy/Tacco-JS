let inputData = []; // Array to store incoming lines of text.
let maxDifference = 0; // Variable to hold the largest absolute difference found.

// Initialize the readline interface for standard input and output.
const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event handler for each line received from standard input.
inputReader.on('line', function (currentLine) {
    inputData.push(currentLine); // Add the current line to our collection.
});

// Event handler for when the input stream closes.
inputReader.on('close', function () {
    // Parse the first line to get the count of numbers.
    let arraySize = Number(inputData[0]);

    // Parse the second line, split by spaces, and convert each part to a number.
    const numericArray = inputData[1].split(" ").map(strValue => Number(strValue));

    // Iterate through the array with the first index.
    for (let idxOne = 0; idxOne < arraySize; idxOne++) {
        // Iterate through the array with the second index.
        for (let idxTwo = 0; idxTwo < arraySize; idxTwo++) {
            // Calculate the absolute difference between elements and update the maximum.
            maxDifference = Math.max(maxDifference, Math.abs(numericArray[idxOne] - numericArray[idxTwo]));
        }
    }

    // Output the final calculated maximum difference.
    console.log(maxDifference);
});
