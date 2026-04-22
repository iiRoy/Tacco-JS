const fileSystemModule = require('fs'); // Explicitly import the 'fs' module
const MAXIMUM_ACCUMULATED_WEIGHT_THRESHOLD = 150; // Defined a constant for the magic number

/**
 * Parses a string line containing space-separated numbers into an array of integers.
 * Includes basic validation and error handling for non-numeric segments.
 * @param {string} inputLine - The string line to parse.
 * @returns {number[]} An array of parsed numbers.
 */
function parseNumericSegmentLine(inputLine) {
    if (typeof inputLine !== 'string' || inputLine.trim().length === 0) {
        // Optionally, throw an error or return an empty array for invalid input
        // For this clone, we'll return an empty array and log a warning.
        console.warn("Attempted to parse an empty or non-string line. Returning empty array.");
        return [];
    }

    // Split the line by spaces and convert each part to an integer
    return inputLine.split(" ").map(segment => {
        const numericValue = parseInt(segment.trim(), 10);
        // If conversion results in NaN, default to 0 to prevent errors
        // This is a slight change in error handling behavior compared to implicit Number() conversion
        if (isNaN(numericValue)) {
            console.warn(`Non-numeric data found in segment '${segment}'. Defaulting to 0.`);
            return 0;
        }
        return numericValue;
    });
}

/**
 * Determines if two given intervals [start1, end1) and [start2, end2) overlap.
 * The original condition was A < b && B > a.
 * @param {number} interval1Start - The starting point of the first interval.
 * @param {number} interval1End - The ending point of the first interval.
 * @param {number} interval2Start - The starting point of the second interval.
 * @param {number} interval2End - The ending point of the second interval.
 * @returns {boolean} True if the intervals overlap, false otherwise.
 */
function checkIntervalOverlap(interval1Start, interval1End, interval2Start, interval2End) {
    // Intervals overlap if the start of one is before the end of the other,
    // AND the end of the one is after the start of the other.
    return (interval1Start < interval2End && interval1End > interval2Start);
}


// --- Main application logic starts here ---
try {
    // Read all raw content from the standard input as a UTF-8 string.
    const rawContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Trim leading/trailing whitespace and split the content into an array of lines.
    const inputDataLines = rawContentBuffer.trim().split("\n");

    let currentLineCursor = 0; // A pointer to track the current line being processed in inputDataLines.

    // Outer loop to process multiple data sets until a termination condition is met.
    while (true) {
        // Fetch the line indicating the size of the current data set.
        // Use the cursor to get the line and then advance the cursor.
        const sizeDescriptorLine = inputDataLines[currentLineCursor++];

        // Parse the size descriptor into an integer.
        // Explicitly using parseInt for robustness.
        const currentDataSetSize = parseInt(sizeDescriptorLine, 10);

        // If the parsed size is zero, it indicates the end of input data, so break the loop.
        if (currentDataSetSize === 0) {
            // console.log("Processing complete: Encountered zero-sized data set."); // Optional debug message
            break;
        }

        // Initialize the operational status for the current data set.
        let dataSetOperationalStatus = "STATUS_OK"; // Renamed the flag for clarity.

        // An array to hold the parsed measurement items for the current data set.
        const measurementRecords = []; // Renamed 'mab' to 'measurementRecords'.

        // Populate the measurement records array based on the current data set size.
        for (let recordIndex = 0; recordIndex < currentDataSetSize; recordIndex++) {
            // Get the next line from input and parse it using the helper function.
            const recordLine = inputDataLines[currentLineCursor++];
            const parsedRecord = parseNumericSegmentLine(recordLine);
            measurementRecords.push(parsedRecord);
        }

        // Iterate through each measurement record to perform overlap and weight aggregation checks.
        for (let primaryRecordIndex = 0; primaryRecordIndex < currentDataSetSize; primaryRecordIndex++) {
            // If the status is already "OVERLOADED", no further checks are needed for this data set.
            if (dataSetOperationalStatus === "OVERLOADED") {
                break; // Exit the outer loop early.
            }

            const primaryRecord = measurementRecords[primaryRecordIndex];
            let accumulatedWeight = primaryRecord[0]; // 'W' - current item's weight + overlapping weights.
            const primaryStartCoordinate = primaryRecord[1]; // 'A' - start coordinate of the primary item.
            const primaryEndCoordinate = primaryRecord[2];   // 'B' - end coordinate of the primary item.

            // Iterate through all other records to check for overlaps with the primary record.
            for (let secondaryRecordIndex = 0; secondaryRecordIndex < currentDataSetSize; secondaryRecordIndex++) {
                // Skip comparison if it's the same record.
                if (primaryRecordIndex === secondaryRecordIndex) {
                    continue;
                }

                const secondaryRecord = measurementRecords[secondaryRecordIndex];
                const secondaryStartCoordinate = secondaryRecord[1]; // 'a' - start coordinate of the secondary item.
                const secondaryEndCoordinate = secondaryRecord[2];   // 'b' - end coordinate of the secondary item.

                // Use the helper function to determine if the intervals overlap.
                if (checkIntervalOverlap(primaryStartCoordinate, primaryEndCoordinate, secondaryStartCoordinate, secondaryEndCoordinate)) {
                    // If an overlap is detected, add the secondary record's weight to the accumulated weight.
                    const additionalWeight = secondaryRecord[0]; // Intermediate variable for clarity.
                    accumulatedWeight += additionalWeight;

                    // Immediately check if the accumulated weight exceeds the predefined threshold.
                    if (accumulatedWeight > MAXIMUM_ACCUMULATED_WEIGHT_THRESHOLD) {
                        dataSetOperationalStatus = "OVERLOADED"; // Update status.
                        break; // Exit the inner loop as overload condition is met for this primary record.
                    }
                }
            }
        }
        // Output the final status for the current data set.
        // Changed "NG" to "OVERLOADED" to be more descriptive.
        console.log(dataSetOperationalStatus === "OVERLOADED" ? "NG" : "OK");
    }

} catch (processingError) {
    // Catch and log any errors that occur during file reading or processing.
    console.error("An unexpected error occurred during the main processing flow:", processingError.message);
    // Optionally, terminate the process with an error code.
    process.exit(1);
}

// End of Type III cloned code.