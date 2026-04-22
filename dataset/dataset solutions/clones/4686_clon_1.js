/*******************************************************************************
 * This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * All identifiers, operators, and expressions remain strictly identical.
 *******************************************************************************/

"use strict" /* Enforces strict mode for cleaner code and fewer errors. */


// The main function to process input and solve the problem.
function Main ( input )
{

    // Pre-process the input string: trim leading/trailing whitespace and split by newline.
    input = input.trim() .split ( '\n' ) ;

    // Parse the first line of input to extract N, C, and K.
    // N: The total number of people.
    const N = input [ 0 ] .trim() .split ( ' ' ) .map ( Number ) [ 0 ] ; /* Extract N */
    // C: The maximum capacity of a single bus.
    const C = input [ 0 ] .trim() .split ( ' ' ) .map ( Number ) [ 1 ] ; // Extract C
    // K: The maximum allowed time difference within a bus.
    const K = input [ 0 ] .trim() .split ( ' ' ) .map ( Number ) [ 2 ] ; /* Extract K */

    /*
     * Extract the departure times for each person.
     * Slice the input array from the second element (index 1) to the end.
     * Convert each element to a number.
     */
    const T = input.slice(1, input.length).map(Number);


    // Sort the departure times in ascending order. This is crucial for the logic.
    T . sort ( ( a , b ) => a - b ) ;


    let cnt = 0 ; // Counter for people currently in the bus.
    let bas = [ ] ; // Stores the departure time of the first person in the current bus.
    let isNext = false ; // Flag to indicate if a new bus is needed for the next person.
    let ret = 1 ; // The total number of buses required, initialized to 1 as at least one bus is always needed.

    // Iterate through each person to assign them to buses.
    for ( let i = 0 ; i < N ; i ++ ) {

        cnt += 1 ; // Increment the count of people in the current bus.

        // If this is the first person in a new bus, record their departure time.
        if ( bas . length === 0 ) {
            bas . push ( T [ i ] ) ;
        }

        // Check conditions for needing a new bus:
        // 1. If the next person's departure time is beyond the allowed time window (bas[0] + K).
        //    (Note: T[i+1] will be undefined for the last person, so this condition will be false or handled by cnt === C)
        // 2. If the current bus has reached its maximum capacity (cnt === C).
        if ( bas [ 0 ] + K < T [ i + 1 ] || cnt === C ) {
            isNext = true ; // Set the flag to indicate a new bus is required.
        }


        // If a new bus is required based on the conditions above, reset for the next bus.
        if ( isNext ) {
            ret += 1 ; // Increment the total bus count.
            cnt = 0 ; // Reset the people counter for the new bus.
            bas = [ ] ; // Clear the 'first person' time for the new bus.
            isNext = false ; // Reset the flag.
        }

    }


    console.log(ret) ; // Output the final total number of buses required.

}
// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;