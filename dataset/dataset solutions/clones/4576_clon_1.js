/* This is the main function that processes the input */
function    Main  (  input  )
{
    // The input string is processed here.
    // It's split by spaces and then each part is converted to an integer.
    var     input    =    input.split(' ').map(  n   =>   parseInt(n,   10)  );


    /* Extracting values from the processed input array */

    A    =    input[0]; /* First value */

    B    =    input[1]; /* Second value */

    C    =    input[2]; /* Third value */


    // Now, we check the condition for these values.
    // The condition is: A <= C AND C <= B
    if ( A   <=   C   &&   C   <=   B )
    {
        // If the condition is true, print 'Yes'.
        console.log(  'Yes'  );
    }
    else
    {
        // Otherwise (if the condition is false), print 'No'.
        console.log(  'No'  );
    }


} // End of Main function.


// This line reads input from standard input and calls the Main function.
Main(  require( 'fs' ).readFileSync( '/dev/stdin',   'utf8' )  );