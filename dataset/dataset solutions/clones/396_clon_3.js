// For file system operations, we bring in the 'fs' module.
const filesystemModule = require('fs');

// Define some critical constants for our simulation.
const TOTAL_DINING_SPOTS = 17; // The total number of individual seats available in the restaurant.
const GROUP_ARRIVAL_INTERVAL_MINUTES = 5; // New groups arrive every 5 minutes.
const MAX_GROUPS_TO_PROCESS = 100; // The total number of groups to process before ending the simulation.
const INPUT_PARSE_RADIX = 10; // The base (radix) for parsing integer values from input strings.
const SEAT_EMPTY_TIMER = 0; // Represents an empty or available seat in the tableOccupancyTimers array.

// Read all incoming data from standard input synchronously.
// First, determine the size of the input stream using file descriptor statistics.
const streamByteSize = filesystemModule.fstatSync(process.stdin.fd).size;
// Allocate a buffer to hold the input data, ensuring it's large enough.
const streamReadBuffer = Buffer.alloc(streamByteSize);
// Read the actual data from standard input into the pre-allocated buffer.
const actualBytesReadCount = filesystemModule.readSync(process.stdin.fd, streamReadBuffer, 0, streamByteSize, 0);
// Convert the buffer content to a UTF-8 string and then split it by newline characters
// to obtain an array of command lines, which are typically group IDs for wait time queries.
const groupQueryIdentifiers = streamReadBuffer.toString('utf8', 0, actualBytesReadCount).split('\n');

// Initiate the restaurant seating and waiting time simulation process.
simulateRestaurantFlow();

/**
 * Orchestrates the entire restaurant seating simulation logic.
 * This function handles group arrivals, finding available seating,
 * assigning groups to seats, and tracking their respective wait times.
 */
function simulateRestaurantFlow() {
    // This array represents the state of each individual dining spot.
    // Each element's value indicates the number of minutes until that specific spot becomes free.
    // It is initialized to all zeros, signifying that all spots are initially available.
    let tableOccupancyTimers = new Array(TOTAL_DINING_SPOTS).fill(SEAT_EMPTY_TIMER);

    // An array defining the number of patrons for various group configurations.
    // This allows for cycling through different group sizes as new groups arrive.
    const patronGroupSizes = [2, 5, 2, 2, 2];
    // An array defining the duration (in minutes) that different groups will spend eating their meal.
    // This also cycles as new groups arrive, determining how long they occupy seats.
    const mealDurations = [19, 39, 25, 36, 22, 42];

    // This variable holds the index of the group that is currently at the front of the waiting queue,
    // attempting to be seated. A value of -1 indicates that no group is actively waiting at the moment.
    let currentWaitingGroupIndex = -1;
    // This counter keeps track of the total minutes that have passed since the simulation started.
    // It's the central timekeeping mechanism for the simulation.
    let elapsedSimulationMinutes = 0;

    // An array used to store the calculated waiting time for each group.
    // The index in this array corresponds to the group's arrival order (e.g., group 0, group 1, etc.).
    // It is sized to accommodate all groups we intend to process, preventing out-of-bounds errors.
    let groupWaitMetrics = new Array(MAX_GROUPS_TO_PROCESS).fill(0);

    // A counter for the number of groups that still need to be served before the simulation concludes.
    // It starts at MAX_GROUPS_TO_PROCESS and decrements each time a group is seated.
    let groupsRemainingToServe = MAX_GROUPS_TO_PROCESS;

    // The core simulation loop. It continues indefinitely until a specific termination condition is met,
    // which is when all `MAX_GROUPS_TO_PROCESS` have been successfully seated.
    simulationMainLoop: while (true) {
        // --- Simulation Phase 1: Update the status of all dining spots ---
        // For each minute that passes, every occupied spot's timer decrements.
        // If a timer reaches zero, the spot becomes available (empty).
        for (let spotIdx = 0; spotIdx < TOTAL_DINING_SPOTS; spotIdx++) {
            // Ensure the timer doesn't go below zero; a spot cannot be "less than empty".
            tableOccupancyTimers[spotIdx] = Math.max(SEAT_EMPTY_TIMER, tableOccupancyTimers[spotIdx] - 1);
        }

        // --- Simulation Phase 2: Check for the arrival of new patron groups ---
        // A new group arrives if two conditions are simultaneously met:
        // 1. There isn't already a group waiting to be seated (`currentWaitingGroupIndex === -1`).
        // 2. The current elapsed time is a perfect multiple of the defined group arrival interval.
        const isCurrentMinuteAnArrivalTime = (elapsedSimulationMinutes % GROUP_ARRIVAL_INTERVAL_MINUTES === 0);
        if (currentWaitingGroupIndex === -1 && isCurrentMinuteAnArrivalTime) {
            // Calculate the index for this newly arriving group. This index also serves as its identifier.
            currentWaitingGroupIndex = elapsedSimulationMinutes / GROUP_ARRIVAL_INTERVAL_MINUTES;
            // A safety check: if the group index somehow exceeds our expected capacity,
            // it indicates a potential issue or an edge case not fully anticipated.
            if (currentWaitingGroupIndex >= MAX_GROUPS_TO_PROCESS) {
                console.warn(`Warning: Group index ${currentWaitingGroupIndex} exceeds MAX_GROUPS_TO_PROCESS. This might indicate an unexpected simulation state or a very long simulation run.`);
                // In a production scenario, one might break the loop here or implement more robust error handling.
            }
        }

        // --- Simulation Phase 3: Attempt to seat any waiting groups ---
        // This inner loop allows multiple groups to be seated within the same minute
        // if consecutive seating opportunities arise rapidly. It continues as long as a group
        // was successfully seated in the previous iteration.
        let wasGroupSeatedInThisAttempt = false;
        do {
            wasGroupSeatedInThisAttempt = false; // Reset the flag for each iteration of this inner loop.

            // Only proceed with seating attempts if there's a group actively waiting.
            if (currentWaitingGroupIndex !== -1) {
                // Retrieve the size of the group currently at the front of the queue.
                // We use the modulo operator to cycle through the `patronGroupSizes` array,
                // ensuring we always get a valid group size from our defined configurations.
                const patronsInCurrentGroup = patronGroupSizes[currentWaitingGroupIndex % patronGroupSizes.length];

                let consecutiveEmptySpotsCount = 0; // Tracks the number of adjacent empty seats found.
                let confirmedSeatingBlockStart = -1; // Stores the starting index of a suitable block of seats.

                // Iterate through all dining spots to find a contiguous block of empty seats
                // that can accommodate the current waiting group.
                for (let searchSpotIdx = 0; searchSpotIdx < TOTAL_DINING_SPOTS; searchSpotIdx++) {
                    if (tableOccupancyTimers[searchSpotIdx] === SEAT_EMPTY_TIMER) {
                        // If the current spot is empty, increment the consecutive count.
                        consecutiveEmptySpotsCount++;
                        // Check if we've found enough consecutive spots for the current group.
                        if (consecutiveEmptySpotsCount === patronsInCurrentGroup) {
                            // Calculate the actual starting index for this block of seats.
                            confirmedSeatingBlockStart = searchSpotIdx - (patronsInCurrentGroup - 1);
                            break; // A suitable contiguous block was found, no need to search further.
                        }
                    } else {
                        // If a non-empty spot is encountered, the consecutive count must be reset,
                        // as the contiguity is broken.
                        consecutiveEmptySpotsCount = SEAT_EMPTY_TIMER;
                    }
                }

                // If a suitable block of seats was successfully identified for the waiting group...
                if (confirmedSeatingBlockStart !== -1) {
                    // Calculate and record the waiting time for this group.
                    // Waiting time is current time minus their scheduled arrival time.
                    const groupScheduledArrivalTime = currentWaitingGroupIndex * GROUP_ARRIVAL_INTERVAL_MINUTES;
                    groupWaitMetrics[currentWaitingGroupIndex] = elapsedSimulationMinutes - groupScheduledArrivalTime;

                    // Determine the meal duration for this specific group.
                    const currentGroupEatingDuration = mealDurations[currentWaitingGroupIndex % mealDurations.length];
                    // Occupy the found seats by setting their timers to the group's meal duration.
                    for (let occupySpotIdx = confirmedSeatingBlockStart; occupySpotIdx < (confirmedSeatingBlockStart + patronsInCurrentGroup); occupySpotIdx++) {
                        tableOccupancyTimers[occupySpotIdx] = currentGroupEatingDuration;
                    }

                    // A group has been successfully seated. Decrement the counter for remaining groups.
                    groupsRemainingToServe--;
                    wasGroupSeatedInThisAttempt = true; // Set flag to true to re-attempt seating another group (if any).

                    // Determine the next group to potentially wait. This is simply the next numerical index.
                    const nextPotentialGroupIndex = currentWaitingGroupIndex + 1;
                    // Calculate the scheduled arrival time for this next potential group.
                    const nextGroupScheduledArrivalTime = nextPotentialGroupIndex * GROUP_ARRIVAL_INTERVAL_MINUTES;

                    // If the next group's scheduled arrival time has already passed or is the current minute,
                    // then advance `currentWaitingGroupIndex` to point to that next group.
                    // Otherwise, no group is immediately waiting after this one, so set `currentWaitingGroupIndex` to -1.
                    if (nextGroupScheduledArrivalTime <= elapsedSimulationMinutes) {
                        currentWaitingGroupIndex = nextPotentialGroupIndex;
                    } else {
                        currentWaitingGroupIndex = -1;
                    }

                    // Check if all designated groups have been served.
                    if (groupsRemainingToServe <= 0) {
                        // If so, the simulation is complete. Break out of the main simulation loop.
                        break simulationMainLoop;
                    }
                }
            }
        } while (wasGroupSeatedInThisAttempt); // Continue trying to seat groups as long as new seating occurred in this minute.

        // Increment the global simulation time by one minute, moving to the next time step.
        elapsedSimulationMinutes++;
    }

    // --- Simulation Phase 4: Process and output results based on input queries ---
    // Iterate through each line in the `groupQueryIdentifiers` array.
    // We subtract 1 from length to account for a potential trailing empty line from `split('\n')`.
    for (let queryIndex = 0; queryIndex < (groupQueryIdentifiers.length - 1); queryIndex++) {
        const rawGroupIdentifier = groupQueryIdentifiers[queryIndex];
        // Attempt to parse the group identifier from the string to an integer.
        const queriedGroupNumber = parseInt(rawGroupIdentifier, INPUT_PARSE_RADIX);

        // Perform validation on the parsed group number to ensure it's a valid query.
        if (isNaN(queriedGroupNumber) || queriedGroupNumber < 0 || queriedGroupNumber >= MAX_GROUPS_TO_PROCESS) {
            // Log an error for invalid input and skip to the next query to avoid crashing.
            console.error(`Error: Invalid group identifier '${rawGroupIdentifier}' at query line ${queryIndex + 1}. Expected a number between 0 and ${MAX_GROUPS_TO_PROCESS - 1}. Skipping this query.`);
            continue;
        }
        // Output the stored waiting time for the requested group to standard output.
        console.log(groupWaitMetrics[queriedGroupNumber]);
    }
}