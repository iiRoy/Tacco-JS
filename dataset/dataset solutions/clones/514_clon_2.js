let incomingData = require('node:fs') . readFileSync ( '/dev/stdin' , 'utf-8' ) ; // Obtain raw text input from standard input stream

const lineSegments = (incomingData.trim()).split('\n'); // Split the input into an array of lines

while (true) { // Main processing loop for each test case
    // Retrieve the first number from the current line segment, converting it to an integer
    let currentCount = parseInt(lineSegments.shift(), 10);

    // If the retrieved count is zero, it signifies the end of input, so break the loop
    if (currentCount === 0) {
        break;
    }

    // Parse the next line for primary values, splitting by space and mapping to numbers
    const primaryValues = lineSegments.shift().split(' ').map(numericString => Number(numericString));

    // Parse the subsequent line for secondary values, splitting by space and converting to floats
    const secondaryValues = lineSegments.shift().split(' ').map(str => parseFloat(str));

    // Calculate the initial sum of all primary values using a reducer function
    let totalPrimarySum = primaryValues.reduce((accumulated, current) => accumulated + current, 0);

    // Sort the secondary values in descending order for subsequent processing
    secondaryValues.sort((valueA, valueB) => valueB - valueA);

    // Initialize the maximum possible value based on the initial sum and count
    let maximumPossibleValue = totalPrimarySum * currentCount;

    while (true) { // Inner loop to process secondary values
        // Check if there are no more secondary values left to process
        if (secondaryValues.length === 0) {
            break; // Exit the inner loop if the array is empty
        }

        // Decrement the counter for the current scenario
        currentCount--;

        // Calculate a new potential maximum value and update if it's greater
        maximumPossibleValue = Math.max(maximumPossibleValue, (totalPrimarySum + secondaryValues.shift()) * currentCount);
    }

    // Output the final calculated maximum value for the current test case
    console.log(maximumPossibleValue);
}