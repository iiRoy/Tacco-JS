const fileSystem = require('fs');

// Reads standard input synchronously to process data.
const standardInputDescriptor = process.stdin.fd;
const initialInputSize = fileSystem.fstatSync(standardInputDescriptor).size;
const temporaryInputBuffer = Buffer.alloc(initialInputSize);
const actualBytesRead = fileSystem.readSync(standardInputDescriptor, temporaryInputBuffer, 0, initialInputSize, 0);

// Decodes the buffer content into a UTF-8 string and segments it by newline.
// The resulting array might contain an empty string at the end if the input has a trailing newline.
const parsedInputLines = temporaryInputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Kicks off the primary application logic.
initiateRestaurantSimulation();

/**
 * Orchestrates the overall simulation process.
 * This function initiates the calculation of group waiting times and then
 * iterates through the parsed input to display specific results.
 */
function initiateRestaurantSimulation() {
  // Execute the core simulation logic to determine all group waiting times.
  const calculatedGroupDelays = computeRestaurantDynamics();

  // Iterate over each line provided in the standard input.
  // We process up to `parsedInputLines.length - 1` to ignore a potential
  // empty string that results from a trailing newline in the input.
  const totalInputQueries = parsedInputLines.length;
  for (let queryIndex = 0; queryIndex < totalInputQueries; ++queryIndex) {
    const currentQueryLine = parsedInputLines[queryIndex];

    // Skip any empty lines, which often occur due to input formatting.
    if (currentQueryLine.trim().length === 0) {
      continue;
    }

    // Convert the string query into an integer, representing a group's unique ID.
    const targetGroupIndex = Number.parseInt(currentQueryLine.trim(), 10);

    // Validate the parsed group index to prevent errors from out-of-bounds access.
    if (targetGroupIndex >= 0 && targetGroupIndex < calculatedGroupDelays.length) {
      // Output the determined waiting time for the requested group.
      console.log(calculatedGroupDelays[targetGroupIndex]);
    } else {
      // This branch could be used for error reporting or logging invalid requests.
      // For this problem, we assume valid group IDs are always provided.
    }
  }
}

/**
 * Simulates the operational flow of a restaurant, from group arrivals to seating,
 * to derive the total waiting time for each customer group.
 * @returns {number[]} An array mapping group identifiers to their respective waiting times in minutes.
 */
function computeRestaurantDynamics() {
  // `seatOccupancyTimers` tracks how many minutes each of the 17 seats will remain occupied.
  // A value of 0 indicates an empty seat.
  let seatOccupancyTimers = Array(17).fill(0);

  // Defines the varying sizes of incoming customer groups.
  // The group size pattern repeats every 5 groups (e.g., group 0, 5, 10... are size 2).
  const incomingGroupSizes = [2, 5, 2, 2, 2];

  // Specifies the duration (in minutes) that each group type spends eating.
  // This eating duration pattern repeats every 6 groups.
  const groupMealDurations = [19, 39, 25, 36, 22, 42];

  // `currentWaitingGroupIndex` holds the identifier of the group that has arrived
  // and is currently waiting to be seated. A value of -1 means no group is waiting.
  let currentWaitingGroupIndex = -1;

  // `simulationElapsedTime` tracks the passage of time within the simulation, in minutes.
  let simulationElapsedTime = 0;

  // `recordedWaitTimes` stores the calculated wait time for each group.
  // Assuming we need to track up to group 99 (total 100 groups, indexed 0-99).
  let recordedWaitTimes = Array(100).fill(0);

  // `remainingGroupsToProcess` counts how many groups still need to be seated before the simulation concludes.
  const totalGroupsToSimulate = 100;
  let remainingGroupsToProcess = totalGroupsToSimulate;

  // The primary simulation loop continues until all groups have been seated.
  while (true) {
    // --- Phase 1: Update seat statuses (groups completing their meals) ---
    // For each seat, decrement its occupancy timer. If it reaches zero, the seat becomes free.
    for (let seatPosition = 0; seatPosition < seatOccupancyTimers.length; ++seatPosition) {
      seatOccupancyTimers[seatPosition] = Math.max(0, seatOccupancyTimers[seatPosition] - 1);
    }

    // --- Phase 2: Process new group arrivals ---
    // A new group "arrives" (becomes available for seating) every 5 minutes.
    // This only occurs if no group is currently waiting to be seated.
    const isFiveMinuteMark = (simulationElapsedTime % 5 === 0);
    if (currentWaitingGroupIndex === -1 && isFiveMinuteMark) {
      // The group's identifier is simply `simulationElapsedTime / 5`.
      currentWaitingGroupIndex = simulationElapsedTime / 5;
    }

    // --- Phase 3: Attempt to seat waiting groups ---
    // This inner loop allows for multiple groups to be seated within the same simulation minute
    // if seats become available and new groups are ready.
    let groupSuccessfullySeatedInCurrentMinute = false;
    do {
      groupSuccessfullySeatedInCurrentMinute = false; // Reset flag for each seating attempt.

      // Proceed only if there's a group waiting to be seated.
      if (currentWaitingGroupIndex !== -1) {
        // Determine how many contiguous seats the current waiting group requires.
        const requiredContiguousSeats = incomingGroupSizes[currentWaitingGroupIndex % incomingGroupSizes.length];

        let currentConsecutiveEmptySeats = 0;
        let foundStartingSeat = -1;

        // Scan all seats to find a block of empty seats large enough for the group.
        for (let seatScanIndex = 0; seatScanIndex < seatOccupancyTimers.length; ++seatScanIndex) {
          if (seatOccupancyTimers[seatScanIndex] === 0) {
            currentConsecutiveEmptySeats++;
            if (currentConsecutiveEmptySeats === requiredContiguousSeats) {
              // Found a suitable block. `foundStartingSeat` is the first index of this block.
              foundStartingSeat = seatScanIndex - (requiredContiguousSeats - 1);
              break; // Exit the seat scanning loop as seats are found.
            }
          } else {
            // Contiguity is broken, reset the count of empty seats.
            currentConsecutiveEmptySeats = 0;
          }
        }

        // If a contiguous block of seats was successfully identified:
        if (foundStartingSeat !== -1) {
          // Calculate and record the waiting time for this group.
          const groupArrivalMoment = currentWaitingGroupIndex * 5;
          recordedWaitTimes[currentWaitingGroupIndex] = simulationElapsedTime - groupArrivalMoment;

          // Occupy the found seats for the duration of the group's meal.
          const currentGroupEatingDuration = groupMealDurations[currentWaitingGroupIndex % groupMealDurations.length];
          for (let fillSeatIndex = foundStartingSeat; fillSeatIndex < (requiredContiguousSeats + foundStartingSeat); ++fillSeatIndex) {
            seatOccupancyTimers[fillSeatIndex] = currentGroupEatingDuration;
          }

          // Mark that a group was seated, which might trigger another seating attempt in this minute.
          groupSuccessfullySeatedInCurrentMinute = true;

          // Decrement the counter for groups yet to be processed.
          remainingGroupsToProcess--;

          // Check if all designated groups have now been seated.
          if (remainingGroupsToProcess <= 0) {
            // If so, the simulation is complete, return the results.
            return recordedWaitTimes;
          }

          // Determine the next group that should be considered for seating.
          // If the next potential group has already arrived (based on simulation time),
          // it becomes the `currentWaitingGroupIndex`. Otherwise, no group is immediately waiting.
          const nextPotentialGroupArrivalMoment = (currentWaitingGroupIndex + 1) * 5;
          if (nextPotentialGroupArrivalMoment <= simulationElapsedTime) {
            currentWaitingGroupIndex++; // Advance to the next group, which is already 'here'.
          } else {
            currentWaitingGroupIndex = -1; // No group is ready to be seated yet.
          }
        }
      }
    } while (groupSuccessfullySeatedInCurrentMinute); // Continue seating attempts as long as groups are successfully seated.

    // Advance the simulation time by one minute.
    simulationElapsedTime++;
  }
}