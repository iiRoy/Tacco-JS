function ProcessInput(rawData) {
    // This function takes raw input string and processes it according to specific rules.

    // Split the entire raw input string into an array of lines.
    let parsedLines = rawData.split('\n');

    // The first line contains the total number of items, stored as a constant.
    const itemCount = parsedLines[0];

    // The second line contains space-separated item values, which are then split into an array.
    const itemValues = parsedLines[1].split(' ');

    // An object to store the frequency count of each unique item value.
    const valueCounts = {};

    // Iterate through the item values to populate the frequency map.
    for (let k = 0; k < itemCount; k++) {
        let currentValue = itemValues[k]; // Get the current item's value.
        // If the value is encountered for the first time, initialize its count to 1; otherwise, increment its existing count.
        valueCounts[currentValue] = (valueCounts[currentValue] === undefined)
            ? 1
            : valueCounts[currentValue] + 1;
    }

    // Perform a specific check on item counts, iterating backwards by two from itemCount - 1.
    for (let k = itemCount - 1; k > 0; k -= 2) {
        // If any item at index 'k' does not have a count of exactly 2, then output 0 and terminate.
        if (valueCounts[k] !== 2) {
            console.log(0);
            return; // Exit the function early.
        }
    }

    // If all checks pass, calculate the final result: 2 raised to the power of (itemCount divided by 2, floored).
    console.log(Math.pow(2, Math.floor(itemCount / 2)));
}

// The following section handles reading input from a file and invoking the main processing logic.
// This line is a commented-out example of how file input might be handled.
// var fileData = require("fs").readFileSync("hoge.txt", "utf8");

// Read the content of the file named 'hoge.txt' synchronously using Node.js's 'fs' module.
let fileData = require('fs').readFileSync('hoge.txt', 'utf8');

// Call the main processing function with the data read from the file.
ProcessInput(fileData);
