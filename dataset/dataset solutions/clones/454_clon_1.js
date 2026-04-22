/*
 * This JavaScript module processes a series of data blocks.
 * Each block starts with a target value 'L', followed by 12 lines
 * representing monthly income and expense figures.
 * The script determines in which month the cumulative balance reaches or exceeds 'L'.
 * If 'L' is not reached within 12 months, it outputs "NA".
 * The program terminates when 'L' is found to be zero.
 */

// Utilize Node.js 'fs' (file system) module to read input synchronously.
// Input is expected from standard input ('/dev/stdin') and encoded in UTF-8.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Pre-process the raw input string:
// 1. Remove any leading/trailing whitespace using .trim().
// 2. Split the cleaned string into an array of individual lines using newline character as delimiter.
var Arr = ( input . trim() ) . split ( "\n" ) ;


// Begin the primary processing loop.
// This loop iterates through the 'Arr' array, handling each data block.
for ( var i = 0 ; i < Arr.length ; i++ )
{
    // Extract the target value 'L' from the current line.
    // The '-0' is a concise way in JavaScript to convert a string to a number.
    var L = Arr[i] - 0 ;

    // Check for the termination condition: if L is 0, exit the program.
    if ( L == 0 )
    {
        break ; // Break out of the 'for' loop.
    }

    // Initialize 'sum' for the current data block.
    // 'sum' will accumulate the monthly balance changes.
    var sum = 0 ;

    // Start an inner loop to process the 12 months of data
    // immediately following the 'L' value.
    for ( var j = 1 ; j <= 12 ; j++ )
    {
        // Access the line corresponding to the current month (i + j).
        // Split this line by spaces to get income and expense strings.
        // Then, use .map(Number) to convert these strings into actual numbers.
        var arr = Arr[ i + j ] . split ( " " ) . map ( Number ) ;

        // Calculate the monthly balance (income - expense) and add it to the running sum.
        sum += arr[0] - arr[1] ;

        // Check if the cumulative sum has met or exceeded the target 'L'.
        if ( sum >= L )
        {
            break ; // If so, no need to process further months for this block; exit inner loop.
        }
    }


    // After the inner loop completes (either by finishing 12 months or breaking early),
    // evaluate the final 'sum' against 'L' to determine the output.
    ( sum >= L )
        ? console . log ( j )     // If 'sum' reached 'L', print the month 'j' when it happened.
        : console . log ( "NA" )  // Otherwise, print "NA" as 'L' was not achieved.


    // Crucially, advance the outer loop counter 'i' by 12.
    // This skips over the 12 monthly data lines that have just been processed,
    // positioning 'i' at the start of the next 'L' value or the end of input.
    i = i + 12 ;

} // End of the main processing loop.