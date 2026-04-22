"use strict" ; // This directive enables strict mode, ensuring cleaner code practices.


// The program's execution begins here.
// It reads the entire content of standard input synchronously.
// The input is then passed as a string argument to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "UTF-8" ) ) ;


/*
 * This is the core function of the application.
 * It takes the raw input string, processes it, performs calculations,
 * and then outputs the final result to the console.
 *
 * @param { string } input - The complete string content read from standard input.
 */
function   main ( input )
{
    // The input string is first divided into an array of strings,
    // where each element corresponds to a line from the input.
    input   =   input . split ( "\n" ) ;


    // The first line of input (index 0) is parsed as an integer.
    // This integer represents the total number of takoyaki.
    const   takoyaki_num   =   parseInt ( input [ 0 ] ) ;

    // A variable to accumulate the 'deliciousness sum' or 'recover_num'.
    // It's initialized to zero before any calculations.
    let     recover_num    =   0 ;


    // The second line of input (index 1) contains a space-separated string
    // of deliciousness points for each takoyaki.
    let   delicious_point   =   input [ 1 ] ;

    // This line processes the deliciousness points string:
    // 1. Splits it into an array of strings using space as a delimiter.
    // 2. Uses the 'map' function to convert each string element into an integer.
    delicious_point  =  delicious_point . split ( " " ) . map ( p  =>  parseInt ( p ) ) ;


    // Start of nested loops to iterate through all unique pairs of takoyaki.
    // The outer loop iterates from the first takoyaki up to the second-to-last.
    for  (  let   i   =   0 ;   i   <   takoyaki_num   -   1 ;   i ++  )
    {
        // The inner loop iterates from the takoyaki immediately following 'i'
        // up to the last takoyaki. This ensures each pair is counted once.
        for  (  let   f   =   i   +   1 ;   f   <   takoyaki_num ;   f ++  )
        {
            // For each unique pair (i, f), calculate the product of their
            // deliciousness points and add it to the 'recover_num' total.
            recover_num   +=   delicious_point [ i ]   *   delicious_point [ f ] ;
        } // End of the inner 'f' loop.
    } // End of the outer 'i' loop.


    // Finally, the calculated total 'recover_num' is printed to the standard output.
    console . log ( recover_num ) ;

} // End of the 'main' function definition.