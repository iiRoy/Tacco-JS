/*
 * This entire script is encapsulated within an immediately invoked function expression (IIFE).
 * It processes numerical input, performing a specific calculation on sequences of numbers.
 * The input is expected to contain multiple test cases, each starting with a number 'n'
 * indicating the count of subsequent numbers for that test case, followed by 'n' numbers.
 * A '0' as 'n' signals the end of the input.
 */
( function ( input ) {

    // Pre-process the input string:
    // 1. Remove a trailing newline character if present.
    // 2. Split the string into an array of lines based on newline characters.
    // 3. Convert each element of the resulting array to a Number.
    var p = input . replace ( /\n$/ , '' ) . split ( '\n' ) . map ( Number ) ;

    // Initialize 's' (current sum) and 'm' (maximum sum encountered) to negative infinity.
    // These variables will be re-initialized for each test case.
    var s = - Infinity ;
    var m = - Infinity ;

    // Start an infinite loop to process test cases.
    // The loop will be explicitly broken when a specific condition is met.
    while ( true ) {

        // Extract the next number from the processed input array.
        // This number 'n' represents the count of elements for the current test case.
        var n = p . shift ( ) ;

        // Check if 'n' is 0. If it is, this signifies the end of the input data.
        if ( n === 0 ) {
            // Terminate the processing loop.
            break ;
        }

        // Re-initialize 's' and 'm' for the new test case.
        // 's' tracks the current sub-array sum.
        // 'm' tracks the maximum sub-array sum found so far within the current test case.
        s = - Infinity ;
        m = - Infinity ;

        // Loop 'n' times to process the numbers belonging to the current test case.
        // This is where Kadane's algorithm logic is applied for each sequence.
        for ( var i = 0 ; i < n ; i ++ ) {

            // Get the next number 'a' from the input array for the current test case.
            var a = p . shift ( ) ;

            // Kadane's algorithm core logic:
            // Decide whether to start a new sub-array (if 'a' is greater than 's + a')
            // or to extend the current sub-array ('s + a').
            if ( a > s + a ) {
                // If 'a' alone is greater, start a new sub-array with 'a'.
                s = a ;
            } else {
                // Otherwise, extend the current sub-array by adding 'a'.
                s = s + a ;
            }

            // Update the overall maximum sum 'm' for the current test case.
            // If the current sub-array sum 's' is greater than the recorded maximum 'm',
            // then 'm' should be updated to 's'.
            if ( s > m ) {
                m = s ;
            }
        }

        // After processing all 'n' numbers for the current test case,
        // print the maximum sub-array sum 'm' found for this test case to the console.
        console . log ( m ) ;

    } // End of the while loop for processing test cases.

// The IIFE is immediately invoked with the content of '/dev/stdin'.
// This reads the entire file synchronously as a UTF-8 string.
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;