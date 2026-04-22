/*
 * This section handles input processing from standard input.
 * It's designed to read the entire content of stdin synchronously.
 */
var fs = require( 'fs' )
  , length = fs.fstatSync( process.stdin.fd ).size // Determine the size of the input stream
  , buffer = new Buffer( length )                   // Allocate a buffer to hold the input data
  , bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 ) // Read data into the buffer
  , input = buffer.toString( 'utf8', 0, bytesRead ).split( '\n' ); // Convert buffer to UTF-8 string and split by newline

// The main execution point of the program.
main();


/**
 * The primary function that orchestrates the simulation.
 * It calls the calculation logic and then prints results.
 */
function main ( ) {

  var waitTime = calc( ); // Execute the core calculation logic.

  // Iterate through the input array (excluding the last empty line, if any)
  for ( var i = 0, len = input.length - 1; i < len; i++ ) {
    // Parse each input line as an integer and use it as an index for waitTime.
    console.log( waitTime[ parseInt( input[i], 10 ) ] );
  }

}


/**
 * Simulates a restaurant waiting line and seating process.
 * Calculates the waiting time for 100 groups.
 * @returns {Int32Array} An array containing the waiting times for each group.
 */
function calc ( ) {

  // Initialize an array representing 17 seats in the restaurant.
  // Each element stores the remaining "eat time" for a seat.
  var seats = new Int32Array( [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

  // Define the number of members for each group type (cyclical).
  var groupMembers = new Int32Array( [ 2, 5, 2, 2, 2 ] );

  // Define the eating duration for each group type (cyclical).
  var eatTimes = new Int32Array( [ 19, 39, 25, 36, 22, 42 ] );


  var headGroup = -1;      // Tracks the index of the next group waiting to be seated. -1 means no group has arrived yet.
  var pastMinutes = 0;     // Total minutes elapsed in the simulation.
  var waitTime = new Int32Array( 100 ); // Stores the calculated waiting time for each of the 100 groups.
  var lastMembers = 100;   // Counter for the number of groups yet to be seated.


  // The main simulation loop continues until all 100 groups are seated.
  while ( true ) {

    // --- Process 'eating finished' events ---
    // Decrement the eat time for all occupied seats.
    // If a seat's eat time drops to 0 or below, it becomes available.
    var i;
    for ( i = 17; i-- ; ) {
      seats[i] = max( --seats[i], 0 );
    }


    // --- Process 'group arrival' events ---
    // A new group arrives every 5 minutes.
    if ( headGroup == -1 && pastMinutes % 5 == 0 ) {
      headGroup = pastMinutes / 5; // Set the first arriving group's index.
    }


    // --- Process 'seating' events ---
    // Attempt to seat the current head group if there is one and not all seats have been checked.
    while ( headGroup != -1 && i != 17 ) {

      var needsSequencialSeats = groupMembers[ headGroup % 5 ]; // Determine seats needed by the current group.
      var sequencialSeats = 0;                                  // Counter for consecutive available seats.
      var startIndex = -1;                                      // Potential starting index for seating.


      // Iterate through the seats to find an available block.
      for ( i = 0; i < 17; i++ ) {

        // If the current seat is empty, increment the sequential counter. Otherwise, reset it.
        sequencialSeats = seats[i] == 0 ? sequencialSeats + 1 : 0;


        // If enough sequential seats are found for the current group...
        if ( sequencialSeats == needsSequencialSeats ) {

          var eatTime = eatTimes[ headGroup % 6 ]; // Get the eating duration for this group.

          startIndex = i - ( needsSequencialSeats - 1 ); // Calculate the actual starting seat index.

          // This group can be seated! Record their waiting time.
          waitTime[ headGroup ] = pastMinutes - ( headGroup * 5 );

          // Occupy the seats with the group's eating time.
          for ( var j = startIndex, len = ( needsSequencialSeats + startIndex ); j < len; j++ ) {
            seats[j] = eatTime;
          }

          // Move to the next potential group.
          // If the next group's arrival time is in the past or present, it's ready.
          // Otherwise, set headGroup to -1, indicating no group is currently waiting.
          headGroup = ( ( ( headGroup + 1 ) * 5 ) <= pastMinutes ) ? headGroup + 1 : -1;

          // Decrement the count of groups remaining.
          if ( !(--lastMembers) ) {
            // If all 100 groups have been seated, the simulation is complete.
            return waitTime;
          }
          break; // Break from the seat-finding loop, as the group has been seated.
        }
      }
    }

    // Advance the simulation by one minute.
    pastMinutes++;
  }

}


/**
 * Custom max function using bitwise operations for performance.
 * @param {number} a - First number.
 * @param {number} b - Second number.
 * @returns {number} The maximum of a and b.
 */
function max ( a, b ) {
  var t = ( a - b ); // Calculate difference.
  return a - ( t & ( t >> 31 ) ); // Bitwise trick to get max without branching.
}