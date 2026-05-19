const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
let lineCollection = (rawData.trim()).split("\n");

// The first line indicates the number of subsequent lines to process
const lineCount = lineCollection.shift();

// Iterate through each specified line
for (let idx = 0; idx < lineCount; idx++) {
    // Convert the current line into an array of numbers (digits)
    let digitArray = lineCollection[idx].split("").map(Number);

    // Sort the digits in descending order to form the largest possible number
    digitArray.sort(function(valA, valB) {
        return valB - valA;
    });
    const maxNumStr = digitArray.join(""); // Convert the sorted digits back to a string

    // Sort the digits in ascending order to form the smallest possible number
    digitArray.sort(function(valX, valY) {
        return valX - valY;
    });
    const minNumStr = digitArray.join(""); // Convert the sorted digits back to a string

    // Calculate and print the difference between the two numbers
    console.log(parseInt(maxNumStr, 10) - parseInt(minNumStr, 10));
}
