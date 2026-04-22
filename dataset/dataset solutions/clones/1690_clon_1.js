/*
 * This JavaScript program processes a series of input lines
 * to count occurrences of specific status codes: AC, WA, TLE, RE.
 * It reads input from standard input, parses it, and then
 * prints the final counts.
 */
function Main ( inputs )
{
    // Split the entire input string into an array of individual lines.
    // The newline character serves as the delimiter for splitting.
    const inputlines = inputs . split ( "\n" ) ;

    // The first line of the input typically contains the number of test cases
    // or the total number of status codes that follow.
    const testcase = inputlines [ 0 ] ;


    // Initialize an array named 'counts'.
    // This array will effectively be used as an associative array (object)
    // to store the frequency of each status code.
    let counts = [ "AC", "WA", "TLE", "RE" ] ;

    // Explicitly set the initial count for each specific status code to zero.
    // This ensures that all counters start from a known state before processing.
    counts [ "AC"  ] =
    counts [ "WA"  ] =
    counts [ "TLE" ] =
    counts [ "RE"  ] = 0 ;


    /*
     * Iterate through the input lines, starting from the second line (index 1),
     * up to and including the line specified by 'testcase' (which is the count
     * of actual data lines).
     * In each iteration, we process one status code.
     */
    for ( let i = 1 ; i <= testcase ; i ++ )
    {
        // Extract the current status code (e.g., "AC", "WA") from the input lines.
        let key = inputlines [ i ] ;

        // Increment the count for the extracted status code.
        // If the status code has not been encountered before (its count is falsy/undefined/0),
        // initialize its count to 1; otherwise, increment its existing count.
        counts [ key ] = ( counts [ key ] ) ? ( counts [ key ] + 1 ) : 1 ;
    }


    // Output the final count for "AC" (Accepted).
    console . log ( "AC x " + counts [ 'AC' ] ) ;

    // Output the final count for "WA" (Wrong Answer).
    console . log ( "WA x " + counts [ 'WA' ] ) ;

    // Output the final count for "TLE" (Time Limit Exceeded).
    console . log ( "TLE x " + counts [ 'TLE' ] ) ;

    // Output the final count for "RE" (Runtime Error).
    console . log ( "RE x " + counts [ 'RE' ] ) ;
}

// The program's entry point.
// It reads the entire content of standard input synchronously as a UTF-8 string,
// and then passes this string to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;