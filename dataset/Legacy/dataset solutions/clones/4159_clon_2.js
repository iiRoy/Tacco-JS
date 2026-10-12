let inputData = []; // Collection for storing each line read from standard input.

const ioHandler = require('readline'); // Import the 'readline' module for interactive input.

const inputReader = ioHandler.createInterface({
    input: process.stdin, // Configure the interface to read from standard input.
    output: process.stdout, // Configure the interface to write to standard output (though not used for writing here).
});

inputReader.on('line', function (currentLine) {
    inputData.push(currentLine); // Append each received line to our input data array.
});

inputReader.on('close', () => { // This event fires when the input stream has ended.
    const itemCount = Number(inputData[0]); // Parse the first line as the total count of elements.
    const dataArray = inputData[1].split(" ").map(numVal => Number(numVal)); // Parse the second line, splitting by space and converting each part to a number.

    let frequencyMap = {}; // Initialize an object to count occurrences of each number.
    for (const numVal of dataArray) { // Iterate through each numeric value in the data array.
        if (frequencyMap[numVal] === undefined) {
            frequencyMap[numVal] = 0; // If a number is encountered for the first time, initialize its count to zero.
        }
        frequencyMap[numVal]++; // Increment the count for the current number.
    }

    let resultSum = 0; // Initialize a variable to store the final calculated sum.
    Object.keys(frequencyMap).forEach(keyStr => { // Loop through each unique number (as a string key) found in the frequency map.
        const currentNum = Number(keyStr); // Convert the string key back to its numeric value.

        // The core logic: if the number itself is not equal to its frequency in the array.
        if (currentNum !== frequencyMap[currentNum]) {
            // If the number is less than its frequency, we need to reduce the frequency.
            // The amount to add to the sum is the excess frequency.
            if (currentNum < frequencyMap[currentNum]) {
                resultSum += frequencyMap[currentNum] - currentNum;
            }
            // If the number is greater than its frequency, we need to remove all occurrences of this number.
            // The amount to add to the sum is simply its frequency.
            else {
                resultSum += frequencyMap[currentNum];
            }
        }
    });

    console.log(resultSum); // Print the final computed sum to standard output.
});
