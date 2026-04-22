"use strict"; // Enforce strict mode for modern JavaScript coding practices.

/**
 * @file This script calculates the total travel time for a transit system,
 *       starting from each possible station to the final destination.
 *       It processes station departure times, travel durations, and frequencies.
 *       The logic replicates a specific, perhaps unconventional, rule for
 *       determining departure times after arrival at an intermediate station.
 */

// Main function to process the input and compute journey durations.
const computeAllJourneyDurations = (rawInputContent) => {
    // Sanitize and segment the input string into an array of individual lines.
    // Removes leading/trailing whitespace and filters out any empty lines.
    const inputLines = rawInputContent.trim().split(/\r?\n/).filter(Boolean);

    // The very first line of input specifies the total number of stations in the transit network.
    const totalStationsCount = Number(inputLines[0]);

    // An array to store the detailed information for each travel segment.
    // Each element will be an object containing properties for travel time,
    // initial departure time, and departure frequency for that specific segment.
    const segmentDetails = [];

    // Iterate through the input lines, starting from the second line (index 1),
    // to parse the data for each segment connecting two stations.
    // The segments are indexed from 0 to (totalStationsCount - 2).
    // For example, segmentDetails[0] corresponds to the journey from station 0 to station 1.
    for (let currentLineIdx = 1; currentLineIdx < totalStationsCount; currentLineIdx++) {
        // Each line contains three space-separated integer values.
        const lineValues = inputLines[currentLineIdx].split(" ").map(valueStr => Number(valueStr));

        // Store the parsed data in an object for better readability and structure.
        segmentDetails.push({
            travelDuration: lineValues[0],          // 'C' in original: Time taken to traverse this segment.
            firstDepartureSchedule: lineValues[1],  // 'S' in original: The earliest scheduled departure time from the origin of this segment.
            departureFrequency: lineValues[2]       // 'F' in original: The interval between subsequent departures from the origin of this segment.
        });
    }

    // This array will store the final computed total travel times,
    // where each element represents the duration for a journey starting at a particular station.
    const calculatedJourneyResults = [];

    // The primary simulation loop: iterate through each possible starting station.
    // A journey can begin at any station from index 0 up to (totalStationsCount - 1).
    for (let startStationIdentifier = 0; startStationIdentifier < totalStationsCount; startStationIdentifier++) {
        let cumulativeTransitTime = 0; // Initialize the timer for the current journey.

        // Special handling for the last station: if a journey starts here,
        // the travel time to the "end" is implicitly zero as there are no further segments.
        if (startStationIdentifier === totalStationsCount - 1) {
            calculatedJourneyResults.push(0);
            // Move to the next starting station, as this one is fully processed.
            continue;
        }

        // --- Initial segment processing (from the starting station) ---
        // For the first leg of the journey, the train departs at its scheduled `firstDepartureSchedule`
        // and travels for `travelDuration`. This calculates the arrival at the *next* station.
        const initialSegmentInfo = segmentDetails[startStationIdentifier];
        cumulativeTransitTime = initialSegmentInfo.firstDepartureSchedule + initialSegmentInfo.travelDuration;

        // --- Subsequent segment processing (for intermediate stations) ---
        // Simulate travel through all intermediate segments until the final destination.
        // The loop index `segmentIndex` refers to the station from which the current segment departs.
        // It starts from the station immediately following the `startStationIdentifier`
        // and continues up to, but not including, the second-to-last station (totalStationsCount - 2).
        for (let segmentIndex = startStationIdentifier + 1; segmentIndex < totalStationsCount - 1; segmentIndex++) {
            const currentSegmentData = segmentDetails[segmentIndex]; // Data for segment departing from `segmentIndex`.

            // Extract relevant parameters for clarity.
            const stationDepartureSchedule = currentSegmentData.firstDepartureSchedule;
            const stationDepartureInterval = currentSegmentData.departureFrequency;
            const segmentTravelDuration = currentSegmentData.travelDuration;

            // Apply the specific departure logic as found in the original code:
            // If the current arrival time exactly matches the station's first scheduled departure,
            // the train departs immediately at that time.
            if (cumulativeTransitTime === stationDepartureSchedule) {
                // No waiting time beyond the scheduled departure.
                // cumulativeTransitTime already represents the departure time from `segmentIndex`.
            } else {
                // If the arrival time does not match the first schedule,
                // a different waiting rule applies based on the original `while` loop behavior.
                // The original logic effectively ensures departure at `stationDepartureSchedule + stationDepartureInterval`
                // if `cumulativeTransitTime` is less than this value. Otherwise, it departs at `cumulativeTransitTime`.
                const nextAvailableDepartureSlot = stationDepartureSchedule + stationDepartureInterval;
                cumulativeTransitTime = Math.max(cumulativeTransitTime, nextAvailableDepartureSlot);
            }
            // After determining the departure time from `segmentIndex`, add the travel time
            // for this segment to get the arrival time at `segmentIndex + 1`.
            cumulativeTransitTime += segmentTravelDuration;
        }

        // Once all segments for the current starting station are processed,
        // store the final accumulated time.
        calculatedJourneyResults.push(cumulativeTransitTime);
    }

    // Output the final results. Each total journey duration is printed on a new line.
    console.log(calculatedJourneyResults.join('\n'));
};

// Standard entry point for competitive programming:
// Read all input from standard input (usually a file or piped data),
// decode it as UTF-8, and then pass it to the main processing function.
computeAllJourneyDurations(require('fs').readFileSync('/dev/stdin', 'utf8'));