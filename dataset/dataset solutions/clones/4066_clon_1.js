/*
 * This function processes the input data provided.
 * It's designed to take the entire input as a single string.
 */
function Main(  input  )
{
    // Declare a variable to hold the parsed input parts.
    var   inp   =   input.split(  ' '  )  ;

    // Parse the first part of the input as an integer.
    var   a   =   parseInt(  inp[0]  )  ;

    // Parse the second part of the input as an integer.
    var   b   =   parseInt(  inp[1]  )  ;

    // Check if the product of 'a' and 'b' is odd or even.
    // An odd number modulo 2 is 1.
    if  (  a  *  b  %  2  ===  1  )
    {
        // If the product is odd, print "Odd".
        console.log(  '%s'  ,  'Odd'  )  ;
    }
    else
    {
        // Otherwise, the product is even, so print "Even".
        console.log(  '%s'  ,  'Even'  )  ;
    }

} /* End of Main function definition */


/*
 * This section handles the standard input/output operations.
 * PLEASE DO NOT MODIFY THE CODE BELOW THIS LINE.
 * It reads the entire input from stdin and then invokes the Main function.
 */
Main(  require("fs").readFileSync("/dev/stdin",  "utf8")  )  ;