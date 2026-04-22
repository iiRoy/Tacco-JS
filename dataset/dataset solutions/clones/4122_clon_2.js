(( rawData ) => {
    // This script processes station travel data to determine journey times.
    const textRows = rawData.split('\n'); // Divide the raw input string into individual lines.

    const countStations = parseInt(textRows[0], 10); // The first line indicates the total number of operational stations.

    const [travelDurations, startTimes, frequencies] = textRows
        .slice(1) // Exclude the first line (station count) from processing.
        .map(rowStr =>
            rowStr.split(' ').map(valStr => parseInt(valStr, 10)) // Parse each line into an array of integer values.
        )
        // Transpose the array of arrays from [ [C1, S1, F1], [C2, S2, F2] ] to [ [C1, C2], [S1, S2], [F1, F2] ].
        .reduce((collection, currentLineArr) =>
            collection.map((element, idx) => element.concat(currentLineArr[idx])),
            [[], [], []]
        );

    // This function computes the total time required to reach the final destination from a specified starting point.
    const calculateJourneyTime = startStationIndex => {
        if (startStationIndex === countStations - 1) {
            return 0; // If already at the last station, no additional time is needed.
        }

        let currentStation = startStationIndex; // Initialize the current station pointer.
        let elapsedTime = 0; // Initialize the accumulated time for the journey.

        while (currentStation !== countStations - 1) {
            // Iterate until the destination station is reached.

            // Calculate the waiting time at the current station and add the travel duration to the next.
            elapsedTime += Math.max(
                startTimes[currentStation] - elapsedTime, // Option 1: Wait until the scheduled departure time.
                elapsedTime % frequencies[currentStation] !== 0
                    ? frequencies[currentStation] - (elapsedTime % frequencies[currentStation]) // Option 2: Wait for the next departure cycle.
                    : 0
            ) + travelDurations[currentStation]; // Add the actual travel time to the next station.

            currentStation++; // Advance to the subsequent station.
        }

        return elapsedTime; // Return the final calculated duration.
    };

    // Generate an array of station indices, then compute and display the journey time for each.
    Array
        .from({ length: countStations }, (_, stationIdx) => stationIdx) // Create an array of indices from 0 to countStations - 1.
        .map(calculateJourneyTime) // Apply the journey time calculation for each starting station.
        .forEach(finalTime => console.log(finalTime)); // Display each computed journey time to the console.

})( require("node:fs").readFileSync("/dev/stdin", "utf8") );
// (Alternative invocation with an empty string for testing purposes) })( '' );