/*
 * This JavaScript code processes input data
 * to determine a specific minimum index based on
 * a series of calculations.
 *
 * It demonstrates basic variable declaration,
 * loops, conditional statements, and mathematical operations.
 */

function    Main (    input    )
{


    // Declare and initialize variables by parsing the input string.
    // The input is expected to be multi-line and space-separated.
    var    N    =    input . split ( "\n" ) [ 0 ] ;
    var    T    =    input . split ( "\n" ) [ 1 ] . split ( " " ) [ 0 ] ;
    var    A    =    input . split ( "\n" ) [ 1 ] . split ( " " ) [ 1 ] ;
    var    H    =    input . split ( "\n" ) [ 2 ] . split ( " " ) ;


    // 'a' will store the absolute differences calculated in the loop.
    var    a    =    [ ] ;

    // 'min' will store the 1-based index of the element with the minimum difference.
    var    min    ;


    /*
     * Iterate through the array 'H', performing calculations for each element.
     * The loop runs from index 0 up to and including H.length - 1.
     */
    for    (    i    =    0    ;    i    <=    (    H . length    -    1    )    ;    i++    )
    {

        // Calculate 'temp_hi' based on 'T' and the current 'H[i]' value.
        // Note: parseInt(..., 10) ensures base-10 parsing.
        var    temp_hi    =    parseInt ( T , 10 )    -    parseInt ( H [ i ] , 10 )    *    0.006    ;


        // Determine 'x' based on the sign of 'A'.
        if    (    parseInt ( A , 10 )    >=    0    )
        {
            var    x    =    parseInt ( A , 10 )    -    temp_hi    ;
        }
        else
        {
            var    x    =    parseInt ( A , 10 )    +    temp_hi    ;
        }


        // Store the absolute value of 'x' in the 'a' array.
        a [ i ]    =    Math . abs ( x )    ;


        // Update 'min' based on comparison with the previous element in 'a'.
        // This logic seems to find the *first* occurrence of a minimum,
        // or the current index if the current value is smaller.
        if    (    i    >=    1    &&    a [ i - 1 ]    >    a [ i ]    )
        {
            min    =    i    +    1    ;
        }
        else if    (    i    >=    1    &&    a [ i ]    >=    a [ i - 1 ]    )
        {
            min    =    i    ;
        }

    } // End of for loop


    // Output the final calculated minimum index to the console.
    console . log ( min ) ;


} // End of the Main function definition.


/*
 * This section handles the execution of the Main function.
 * It reads the entire content of '/dev/stdin' as a UTF-8 string
 * and passes it as input to the Main function.
 * This is typical for competitive programming environments.
 */
Main (    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )    ) ;