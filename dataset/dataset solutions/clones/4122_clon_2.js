((rawData) => {
    // Process the raw input string into individual lines
    const textRows = rawData.split("\n");

    // Extract the total number of stations from the first line
    const numStations = textRows[0] | 0;

    // Parse the remaining lines to get travel times, start times, and frequencies
    const [travelTimes, startTimes, frequencies] = textRows.slice(1)
        .map(singleLine => singleLine.split(" ").map(parsedValue => parsedValue | 0)) // Convert each line to an array of integers
        .reduce((tempStorage, currentLineData) => {
            // Distribute values from each line into their respective arrays (travelTimes, startTimes, frequencies)
            return tempStorage.map((elementArray, indexPosition) => elementArray.concat(currentLineData[indexPosition]));
        }, [[], [], []]); // Initialize with three empty arrays

    /**
     * Calculates the arrival time at the final station starting from a given station.
     * @param {number} stationIndex - The starting station index.
     * @returns {number} The total time taken to reach the destination.
     */
    const calculateArrivalTime = stationIndex => {
        // If already at the destination, no time is needed
        if (stationIndex === numStations - 1) {
            return 0;
        }

        let currentStation = stationIndex; // Keep track of the current station in the journey
        let totalTime = 0; // Accumulate the total travel time

        // Loop until the destination station is reached
        while (currentStation !== numStations - 1) {
            // Calculate the time spent waiting and traveling for the current segment
            // 1. Determine the earliest departure time from the current station:
            //    - It must be at least 'startTimes[currentStation]'.
            //    - It must be a multiple of 'frequencies[currentStation]'.
            //    - It must be greater than or equal to the current 'totalTime'.
            // 2. Add the travel duration 'travelTimes[currentStation]' to 'totalTime'.
            totalTime += Math.max(
                startTimes[currentStation] - totalTime, // Time needed to wait until the start time
                totalTime % frequencies[currentStation] !== 0 // If current time is not a multiple of frequency
                    ? frequencies[currentStation] - totalTime % frequencies[currentStation] // Time to wait for the next frequency slot
                    : 0 // No wait needed if already a multiple
            ) + travelTimes[currentStation];

            // Move to the next station
            currentStation++;
        }
        return totalTime; // Return the accumulated time
    };

    // Generate an array of station indices (0 to N-1),
    // calculate arrival time for each starting station,
    // and print each result to the console.
    Array.from(new Array(numStations), (_unused, stationIdentifier) => stationIdentifier)
        .map(calculateArrivalTime) // Apply the solver function for each starting station
        .forEach(finalTime => console.log(finalTime)); // Output each calculated time

})(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input
// Optional: For local testing, you might use a hardcoded string instead of fs.readFileSync.
// Example: })(`3\n1 1 1\n1 1 1`);
