// This script is designed to categorize and count blood types from standard input.
// It reads raw data, processes each line, and then outputs the total for each type.

// Acquire the file system utility module for input operations.
let fileSystemModule = require('fs');

// Read the complete data stream from the standard input device.
// The data is expected to be encoded in UTF-8 format.
let incomingDataString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Pre-process the acquired string: remove any leading/trailing whitespace,
// then divide it into an array of distinct lines based on newline characters.
let parsedInputLines = incomingDataString.trim().split("\n");

// Initialize an array to hold the cumulative counts for each blood group.
// The order corresponds to A, B, AB, and O types respectively.
let groupCounters = [0, 0, 0, 0]; // Index 0: Type A, Index 1: Type B, Index 2: Type AB, Index 3: Type O

// Iterate through each individual line that was extracted from the input.
parsedInputLines.forEach(function(currentEntryLine)
{
    // For every line, split it into component fields using a comma as the delimiter.
    let lineSegments = currentEntryLine.split(",");

    // Evaluate the second field (at index 1) to ascertain the blood type.
    if (lineSegments[1] === "A") {
        groupCounters[0]++; // Increment the count for 'A' type.
    }

    if (lineSegments[1] === "B") {
        groupCounters[1]++; // Increment the count for 'B' type.
    }

    if (lineSegments[1] === "AB") {
        groupCounters[2]++; // Increment the count for 'AB' type.
    }

    if (lineSegments[1] === "O") {
        groupCounters[3]++; // Increment the count for 'O' type.
    }
});

// Display the final tally for each blood type to the console.
console.log(groupCounters[0]); // Print the total count for blood type A.
console.log(groupCounters[1]); // Print the total count for blood type B.
console.log(groupCounters[2]); // Print the total count for blood type AB.
console.log(groupCounters[3]); // Print the total count for blood type O.