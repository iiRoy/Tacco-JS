const parseTimeComponents = (timeStringValue) => {
    // Perform basic validation on the input string
    if (typeof timeStringValue !== 'string' || !timeStringValue.includes(':')) {
        // In a production system, this might throw an error or log a detailed warning.
        // For cloning, we'll return a default safe value.
        console.error(`Invalid time string format encountered: "${timeStringValue}". Defaulting to 00:00.`);
        return [0, 0];
    }
    const timeParts = timeStringValue.split(':');
    if (timeParts.length !== 2) {
        console.error(`Unexpected number of parts in time string: "${timeStringValue}". Defaulting to 00:00.`);
        return [0, 0];
    }

    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Validate parsed integer values
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error(`Time components out of valid range (HH:0-23, MM:0-59) for "${timeStringValue}". Defaulting to 00:00.`);
        return [0, 0];
    }
    return [hours, minutes];
};

const convertTimePartsToTotalMinutes = (timePartsArray) => {
    // Ensure the input is a valid array of two numbers
    if (!Array.isArray(timePartsArray) || timePartsArray.length !== 2 ||
        typeof timePartsArray[0] !== 'number' || typeof timePartsArray[1] !== 'number' ||
        isNaN(timePartsArray[0]) || isNaN(timePartsArray[1])) {
        console.error(`Invalid time parts array for minute conversion:`, timePartsArray, `. Returning 0 minutes.`);
        return 0; // Return 0 minutes for invalid input
    }
    const [hours, minutes] = timePartsArray;
    return (hours * 60) + minutes;
};

// --- Main application logic starts here ---

// Fetch the raw content from the standard input stream
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: trim whitespace and split into individual lines.
// Filter out any lines that become empty after trimming, to prevent issues with malformed input.
let dataLineBuffer = rawInputContent
    .trim()
    .split('\n')
    .filter(line => line.length > 0); // Remove any completely empty lines

let processingBlockCounter = 0; // Helper variable to track processed blocks

// Loop through the dataLineBuffer as long as there are lines remaining to process.
// Each iteration of this outer loop processes one "block" or "case" of data.
while (dataLineBuffer.length > 0) {
    processingBlockCounter++;
    // This array will hold the results for the current block of data
    const qualifyingTimeIntervalRecords = [];

    // Extract the configuration line for the current block (N T values)
    const currentConfigLine = dataLineBuffer.shift();
    if (!currentConfigLine) {
        console.warn(`Unexpected empty configuration line for block ${processingBlockCounter}. Skipping.`);
        continue;
    }
    const configParameters = currentConfigLine.split(' ').map(Number);

    // Destructure configuration parameters and add robust validation
    if (configParameters.length < 2 || isNaN(configParameters[0]) || isNaN(configParameters[1])) {
        console.error(`Malformed configuration line for block ${processingBlockCounter}: "${currentConfigLine}". Expected "N T". Skipping this block.`);
        // To properly skip, we'd need to know N. Since we can't parse it, we just continue.
        continue;
    }
    const [numberOfScheduleEntries, minimumTimeGapThreshold] = configParameters;

    // Variables to store the end time and label from the *previous* schedule entry.
    // These are crucial for comparing a current entry's start time with the previous entry's end time.
    let previousEntryEndTimeParts = null;
    let previousEntryIdentifier = null;

    // Iterate through the specified number of schedule entries for the current block
    for (let entryIdx = 0; entryIdx < numberOfScheduleEntries; entryIdx++) {
        const currentScheduleEntryLine = dataLineBuffer.shift();
        if (!currentScheduleEntryLine) {
            console.error(`Input exhausted prematurely for block ${processingBlockCounter}. Expected ${numberOfScheduleEntries} entries, but only found ${entryIdx}.`);
            break; // Exit the inner loop if lines run out
        }

        // Split the current entry line into its distinct components
        const entryDataSegments = currentScheduleEntryLine.split(' ');
        // Validate that the entry line has the expected number of segments
        if (entryDataSegments.length < 4) {
            console.warn(`Incomplete data line for block ${processingBlockCounter}, entry ${entryIdx + 1}: "${currentScheduleEntryLine}". Skipping this entry.`);
            // Skipping means we don't update previousEntryEndTimeParts or previousEntryIdentifier,
            // which might lead to incorrect comparisons for the *next* valid entry.
            // This behavior mimics the original's lack of explicit error handling for malformed lines.
            continue;
        }

        // Parse the start time for the current schedule entry
        const currentEntryStartHourMinute = parseTimeComponents(entryDataSegments[0]);
        const currentEntryStartTimeInMinutes = convertTimePartsToTotalMinutes(currentEntryStartHourMinute);

        // Only perform comparison if this is not the very first entry (i.e., previous data exists)
        if (entryIdx > 0) {
            // Ensure we have valid previous data before attempting a comparison
            if (previousEntryEndTimeParts && previousEntryIdentifier !== null) {
                const previousEntryEndTimeInMinutes = convertTimePartsToTotalMinutes(previousEntryEndTimeParts);
                const calculatedTimeDifference = currentEntryStartTimeInMinutes - previousEntryEndTimeInMinutes;

                // If the time difference meets or exceeds the defined threshold, record it
                if (calculatedTimeDifference >= minimumTimeGapThreshold) {
                    qualifyingTimeIntervalRecords.push(`${previousEntryIdentifier} ${calculatedTimeDifference}`);
                }
            } else {
                console.warn(`Previous entry's end time or identifier was unexpectedly null for block ${processingBlockCounter}, entry ${entryIdx + 1}. Comparison skipped.`);
            }
        }

        // Update the 'previous' data variables with information from the *current* entry
        // These values will be used in the next iteration for comparison.
        previousEntryEndTimeParts = parseTimeComponents(entryDataSegments[2]);
        previousEntryIdentifier = entryDataSegments[3];
    }

    // Output the total count of qualifying intervals found for the current data block
    console.log(qualifyingTimeIntervalRecords.length);

    // If there are any records, iterate through them and print each one
    if (qualifyingTimeIntervalRecords.length > 0) {
        qualifyingTimeIntervalRecords.forEach(recordDetails => {
            console.log(recordDetails);
        });
    }

    // Optional: Add a separator between outputs of different processing blocks for clarity
    // if (dataLineBuffer.length > 0) {
    //     console.log("--- End of Block " + processingBlockCounter + " ---");
    // }
}

// End of script execution.