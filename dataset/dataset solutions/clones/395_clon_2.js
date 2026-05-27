var fileSystem = require('fs');

// Determine the size of the standard input stream
var dataLength = fileSystem.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var inputBuffer = new Buffer(dataLength);

// Read data from standard input into the buffer
var readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);

// Convert the buffer content to a UTF-8 string and split into lines
var inputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Execute the primary processing function
processInput();

/**
 * Main function to process the input and display results.
 */
function processInput() {
  // Calculate the waiting times for all parties
  var calculatedWaitTimes = calculateSeatingTimes();

  // Iterate through each line of input (excluding the last empty line if present)
  for (var idx = 0, lineCount = inputLines.length - 1; idx < lineCount; idx++) {
    // Parse the input line as an integer and use it as an index to display the waiting time
    console.log(calculatedWaitTimes[parseInt(inputLines[idx], 10)]);
  }
}

/**
 * Calculates the waiting times for a series of parties arriving at a restaurant.
 * This simulation models seating arrangements and dining durations.
 * @returns {number[]} An array where the index represents the party number and the value is their waiting time.
 */
function calculateSeatingTimes() {
  // Represents the state of 17 seats; 0 means empty, >0 means occupied for that many more minutes.
  var seatingArrangement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Sizes of the arriving parties, repeating in a cycle.
  var partySizes = [2, 5, 2, 2, 2];

  // Dining durations for parties, repeating in a cycle.
  var diningDurations = [19, 39, 25, 36, 22, 42];

  // Index of the next party to be seated. -1 means no party is currently waiting to be seated.
  var currentPartyIndex = -1;

  // Total minutes elapsed since the simulation started.
  var elapsedMinutes = 0;

  // Array to store the waiting duration for each party. Initialized for up to 100 parties.
  var partyWaitDurations = new Array(100).fill(0);

  // Counter for the number of parties remaining to be seated (starts at 100).
  var remainingPartiesToSeat = 100;

  // Main simulation loop, continues until all parties are seated.
  while (true) {
    // Step 1: Decrement dining times for occupied seats.
    // Iterate through seats in reverse to avoid issues with loop variable 'seatIdx' being reused later.
    var seatIdx;
    for (seatIdx = 17; seatIdx--;) {
      seatingArrangement[seatIdx] = getMaximumValue(--seatingArrangement[seatIdx], 0);
    }

    // Step 2: Check for new party arrival.
    // A new party arrives every 5 minutes.
    if (currentPartyIndex === -1 && elapsedMinutes % 5 === 0) {
      currentPartyIndex = elapsedMinutes / 5;
    }

    // Step 3: Attempt to seat the current party.
    // Continue trying to seat the party as long as there's a party waiting and we haven't checked all seats.
    while (currentPartyIndex !== -1 && seatIdx !== 17) {
      // Determine the size of the current party.
      var requiredConsecutiveSeats = partySizes[currentPartyIndex % 5];
      var availableConsecutiveSeats = 0;
      var startSeatIndex = -1;

      // Scan through the seating arrangement to find consecutive empty seats.
      var seatCheckIdx;
      for (seatCheckIdx = 0; seatCheckIdx < seatingArrangement.length; seatCheckIdx++) {
        // If the current seat is empty, increment the consecutive count; otherwise, reset it.
        availableConsecutiveSeats = seatingArrangement[seatCheckIdx] === 0 ? availableConsecutiveSeats + 1 : 0;

        // If enough consecutive seats are found for the current party.
        if (availableConsecutiveSeats === requiredConsecutiveSeats) {
          startSeatIndex = seatCheckIdx - (requiredConsecutiveSeats - 1);

          // Party can be seated! Record their waiting time.
          partyWaitDurations[currentPartyIndex] = elapsedMinutes - (currentPartyIndex * 5);

          // Occupy the found seats for the party's dining duration.
          var seatUpdateIdx;
          for (seatUpdateIdx = startSeatIndex; seatUpdateIdx < (requiredConsecutiveSeats + startSeatIndex); seatUpdateIdx++) {
            seatingArrangement[seatUpdateIdx] = diningDurations[currentPartyIndex % 6];
          }

          // Move to the next party. If the next party's arrival time is in the future, set currentPartyIndex to -1.
          currentPartyIndex = (((currentPartyIndex + 1) * 5) <= elapsedMinutes) ? currentPartyIndex + 1 : -1;

          // Decrement the count of remaining parties.
          if (!(--remainingPartiesToSeat)) {
            // All 100 groups have been seated. The simulation is complete.
            return partyWaitDurations;
          }
          break; // Break from the seat scanning loop, as the party has been seated.
        }
      }
      // If the inner loop completed without seating the party, it means no suitable seats were found.
      // The outer while loop condition `seatIdx !== 17` will prevent re-entering if `seatCheckIdx` reached 17.
      // This is a subtle point: `seatIdx` is the loop variable from the *previous* loop.
      // The original code's `i` was reused, which is a bit confusing.
      // To maintain exact behavior, `seatIdx` (which was `i` in original) needs to be reset or handled carefully.
      // The original code's `i` was 17 after the first loop, then reset to 0 in the second loop.
      // The `while(headGroup != -1 && i != 17)` condition is effectively `while(currentPartyIndex != -1 && seatCheckIdx != 17)`
      // after the inner loop. If `seatCheckIdx` reaches 17, it means no seats were found.
      // The `break` statement inside the `if(sequencialSeats == needsSequencialSeats)` block ensures that
      // if a party is seated, the `seatCheckIdx` loop terminates early, and the `while` condition
      // `seatIdx != 17` (which is `seatCheckIdx != 17` in this context) might still be true,
      // allowing another attempt to seat the *next* party if `currentPartyIndex` was updated.
      // However, if no seats are found, `seatCheckIdx` will reach 17, and the `while` loop will terminate.
      // This behavior is preserved by using `seatCheckIdx` in place of `i` for the second loop.
      // The `seatIdx` variable from the first loop is not directly used in the `while` condition.
      // The `i != 17` in the original `while` condition refers to the `i` from the *inner* loop,
      // which is `seatCheckIdx` in this clone.
      if (seatCheckIdx === seatingArrangement.length) { // If inner loop finished without seating
        break; // Exit the while loop, party not seated this minute.
      }
    }

    // Increment the total elapsed minutes.
    elapsedMinutes++;
  }
}

/**
 * Custom implementation of Math.max(a, b) using bitwise operations.
 * @param {number} val1 - The first number.
 * @param {number} val2 - The second number.
 * @returns {number} The greater of the two numbers.
 */
function getMaximumValue(val1, val2) {
  var diff = (val1 - val2);
  // If diff is negative, (diff >> 31) is -1. If diff is positive or zero, (diff >> 31) is 0.
  // This effectively computes: val1 - (diff if diff < 0 else 0)
  // Which is: val1 - (val1 - val2) = val2 if val1 < val2
  // And: val1 - 0 = val1 if val1 >= val2
  return val1 - (diff & (diff >> 31));
}
