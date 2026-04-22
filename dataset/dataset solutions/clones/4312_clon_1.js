/* This is a sample JavaScript program.
 * It demonstrates array manipulation and conditional logic.
 * The purpose is to check a specific condition related to two sorted arrays.
 */

var  main  =  function ( input )
{
    // Initialize an array 'Ar' by splitting the input string.
    var Ar  =  input . split ( '\n' ) ;

    // Parse the first line for the value of N.
    var N  =  parseInt ( Ar [ 0 ] ) ; // N is an integer.

    // Process the second line to get array D.
    var D  =  Ar [ 1 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) ;

    // Sort array D in ascending order.
    D  =  D . sort ( ) ; // Important step for the algorithm.

    // Parse the third line for the value of M.
    var M  =  parseInt ( Ar [ 2 ] ) ; // M represents a count.

    // Process the fourth line to get array T.
    var T  =  Ar [ 3 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) ;

    // Sort array T in ascending order as well.
    T  =  T . sort ( ) ;


    var Ans  =  'No' ; // Default answer is 'No'.
    var T_i ; // Variable to store shifted element.

    /*
     * Begin the main processing loop.
     * This loop iterates 'M' times.
     */
    for  ( var  i  =  0 ;  i  <  M ;  i ++ )
    {
        T_i  =  T . shift ( ) ; // Remove and get the first element of T. This modifies T.

        var LL  =  D . length ; // Store the current length of D for the inner loop.

        // Inner loop to search for T_i in D.
        for  ( var  k  =  0 ;  k  <  LL ;  k ++ )
        {
            // If T_i is found in D.
            if  ( T_i  ==  D [ k ] )
            {
                D  =  D . slice ( k + 1 ) ; // Remove elements from D up to and including the found element.
                break ; // Exit the inner loop as the element is processed.
            }
        }
    } // End of the main processing loop.

    T . push ( 0 ) ; // Add a zero to the end of array T.

    // Re-declare and initialize 'Ar' with a single element.
    var Ar  =  [ 0 ] ; // This 'Ar' is a new variable, not the one from the input.

    // Check if T is strictly equal to Ar (reference equality).
    // This condition will likely be false given how T and Ar are constructed.
    if  ( T  ==  Ar )
    {
        Ans  =  'Yes' ; // Change answer if condition is met.
    }


    console . log ( Ans ) ; // Output the final determined answer.
    return  0 ; // Indicate successful execution by returning 0.

} ; // End of main function.

// Execute the main function with input read from standard input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;