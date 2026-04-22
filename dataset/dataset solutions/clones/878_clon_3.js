const fileSystemModule = require('fs');

/**
 * Transforms a time string in "HH:MM" format into the total number of minutes since midnight.
 * Includes format and range validation for robustness.
 * @param {string} timeExpression - The time string to parse, e.g., "09:45".
 * @returns {number} The total minutes from midnight, or NaN if parsing fails or input is invalid.
 */
function convertTimeFormatToMinutes(timeExpression) {
    // Basic type and format check
    if (typeof timeExpression !== 'string' || !/^\d{1,2}:\d{2}$/.test(timeExpression)) {
        console.error(`Validation Error: Provided time string '${timeExpression}' is not in expected HH:MM format.`);
        return NaN;
    }

    const timeSegments = timeExpression.split(':');
    const hoursComponent = parseInt(timeSegments[0], 10);
    const minutesComponent = parseInt(timeSegments[1], 10);

    // Range validation for hours and minutes
    if (isNaN(hoursComponent) || isNaN(minutesComponent) ||
        hoursComponent < 0 || hoursComponent > 23 ||
        minutesComponent < 0 || minutesComponent > 59) {
        console.error(`Validation Error: Time components are out of valid range for '${timeExpression}'.`);
        return NaN;
    }

    return (hoursComponent * 60) + minutesComponent;
}

/**
 * Processes a sequence of transit event data from standard input to identify
 * and report connections that meet a specified minimum layover duration.
 * This function handles input parsing, validation, and result generation.
 */
function analyzeTransitConnections() {
    let rawStandardInputContent;
    try {
        // Read all available data from the standard input stream synchronously.
        // This method is common in competitive programming environments where stdin is pre-populated.
        const inputDescriptor = process.stdin.fd;
        const inputStatistics = fileSystemModule.fstatSync(inputDescriptor);
        const inputDataSize = inputStatistics.size;
        const dataBuffer = Buffer.alloc(inputDataSize); // Allocate buffer for the entire input
        const bytesActuallyRead = fileSystemModule.readSync(inputDescriptor, dataBuffer, 0, inputDataSize, 0);
        rawStandardInputContent = dataBuffer.toString('utf8', 0, bytesActuallyRead);
    } catch (inputReadError) {
        console.error("Critical Error: Unable to read data from standard input.", inputReadError.message);
        process.exit(1); // Exit with an error code
    }

    // Split the raw content into individual lines and remove any leading/trailing whitespace.
    const allParsedInputLines = rawStandardInputContent.trim().split('\n');

    // A minimum of two lines is required: one for global parameters, one for the initial event.
    if (allParsedInputLines.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines.");
        process.exit(1);
    }

    // Parse the first line which contains the total expected entries and the minimum layover threshold.
    const primaryParameters = allParsedInputLines[0].split(' ');
    if (primaryParameters.length < 2) {
        console.error("Error: First line is malformed. Expected two space-separated numbers.");
        process.exit(1);
    }

    const totalExpectedEventLines = parseInt(primaryParameters[0], 10);
    const requiredMinimumLayover = parseInt(primaryParameters[1], 10);

    // Validate the parsed numeric parameters.
    if (isNaN(totalExpectedEventLines) || isNaN(requiredMinimumLayover) ||
        totalExpectedEventLines < 0 || requiredMinimumLayover < 0) {
        console.error("Error: Invalid numeric values found on the first line.");
        process.exit(1);
    }

    // Extract details from the second line (index 1) to set up the initial 'previous' state.
    const initialEventDetails = allParsedInputLines[1].split(' ');
    if (initialEventDetails.length < 4) {
        console.error("Error: Second line is malformed. Expected four space-separated event details.");
        process.exit(1);
    }

    let previousJourneyArrivalTime = convertTimeFormatToMinutes(initialEventDetails[2]);
    let previousJourneyArrivalStation = initialEventDetails[3];

    // Check if the initial time parsing was successful.
    if (isNaN(previousJourneyArrivalTime)) {
        console.error("Error: Failed to parse arrival time for the initial event on line 2.");
        process.exit(1);
    }

    // This array will store identified connections that satisfy the layover condition.
    // Each connection is an object for better readability.
    const qualifyingConnectionRecords = [];

    // Loop through the remaining event lines, starting from the third line (index 2).
    // The loop continues as long as `lineIterator` is within the expected number of event lines
    // and also within the actual number of lines read from input.
    for (let lineIterator = 2; lineIterator < totalExpectedEventLines + 1; lineIterator++) {
        // Guard clause: Check if we've run out of input lines prematurely.
        if (lineIterator >= allParsedInputLines.length) {
            console.warn(`Warning: Expected ${totalExpectedEventLines} data lines but input ended at line ${lineIterator}. Processing stopped early.`);
            break;
        }

        const currentEventLineDetails = allParsedInputLines[lineIterator].split(' ');

        // Guard clause: Validate the format of the current line.
        if (currentEventLineDetails.length < 4) {
            console.warn(`Warning: Line ${lineIterator + 1} is malformed. Expected four event details. Skipping this entry.`);
            continue; // Skip to the next line
        }

        const currentEventDepartureTime = convertTimeFormatToMinutes(currentEventLineDetails[0]);
        const currentEventArrivalTime = convertTimeFormatToMinutes(currentEventLineDetails[2]);
        const currentEventArrivalStation = currentEventLineDetails[3];

        // Guard clause: Validate that time parsing for the current line was successful.
        if (isNaN(currentEventDepartureTime) || isNaN(currentEventArrivalTime)) {
            console.warn(`Warning: Failed to parse time(s) on line ${lineIterator + 1}. Skipping this entry.`);
            continue;
        }

        // Calculate the layover duration between the previous event's arrival and the current event's departure.
        const calculatedLayoverPeriod = currentEventDepartureTime - previousJourneyArrivalTime;

        // If the calculated layover meets or exceeds the required minimum, record this connection.
        if (calculatedLayoverPeriod >= requiredMinimumLayover) {
            qualifyingConnectionRecords.push({
                departureFromStation: previousJourneyArrivalStation, // The station where the layover occurs
                durationInMinutes: calculatedLayoverPeriod // The length of the layover
            });
        }

        // Update the 'previous' event's arrival information for the next iteration based on the *current* event's arrival.
        previousJourneyArrivalTime = currentEventArrivalTime;
        previousJourneyArrivalStation = currentEventArrivalStation;
    }

    // Output the total count of connections found.
    console.log(qualifyingConnectionRecords.length);

    // Iterate through the recorded connections and print their details.
    qualifyingConnectionRecords.forEach(connection => {
        console.log(`${connection.departureFromStation} ${connection.durationInMinutes}`);
    });
}

// Execute the main processing function.
analyzeTransitConnections();