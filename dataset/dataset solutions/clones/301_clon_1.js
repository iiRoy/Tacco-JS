/*
 * This is a Type I clone of an existing JavaScript program.
 * The original functionality is preserved exactly as defined.
 * Only whitespace and comments have been altered to achieve visual difference.
 */


// Begin by resuming the standard input stream.
process.stdin.resume( ) ;


// Set the character encoding for the input stream to 'utf8'.
process.stdin.setEncoding( 'utf8' ) ;


/*
 * Read the entire content from '/dev/stdin' synchronously using 'fs' module.
 * The content is expected to be 'utf8' encoded.
 * Then, trim any leading/trailing whitespace from the content.
 * Finally, split the trimmed content into an array 'x' using any whitespace as a delimiter.
 * This array 'x' will contain the numerical inputs for processing.
 */
x = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( /\s/ ) ;


// Initiate a loop to process the input array 'x' in pairs.
// 'i' serves as the index for the starting year of a range.
// The loop increments 'i' by 2 in each iteration to move to the next pair.
for ( i = 0 ; i < x . length ; i += 2 )
{

    // Initialize 'count' variable to zero for each new range.
    // This variable will track the number of leap years found within the current range.
    count = 0 ;


    // Assign the current starting year from the input array to 'y'.
    y = x [ i ] ;


    // Check for a termination condition: if the sum of the current pair of numbers is zero.
    // This typically signals the end of input data in competitive programming contexts.
    if ( y + x [ i + 1 ] == 0 )
    {
        // If the termination condition is met, break out of the main processing loop.
        break ;
    }


    // This inner loop iterates through all years from 'y' (start year)
    // up to and including 'x[i+1]' (end year) for the current range.
    for ( ; y <= x [ i + 1 ] ; y++ )
    {
        // Apply the standard Gregorian calendar leap year rules:
        // A year is a leap year if it is perfectly divisible by 400,
        // OR if it is perfectly divisible by 4 AND not perfectly divisible by 100.
        if ( ( y % 400 == 0 ) || ( ( y % 4 == 0 ) && ( y % 100 != 0 ) ) )
        {
            // If the current year 'y' is determined to be a leap year,
            // convert it to a String, trim any whitespace (though unlikely for a number),
            // and print it to the console.
            console . log ( String ( y ) . trim ( ) ) ;

            // Increment the 'count' of leap years found for this range.
            count++ ;
        }
    }


    // This conditional console.log statement is for formatting output.
    // It prints an empty line after processing a range,
    // unless it's the very first range (i==0) and also not the only range (x.length-1).
    // Or if it's the very last range.
    // This helps separate the output for different input cases.
    if ( ( i != 0 ) || ( i == x . length - 1 ) )
    {
        console . log ( ) ;
    }


    // After processing a full range of years,
    // check if no leap years were found ('count' remains zero).
    if ( count == 0 )
    {
        // If no leap years were found in the current range,
        // print "NA" followed by a newline character to the console.
        console . log ( "NA\n" ) ;
    }

} // End of the main loop that processes year ranges.


/*
 * Program execution concludes here.
 * All input ranges have been processed.
 */