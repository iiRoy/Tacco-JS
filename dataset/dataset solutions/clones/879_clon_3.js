(function(sourceDataString) {
    // --- Configuration and Constants for parsing and processing ---
    const TIME_DELIMITER_CHAR = ':'; // Separator for hours and minutes in time strings
    const DATA_FIELD_SEPARATOR_CHAR = ' '; // Separator for fields within each input record
    // A very large time value, acting as a sentinel for the 'end of previous event'.
    // This ensures that the gap calculated for the very first event will be significantly negative,
    // thereby not meeting the 'minimum required interval' condition, consistent with original logic.
    const INITIAL_PREVIOUS_END_TIME_SENTINEL = Number.MAX_SAFE_INTEGER;

    /**
     * Converts a time string in "HH:MM" format into the total number of minutes from midnight.
     * Includes basic validation for format and numerical range.
     * @param {string} timeRepresentation - The time string to convert (e.g., "09:30").
     * @returns {number} The total minutes from midnight, or 0 if parsing fails or invalid.
     */
    const convertTimeFormatToMinutes = (timeRepresentation) => {
        if (typeof timeRepresentation !== 'string' || !timeRepresentation.includes(TIME_DELIMITER_CHAR)) {
            console.error("Data processing error: Invalid time format detected, expected HH:MM. Received:", timeRepresentation);
            return 0; // Default to 0 minutes on error, or could throw.
        }
        const timeComponents = timeRepresentation.split(TIME_DELIMITER_CHAR);
        const hoursComponent = parseInt(timeComponents[0], 10);
        const minutesComponent = parseInt(timeComponents[1], 10);

        // Perform basic range checks for hours and minutes
        if (isNaN(hoursComponent) || isNaN(minutesComponent) ||
            hoursComponent < 0 || hoursComponent > 23 ||
            minutesComponent < 0 || minutesComponent > 59) {
            console.error("Data processing error: Time components out of valid range (HH 0-23, MM 0-59). Received:", timeRepresentation);
            return 0;
        }
        return (hoursComponent * 60) + minutesComponent;
    };

    /**
     * Handles the display of the final processed results to the console.
     * @param {string[]} resultsCollection - An array of strings, each representing a result line.
     */
    const displayProcessingResults = (resultsCollection) => {
        console.log(resultsCollection.length);
        resultsCollection.forEach(resultEntry => {
            console.log(resultEntry);
        });
    };

    // --- Input Parsing and Initial Configuration Extraction ---
    // Split the raw input into individual lines, filtering out any empty or whitespace-only lines.
    let allProcessedInputLines = sourceDataString.split('\n').filter(lineContent => lineContent.trim() !== '');

    // Implement a guard clause for insufficient input data.
    if (allProcessedInputLines.length < 2) {
        console.error("Input data error: Not enough lines provided. Expected at least a configuration line and one event record.");
        return; // Terminate execution if essential data is missing.
    }

    // Extract the first line, which contains the overall configuration.
    const configurationLine = allProcessedInputLines.shift();
    const configurationFields = configurationLine.split(DATA_FIELD_SEPARATOR_CHAR);

    // Parse the number of expected event records (N) and the minimum gap threshold (T).
    let declaredEventCount = parseInt(configurationFields[0], 10);
    let requiredMinimumTimeGap = parseInt(configurationFields[1], 10);

    // Validate the parsed configuration values to ensure they are meaningful.
    if (isNaN(declaredEventCount) || declaredEventCount <= 0 ||
        isNaN(requiredMinimumTimeGap) || requiredMinimumTimeGap < 0) {
        console.error("Configuration error: Invalid or missing numeric parameters for N (event count) or T (minimum gap).");
        return;
    }

    // Add a check to reconcile the declared N with the actual number of available event lines.
    if (allProcessedInputLines.length !== declaredEventCount) {
        console.warn(`Input data warning: Declared number of events (${declaredEventCount}) does not match the actual number of event lines (${allProcessedInputLines.length}). Adjusting processing to available lines.`);
        declaredEventCount = allProcessedInputLines.length; // Use the actual count for the loop.
    }

    let lastRecordedEventEndTimeInMinutes = INITIAL_PREVIOUS_END_TIME_SENTINEL; // Initialize with sentinel.
    const qualifiedIntervalsLog = []; // Array to store event identifiers and their qualifying gaps.

    // --- Core Processing Logic: Iterate through event records ---
    // This loop processes each event record to determine if the time gap before it meets the criteria.
    for (let currentEventIdx = 0; currentEventIdx < declaredEventCount; ++currentEventIdx) {
        const singleEventRecordLine = allProcessedInputLines[currentEventIdx];
        const eventDetailParts = singleEventRecordLine.split(DATA_FIELD_SEPARATOR_CHAR);

        // Add a check for malformed event lines within the loop.
        if (eventDetailParts.length < 3) {
            console.warn(`Skipping malformed event record at index ${currentEventIdx} due to insufficient fields: "${singleEventRecordLine}"`);
            continue; // Move to the next event record.
        }

        // Extract individual components from the current event record.
        const eventBeginTimeStr = eventDetailParts[0];
        const eventUniqueLabel = eventDetailParts[1];
        const eventFinishTimeStr = eventDetailParts[2];

        // Convert the string time representations into total minutes for calculation.
        const currentEventStartTimeInMinutes = convertTimeFormatToMinutes(eventBeginTimeStr);
        const currentEventEndTimeInMinutes = convertTimeFormatToMinutes(eventFinishTimeStr);

        // Calculate the duration of the break between the end of the previous event and the start of the current one.
        const calculatedTimeInterruption = currentEventStartTimeInMinutes - lastRecordedEventEndTimeInMinutes;

        // Check if this interruption duration meets or exceeds the required minimum threshold.
        if (calculatedTimeInterruption >= requiredMinimumTimeGap) {
            // If it qualifies, record the event's label and the calculated gap.
            qualifiedIntervalsLog.push(`${eventUniqueLabel} ${calculatedTimeInterruption}`);
        }

        // Update the 'last event end time' for the next iteration's calculation.
        lastRecordedEventEndTimeInMinutes = currentEventEndTimeInMinutes;
    }

    // --- Output Generation ---
    // Call the dedicated function to display the collected results.
    displayProcessingResults(qualifiedIntervalsLog);

})(require('fs').readFileSync('/dev/stdin', 'utf8').trim());