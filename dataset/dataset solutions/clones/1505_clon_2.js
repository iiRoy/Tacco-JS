const analyzePairSequences = (rawData) => {
    // This function processes an input string to find a specific pattern.

    // Split the entire input string into an array of individual line strings.
    let inputLines = rawData.split("\n");

    // The first line of the input contains the count of data entries.
    // Convert this string value to an integer for numerical operations.
    let totalDataRecords = parseInt(inputLines[0], 10);

    // Create a new array containing only the data records, excluding the first line.
    let dataRecords = inputLines.slice(1);

    // Map through the data records to extract the first component (before the space) from each line.
    let primaryElements = dataRecords.map(singleRecord => singleRecord.split(" ")[0]);

    // Map through the data records to extract the second component (after the space) from each line.
    let secondaryElements = dataRecords.map(singleRecord => singleRecord.split(" ")[1]);

    // Initialize a counter to track consecutive identical pairs.
    let consecutiveIdenticalCount = 0;

    // Initialize a boolean flag to indicate if the target pattern (three or more consecutive identical pairs) is found.
    let patternDetected = false;

    // Loop through each data record, from the first to the last.
    for (let recordIndex = 0; recordIndex < totalDataRecords; recordIndex++) {
        // Compare the primary and secondary elements of the current record using strict equality.
        if (primaryElements[recordIndex] === secondaryElements[recordIndex]) {
            // If the elements are identical, increment the consecutive identical counter.
            consecutiveIdenticalCount++;

            // Check if the consecutive count has reached or exceeded the threshold of 3.
            if (consecutiveIdenticalCount >= 3) {
                // If the threshold is met, set the pattern detected flag to true.
                patternDetected = true;
            }
        } else {
            // If the elements are not identical, reset the consecutive identical counter.
            consecutiveIdenticalCount = 0;
        }
    }

    // Output the result based on whether the pattern was detected.
    console.log(patternDetected ? "Yes" : "No");
};

// Acquire the 'require' function to load modules.
const moduleLoader = require;

// Load the Node.js 'fs' (file system) module.
const fileSystemModule = moduleLoader("fs");

// Alias the 'readFileSync' method from the file system module for direct use.
const readSynchronousFile = fileSystemModule.readFileSync;

// Read the content from standard input synchronously, using 'utf8' character encoding.
const fileContents = readSynchronousFile("/dev/stdin", "utf8");

// Execute the main analysis function with the content read from the input.
analyzePairSequences(fileContents);