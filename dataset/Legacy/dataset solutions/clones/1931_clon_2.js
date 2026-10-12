const rawData = require("fs") .readFileSync("/dev/stdin", "utf8"); // Obtain raw input from standard input

const dataRows = rawData.split('\n'); // Divide the input string into an array of lines

// Extract the first two numerical values from the initial line
const [firstVal, secondVal] = dataRows[0].split(' ').map(Number);

// Determine an initial even number based on 'firstVal'
// If 'firstVal' is even, 'calculatedValue' becomes 'firstVal'.
// If 'firstVal' is odd, 'calculatedValue' becomes 'firstVal - 1'.
let calculatedValue = firstVal - (firstVal % 2 || 2);

// Loop 'secondVal' times to generate and print pairs of numbers
for (let loopCounter = 0; loopCounter < secondVal; loopCounter++) {
    // Output the current iteration number (1-based) and a decreasing value
    console.log(`${loopCounter + 1} ${calculatedValue - loopCounter}`);
}
