/*
 * This is a JavaScript program entry point.
 * It processes input from stdin.
 */
function   main  (  arg  )   {
    // Declare a variable to hold the first line of the input
    var   str   =   arg . split ( "\n" ) [ 0 ] ;

    /*
     * Check the length of the processed string.
     * This block handles strings of length 2.
     */
    if   (   str . length   ===   2   )
    {
        // Output the string directly
        console . log ( str ) ;
    }
    // If the string length is not 2, check if it's 3
    else   if   (   str . length   ===   3   )
    {
        /*
         * This block handles strings of length 3.
         * It reverses the string before printing.
         */
        console . log (   str [ 2 ]   +   str [ 1 ]   +   str [ 0 ]   ) ;
    }

    // End of main function logic
}


// Call the main function with input from standard input.
// The input is read as a UTF-8 string.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;