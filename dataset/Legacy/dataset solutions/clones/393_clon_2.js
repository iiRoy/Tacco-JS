function executeSimulation() {
  // Initialize the seating arrangement for the restaurant.
  // Each element represents a seat; 0 means empty, a positive number indicates
  // the remaining minutes until the seat becomes available.
  let seatingArrangement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // Define the sizes of incoming parties.
  const partySizes = [2, 5, 2, 2, 2];
  // Define the duration (in minutes) each party will occupy seats once seated.
  const mealDurations = [19, 39, 25, 36, 22, 42];

  // Tracks the index of the next party that has arrived or is about to arrive.
  // -1 means no party is currently waiting to be seated.
  let currentPartyIndex = -1;
  // Keeps track of the total elapsed time in minutes since the simulation started.
  let elapsedTime = 0;
  // An array to store the waiting time for each party, indexed by their arrival order.
  let partyWaitTimes = [];

  // Simulate the restaurant operation minute by minute until 100 parties
  // have their waiting times recorded.
  while (partyWaitTimes.length < 100) {
    // --- Phase 1: Update seat occupancy (parties finish eating) ---
    // Iterate through all seats and decrement their occupancy timer.
    // If a seat's timer reaches 0, it remains 0 (empty).
    for (let seatIdx = 0; seatIdx < seatingArrangement.length; seatIdx++) {
      seatingArrangement[seatIdx] = seatingArrangement[seatIdx] === 0 ? 0 : seatingArrangement[seatIdx] - 1;
    }

    // --- Phase 2: Party arrival ---
    // If no party is currently waiting to be seated (currentPartyIndex is -1)
    // and the current minute is an arrival minute (every 5 minutes).
    if (currentPartyIndex === -1 && elapsedTime % 5 === 0) {
      // Calculate the index of the newly arrived party based on elapsed time.
      currentPartyIndex = elapsedTime / 5;
    }

    // --- Phase 3: Seating process ---
    // Attempt to seat the current waiting party if there is one.
    while (currentPartyIndex !== -1) {
      // Determine the number of consecutive seats required for the current party.
      const requiredConsecutiveSeats = partySizes[currentPartyIndex % 5];
      let availableConsecutiveSeats = 0;
      let startingSeatIndex = -1; // This will store the index where the required consecutive seats start.

      // Scan through the seating arrangement to find a contiguous block of empty seats.
      for (let seatIdx = 0; seatIdx < seatingArrangement.length; seatIdx++) {
        // If the current seat is empty (value is 0), increment the count of available consecutive seats.
        // Otherwise, the sequence of empty seats is broken, so reset the count.
        availableConsecutiveSeats = seatingArrangement[seatIdx] === 0 ? availableConsecutiveSeats + 1 : 0;

        // If enough consecutive seats are found.
        if (availableConsecutiveSeats === requiredConsecutiveSeats) {
          // Calculate the actual starting index for this block of seats.
          startingSeatIndex = seatIdx - (requiredConsecutiveSeats - 1);
          break; // A suitable spot was found, exit the search loop.
        }
      }

      // Check if a suitable block of seats was found for the party.
      if (startingSeatIndex !== -1) {
        // Party successfully seated.
        // Record the waiting time for this party. Waiting time is current time minus arrival time.
        partyWaitTimes[currentPartyIndex] = elapsedTime - (currentPartyIndex * 5);
        // Occupy the found seats for the duration of their meal.
        for (let seatIdx = startingSeatIndex; seatIdx < (requiredConsecutiveSeats + startingSeatIndex); seatIdx++) {
          seatingArrangement[seatIdx] = mealDurations[currentPartyIndex % 6];
        }

        // Determine the next party to consider for seating.
        // If the next potential party (currentPartyIndex + 1) has already arrived
        // (i.e., their arrival time is less than or equal to the current elapsed time),
        // then move to consider that party. Otherwise, set currentPartyIndex to -1,
        // indicating no party is currently waiting to be seated.
        currentPartyIndex = (((currentPartyIndex + 1) * 5) <= elapsedTime) ? currentPartyIndex + 1 : -1;
      } else {
        // Party could not be seated due to lack of available space.
        // They will continue to wait until the next minute, so break from this inner loop.
        break;
      }
    }

    // Advance the simulation by one minute.
    elapsedTime++;
  }

  // --- Output results ---
  // For each input query, parse the party index and print the corresponding party's waiting time.
  for (let queryIdx = 0; queryIdx < (rawData.length - 1); queryIdx++) {
    console.log(partyWaitTimes[parseInt(rawData[queryIdx], 10)]);
  }
}

// Global variable to store raw input data from stdin.
let rawData = '';

// Set up standard input processing.
process.stdin.resume(); // Keep the Node.js process alive for input.
process.stdin.setEncoding('utf8'); // Specify character encoding for the input stream.

// Event listener for incoming data chunks from stdin.
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk; // Append received data to the rawData string.
});

// Event listener for the 'end' of the input stream.
process.stdin.on('end', function() {
  // Once all input is received, split the accumulated raw data into an array of lines.
  rawData = rawData.split('\n');
  // After processing the input, initiate the main simulation logic.
  executeSimulation();
});
