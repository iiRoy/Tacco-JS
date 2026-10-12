// Helper function to manage seat timers by decrementing non-zero values
function decrementOccupancyTimers(currentSeats) {
  for (let seatIndex = 0; seatIndex < currentSeats.length; seatIndex++) {
    currentSeats[seatIndex] = currentSeats[seatIndex] === 0 ? 0 : currentSeats[seatIndex] - 1;
  }
}

// Helper function to find the starting index of a contiguous block of free seats
function locateFreeSeatBlock(seatStatus, neededCount) {
  let consecutiveFreeCount = 0;
  for (let seatIndex = 0; seatIndex < seatStatus.length; seatIndex++) {
    consecutiveFreeCount = seatStatus[seatIndex] === 0 ? consecutiveFreeCount + 1 : 0;
    if (consecutiveFreeCount === neededCount) {
      return seatIndex - (neededCount - 1); // Return the starting index of the found block
    }
  }
  return -1; // No suitable block of seats found
}

// Helper function to mark a block of seats as occupied for a given duration
function assignSeats(seatStatus, startPosition, count, duration) {
  for (let seatIndex = startPosition; seatIndex < (count + startPosition); seatIndex++) {
    seatStatus[seatIndex] = duration;
  }
}

function mainSimulation() {
  // Define simulation constants
  const TOTAL_SEATS_COUNT = 17;
  const GROUP_ARRIVAL_INTERVAL_MINUTES = 5;
  const MAX_WAIT_TIMES_TO_RECORD = 100;

  // Initialize simulation state variables
  const seatOccupancy = new Array(TOTAL_SEATS_COUNT).fill(0);
  const groupSizes = [2, 5, 2, 2, 2];
  const eatingDurations = [19, 39, 25, 36, 22, 42];

  let currentProcessingGroupIndex = -1; // Index of the group currently being considered for seating
  let simulationTimeInMinutes = 0;
  const recordedWaitTimes = []; // Stores wait times for each group index

  // Main simulation loop: continues until 100 wait times are recorded
  while (recordedWaitTimes.length < MAX_WAIT_TIMES_TO_RECORD) {
    // Step 1: Advance time for all occupied seats
    decrementOccupancyTimers(seatOccupancy);

    // Step 2: Check for a new group arrival if no group is currently being processed
    const isNoGroupCurrentlyProcessing = currentProcessingGroupIndex === -1;
    const isCurrentMinuteAnArrivalMinute = simulationTimeInMinutes % GROUP_ARRIVAL_INTERVAL_MINUTES === 0;

    if (isNoGroupCurrentlyProcessing && isCurrentMinuteAnArrivalMinute) {
      currentProcessingGroupIndex = simulationTimeInMinutes / GROUP_ARRIVAL_INTERVAL_MINUTES;
    }

    // Step 3: Attempt to seat the current group and subsequent groups if possible
    while (currentProcessingGroupIndex !== -1) {
      const requiredGroupSize = groupSizes[currentProcessingGroupIndex % groupSizes.length];
      const potentialStartIndex = locateFreeSeatBlock(seatOccupancy, requiredGroupSize);

      if (potentialStartIndex !== -1) {
        // If a suitable block of seats is found, seat the group
        const groupArrivalTime = currentProcessingGroupIndex * GROUP_ARRIVAL_INTERVAL_MINUTES;
        recordedWaitTimes[currentProcessingGroupIndex] = simulationTimeInMinutes - groupArrivalTime;

        const groupEatingDuration = eatingDurations[currentProcessingGroupIndex % eatingDurations.length];
        assignSeats(seatOccupancy, potentialStartIndex, requiredGroupSize, groupEatingDuration);

        // Check if the next group has also arrived and can be processed immediately
        const nextGroupCandidateIndex = currentProcessingGroupIndex + 1;
        const nextGroupExpectedArrivalTime = nextGroupCandidateIndex * GROUP_ARRIVAL_INTERVAL_MINUTES;

        if (nextGroupExpectedArrivalTime <= simulationTimeInMinutes) {
          currentProcessingGroupIndex = nextGroupCandidateIndex; // Process the next group
        } else {
          currentProcessingGroupIndex = -1; // No more groups waiting at this exact minute
        }
      } else {
        // If no seats are available for the current group, stop trying to seat groups for this minute
        break;
      }
    }

    simulationTimeInMinutes++; // Advance simulation time by one minute
  }

  // Step 4: Process input requests and output the recorded wait times
  const inputLines = rawData.slice(0, rawData.length - 1); // Exclude potential empty last line
  for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const requestedGroupNumber = parseInt(inputLines[lineIndex], 10);
    console.log(recordedWaitTimes[requestedGroupNumber]);
  }
}

let rawData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawData += chunk;
});
process.stdin.on('end', function() {
  rawData = rawData.split('\n');
  mainSimulation();
});
