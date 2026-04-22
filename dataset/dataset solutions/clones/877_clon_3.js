const extractTimeComponents = (timeStringValue) => {
    // Helper function to parse a time string "HH:MM" into its hour and minute parts.
    // Includes a basic validation for format.
    const timeParts = timeStringValue.split(':');
    if (timeParts.length !== 2 || isNaN(Number(timeParts[0])) || isNaN(Number(timeParts[1]))) {
        console.warn(`Warning: Invalid time format encountered: "${timeStringValue}". Defaulting to 00:00.`);
        return { hour: 0, minute: 0 };
    }
    return {
        hour: Number(timeParts[0]),
        minute: Number(timeParts[1])
    };
};

const convertToAbsoluteMinutes = (timeObject) => {
    // Helper function to convert a time object { hour, minute } into total minutes from midnight.
    return timeObject.hour * 60 + timeObject.minute;
};

// Read the entire standard input as a UTF-8 string.
const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace from start/end of the whole string,
// then split into individual lines. Filter out any completely empty lines.
let inputRecordBatches = sourceData.trim().split('\n').filter(line => line.length > 0);

// Main processing loop: continues as long as there are data batches to process.
while (inputRecordBatches.length > 0) {
    // This array will store the identified time intervals (gaps) for the current batch.
    const detectedTimeIntervals = [];

    // Extract the configuration line (N and T) for the current batch.
    const configLineRaw = inputRecordBatches.shift();

    // Guard clause: If for some reason the configuration line is missing, break the loop.
    if (!configLineRaw) {
        console.error("Error: Expected configuration line but none found. Terminating batch processing.");
        break;
    }

    const batchConfiguration = configLineRaw.split(' ').map(Number);

    // Validate the configuration line: must have two numbers (N and T).
    if (batchConfiguration.length < 2 || isNaN(batchConfiguration[0]) || isNaN(batchConfiguration[1])) {
        console.error(`Error: Malformed configuration line: "${configLineRaw}". Skipping current batch.`);
        // To continue processing subsequent batches, we could 'continue' here,
        // but for now, we'll break if a config is critically malformed.
        break;
    }

    const numberOfRecords = batchConfiguration[0]; // N: Number of data records to follow.
    const minimumGapDuration = batchConfiguration[1]; // T: Minimum duration for a gap to be considered.

    // This variable will hold the end time of the *previous* record, in minutes.
    // It's initialized to null to correctly handle the first record (which has no preceding record).
    let lastProcessedEndTimeInMinutes = null;

    // Loop through each record line as specified by 'numberOfRecords'.
    for (let recordIndex = 0; recordIndex < numberOfRecords; recordIndex++) {
        const currentRecordLine = inputRecordBatches.shift();

        // Guard clause: Ensure we don't run out of record lines prematurely.
        if (!currentRecordLine) {
            console.error(`Error: Expected ${numberOfRecords} records but only found ${recordIndex}. Aborting current batch.`);
            break; // Exit the inner loop for the current batch.
        }

        const currentRecordParts = currentRecordLine.split(' ');

        // Basic validation for the record line format.
        // Original code expects at least 4 parts: startTime, some_data, endTime, label.
        if (currentRecordParts.length < 4) {
            console.warn(`Warning: Malformed record line encountered: "${currentRecordLine}". Skipping this record.`);
            continue; // Skip to the next record in the loop.
        }

        // Parse the start time of the current record.
        const currentStartTimeComponents = extractTimeComponents(currentRecordParts[0]);
        const currentMinutesTotal = convertToAbsoluteMinutes(currentStartTimeComponents);

        // Calculate the time difference only if this is not the first record
        // and a previous end time has been established.
        if (recordIndex > 0 && lastProcessedEndTimeInMinutes !== null) {
            const timeDifferenceBetweenRecords = currentMinutesTotal - lastProcessedEndTimeInMinutes;

            // If the calculated difference meets or exceeds the threshold, add it to our collection.
            if (timeDifferenceBetweenRecords >= minimumGapDuration) {
                const recordIdentifier = currentRecordParts[3]; // The label associated with this record.
                detectedTimeIntervals.push(`${recordIdentifier} ${timeDifferenceBetweenRecords}`);
            }
        }

        // Parse the end time of the *current* record. This value will become
        // 'lastProcessedEndTimeInMinutes' for the *next* iteration.
        const currentEndTimeComponents = extractTimeComponents(currentRecordParts[2]);
        lastProcessedEndTimeInMinutes = convertToAbsoluteMinutes(currentEndTimeComponents);
    }

    // Output the results for the current batch.
    if (detectedTimeIntervals.length === 0) {
        console.log(0); // No significant gaps found.
    } else {
        console.log(detectedTimeIntervals.length); // Print the count of detected gaps.
        // Iterate and print each detected gap using a modern for...of loop.
        for (const intervalEntry of detectedTimeIntervals) {
            console.log(intervalEntry);
        }
    }
}