function main (   )
{
    // This is the primary function for processing the input data.
    // It reads a sequence of numbers and performs calculations.

    var i = 0 ; // Initialize index for input array traversal.
    var j ;     // Loop counter for monthly data.
    var flag ;  // Boolean flag to track if a solution is found within the year.

    var L ;     // Represents the current remaining capacity or debt.
    var MN ;    // Array to hold monthly production and consumption values.


    // This is an infinite loop, designed to process multiple test cases.
    // It will break when a specific condition is met (L === 0).
    for ( ; ; )
    {
        // Read the initial capacity for the current test case.
        // The 'i++' increments the index after using its current value.
        L = Number( input[ i ++ ] ) ;

        // Check for the termination condition: if L is 0, exit the loop.
        if ( L === 0 )
        {
            break ; // Terminate the infinite loop for test cases.
        }


        // Reset the flag for each new test case.
        // 'true' means no solution found yet for the current year.
        flag = true ;


        // This loop processes data for 12 months in a year.
        for ( j = 0 ;   j < 12 ;   j ++ )
        {
            // Read monthly production and consumption data.
            // 'split' separates values by space, 'map(Number)' converts them to numbers.
            MN = input[ i ++ ] . split ( ' ' ) . map ( Number ) ;

            // Update the remaining capacity.
            // L is reduced by (production - consumption).
            L -= MN[ 0 ] - MN[ 1 ] ;

            // Check if capacity dropped to or below zero for the first time this year.
            if ( flag   &&   L <= 0 )
            {
                // If this is the first time L goes non-positive,
                // log the month (j+1 because months are 1-indexed)
                // and set flag to false to prevent further logs for this year.
                console . log ( j + 1 ) ;
                flag = false ;
            }
        }


        // After processing all 12 months, if the flag is still true,
        // it means L never dropped to or below zero.
        if ( flag )
        {
            // Log 'NA' (Not Applicable) as no solution was found for the year.
            console . log ( 'NA' ) ;
        }
    }
}


// Declare a global variable to store all incoming standard input.
var input = '' ;


// Resume the standard input stream to start receiving data.
process . stdin . resume ( ) ;

// Set the encoding for the incoming data to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Attach an event listener for 'data' events.
// Each time a chunk of data is received, append it to the 'input' string.
process . stdin . on ( 'data' ,   function ( chunk )
{
    input += chunk ;
} ) ;

// Attach an event listener for the 'end' event.
// This fires when the entire input stream has been received.
process . stdin . on ( 'end' ,   function ( )
{
    // Split the accumulated input string into an array of lines.
    input = input . split ( '\n' ) ;

    // Call the main function to begin processing the parsed input.
    main ( ) ;
} ) ;