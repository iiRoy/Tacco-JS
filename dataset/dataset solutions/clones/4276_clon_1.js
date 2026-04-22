/*
 * This section handles standard input setup.
 * It ensures the process can receive and decode input.
 */
process.stdin.resume();


process.stdin.setEncoding( 'utf8' );


/*
 * The 'Main' function will receive the entire input data
 * as a single string argument.
 */
function  Main ( input )
{

    /*
     * Parse the input string into individual lines.
     * The first line is line0, the second is line1, and so on.
     */
    var  tmp = input . split( "\n" ) ;

    // Extract the first line of input and split it by spaces.
    var  line0 = tmp[ 0 ] . split( " " ) ;

    // Extract the second line of input and split it by spaces.
    var  line1 = tmp[ 1 ] . split( " " ) ;

    /*
     * These lines are commented out as they are not currently used.
     * var line2 = tmp[2].split(" ");
     * var line3 = tmp[3].split(" ");
     */


    // Parse the first element of line0 as an integer for 'n'.
    var  n = Number( line0[ 0 ] ) ;

    // Parse the first element of line1 as an integer for 'k'.
    var  k = Number( line1[ 0 ] ) ;

    /*
     * This variable 'b' is not used in the current logic.
     * var b = Number(line0[2]);
     */


    // Initialize the answer variable.
    var  ans = 1 ;


    /*
     * This console.log statement is for debugging purposes and is currently
     * commented out.
     * console.log( n+" "+ k +" "+ " hoge ")
     */


    // Loop 'n' times to apply the transformation logic.
    for ( var  i = 1 ;  i <= n ;  i++ )
    {
        // If the current answer is less than 'k', double it.
        if ( ans < k )
        {
            ans *= 2 ;
        }
        // Otherwise, add 'k' to the answer.
        else
        {
            ans += k ;
        }
    }


    // Output the final calculated answer to the console.
    console . log( ans ) ;


}


// This part reads input from standard input and calls the Main function.
// It should typically not be modified for competitive programming environments.
Main( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ) ;