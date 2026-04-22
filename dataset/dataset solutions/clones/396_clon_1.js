/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct but functionally equivalent version.
 */

// --- Standard Input Processing ---
// Import the Node.js 'fs' module for file system operations.
var fs = require('fs')
  , // Get the size of the standard input file descriptor.
    length = fs.fstatSync(process.stdin.fd).size
  , // Create a buffer to hold the input data.
    buffer = new Buffer(length)
  , // Read data synchronously from standard input into the buffer.
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , // Convert the buffer to a UTF-8 string, then split by newlines.
    input = buffer.toString('utf8', 0, bytesRead).split('\n')
;

// --- Main Program Execution ---
// Call the primary function to start the simulation.
main();


/**
 * The main function encapsulates the core logic of the simulation.
 * It manages seat availability, group arrivals, seating, and calculates wait times.
 */
function main() {

  // --- Simulation State Variables Initialization ---

  // Array representing 17 seats; 0 means empty, positive value means occupied for that many minutes.
  var seats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Members in each group, indexed by (group_id % 5).
  var groupMembers = [2, 5, 2, 2, 2];

  // Eating duration for each group, indexed by (group_id % 6).
  var eatTimes = [19, 39, 25, 36, 22, 42];


  // The ID of the group currently at the head of the queue, or -1 if no group is waiting.
  var headGroup = -1;

  // The total number of minutes that have passed in the simulation.
  var pastMinutes = 0;

  // Array to store the wait time for each group. Initialized to a large size.
  var waitTime = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Counter for the number of groups remaining to be seated (starts at 100).
  var lastMembers = 100;


  // --- Main Simulation Loop ---
  // The simulation continues indefinitely until 100 groups are seated.
  while (true) {

    // --- "Eat-End" Phase: Decrement seat timers ---
    // Iterate through all seats and decrement their occupation timers.
    // If a seat's timer reaches 0, it becomes empty.
    var i;
    for (i = 17; i--;) {
      seats[i] = max(--seats[i], 0);
    }


    // --- "Arrival" Phase: Check for new group arrival ---
    // A new group arrives every 5 minutes, if no group is currently waiting.
    if (headGroup == -1 && pastMinutes % 5 == 0) {
      headGroup = pastMinutes / 5; // Assign the group ID based on arrival time.
    }


    // --- "Seating" Phase: Attempt to seat waiting groups ---
    // Continue attempting to seat groups as long as there's a group waiting
    // and the loop iterator 'i' (reused from the previous loop) is not 17.
    while (headGroup != -1 && i != 17) {
      // Determine the number of sequential seats required for the current group.
      var needsSequencialSeats = groupMembers[headGroup % 5];
      var sequencialSeats = 0; // Counter for currently available sequential seats.
      var startIndex = -1;     // The starting index of the found sequential seats.


      // Iterate through all seats to find a suitable contiguous block.
      for (i = 0; i < seats.length; i++) {
        // If the current seat is empty, increment the sequential seats counter; otherwise, reset it.
        sequencialSeats = seats[i] == 0 ? sequencialSeats + 1 : 0;

        // If a sufficient number of sequential seats are found...
        if (sequencialSeats == needsSequencialSeats) {
          // Calculate the starting index of this block.
          startIndex = i - (needsSequencialSeats - 1);

          // --- Group Seated ---
          // Record the wait time for this group.
          waitTime[headGroup] = pastMinutes - (headGroup * 5);

          // Occupy the found seats for the group's eating duration.
          for (var j = startIndex; j < (needsSequencialSeats + startIndex); j++) {
            seats[j] = eatTimes[headGroup % 6];
          }

          // Move the 'headGroup' pointer to the next group if it has already arrived,
          // otherwise, set it to -1, indicating no group is currently at the head.
          headGroup = (((headGroup + 1) * 5) <= pastMinutes) ? headGroup + 1 : -1;

          // Decrement the total count of groups remaining to be seated.
          if (!(--lastMembers)) {
            // If 100 groups have been seated, the simulation is complete.
            return; // Exit the main function.
          }
          break; // Exit the inner 'for' loop as the group has been seated.
        }
      }
    }


    // Increment the total elapsed minutes for the simulation.
    pastMinutes++;

  } // End of while(true) simulation loop.


  // --- Output Wait Times ---
  // After the simulation, iterate through the input queries (group IDs)
  // and print their calculated wait times.
  for (var i = 0; i < (input.length - 1); i++) {
    console.log(waitTime[parseInt(input[i], 10)]);
  }

} // End of main function.


/**
 * Custom 'max' function to find the maximum of two numbers.
 * This implementation uses bitwise operations for performance or
 * to avoid standard library calls.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The greater of the two input numbers.
 */
function max(a, b) {
  var t = (a - b);
  // This bitwise trick works for signed 32-bit integers.
  // If t is negative, (t >> 31) is -1.
  // If t is positive or zero, (t >> 31) is 0.
  // So, t & (t >> 31) is t if t is negative, and 0 if t is positive/zero.
  // a - (t if t<0 else 0) results in max(a,b).
  return a - (t & (t >> 31));
}