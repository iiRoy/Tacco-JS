// Function to orchestrate the simulation of group seating in a venue
function simulateSeatingProcess() {

  // Configuration Constants for the seating simulation
  const TOTAL_SEATING_CAPACITY = 17; // Defines the total number of individual seats available in the venue.
  const ARRIVAL_INTERVAL_MINUTES = 5; // Specifies that a new group arrives every 5 minutes.
  const MAX_WAIT_TIMES_TO_RECORD = 100; // The simulation will run until this many group wait times have been recorded.

  // Seating area status:
  // An array representing each seat. A value of 0 means the seat is empty.
  // A positive number indicates the seat is occupied and will be free in that many minutes.
  let occupancyTracker = Array(TOTAL_SEATING_CAPACITY).fill(0); // Initialize all seats as empty at the start.

  // Group characteristics, which cycle through these arrays based on group arrival index.
  // `incomingGroupCounts`: Defines the number of members in each arriving group.
  const incomingGroupCounts = [2, 5, 2, 2, 2];
  // `stayDurationPerGroup`: Defines how many minutes each group will occupy their seats.
  const stayDurationPerGroup = [19, 39, 25, 36, 22, 42];

  // Simulation state variables
  // `currentGroupAwaitingSeatingIndex`: Stores the sequential index of the group that has arrived
  // and is currently waiting to be seated. A value of -1 means no group is actively queued
  // for immediate seating consideration.
  let currentGroupAwaitingSeatingIndex = -1;
  let simulationClock = 0; // Tracks the current minute elapsed in the simulation.
  // `recordedDelays`: An array to store the calculated waiting time (in minutes) for each successfully seated group.
  let recordedDelays = [];

  // Main simulation loop: This loop continues to execute, advancing the simulation clock minute by minute,
  // until the desired number of group wait times (MAX_WAIT_TIMES_TO_RECORD) has been collected.
  while (recordedDelays.length < MAX_WAIT_TIMES_TO_RECORD) {

    // --- Phase 1: Process Departures (Groups finishing their stay) ---
    // Iterate through every seat in the venue. For any occupied seat, decrement its remaining occupation timer.
    // When a seat's timer naturally reaches 0 (or is already 0), it signifies the seat is empty and available.
    for (let seatIndex = 0; seatIndex < TOTAL_SEATING_CAPACITY; seatIndex++) {
      if (occupancyTracker[seatIndex] > 0) {
        occupancyTracker[seatIndex]--; // Reduce the remaining time for occupied seats.
      }
    }

    // --- Phase 2: Group Arrival Check and Queuing ---
    // A new group is considered to have "arrived" at the venue if two conditions are met:
    // 1. The `simulationClock` (current minute) is a perfect multiple of the `ARRIVAL_INTERVAL_MINUTES`.
    // 2. There is currently no other group (`currentGroupAwaitingSeatingIndex === -1`) already in the queue
    //    for immediate seating consideration from a previous minute.
    if (currentGroupAwaitingSeatingIndex === -1 && (simulationClock % ARRIVAL_INTERVAL_MINUTES === 0)) {
      // Calculate the sequential index of this newly arrived group. For instance, at minute 0, it's group 0;
      // at minute 5, it's group 1; at minute 10, it's group 2, and so on.
      currentGroupAwaitingSeatingIndex = simulationClock / ARRIVAL_INTERVAL_MINUTES;
    }

    // --- Phase 3: Attempt to Seat Arrived Groups ---
    // This inner loop continuously tries to seat the `currentGroupAwaitingSeatingIndex` (if one is pending).
    // It's designed to handle scenarios where multiple groups might arrive and be seated within the same
    // simulation minute, should seats become available rapidly.
    while (currentGroupAwaitingSeatingIndex !== -1) {
      // Determine the specific number of contiguous seats this group requires,
      // by cycling through the `incomingGroupCounts` array.
      const requiredContiguousSeats = incomingGroupCounts[currentGroupAwaitingSeatingIndex % incomingGroupCounts.length];

      let availableConsecutiveSeats = 0; // A temporary counter for tracking contiguous empty seats during the scan.
      let foundStartingPosition = -1; // Will store the starting index of a suitable block of seats if found.

      // Scan the entire `occupancyTracker` array from left to right to find a block of empty seats.
      for (let sIdx = 0; sIdx < TOTAL_SEATING_CAPACITY; sIdx++) {
        if (occupancyTracker[sIdx] === 0) {
          availableConsecutiveSeats++; // If the seat is empty, extend the current sequence of empty seats.
        } else {
          availableConsecutiveSeats = 0; // If an occupied seat is encountered, the sequence is broken.
        }

        // Check if the current sequence of empty seats is sufficient for the group.
        if (availableConsecutiveSeats === requiredContiguousSeats) {
          // Calculate the actual starting index of the contiguous block.
          foundStartingPosition = sIdx - (requiredContiguousSeats - 1);
          break; // A suitable spot is found, no need to scan further.
        }
      }

      // Decision Branch: Evaluate if seating was successful or not.
      if (foundStartingPosition !== -1) {
        // --- Seating Successful for currentGroupAwaitingSeatingIndex ---
        // Calculate the group's actual arrival time based on its index and the arrival interval.
        const groupActualArrivalTime = currentGroupAwaitingSeatingIndex * ARRIVAL_INTERVAL_MINUTES;
        // Record the waiting time: current simulation time minus the group's arrival time.
        recordedDelays[currentGroupAwaitingSeatingIndex] = simulationClock - groupActualArrivalTime;

        // Determine how long this specific group will occupy the seats, cycling through `stayDurationPerGroup`.
        const groupStayDuration = stayDurationPerGroup[currentGroupAwaitingSeatingIndex % stayDurationPerGroup.length];

        // Occupy the found seats by setting their timers to the `groupStayDuration`.
        for (let fillIdx = foundStartingPosition; fillIdx < (requiredContiguousSeats + foundStartingPosition); fillIdx++) {
          occupancyTracker[fillIdx] = groupStayDuration;
        }

        // After successfully seating a group, check if the *next* sequential group (by arrival order)
        // has also already "arrived" by the current `simulationClock`.
        // If the next group's potential arrival time is less than or equal to the current clock,
        // it means that group has already arrived and should be considered for seating immediately
        // within this same simulation minute.
        const nextGroupPotentialArrivalTime = (currentGroupAwaitingSeatingIndex + 1) * ARRIVAL_INTERVAL_MINUTES;
        if (nextGroupPotentialArrivalTime <= simulationClock) {
          currentGroupAwaitingSeatingIndex++; // Advance to consider the next group in the arrival sequence.
        } else {
          // If the next group hasn't arrived yet, reset the pointer, meaning no more groups
          // are immediately waiting to be seated at this exact minute.
          currentGroupAwaitingSeatingIndex = -1;
        }
      } else {
        // --- Seating Unsuccessful ---
        // The `currentGroupAwaitingSeatingIndex` group could not be seated because no sufficiently
        // large contiguous block of empty seats was found. This group must wait.
        // Break from this inner seating loop; the `currentGroupAwaitingSeatingIndex` remains set,
        // indicating this group is still pending and will be retried in the next simulation minute.
        break;
      }
    }

    // --- Phase 4: Advance Simulation Clock ---
    simulationClock++; // Increment the simulation time by one minute, moving to the next time step.
  }

  // --- Post-simulation Processing: Output Results ---
  // This section is responsible for printing the recorded waiting times based on external input.
  // It assumes 'input' is a globally available array of string-encoded group indices.
  if (typeof input !== 'undefined' && Array.isArray(input)) {
      // Loop through the input array. The `input.length - 1` is used to account for potential
      // empty strings resulting from `split('\n')` if the input ends with a newline.
      for (let outputIdx = 0; outputIdx < (input.length - 1); outputIdx++) {
        // Parse the group index from the string input to an integer.
        const targetGroupIndex = parseInt(input[outputIdx], 10);

        // Validate the parsed index to ensure it's within the bounds of `recordedDelays`.
        // This prevents errors from trying to access non-existent wait times.
        if (targetGroupIndex >= 0 && targetGroupIndex < recordedDelays.length) {
            console.log(recordedDelays[targetGroupIndex]);
        }
      }
  }
}

// Global variable to accumulate raw input data received from standard input.
let input = ''; // Renamed from `receivedInputData` for direct compatibility with original `main`'s `input` usage.

// Standard Node.js process for handling input from the console (stdin).
process.stdin.resume(); // Ensures the stdin stream remains open to receive data.
process.stdin.setEncoding('utf8'); // Sets the character encoding for the incoming input data.

// Event listener for incoming data chunks. Each chunk is appended to the `input` string.
process.stdin.on('data', function(chunk) {
  input += chunk;
});

// Event listener for the end of the input stream. This signifies all input has been received.
process.stdin.on('end', function() {
  // Process the accumulated raw input:
  // 1. `trim()` removes any leading/trailing whitespace (e.g., final newline character).
  // 2. `split('\n')` divides the string into an array of lines, where each line is a group index.
  // The global `input` variable is then ready for use by `simulateSeatingProcess`.
  input = input.trim().split('\n');
  simulateSeatingProcess(); // Initiate the main simulation function after input is ready.
});