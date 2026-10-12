const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

// Parse the number of initial data entries
let numEntries = parseInt(inputLines[0], 10);

// Initialize an object to store the first set of data
const dataStore = {};

// Loop through the input lines to populate dataStore
for (let idx = 0; idx < numEntries; idx++) {
    // Split each line into temporary parts
    const tempParts = inputLines[1 + idx].split(" ");
    // Create a new entry in dataStore for the current index
    dataStore[idx] = {};
    // Parse and store the first integer value
    dataStore[idx][0] = parseInt(tempParts[0], 10);
    // Parse and store the second integer value
    dataStore[idx][1] = parseInt(tempParts[1], 10);
}

// Increment the index to point to the line containing the number of queries
numEntries++; // This effectively moves 'idx' to the line after the data entries
// Parse the number of queries
const numQueries = parseInt(inputLines[numEntries]);

// Initialize an object to store query details
const queryDetails = {};

// Loop through the input lines to populate queryDetails
for (let queryCounter = 0; queryCounter < numQueries; queryCounter++) {
    // Split each query line into temporary parts
    const tempParts = inputLines[1 + numEntries + queryCounter].split(" ");
    // Create a new entry in queryDetails for the current query counter
    queryDetails[queryCounter] = {};
    // Parse and store the first integer value (adjusted by -1)
    queryDetails[queryCounter][0] = parseInt(tempParts[0], 10) - 1;
    // Parse and store the second integer value
    queryDetails[queryCounter][1] = parseInt(tempParts[1], 10);
}

// Process each query
for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    // Extract the starting 'x' value for the current query
    let currentX = queryDetails[queryIdx][0];
    // Extract the 'L' limit value for the current query
    const limitVal = queryDetails[queryIdx][1];

    // Initialize the result sum for the current query
    let resultSum = 0;
    // Initialize a weight accumulator
    let weightAccumulator = 0;

    // Loop while weightAccumulator is within limitVal, and update currentX
    for (; weightAccumulator <= limitVal; currentX >>= 1) {
        // Add the weight from the dataStore entry to the accumulator
        weightAccumulator += dataStore[currentX][1];
        // If the accumulated weight is still within the limit, add the value
        if (weightAccumulator <= limitVal) {
            resultSum += dataStore[currentX][0];
        }
        // If currentX becomes 0, break the loop to prevent infinite loop
        if (currentX === 0) {
            break;
        }
    }
    // Output the calculated result sum for the current query
    console.log(resultSum);
}
