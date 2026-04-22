((inputContent) => {
    // --- Input Processing and Data Initialization ---
    // Split the raw input string into individual lines for processing.
    const rawLines = inputContent.split("\n");

    // Implement a basic guard clause for empty input.
    if (rawLines.length === 0 || rawLines[0].trim() === "") {
        console.error("Error: Input data is empty or malformed.");
        return; // Exit if no meaningful input.
    }

    // Parse the total count of stations from the first line.
    // Using parseInt with radix 10 for explicit and robust number conversion.
    const totalStationsCount = Number.parseInt(rawLines[0].trim(), 10);

    // Validate the parsed station count. It must be a positive integer.
    if (isNaN(totalStationsCount) || totalStationsCount < 1) {
        console.error("Error: Invalid number of stations specified in the first line.");
        return;
    }

    // Initialize separate arrays to store details for each travel segment.
    // Each segment connects two consecutive stations (e.g., station i to i+1).
    const segmentTravelDurations = [];    // Represents 'C' from the original problem: time to travel the segment.
    const segmentStartDepartures = [];    // Represents 'S': the initial departure time from the current station.
    const segmentServiceIntervals = [];   // Represents 'F': the frequency of train departures from the current station.

    // Iterate through the input lines, starting from the second line (index 1),
    // to populate the segment data arrays.
    for (let lineIndex = 1; lineIndex < rawLines.length; lineIndex++) {
        const currentLineText = rawLines[lineIndex].trim();

        // Skip any empty lines that might be present in the input.
        if (currentLineText === "") {
            continue;
        }

        // Parse three integer values (C, S, F) from each segment line.
        const numericValues = currentLineText.split(" ").map(str => Number.parseInt(str, 10));

        // Validate that exactly three valid numbers were parsed for each segment.
        if (numericValues.length !== 3 || numericValues.some(isNaN)) {
            console.error(`Warning: Skipping malformed segment data on line ${lineIndex + 1}. Expected 3 numbers.`);
            continue; // Skip this line and proceed to the next.
        }

        // Store the parsed values into their respective arrays.
        segmentTravelDurations.push(numericValues[0]);
        segmentStartDepartures.push(numericValues[1]);
        segmentServiceIntervals.push(numericValues[2]);
    }

    // Additional validation: Ensure we have (N-1) segments for N stations.
    if (totalStationsCount > 1 && segmentTravelDurations.length !== totalStationsCount - 1) {
        console.error(`Error: Mismatch detected between station count (${totalStationsCount}) and number of processed segments (${segmentTravelDurations.length}).`);
        return;
    }

    // --- Helper Function for Calculating Waiting Time at a Station ---
    /**
     * Determines the total wait time required at a station before a train can depart.
     * This considers both the scheduled initial departure time and the train's operating frequency.
     * @param {number} currentArrivalTime The time when the traveler arrives at the current station.
     * @param {number} scheduledInitialDeparture The earliest fixed departure time (S) for trains from this station.
     * @param {number} trainServiceFrequency The interval (F) between successive train departures.
     * @returns {number} The total duration the traveler must wait at the station.
     */
    const calculateStationWaitDuration = (currentArrivalTime, scheduledInitialDeparture, trainServiceFrequency) => {
        // First, calculate any wait needed to reach the scheduled initial departure time (S).
        // If currentArrivalTime is before S, we must wait at least until S.
        const waitUntilScheduledStart = Math.max(0, scheduledInitialDeparture - currentArrivalTime);

        // Determine the effective time at which we are ready to consider frequency alignment.
        // This is our arrival time plus any mandatory wait until the scheduled departure.
        const effectiveTimeForFrequencyCheck = currentArrivalTime + waitUntilScheduledStart;

        // Calculate additional wait needed to align with the train's frequency (F).
        let frequencyAlignmentWait = 0;
        // Avoid division by zero if frequency is 0 (though problem context usually implies F > 0).
        if (trainServiceFrequency > 0) {
            const remainder = effectiveTimeForFrequencyCheck % trainServiceFrequency;
            if (remainder !== 0) {
                // If not aligned, wait until the next multiple of the frequency.
                frequencyAlignmentWait = trainServiceFrequency - remainder;
            }
        }

        // The total wait is the sum of waiting for the scheduled start and then for frequency alignment.
        return waitUntilScheduledStart + frequencyAlignmentWait;
    };


    // --- Core Travel Time Computation Logic ---
    /**
     * Computes the total time taken to travel from a specified starting station
     * to the final destination station (totalStationsCount - 1).
     * @param {number} departureStationIndex The index of the station from which the journey begins.
     * @returns {number} The total time units for the journey, or -1 if the index is invalid.
     */
    const computeJourneyTime = (departureStationIndex) => {
        // If the journey starts at the final station, no travel time is required.
        if (departureStationIndex === totalStationsCount - 1) {
            return 0;
        }

        // Add a guard for invalid starting station indices.
        if (departureStationIndex < 0 || departureStationIndex >= totalStationsCount) {
            console.error(`Invalid departure station index: ${departureStationIndex}.`);
            return -1; // Indicate an error.
        }

        let accumulatedJourneyTime = 0; // Tracks the elapsed time from the start of the journey.
        let currentSegmentIterator = departureStationIndex; // Index for the current segment being processed.

        // Loop through each segment from the starting station up to the station just before the destination.
        // The last segment connects (totalStationsCount - 2) to (totalStationsCount - 1).
        while (currentSegmentIterator < totalStationsCount - 1) {
            // Retrieve segment-specific parameters.
            const currentSegmentDuration = segmentTravelDurations[currentSegmentIterator];
            const currentSegmentDepartureTime = segmentStartDepartures[currentSegmentIterator];
            const currentSegmentFrequency = segmentServiceIntervals[currentSegmentIterator];

            // Calculate the necessary wait time at the current station.
            const timeToWaitAtStation = calculateStationWaitDuration(
                accumulatedJourneyTime,
                currentSegmentDepartureTime,
                currentSegmentFrequency
            );

            // Update the total time: add the wait time, then add the travel time for the segment.
            accumulatedJourneyTime += timeToWaitAtStation + currentSegmentDuration;

            // Move to the next travel segment (i.e., arrive at the next station).
            currentSegmentIterator++;
        }

        return accumulatedJourneyTime;
    };


    // --- Output Generation ---
    // Prepare an array to store the computed travel times for all possible starting points.
    const allJourneyResults = [];

    // Iterate through each station, considering it as a potential starting point.
    for (let stationIdx = 0; stationIdx < totalStationsCount; stationIdx++) {
        const timeFromCurrentStation = computeJourneyTime(stationIdx);
        allJourneyResults.push(timeFromCurrentStation);
    }

    // Print each calculated travel time to the standard output.
    allJourneyResults.forEach(result => console.log(result));

// The entire script is wrapped in an Immediately Invoked Function Expression (IIFE).
// It reads input from standard input using Node.js 'fs' module and UTF-8 encoding.
})(require("fs").readFileSync("/dev/stdin", "utf8"));