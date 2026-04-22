function calculateTotalSpanDuration(rawDataString) {
    // A utility function to ensure consistent parsing of integer values, using base 10.
    const parseNumericValue = (str) => parseInt(str, 10);

    // Initial processing of the raw input: split it into individual lines.
    // Any leading or trailing whitespace from the entire input is also removed for robustness.
    const processedLines = rawDataString.trim().split('\n');

    // Perform a basic check to ensure the input contains at least two lines:
    // one for configuration parameters and another for event timestamps.
    if (processedLines.length < 2) {
        console.error("Input processing error: Insufficient data lines provided. Expected at least two.");
        return; // Exit if input format is incorrect.
    }

    // Extract and parse the configuration values from the first line.
    // This includes the total count of events and the standard duration for each event block.
    const configurationElements = processedLines[0].split(' ');
    const totalEventCount = parseNumericValue(configurationElements[0]);
    const standardBlockLength = parseNumericValue(configurationElements[1]);

    // Validate the parsed configuration values to ensure they are valid non-negative numbers.
    if (isNaN(totalEventCount) || isNaN(standardBlockLength) || totalEventCount < 0 || standardBlockLength < 0) {
        console.error("Input validation error: Configuration values are invalid or negative.");
        return;
    }

    // If there are no events to process, the total active time will naturally be zero.
    if (totalEventCount === 0) {
        console.log(0);
        return;
    }

    // Retrieve and prepare the event timestamps from the second line of input.
    const eventTimeStrings = processedLines[1].split(' ');

    // Initialize the accumulator for the total active time and variables
    // to manage the currently consolidating time span.
    let cumulativeActiveTime = 0;
    
    // The first event determines the start of our initial active span.
    const initialEventTimestamp = parseNumericValue(eventTimeStrings[0]);
    if (isNaN(initialEventTimestamp)) {
        console.error("Data error: The very first event timestamp is not a valid number.");
        console.log(0); // Output 0 as a default in case of critical parsing failure.
        return;
    }
    let currentConsolidatedStart = initialEventTimestamp;
    let currentConsolidatedEnd = initialEventTimestamp + standardBlockLength;

    // Iterate through the remaining event timestamps, starting from the second event.
    // The primary objective here is to merge any overlapping or immediately consecutive time blocks.
    for (let currentEventIndex = 1; currentEventIndex < totalEventCount; currentEventIndex++) {
        const currentEventTimestamp = parseNumericValue(eventTimeStrings[currentEventIndex]);

        // Validate each timestamp individually. If an event timestamp is invalid, a warning is logged,
        // and that specific event is skipped to prevent further errors.
        if (isNaN(currentEventTimestamp)) {
            console.warn(`Data warning: Invalid timestamp '${eventTimeStrings[currentEventIndex]}' encountered at event index ${currentEventIndex}. This event will be ignored.`);
            continue; // Move to the next event.
        }

        // Determine if the current event's time block either overlaps with, or directly follows,
        // the current active consolidated span.
        if (currentEventTimestamp <= currentConsolidatedEnd) {
            // If there's an overlap or adjacency, extend the end of the current consolidated span
            // to encompass this new event's block.
            currentConsolidatedEnd = currentEventTimestamp + standardBlockLength;
        } else {
            // If the current event starts strictly after the current consolidated span has fully ended,
            // finalize the current span: calculate its duration and add it to the total accumulator.
            cumulativeActiveTime += (currentConsolidatedEnd - currentConsolidatedStart);
            
            // Then, initiate a brand new consolidated span based on the current event's timing.
            currentConsolidatedStart = currentEventTimestamp;
            currentConsolidatedEnd = currentEventTimestamp + standardBlockLength;
        }
    }

    // After the loop finishes processing all events, the very last active consolidated span
    // also needs to have its duration added to the total.
    cumulativeActiveTime += (currentConsolidatedEnd - currentConsolidatedStart);

    // Output the final calculated total active time to the console.
    console.log(cumulativeActiveTime);
}

// This line handles the standard input/output mechanism.
// It reads all data from the standard input stream, decodes it as UTF-8,
// and then passes this raw string data to our primary processing function.
calculateTotalSpanDuration(require("fs").readFileSync("/dev/stdin", "utf8"));