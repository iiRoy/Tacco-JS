"use strict"; // Enforce strict parsing and error handling for better code quality.

// This function computes the travel time for a series of train departures.
const calculateTravelTimes = (  rawData  ) => {
    // Trim whitespace and split the input string into individual lines.
    rawData = rawData.trim().split( '\n' ) ;

    // The first line contains the total number of stations.
    const totalStops = Number(rawData[0]);

    // Initialize arrays to store station-specific data:
    //  - journeyDurations: Duration of travel from current station to next.
    //  - initialDepartures: Scheduled departure time from current station.
    //  - scheduleFrequencies: Frequency of departures from current station.
    let journeyDurations = [];
    let initialDepartures = [];
    let scheduleFrequencies = [];

    // Populate the station data arrays by parsing subsequent input lines.
    for (let stationIndex = 1; stationIndex < totalStops; stationIndex++) {
        // Parse each line, converting space-separated values to integers.
        const stationInfo = rawData[stationIndex].split(' ').map(strNum => Number(strNum));
        journeyDurations[stationIndex - 1] = stationInfo[0]; // Cost (C)
        initialDepartures[stationIndex - 1] = stationInfo[1]; // Start (S)
        scheduleFrequencies[stationIndex - 1] = stationInfo[2]; // Frequency (F)
    }

    // Array to store the final computed travel times for each starting station.
    let finalResults = [];

    // Iterate through each station as a starting point.
    for (let currentStartStation = 0; currentStartStation < totalStops; currentStartStation++) {
        // Initialize the elapsed time for the current journey.
        let elapsedTime = 0;
        // Calculate initial travel time from the current station.
        // This is the departure time from the current station plus the travel duration to the next.
        elapsedTime += initialDepartures[currentStartStation] + journeyDurations[currentStartStation];

        // If this is the very last station, the travel time is 0 (it's the destination).
        if (currentStartStation === totalStops - 1) {
            finalResults.push(0);
            break; // Exit the loop as we're done with the last station.
        }

        // Iterate through subsequent stations to calculate cumulative travel time.
        // The loop goes up to totalStops - 1 because the arrays (C,S,F) have N-1 elements.
        for (let subsequentStop = Number(currentStartStation) + 1; subsequentStop < totalStops - 1; subsequentStop++) {
            // Check if arrival time at the next station perfectly matches its departure time.
            if (elapsedTime === initialDepartures[subsequentStop]) {
                elapsedTime += journeyDurations[subsequentStop]; // Depart immediately.
            } else {
                // If arrival is before scheduled departure, or not on a frequency interval, wait.
                // Increment time until a valid departure slot is found.
                while (initialDepartures[subsequentStop] + scheduleFrequencies[subsequentStop] > elapsedTime) {
                    elapsedTime++; // Advance time by one unit.
                }
                // Once a valid departure time is reached, add the travel duration to the next station.
                elapsedTime += journeyDurations[subsequentStop];
            }
        }
        // Store the total elapsed time for the journey starting at currentStartStation.
        finalResults.push(elapsedTime);
    }

    // Output the calculated cumulative travel times, each on a new line.
    console.log(finalResults.join('\n'));
};

// Read input from standard input and pass it to the main processing function.
calculateTravelTimes( require('fs').readFileSync('/dev/stdin', 'utf8') );