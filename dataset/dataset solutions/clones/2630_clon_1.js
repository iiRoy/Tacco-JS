'use strict' /* This directive enforces strict mode. */



function  Main   (  input  )   {
    // The main function that processes the input.

    /*
     * First, we process the input string.
     * It's expected to be a multi-line string.
     * We split it by newline, take the second line (index 1),
     * then split that line by spaces, and finally
     * convert each resulting string into a number.
     * This array of numbers is assigned to constant A.
     */
    const  A  =  input . split ( "\n" ) [ 1 ] . split ( " " ) . map (  x  =>  Number (  x  )  ) ;


    // Initialize a variable 'mother' which will accumulate the sum of reciprocals.
    let   mother   =   0 ;


    /*
     * Iterate through each element 'a' in the array 'A'.
     * For each 'a', calculate its reciprocal (1/a)
     * and add it to the 'mother' variable.
     */
    for (  const   a   of   A  )
    {
        mother   +=   1   /   a ; // Add the reciprocal to the sum.
    }


    /*
     * Finally, compute the reciprocal of the accumulated sum 'mother'
     * and print it to the console. This effectively calculates
     * the equivalent resistance of resistors in parallel.
     */
    console . log (  1   /   mother  ) ;

} // End of Main function.



// This part handles reading input from standard input and calling the Main function.
Main (
    require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
        . trim ( )
) ;
// The program execution starts here.