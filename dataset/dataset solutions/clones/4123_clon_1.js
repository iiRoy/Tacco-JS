/*
 * This is a Type I clone of an existing JavaScript program.
 * It strictly adheres to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been altered, added, or removed to create visual distinction.
 */

"use strict";
    // Enable strict mode for better error handling and cleaner code.
    // This directive must be at the top of the script or a function.


/*
 * The main function processes the input argument.
 * @param {string} arg - The input string, typically read from standard input.
 */
const main =     arg =>   {

    // Pre-process the input string: trim whitespace and split by newline characters.
    arg   = arg  .trim()
            .split("\n");

    // Parse the first line of input to get the total number of stations, N.
    const N  =   parseInt(arg[0])    ;

    // Initialize arrays to store station-specific data:
    // C: Time taken to travel from station i to i+1
    // S: Departure time from station i
    // F: Frequency of trains from station i
    let C = [];
    let S = [];
    let F = [];

    // Loop through the input lines starting from the second line (index 1)
    // to populate the C, S, and F arrays.
    for ( let i = 1; i < N;  i++ ) {

        // Split each line by space, then map each part to an integer.
        // The resulting 'temp' array holds [C_i, S_i, F_i].
        let temp =   arg[i]
                        .split(" ")
                        .map(n => parseInt(n));


        // Assign parsed values to their respective arrays.
        // Note: C, S, F are 0-indexed, but input lines are 1-indexed for stations.
        C[i - 1] = temp[0];
        S[i - 1] = temp[1];
        F[i - 1] = temp[2];

        // End of loop iteration.
    }


    // Initialize an array to store the final answer for each starting station.
    let answer     = [];


    /*
     * Main loop: Iterate through each possible starting station 'i'.
     * For each starting station, calculate the arrival time at the final destination.
     */
    for ( let i = 0;   i < N;   i++ ) {

        // Initialize 'time' variable for the current journey.
        // This will accumulate the total travel time.
        let time = 0;

        // If starting from station 'i', the first leg of the journey
        // takes C[i] time, and it departs at S[i].
        // So, the arrival time at the next station (i+1) is S[i] + C[i].
        time += S[i] + C[i];


        // Special case: If we are at the last station (N-1),
        // the travel time to the destination (which is itself) is 0.
        if ( i === N - 1 ) {

            answer.push(0); // Add 0 to the answer array.

            // Since we're at the last station, no further calculation is needed for this path.
            break;
        }


        // Nested loop: Calculate travel time from station 'i' to the end.
        // 'j' represents the current station being considered in the journey.
        // We start from the station after the current one (i+1) up to the second to last station (N-2).
        for ( let j = parseInt(i) + 1;   j < N - 1;   j++ ) {

            // Check if the current arrival 'time' aligns with the departure 'S[j]' of the next train.
            if ( time === S[j] ) {

                // If arrival time equals departure time, we can immediately take the train.
                // Add the travel time for this segment (C[j]).
                time += C[j];

            } else {

                // If arrival time does not align with departure time, we need to wait.
                // The 'while' loop advances 'time' until it is a valid departure time for station 'j'.
                // A valid departure time must be >= S[j] and be a multiple of F[j] relative to S[j].
                while ( ( S[j] + F[j] ) > time ) {
                    time++; // Increment time until it satisfies the condition.
                }

                // After waiting, add the travel time for this segment (C[j]).
                time += C[j];
            }

            // End of inner loop iteration.
        }

        // After calculating the total time from station 'i' to the final destination,
        // add it to the 'answer' array.
        answer.push(time);
    }


    // Output the results: Join all calculated times with newline characters.
    console.log( answer.join("\n") );

}; // End of main function definition.


// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main( require('fs').readFileSync('/dev/stdin', 'utf8') );

// End of script.