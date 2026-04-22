/*
 * This is the primary function for processing the input.
 * It calculates a specific value based on three integer inputs.
 */
function   Main (  input   )
{
    // First, split the input string by spaces to get individual parts.
    input  =  input . split ( " " ) ;


    // Parse the three required integer values from the split input array.
    var   w   =   parseInt ( input [ 0 ] ) ; // Width parameter
    var   a   =   parseInt ( input [ 1 ] ) ; // First coordinate
    var   b   =   parseInt ( input [ 2 ] ) ; // Second coordinate

    // Declare a variable 's' to store the final calculated result.
    var   s ;


    // Ensure 'a' is always less than or equal to 'b' by swapping if necessary.
    if  ( a  >  b )
    {
        // Temporary variable 'c' for swapping 'a' and 'b'.
        var   c   =   a ;
        a   =   b ;
        b   =   c ;
    }

    /*
     * Now, determine the value of 's' based on the relationship
     * between 'a', 'w', and 'b'.
     * This section calculates the "overlap" or "distance".
     */
    if  ( ( a  +  w )  >=  b )
    {
        s   =   0 ; // If there's an overlap or touch, the distance is zero.
    }
    else
    {
        // Otherwise, calculate the positive distance between the two segments.
        s   =   b   -   ( a   +   w ) ;
    }


    // Output the final calculated value 's' to the console.
    // The '%s' format specifier is used, though 's' is a number.
    console . log ( '%s' ,   s ) ;
}


// This function is provided for debugging purposes within a browser environment.
// It retrieves input from an HTML element and passes it to the Main function.
function   debug (  )
{
    var   input   =   document . getElementById ( "input" ) . value ;
    Main ( input ) ; // Call the main logic with the debug input.
}


// --- Main execution block ---
// This part handles reading input from standard input in a Node.js environment
// and then invokes the primary 'Main' function with that input.
Main  (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )  ) ;