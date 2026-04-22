/* This is a re-formatted JavaScript code snippet.
 * It processes input data based on specific criteria.
 * All identifiers, operators, and expressions remain unchanged.
 */
function main  (   input   )
{
    // The input string is broken down into individual lines.
    // Each line becomes an element in the 'input' array.
    input  =  input . split ( "\n" ) ;


    /*
     *  The first line of the processed input (input[0]) is
     *  then further divided by space characters. This is stored
     *  in a temporary variable called 'tmp'.
     */
    tmp = input [ 0 ] . split ( " " ) ;


    // Similarly, the second line of the input (input[1]) is
    // also split by spaces and assigned to the 'moke' variable.
    moke  =  input [ 1 ] . split ( " " ) ;


    // A counter variable is initialized to zero.
    // This will keep track of how many times a condition is met.
    count = 0 ;


    // A looping construct is initiated here.
    // It iterates a number of times determined by the first element of 'tmp'.
    for  ( i = 0  ;  i < tmp [ 0 ]  ;  i ++ )
    {
        /*
         *  Within each iteration of the loop, a conditional check is performed.
         *  It compares the second element of 'tmp' with the current element
         *  from the 'moke' array.
         */
        if  ( tmp [ 1 ]  <=  moke [ i ] )
        {
            // If the above condition evaluates to true, the counter is incremented.
            count ++ ;
        } // End of the 'if' block.
    } // End of the 'for' loop.


    // Finally, the total count is printed to the standard output.
    console . log ( count ) ;

} // End of the 'main' function.


/*
 *  IMPORTANT: Do not modify any code below this line.
 *  This section is responsible for reading data from standard input
 *  and invoking the primary 'main' function to start execution.
 */
main( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;