const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

// Parse the number of initial entries
let numEntries = parseInt(inputLines[0], 10);

// Initialize an object to store the first set of data
const entryData = {};

// Loop through the initial entries to populate entryData
for (let idx = 0; idx < numEntries; idx++) {
    // Split the current line into parts
    const currentLineParts = inputLines[1 + idx].split(" ");
    // Create a new object for the current index
    entryData[idx] = {};
    // Store the first parsed integer at key 0
    entryData[idx][0] = parseInt(currentLineParts[0], 10);
    // Store the second parsed integer at key 1
    entryData[idx][1] = parseInt(currentLineParts[1], 10);
}

// Parse the number of queries, using the current index 'idx' which was incremented in the loop
let numQueries = parseInt(inputLines[idx++], 10);

// Initialize an object to store query details
const queryDetails = {};

// Loop through the query entries to populate queryDetails
for (let queryIdx = 0; queryIdx < numEntries; queryIdx++) {
    // Split the current line into parts
    const currentLineParts = inputLines[1 + idx + queryIdx].split(" ");
    // Create a new object for the current query index
    queryDetails[queryIdx] = {};
    // Store the first parsed integer (decremented by 1) at key 0
    queryDetails[queryIdx][0] = parseInt(currentLineParts[0], 10) - 1;
    // Store the second parsed integer at key 1
    queryDetails[queryIdx][1] = parseInt(currentLineParts[1], 10);
}

// Process each query
for (let idx = 0; idx < numQueries; idx++) {
    // Get the starting 'x' value for the current query
    let currentX = queryDetails[idx][0];
    // Get the 'L' limit value for the current query
    const limitVal = queryDetails[idx][1];

    // Initialize the total accumulated value for this query
    let totalValue = 0;
    // Initialize the accumulated weight sum
    let weightSum = 0;

    // Loop while the accumulated weight is within the limit and 'x' is valid
    for (let loopCounter = 0; loopCounter <= limitVal; currentX >>= 1) {
        // Add the weight of the current 'x' entry to the sum
        weightSum += entryData[currentX][1];
        // If the new weight sum is still within the limit, add the value
        if (weightSum <= limitVal) {
            totalValue += entryData[currentX][0];
        }
        // If 'x' becomes 0, we've reached the root, so break
        if (currentX === 0) {
            break;
        }
    }
    // Output the calculated total value for the current query
    console.log(totalValue);
}
