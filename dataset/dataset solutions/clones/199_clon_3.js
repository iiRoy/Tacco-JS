// This module facilitates file system operations, essential for input reading.
const fileSystemUtility = require('fs');

// Define the standard input stream path where data is expected.
const standardInputSource = '/dev/stdin';

// Define string constants for each recognized blood group.
// Using constants improves readability and reduces magic strings.
const BLOOD_GROUP_TYPE_A = 'A';
const BLOOD_GROUP_TYPE_B = 'B';
const BLOOD_GROUP_TYPE_AB = 'AB';
const BLOOD_GROUP_TYPE_O = 'O';

// Initialize a data structure (Map) to store tallies for each blood group.
// A Map is used here for better extensibility and explicit key-value pairing
// compared to a fixed-index array.
const observedBloodGroupTallies = new Map([
    [BLOOD_GROUP_TYPE_A, 0],
    [BLOOD_GROUP_TYPE_B, 0],
    [BLOOD_GROUP_TYPE_AB, 0],
    [BLOOD_GROUP_TYPE_O, 0]
]);

// Attempt to read the entire content from the specified standard input path synchronously.
// A try-catch block is added for robust error handling during file access.
let rawStreamContent;
try {
    rawStreamContent = fileSystemUtility.readFileSync(standardInputSource, 'utf8');
} catch (fileReadError) {
    // If reading fails, log an error message and terminate the process.
    console.error(`ERROR: Unable to access or read data from ${standardInputSource}. Details: ${fileReadError.message}`);
    process.exit(1); // Exit with a non-zero code to indicate failure.
}

// Pre-process the raw input content:
// 1. Trim any leading or trailing whitespace from the entire content.
// 2. Split the content into an array of individual lines, using newline as a delimiter.
const processedInputRecords = rawStreamContent.trim().split('\n');

// Implement a guard clause to check if any meaningful data records were obtained.
// This prevents unnecessary processing if the input was empty or only contained whitespace.
if (processedInputRecords.length === 0 || (processedInputRecords.length === 1 && processedInputRecords[0] === '')) {
    console.warn("WARNING: No valid data records were found in the input. All blood group counts will remain zero.");
    // In this scenario, we proceed to output zeros, which is functionally equivalent to the original.
} else {
    // Iterate through each processed line to extract and tally blood group information.
    // Using a for...of loop offers a clear and modern way to iterate over array elements.
    for (const currentRecordLine of processedInputRecords) {
        // Skip any lines that are empty or contain only whitespace after trimming.
        if (currentRecordLine.trim() === '') {
            continue;
        }

        // Split the current record line by the comma delimiter to separate components.
        const recordComponents = currentRecordLine.split(',');

        // Validate the structure of the record line. We expect at least two parts:
        // typically an identifier and the blood group.
        if (recordComponents.length < 2) {
            console.warn(`NOTICE: Malformed data line encountered: "${currentRecordLine}". Expected at least two comma-separated values. This line will be skipped.`);
            continue; // Move to the next line if the current one is improperly formatted.
        }

        // Extract the blood group string, trim any surrounding whitespace,
        // and convert it to uppercase for consistent and case-insensitive matching.
        const identifiedGroup = recordComponents[1].trim().toUpperCase();

        // Increment the tally for the identified blood group if it's one of the recognized types.
        if (observedBloodGroupTallies.has(identifiedGroup)) {
            const currentCount = observedBloodGroupTallies.get(identifiedGroup);
            observedBloodGroupTallies.set(identifiedGroup, currentCount + 1);
        } else {
            // Log a warning if an unknown or unexpected blood group is found.
            console.warn(`NOTICE: Unrecognized blood group "${identifiedGroup}" found in line: "${currentRecordLine}". This particular entry will not be included in the final counts.`);
        }
    }
}

// Output the final computed counts for each blood group.
// The order of output is maintained as per the original code's implicit order.
console.log(observedBloodGroupTallies.get(BLOOD_GROUP_TYPE_A));
console.log(observedBloodGroupTallies.get(BLOOD_GROUP_TYPE_B));
console.log(observedBloodGroupTallies.get(BLOOD_GROUP_TYPE_AB));
console.log(observedBloodGroupTallies.get(BLOOD_GROUP_TYPE_O));

// The program concludes after printing the results.