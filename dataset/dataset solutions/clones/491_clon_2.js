// This program reads input from standard input, processes it in chunks,
// and performs a specific validation check based on numerical ranges and sums.

var rawText = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw content from the file system.
var lineFragments = (rawText.trim()).split("\n");               // Split the trimmed raw content into an array of lines.

// Enter an infinite loop to process multiple datasets until a termination condition is met.
while (true) {
    // Extract the number of records for the current dataset.
    // The '- 0' trick converts the string to a number.
    var recordCount = lineFragments.shift() - 0;

    // Check if the record count is zero, which signals the end of input.
    if (recordCount === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize a status variable for the current dataset.
    // It's set to "OK" by default, assuming validity until proven otherwise.
    var validationOutcome = "OK";

    // Create an empty array to store the parsed numerical data records.
    var dataRecords = [];

    // Iterate 'recordCount' times to parse and store each record.
    for (var primaryIdx = 0; primaryIdx < recordCount; primaryIdx++) {
        // Each line is split by space and its elements are converted to floating-point numbers.
        var currentRecordData = (lineFragments.shift()).split(" ").map(parseFloat);
        dataRecords.push(currentRecordData); // Add the processed record to our collection.
    }

    // Re-initialize the validation outcome. This structure is preserved from the original.
    validationOutcome = "OK";

    // Begin the core validation logic, iterating through each record as a primary focus.
    for (var primaryIdx = 0; primaryIdx < recordCount; primaryIdx++) {
        // If the validation has already failed for this dataset, no further checks are needed.
        if (validationOutcome === "NG") {
            break; // Break out of the outer loop.
        }

        // Extract the three components of the current primary record.
        // These represent a weight/value and a numerical range.
        var totalWeight = dataRecords[primaryIdx][0];
        var rangeStart = dataRecords[primaryIdx][1];
        var rangeEnd = dataRecords[primaryIdx][2];

        // Compare the current primary record with every other record in the dataset.
        for (var secondaryIdx = 0; secondaryIdx < recordCount; secondaryIdx++) {
            // Skip self-comparison; a record should not be compared with itself.
            if (primaryIdx === secondaryIdx) {
                continue; // Move to the next secondary record.
            }

            // Extract the range components from the secondary record for overlap checking.
            var otherRangeStart = dataRecords[secondaryIdx][1];
            var otherRangeEnd = dataRecords[secondaryIdx][2];

            // Determine if there is an overlap between the primary and secondary ranges.
            // An overlap exists if the primary range starts before the secondary ends,
            // AND the primary range ends after the secondary starts.
            if (rangeStart < otherRangeEnd && rangeEnd > otherRangeStart) {
                // If an overlap is detected, accumulate the weight/value from the secondary record.
                totalWeight += dataRecords[secondaryIdx][0];
            }

            // After potential accumulation, check if the 'totalWeight' exceeds a critical threshold.
            if (totalWeight > 150) {
                validationOutcome = "NG"; // If the threshold is exceeded, mark the dataset as "NG".
            }
        }
    }

    // Output the final validation status for the current dataset to the console.
    console.log(validationOutcome);
}