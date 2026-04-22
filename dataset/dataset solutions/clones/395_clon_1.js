// This section handles standard input operations.
// It uses Node.js's 'fs' module to read data from the standard input stream.
// The entire input content is read and then processed into an array of lines.
var fs = require( 'fs' );

// Determine the size of the standard input.
var length = fs.fstatSync( process.stdin.fd ).size;

// Create a buffer to hold the input data.
var buffer = new Buffer( length );

// Read the data from standard input into the buffer.
var bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 );

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
var input = buffer.toString( 'utf8', 0, bytesRead ).split( '\n' );

// Invoke the main application logic.
main();


/**
 * This is the primary function that orchestrates the program's execution.
 * It first computes the waiting times for various groups and then
 * iterates through the provided input to display the corresponding wait times.
 *
 * @returns {void} This function does not return any value directly.
 */
function main ( ) {

    // Call the `calc` function to perform the simulation and
    // obtain an array of calculated waiting times.
    var waitTime = calc( );


    // Loop through each line of the input array.
    // The loop runs up to `input.length - 1` to ignore a potential
    // empty line at the end of the input (common with `split('\n')`).
    for ( var i = 0, len = input.length - 1; i < len; i ++ ) {

        // For each input line, parse it as an integer (base 10).
        // This integer is used as an index to retrieve the waiting time
        // from the `waitTime` array, which is then printed to the console.
        console.log( waitTime[ parseInt( input[ i ], 10 ) ] );

    } // End of the loop that processes and prints results.

} // End of the 'main' function.


/**
 * The `calc` function simulates a restaurant seating process to determine
 * the waiting times for a predefined number of customer groups.
 * It models seat occupancy, group arrivals, and dining durations over time.
 *
 * @returns {Array<number>} An array where each index `k` holds the
 *                          waiting time for group `k`.
 */
function calc ( ) {

    // An array representing 17 seats in the restaurant.
    // Each element stores the remaining time (in minutes) until the seat becomes free.
    // A value of 0 indicates an empty seat.
    var seats = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

    // Defines the sizes of different types of groups that will arrive.
    var groupMembers = [ 2, 5, 2, 2, 2 ];

    // Defines the eating duration (in minutes) for different types of groups.
    var eatTimes = [ 19, 39, 25, 36, 22, 42 ];


    // `headGroup` tracks the ID of the group currently at the front of the queue,
    // ready to be seated. A value of -1 means no group is currently waiting at the head.
    var headGroup = -1;

    // `pastMinutes` is the global time counter for the simulation, in minutes.
    var pastMinutes = 0;

    // `waitTime` is an array that will store the calculated waiting time for each group.
    // It's pre-initialized to a large size to accommodate up to 100 groups.
    var waitTime = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

    // `lastMembers` counts down the total number of groups that still need to be seated.
    // The simulation concludes when this counter reaches zero.
    var lastMembers = 100;


    // The main simulation loop. This `while(true)` loop continues indefinitely
    // until all groups are seated and the `waitTime` array is returned.
    while ( true ) {

        // --- Step 1: Update seat timers ---
        // For every minute that passes, decrement the timer for each occupied seat.
        // If a seat's timer drops to 0, it becomes available.
        var i; // Declare loop variable 'i' for scope.
        for ( i = 17; i -- ; ) {

            // Decrement the seat timer and ensure it doesn't go below zero.
            seats[ i ] = max( --seats[ i ], 0 );

        } // End of seat timer update loop.


        // --- Step 2: Handle new group arrivals ---
        // If no group is currently at the head of the queue (`headGroup == -1`)
        // AND the current `pastMinutes` is a multiple of 5 (indicating a new arrival time),
        // then a new group arrives.
        if ( headGroup == -1 && pastMinutes % 5 == 0 ) {

            // The ID of the arriving group is determined by the elapsed time.
            headGroup = pastMinutes / 5;

        } // End of new group arrival check.


        // --- Step 3: Attempt to seat the current head group ---
        // This loop continues as long as there's a group waiting at the head (`headGroup != -1`)
        // AND the seat scanning loop (controlled by `i != 17`) hasn't finished its full scan or reset.
        while ( headGroup != -1 && i != 17 ) {

            // Determine how many contiguous seats the current group needs.
            var needsSequencialSeats = groupMembers[ headGroup % 5 ];

            // Counter to track the number of currently available sequential seats.
            var sequencialSeats = 0;

            // Variable to store the starting index of an available block of seats.
            var startIndex = -1;


            // Iterate through all available seats to find a suitable block.
            for ( i = 0; i < seats.length; i ++ ) {

                // If the current seat is free (`seats[i] == 0`), increment the sequential counter.
                // Otherwise, the sequence is broken, so reset the counter to 0.
                sequencialSeats = seats[ i ] == 0 ? sequencialSeats + 1 : 0;

                // If a sufficient block of sequential seats has been found...
                if ( sequencialSeats == needsSequencialSeats ) {

                    // Calculate the exact starting index of this block.
                    startIndex = i - ( needsSequencialSeats - 1 );

                    // The group can be seated!
                    // Calculate their waiting time: current time minus their arrival time.
                    waitTime[ headGroup ] = pastMinutes - ( headGroup * 5 );

                    // Occupy the found seats by setting their timers to the group's eating duration.
                    for ( var j = startIndex; j < ( needsSequencialSeats + startIndex ); j ++ ) {

                        seats[ j ] = eatTimes[ headGroup % 6 ];

                    } // End of loop for seat occupation.


                    // Determine the next group to potentially become the `headGroup`.
                    // If the next group's arrival time has already passed (`(headGroup + 1) * 5 <= pastMinutes`),
                    // then that group immediately becomes the new `headGroup`.
                    // Otherwise, no group is at the head for now (`-1`).
                    headGroup = ( ( ( headGroup + 1 ) * 5 ) <= pastMinutes ) ? headGroup + 1 : -1;

                    // Decrement the count of groups remaining to be seated.
                    if ( !( --lastMembers ) ) {

                        // If `lastMembers` becomes 0, all 100 groups have been seated.
                        // The simulation is complete; return the `waitTime` array.
                        return waitTime;

                    } // End of check for all groups seated.

                    // Since a group was successfully seated, break out of the seat scanning loop
                    // to re-evaluate the overall seating conditions for the next minute.
                    break;

                } // End of conditional check for finding sequential seats.

            } // End of the loop for scanning seats.

        } // End of the `while` loop for the seating process.


        // After all phases for the current minute, advance the simulation by one minute.
        pastMinutes ++;

    } // End of the main simulation `while` loop.

} // End of the 'calc' function.


/**
 * This function determines the maximum of two numbers using a bitwise trick
 * to avoid conditional branching, which can sometimes offer a slight performance
 * advantage on certain architectures.
 *
 * @param {number} a - The first number for comparison.
 * @param {number} b - The second number for comparison.
 * @returns {number} The larger of the two input numbers (`a` or `b`).
 */
function max ( a, b ) {

    // Calculate the difference between 'a' and 'b'.
    var t = ( a - b );

    // This bitwise operation leverages the sign bit.
    // If 't' is negative (a < b), (t >> 31) will be -1 (for 32-bit signed integers).
    // Then (t & -1) is 't'. So, a - t = a - (a - b) = b.
    // If 't' is positive or zero (a >= b), (t >> 31) will be 0.
    // Then (t & 0) is 0. So, a - 0 = a.
    return a - ( t & ( t >> 31 ) );

} // End of the 'max' function.