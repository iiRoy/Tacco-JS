/*
 * This file processes input data from standard input.
 * It reads each line, performs calculations based on two numbers per line,
 * and then prints a resulting number to the console.
 */
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// The raw input string is trimmed of leading/trailing whitespace
// and then split into an array of strings, where each string is a line.
var   Arr   =   ( input.trim ( ) ) . split ( "\n" ) ;


// Iterate over each line obtained from the input array.
for   ( var   i   =   0 ;   i   <   Arr . length ;   i ++ )
{
    // Check if the current line signifies the end of input processing.
    // If the line is "0 0", the loop terminates.
    if   ( Arr [ i ]   ==   "0 0" )
    {
        break   ;
    }

    // Split the current line by space and convert each part to a number.
    // This creates an array 'arr' containing two numerical values.
    var   arr   =   Arr [ i ] . split ( " " ) . map ( Number ) ;

    // The first number from the line is assigned to variable N.
    var   N   =   arr [ 0 ] ;

    // The second number from the line is assigned to variable m.
    var   m   =   arr [ 1 ] ;

    // Initialize an empty object 'n' which will be used as a hash map or dictionary.
    var   n   =   { } ;

    // Populate the object 'n' with keys from 0 to N-1,
    // initializing each value to null.
    for   ( var   j   =   0 ;   j   <   N ;   j ++ )
    {
        n [ j ]   =   null ;
    }

    // Initialize a counter 'x' to 0. This variable will be updated within the main loop.
    var   x   =   0 ;


    // This is the primary processing loop, running N times.
    for   ( var   k   =   0 ;   k   <   N ;   k ++ )
    {
        // Initialize a secondary counter 'y' to 0 for the inner do-while loop.
        var   y   =   0 ;

        // The do-while loop continues until 'y' equals 'm'.
        do
        {
            // Increment 'x'. This is a circular counter, resetting to 0 if it reaches N.
            x ++ ;
            if   ( x   ==   N )
            {
                x   =   0 ;
            }

            // If the element at index 'x' in 'n' is null, increment 'y'.
            // This effectively counts available (null) slots in a circular manner.
            if   ( n [ x ]   ===   null )
            {
                y ++ ;
            }
        }   while   ( y   !=   m ) ;

        // Once 'y' equals 'm', assign the current value of 'k' to n[x].
        // This marks the slot 'x' as occupied.
        n [ x ]   =   k ;
    }

    // After the main loop, if 'x' is 0, it's adjusted to 1.
    // This is a specific condition check for the final output.
    if   ( x   ==   0 )
    {
        x   =   1 ;
    }

    // Print the final calculated value of 'x' to the console.
    console . log ( x ) ;
}