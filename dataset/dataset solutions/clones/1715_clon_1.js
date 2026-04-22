/* This file enforces strict parsing and execution rules. */
'use strict' ; /* Enforce strict mode for better code quality. */


function Main
(
    input /* The raw input string from stdin. */
)
{
    // Process the input string to extract relevant data.
    const tmp = input . trim ( ) . split ( '\n' ) ;

    // D: The number of days for the contest. It's the first line of input.
    const D = Number ( tmp [ 0 ] ) ;

    /*
     * C: An array representing the daily cost incurred for each contest type
     *    when that specific contest is *not* held. This is from the second line.
     */
    const C = tmp [ 1 ] . split ( ' ' ) . map ( ( v ) => Number ( v ) ) ;

    /*
     * S: A 2D array where S[dayIndex][contestTypeIndex] is the base satisfaction
     *    gained if a particular contestType is held on a given day.
     *    These are the lines from index 2 up to 2 + D - 1.
     */
    const S = tmp
      . slice ( 2 , 2 + D ) // Extract lines corresponding to the S matrix data.
      . map (
            ( v ) => v . split ( ' ' ) . map ( ( v ) => Number ( v ) )
        ) ; // Convert each line string into an array of numbers.

    // T: An array indicating which contest type (1-indexed) is held on each day.
    //    These are the last D lines of the input.
    const T = tmp . slice ( -1 * D ) . map ( ( v ) => Number ( v ) ) ;

    // Initialize tracking variables for the simulation's state.

    // LastContestDays: An array to keep track of the most recent day
    // (1-indexed) each of the 26 contest types was held.
    let LastContestDays = Array ( 26 ) . fill ( 0 ) ; // Initialized to 0, signifying no contest has been held yet.

    // currnetContestLebels: A temporary array to store the satisfaction level
    // (positive or negative) for each contest type on the *current* day being processed.
    let currnetContestLebels = Array ( 26 ) . fill ( 0 ) ; // Will be calculated for each day.

    // lebel: The cumulative total satisfaction score accumulated over all days.
    let lebel = 0 ; // Starts at zero and accumulates daily satisfaction.


    // Begin the simulation loop, iterating through each day of the contest period.
    for
    (
        let i = 1 ;  /* 'i' represents the current day, starting from 1. */
        i <= D ;     /* The loop continues until all 'D' days are processed.   */
        i ++         /* Increment the day counter for the next iteration.       */
    )
    {
        // Update the 'LastContestDays' array for the contest type that is held on the current day 'i'.
        // T[i-1] gives the 1-indexed contest type, so T[i-1]-1 gives the 0-indexed type.
        LastContestDays [ T [ i - 1 ] - 1 ] = i ;

        // Calculate the satisfaction contribution for each contest type for the current day.
        for
        (
            let j = 0 ;           /* 'j' represents the 0-indexed contest type. */
            j < C . length ;      /* Iterate through all possible contest types (0 to 25). */
            j ++                  /* Move to the next contest type. */
        )
        {
            // Determine if contest type 'j' was the one held on the current day 'i'.
            if ( LastContestDays [ j ] === i )
            {
                // If contest type 'j' was held on day 'i', its satisfaction is directly from the S matrix.
                // S[i-1][j] because 'i' is 1-indexed for days, and 'j' is 0-indexed for contest types.
                currnetContestLebels [ j ] = S [ i - 1 ] [ j ] ;
            }
            else
            {
                // If contest type 'j' was *not* held on day 'i', its satisfaction decreases.
                // The decrease is C[j] (cost per day) multiplied by the number of days since it was last held.
                // The result is multiplied by -1 to make it a negative satisfaction.
                currnetContestLebels [ j ] = C [ j ] * ( i - LastContestDays [ j ] ) * -1 ;
            }
        }

        // Sum up all the individual satisfaction levels for the current day (from 'currnetContestLebels')
        // and add this sum to the total cumulative satisfaction 'lebel'.
        lebel += currnetContestLebels . reduce ( ( acc , cur ) => acc + cur ) ;

        // Output the cumulative satisfaction score after processing the current day.
        console . log ( String ( lebel ) ) ;
    }

    // The function has completed its task for all days.
    return ;
}

// This line reads the entire content of standard input synchronously,
// converts it to a UTF-8 string, and then passes it to the Main function for processing.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;