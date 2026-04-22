var fileSys = require('fs'),
  fileSize = fileSys.fstatSync(process.stdin.fd).size,
  dataBuffer = new Buffer(fileSize),
  readCount = fileSys.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0),
  dataLines = dataBuffer.toString('utf8', 0, readCount).split('\n');

processSimulation();

function processSimulation() {
  // Initialize seating availability for 17 spots
  var occupancyStatus = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // Define the number of people in each group
  var partySizes = [2, 5, 2, 2, 2];
  // Set the duration of meals for different groups
  var mealDurations = [19, 39, 25, 36, 22, 42];

  var currentPartyIndex = -1; // Tracks the next group waiting to be seated
  var elapsedTime = 0; // Simulation time in minutes
  // Array to store the waiting time for each of the 100 potential groups
  var queueDelays = new Array(100).fill(0);
  var remainingPartiesToSeat = 100; // Total groups to process

  while (true) {
    // Decrement meal timers for occupied seats
    let idx;
    for (idx = 17; idx--;) {
      occupancyStatus[idx] = getMaximum(--occupancyStatus[idx], 0);
    }

    // Check for a new party arrival every 5 minutes if no one is currently waiting
    if (currentPartyIndex === -1 && elapsedTime % 5 === 0) {
      currentPartyIndex = elapsedTime / 5;
    }

    // Attempt to seat the waiting party if there is one and the previous loop finished (idx is 0)
    while (currentPartyIndex !== -1 && idx !== 17) {
      var requiredConsecutiveSpots = partySizes[currentPartyIndex % 5];
      var currentConsecutiveCount = 0;
      var startPosition = -1;

      for (let spotIdx = 0; spotIdx < occupancyStatus.length; spotIdx++) {
        // Count consecutive empty spots
        currentConsecutiveCount = occupancyStatus[spotIdx] === 0 ? currentConsecutiveCount + 1 : 0;

        if (currentConsecutiveCount === requiredConsecutiveSpots) {
          startPosition = spotIdx - (requiredConsecutiveSpots - 1);
          // Seating found! Record the wait time for this party.
          queueDelays[currentPartyIndex] = elapsedTime - (currentPartyIndex * 5);
          // Occupy the found seats for their meal duration
          for (let pos = startPosition; pos < (requiredConsecutiveSpots + startPosition); pos++) {
            occupancyStatus[pos] = mealDurations[currentPartyIndex % 6];
          }

          // Determine the next party to consider, or set to -1 if no new party is ready yet
          currentPartyIndex = (((currentPartyIndex + 1) * 5) <= elapsedTime) ? currentPartyIndex + 1 : -1;
          // Decrement the total count of parties left to seat
          if (!(--remainingPartiesToSeat)) {
            // All 100 groups have been seated, simulation complete
            return;
          }
          break; // Exit the spot search loop, party is seated
        }
      }
    }

    elapsedTime++; // Advance the simulation time by one minute
  }

  // Output the calculated waiting times based on the input requests
  for (let idx = 0; idx < (dataLines.length - 1); idx++) {
    console.log(queueDelays[parseInt(dataLines[idx], 10)]);
  }

}

// Custom max function using bitwise operations
function getMaximum(valOne, valTwo) {
  var diffVal = (valOne - valTwo);
  return valOne - (diffVal & (diffVal >> 31));
}