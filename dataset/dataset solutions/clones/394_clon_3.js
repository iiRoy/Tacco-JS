const fileSystemModule = require('fs'); // Core module for file system operations

// --- Input Processing Section ---
// Determine the total byte size of the standard input stream.
const inputDataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a new Buffer to hold the raw bytes read from standard input.
// Using Buffer.alloc for safer memory allocation compared to deprecated 'new Buffer()'.
const rawInputBuffer = Buffer.alloc(inputDataSize);

// Synchronously read data from standard input into the allocated buffer.
// Parameters: file descriptor, buffer, offset, length, position.
const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, rawInputBuffer, 0, inputDataSize, 0);

// Convert the buffer content to a UTF-8 string, then split it into an array of lines.
// Each element in `queryLines` represents a line from the input.
const queryLines = rawInputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// --- Simulation Execution ---
// Begin the main simulation process.
initiateRestaurantFlowSimulation();

/**
 * Serves as the primary orchestrator for the restaurant simulation.
 * It triggers the core simulation logic and then processes user queries.
 */
function initiateRestaurantFlowSimulation() {
  // Execute the detailed restaurant simulation to obtain all calculated wait times for parties.
  const calculatedWaitTimes = conductRestaurantOperations();

  // Guard clause: If there are no query lines (or only an empty final line), there's nothing to process.
  if (queryLines.length <= 1) {
    return;
  }

  // Iterate through each query line (excluding the potential trailing empty line).
  for (let queryIndex = 0; queryIndex < queryLines.length - 1; queryIndex++) {
    // Convert the current query line (which represents a party number) into a numerical value.
    const queriedPartyIdentifier = Number(queryLines[queryIndex]);
    // Print the wait time corresponding to the queried party identifier.
    console.log(calculatedWaitTimes[queriedPartyIdentifier]);
  }
}

/**
 * Simulates the entire customer flow and seating process within a restaurant.
 * This function calculates the wait time for the first 100 arriving parties.
 * @returns {Array<number>} An array where the index corresponds to the party's arrival order
 *                          and the value is the total minutes that party waited to be seated.
 */
function conductRestaurantOperations() {
  const totalRestaurantSeats = 17; // Total number of individual seats available in the restaurant.
  // An array tracking the remaining "meal time" for each seat.
  // A value of 0 indicates the seat is currently free.
  const tableOccupancyTimers = new Array(totalRestaurantSeats).fill(0);

  // Predefined configurations for the sizes of arriving customer parties.
  const customerPartySizes = [2, 5, 2, 2, 2];

  // Predefined durations (in minutes) for meals, linked to party types/indices.
  const predefinedMealDurations = [19, 39, 25, 36, 22, 42];

  // --- Simulation State Variables ---
  let nextPartyToSeatIndex = -1;       // Index of the next party that has arrived and is waiting to be seated. -1 if no party is currently waiting.
  let currentSimulationMinute = 0;     // The elapsed time in minutes since the simulation began.
  const recordedWaitTimes = new Array(100); // Stores the calculated wait times for the first 100 parties.
  let partiesRemainingToProcess = 100; // Counter for how many parties still need to be seated before the simulation ends.

  const partyArrivalCadence = 5; // New constant: Parties arrive every 5 minutes.

  // --- Main Simulation Loop ---
  // This loop continues indefinitely until all 100 parties have been seated and their wait times recorded.
  for (;;) {
    // --- Phase 1: Update Seat Availability (Customers Finishing Meals) ---
    // Iterate through each seat and decrement its occupancy timer.
    // If a seat's timer reaches zero, it becomes available.
    for (let seatIterator = 0; seatIterator < totalRestaurantSeats; seatIterator++) {
      // Ensure the timer never goes below zero.
      tableOccupancyTimers[seatIterator] = Math.max(0, tableOccupancyTimers[seatIterator] - 1);
    }

    // --- Phase 2: Check for New Party Arrivals ---
    // Calculate the expected index of the party that should arrive at the current minute.
    const potentialNewPartyArrivalIndex = Math.floor(currentSimulationMinute / partyArrivalCadence);
    // Determine if the current minute marks an official arrival time for a new party.
    const isCurrentMinuteAnArrivalMoment = (currentSimulationMinute % partyArrivalCadence === 0);

    // If no party is currently queued for seating AND it's an arrival minute,
    // then the newly arrived party becomes the next candidate for seating.
    if (nextPartyToSeatIndex === -1 && isCurrentMinuteAnArrivalMoment) {
      nextPartyToSeatIndex = potentialNewPartyArrivalIndex;
    }

    // --- Phase 3: Attempt to Seat Waiting Parties ---
    // This inner loop attempts to seat parties. It can seat multiple parties
    // within the same minute if seats become available and subsequent parties
    // have already arrived. It stops if no party is waiting or if the current
    // waiting party cannot be seated.
    while (nextPartyToSeatIndex !== -1) {
      // Determine the number of consecutive seats required by the current waiting party.
      const requiredAdjacentSpots = customerPartySizes[nextPartyToSeatIndex % customerPartySizes.length];
      let currentConsecutiveFreeSpots = 0; // Tracks the count of contiguous free seats found so far.
      let firstSeatFoundForParty = -1;     // The starting index of the block of seats found.
      let seatingArrangementFound = false; // Flag indicating if suitable seats were found.

      // Search for a contiguous block of free seats across the restaurant.
      for (let seatSearchIndex = 0; seatSearchIndex < totalRestaurantSeats; seatSearchIndex++) {
        if (tableOccupancyTimers[seatSearchIndex] === 0) {
          currentConsecutiveFreeSpots++; // Increment if the current seat is free.
        } else {
          currentConsecutiveFreeSpots = 0; // Reset count if an occupied seat is encountered.
        }

        // If a sufficient number of consecutive free spots has been found:
        if (currentConsecutiveFreeSpots === requiredAdjacentSpots) {
          firstSeatFoundForParty = seatSearchIndex - (requiredAdjacentSpots - 1);
          seatingArrangementFound = true;
          break; // Seats found, no need to search further.
        }
      }

      // If a suitable block of seats was found for the current waiting party:
      if (seatingArrangementFound) {
        // Determine how long this party will occupy the seats.
        const partyMealDuration = predefinedMealDurations[nextPartyToSeatIndex % predefinedMealDurations.length];

        // Calculate and record the wait time for this party.
        // Wait time = current time - (party's arrival time).
        recordedWaitTimes[nextPartyToSeatIndex] = currentSimulationMinute - (nextPartyToSeatIndex * partyArrivalCadence);

        // Occupy the found seats by setting their timers.
        for (let fillSeatIndex = 0; fillSeatIndex < requiredAdjacentSpots; fillSeatIndex++) {
          tableOccupancyTimers[firstSeatFoundForParty + fillSeatIndex] = partyMealDuration;
        }

        // Decrement the count of parties still needing to be seated.
        partiesRemainingToProcess--;

        // Check if the simulation is complete (all 100 parties have been seated).
        if (partiesRemainingToProcess <= 0) {
          return recordedWaitTimes; // Return the results and end the simulation.
        }

        // After seating a party, immediately check if the *next* sequential party
        // has already arrived. If so, attempt to seat them within the same minute.
        const subsequentPartyCandidateIndex = nextPartyToSeatIndex + 1;
        if (subsequentPartyCandidateIndex * partyArrivalCadence <= currentSimulationMinute) {
          nextPartyToSeatIndex = subsequentPartyCandidateIndex; // Proceed to try seating the next party.
        } else {
          nextPartyToSeatIndex = -1; // No more parties currently waiting from the arrival queue.
        }
      } else {
        // If no seats could be found for the current waiting party,
        // this party remains `nextPartyToSeatIndex` for the next minute.
        // Break from this inner `while` loop, as no further seating can occur in this minute.
        break;
      }
    } // End of while (nextPartyToSeatIndex !== -1)

    // Advance the simulation clock by one minute.
    currentSimulationMinute++;
  }
}