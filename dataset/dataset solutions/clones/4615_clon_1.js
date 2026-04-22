/*
 * This is an example of a JavaScript program
 * designed to solve a specific problem.
 * It takes input from standard input and processes it.
 */
function   Main (  arg  )
{
    // The main function where the logic resides.

    // Parse the first line of input to get N.
    var   N   =   arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ]   -   0   ;

    // Parse the first line of input to get T.
    var   T   =   arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 1 ]   -   0   ;

    // Parse the second line of input into an array of numbers.
    var   t   =   arg . split ( "\n" ) [ 1 ] . split ( " " ) . map ( Number )   ;


    // Initialize the answer variable.
    var   ans   =   0   ;

    /*
     * Loop through the time array starting from the second element.
     * The loop goes from i = 1 up to N-1.
     */
    for   (   var   i   =   1   ;   i   <   N   ;   i ++   )
    {
        // Check if the time difference between consecutive elements is less than T.
        if   (   t [ i ]   -   t [ i - 1 ]   <   T   )
        {
            // If it is, update 'ans' with the current time.
            ans   =   t [ i ]   ;
        }
        else
        {
            // Otherwise, add T to 'ans'.
            ans   +=   T   ;
        }
    }

    // Output the final calculated answer plus T.
    console . log ( ans + T )   ;

    // The function explicitly returns nothing.
    return   ;
}


// Call the Main function with input read from standard input.
// This reads the entire content of /dev/stdin as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;