// This script processes numerical data from standard input to perform a specific validation check.

const fileSystemUtility = require('fs'); // Obtain file system module for I/O operations
const sourcePath = '/dev/stdin';         // Define the standard input file path for reading
const textEncoding = 'utf8';              // Specify the character encoding for input data

let rawInputContent = fileSystemUtility.readFileSync(sourcePath, textEncoding); // Read the entire content from the specified source

let processedLineSegments = rawInputContent
  .trim()                               // Remove leading and trailing whitespace from the raw content
  .split("\n");                         // Split the content into an array of individual lines

// Main processing loop: continues indefinitely until an explicit break condition is met
for ( ; ; ) {
    let itemCount = Number(processedLineSegments.shift()); // Extract the first line, convert it to a number, and use as item count

    // Terminate the processing loop if the extracted item count is zero
    if (itemCount === 0)
        break;

    let operationStatus = "SUCCESS"; // Initialize the status indicator for the current batch of items
    let measurementRecords = [];     // Declare an array to store parsed measurement records

    // Loop to read and parse 'itemCount' number of records from the input lines
    for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
        let currentRecord = processedLineSegments
          .shift()                                // Get the next line from the processed segments
          .split(" ")                             // Split the line by spaces into an array of strings
          .map(valueString => Number(valueString)); // Convert each string part to a numeric value
        measurementRecords.push(currentRecord);   // Add the fully parsed numeric record to the collection
    }

    operationStatus = "SUCCESS"; // Re-initialize the status indicator before starting the validation phase

    // Nested loops for applying the core validation logic to the measurement records
    for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
        // If a failure has already been detected for the current batch, skip further checks
        if (operationStatus === "FAILURE")
            break; // Exit the outer loop for this batch

        let currentWeight = measurementRecords[outerIndex][0];     // Extract the primary weight from the current record
        let currentLowerBound = measurementRecords[outerIndex][1]; // Extract the lower bound from the current record
        let currentUpperBound = measurementRecords[outerIndex][2]; // Extract the upper bound from the current record

        for (let innerIndex = 0; innerIndex < itemCount; innerIndex++) {
            // Skip comparison of a record with itself to avoid redundant checks
            if (outerIndex === innerIndex)
                continue; // Move to the next inner loop iteration

            let comparedWeight = measurementRecords[innerIndex][0];     // Extract the weight of the record being compared
            let comparedLowerBound = measurementRecords[innerIndex][1]; // Extract the lower bound of the compared record
            let comparedUpperBound = measurementRecords[innerIndex][2]; // Extract the upper bound of the compared record

            // Check for an overlap condition between the current and compared records' bounds
            if (currentUpperBound <= comparedLowerBound && currentLowerBound <= comparedUpperBound) {
                currentWeight += comparedWeight; // If overlap exists, accumulate the compared weight to the current weight
            }

            // After potential accumulation, check if the total current weight exceeds a predefined limit
            if (currentWeight > 150) {
                operationStatus = "FAILURE"; // Set the status to failure if the limit is exceeded
                // Note: This does not break the inner loop, maintaining the original control flow.
            }
        }
    }

    console.log(operationStatus); // Output the final status (SUCCESS or FAILURE) for the processed batch
}