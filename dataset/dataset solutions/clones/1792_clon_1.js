/* This program processes numerical inputs to determine a specific condition.
 * It calculates distances and applies a shortening factor over a set number of iterations.
 * The final output is "YES" if the distance becomes zero, otherwise "NO".
 */
function Main ( input )
{
    // Parse input values from the provided string.
    // The input format is expected to be multiple lines, with numbers separated by spaces.

    let a = input . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ] ; // First number from the first line.
    let v = input . split ( "\n" ) [ 0 ] . split ( " " ) [ 1 ] ; // Second number from the first line.

    let b = input . split ( "\n" ) [ 1 ] . split ( " " ) [ 0 ] ; // First number from the second line.
    let w = input . split ( "\n" ) [ 1 ] . split ( " " ) [ 1 ] ; // Second number from the second line.

    let t = input . split ( "\n" ) [ 2 ] ; // The third line contains the value for 't'.


    let distance = 0 ; // Initialize the distance variable.

    // Calculate the initial absolute distance between 'a' and 'b'.
    if ( a > b )
    {
        distance = a - b ; // If 'a' is greater, subtract 'b' from 'a'.
    }
    else
    {
        distance = b - a ; // Otherwise, subtract 'a' from 'b' to get a positive distance.
    }


    let shortened = v - w ; // Calculate the value by which the distance will be reduced per iteration.


    // Loop for 't' iterations, adjusting the distance.
    // The loop runs from i=0 up to and including 't'.
    for ( let i = 0 ; i <= t ; i++ )
    {
        if ( i != 0 ) // Only apply the reduction after the first iteration (when i is not 0).
        {
            distance -= shortened ; // Decrease the distance by the 'shortened' amount.
        }

        if ( distance == 0 ) // Check if the distance has reached zero at any point.
        {
            break ; // If distance is zero, there's no need to continue looping.
        }
    }


    // Output the result based on the final distance value.
    if ( distance == 0 )
    {
        console . log ( "YES" ) ; // If distance is exactly zero, print "YES".
    }
    else
    {
        console . log ( "NO" ) ; // Otherwise, if distance is not zero, print "NO".
    }
}

// Invoke the Main function with input read from standard input.
// This is typical for competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;