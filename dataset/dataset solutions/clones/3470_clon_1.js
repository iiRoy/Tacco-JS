/*
 * This helper function converts a string to an integer.
 * It utilizes the built-in parseInt function for robust string-to-number conversion.
 *
 * @param {string} d - The input string that needs to be converted into an integer.
 * @returns {number} The integer value derived from the input string.
 */
function toInt ( d )
{
    return  parseInt ( d ) ;
}


/*
 * This is the main function of the program. It processes input data,
 * simulates a specific algorithmic process involving two quantities (a and b),
 * and then outputs their final states.
 *
 * The simulation involves K turns, where in each turn, one quantity is
 * halved (after potentially being decremented if odd) and added to the other.
 *
 * @param {string} input - The entire input received from standard input, typically a multi-line string.
 */
function Main ( input )
{
    // First, split the input string by newline characters to get an array of individual lines.
    const   data  =  input . split ( "\n" ) ;

    // The first line of data contains three space-separated values.
    // We split this line by spaces and then map each part to an integer using our toInt helper.
    const   field  =  data [ 0 ] . split ( ' ' ) . map ( toInt ) ;

    // Extract the initial values A, B, and the number of iterations K from the parsed field array.
    const   A  =  field [ 0 ] ;
    const   B  =  field [ 1 ] ;
    const   K  =  field [ 2 ] ;


    // Initialize mutable variables 'a' and 'b' with the values of A and B, respectively.
    // These variables will be modified throughout the simulation.
    var   a  =  A ;
    var   b  =  B ;

    // Initialize a turn indicator 't'. 'a' signifies that it's currently 'a's turn to act.
    var   t  =  'a' ;


    // Begin the primary simulation loop, which runs for K iterations.
    for  ( var   i  =  0 ;   i  <  K ;   i ++ )
    {
        // Check whose turn it is based on the 't' indicator.
        if  ( t   ===   'a' )
        {
            // If 'a's current value is odd, decrement it by one to make it even.
            if  ( a   %   2   !==   0 )
            {
                a -- ;
            }

            // Calculate 'pa', which is half of 'a'. This is the amount transferred.
            var   pa  =  a   /   2 ;

            // Update 'a' by subtracting 'pa' and 'b' by adding 'pa'.
            a  =  a   -   pa ;
            b  =  b   +   pa ;

            // Switch the turn indicator to 'b' for the next iteration.
            t  =  'b' ;
        }
        else  // It is 'b's turn to act.
        {
            // If 'b's current value is odd, decrement it by one to make it even.
            if  ( b   %   2   !==   0 )
            {
                b -- ;
            }

            // Calculate 'pb', which is half of 'b'. This is the amount transferred.
            var   pb  =  b   /   2 ;

            // Update 'a' by adding 'pb' and 'b' by subtracting 'pb'.
            a  =  a   +   pb ;
            b  =  b   -   pb ;

            // Switch the turn indicator back to 'a' for the next iteration.
            t  =  'a' ;
        }
    }

    // After the loop completes, print the final values of 'a' and 'b',
    // separated by a single space, to the standard output.
    console . log ( a   +   ' '   +   b ) ;
}


// This line reads the entire content of standard input (typically from a file or pipe)
// as a UTF-8 encoded string and passes it to the Main function to begin execution.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;