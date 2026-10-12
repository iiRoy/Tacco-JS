let inputData = [];

const ioHandler = require('readline');

const inputReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (currentLine) {
    inputData.push(currentLine);
});

inputReader.on('close', function () {
    // Extract the initial parameters from the first line of input.
    const firstLineParts = inputData[0].split(" ");
    let numElements = Number(firstLineParts[0]);
    let windowSize = Number(firstLineParts[1]);

    // Remove the first line as it has been processed.
    inputData.shift();

    // Convert the remaining input lines into an array of numerical values.
    const heightsArray = inputData.map(strVal => Number(strVal));

    // Sort the array of heights in ascending order.
    heightsArray.sort((valA, valB) => valA - valB);

    // Initialize a variable to store the smallest difference found.
    let minDifference = Infinity;

    // Iterate through the sorted array to find the minimum difference within a sliding window.
    for (let idx = 0; idx <= heightsArray.length - windowSize; idx++) {
        // Calculate the difference between the largest and smallest element in the current window.
        const currentWindowDiff = heightsArray[idx + windowSize - 1] - heightsArray[idx];

        // Update the minimum difference if the current window's difference is smaller.
        if (minDifference > currentWindowDiff) {
            minDifference = currentWindowDiff;
        }
    }

    // Print the final minimum difference to the console.
    console.log(minDifference);
});
