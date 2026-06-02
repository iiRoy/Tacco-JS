var fs = require('fs');
var fileSize = fs.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(fileSize);
var actualBytesRead = fs.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);
var rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Begin program execution
executeSimulation();

function executeSimulation() {
  // Calculate all wait times for parties
  var calculatedWaitTimes = simulateRestaurant();

  // Output the wait time for each requested party from input
  for (var lineIndex = 0, totalLines = rawInputLines.length - 1; lineIndex < totalLines; lineIndex++) {
    console.log(calculatedWaitTimes[parseInt(rawInputLines[lineIndex], 10)]);
  }
}

function simulateRestaurant() {
  // Initialize restaurant state
  var chairOccupancy = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  var partySizes = new Int32Array([2, 5, 2, 2, 2]);
  var diningDurations = new Int32Array([19, 39, 25, 36, 22, 42]);

  var currentPartyIndex = -1; // Index of the next party to arrive/be seated
  var elapsedMinutes = 0;     // Total minutes passed since opening
  var partyWaitTimes = new Int32Array(100); // Stores wait times for parties 0-99
  var remainingPartiesToSeat = 100; // Counter for the 100 parties

  // Main simulation loop
  while (true) {
    // Step 1: Decrement dining times for occupied chairs
    var chairIterator;
    for (chairIterator = 17; chairIterator--;) {
      chairOccupancy[chairIterator] = determineMaximum(--chairOccupancy[chairIterator], 0);
    }

    // Step 2: Check for new party arrival
    if (currentPartyIndex === -1 && elapsedMinutes % 5 === 0) {
      currentPartyIndex = elapsedMinutes / 5;
    }

    // Step 3: Attempt to seat parties
    while (currentPartyIndex !== -1 && chairIterator !== 17) { // chairIterator is 0 here, so this condition is always true
      var requiredChairs = partySizes[currentPartyIndex % 5];
      var consecutiveEmptyChairs = 0;
      var startChairIndex = -1;

      for (chairIterator = 0; chairIterator < 17; chairIterator++) {
        consecutiveEmptyChairs = chairOccupancy[chairIterator] === 0 ? consecutiveEmptyChairs + 1 : 0;

        if (consecutiveEmptyChairs === requiredChairs) {
          var currentPartyDiningDuration = diningDurations[currentPartyIndex % 6];

          startChairIndex = chairIterator - (requiredChairs - 1);
          // Party can be seated! Record their wait time.
          partyWaitTimes[currentPartyIndex] = elapsedMinutes - (currentPartyIndex * 5);
          for (var seatFillIndex = startChairIndex, fillLoopEnd = (requiredChairs + startChairIndex); seatFillIndex < fillLoopEnd; seatFillIndex++) {
            chairOccupancy[seatFillIndex] = currentPartyDiningDuration;
          }

          // Determine the next party to consider for seating
          currentPartyIndex = (((currentPartyIndex + 1) * 5) <= elapsedMinutes) ? currentPartyIndex + 1 : -1;

          // Check if all 100 parties have been seated
          if (!(--remainingPartiesToSeat)) {
            return partyWaitTimes; // All parties seated, simulation complete
          }
          break; // Break from inner chair iteration, try to seat next party or advance time
        }
      }
    }

    // Advance time by one minute
    elapsedMinutes++;
  }
}

// Custom maximum function using bitwise operations
function determineMaximum(valA, valB) {
  var difference = (valA - valB);
  return valA - (difference & (difference >> 31));
}
