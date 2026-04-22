/*
 * This script reads two numbers from standard input, performs a series of conditional calculations,
 * and then prints a final count based on these calculations.
 *
 * It's designed to handle specific scenarios involving positive and negative numbers.
 */

inp  =  require ( 'fs' ) . readFileSync (
    '/dev/stdin' , // Path to the standard input file
    'utf8'         // Encoding for reading the file
) . split ( '\n' ) ; // Split the input content into an array of lines


l  =  inp . shift ( ) // Get and remove the first line from the input array
    . split ( ' ' ) ; // Split this line by spaces to get individual number strings


x  =  l [ 0 ]  *  1 ; // Convert the first string component to a numerical value


y  =  l [ 1 ]  *  1 ; // Convert the second string component to a numerical value


cnt  =  0 ; // Initialize the counter variable to zero


// Main conditional block to determine 'cnt' based on 'x' and 'y' values

if  ( x  ==  y ) // If both numbers are identical
{
    // No operation is performed on 'cnt' in this specific case,
    // as per the problem's logic when x equals y.
}
else // If 'x' and 'y' are not equal, proceed with more detailed checks
{

    if  ( x  >  y ) // Scenario where 'x' is strictly greater than 'y'
    {

        if  ( x  >=  0  &&  y  >=  0 ) // Both 'x' and 'y' are non-negative
        {
            cnt  +=  2 ; // Add two to the counter
        }
        else  if  ( x  >=  0  &&  y  <  0 ) // 'x' is non-negative, 'y' is negative
        {
            cnt  +=  1 ; // Add one to the counter
        }
        else // This covers the case where both 'x' and 'y' are negative, but x > y (e.g., x=-1, y=-5)
        {
            cnt  +=  2 ; // Add two to the counter
        }

    }
    else // Scenario where 'x' is strictly less than 'y' (x < y)
    {

        if  ( x  >=  0  &&  y  >=  0 ) // Both 'x' and 'y' are non-negative (e.g., x=1, y=5)
        {
            // No operation needed for 'cnt' in this specific sub-case.
        }
        else  if  ( x  <  0  &&  y  >=  0 ) // 'x' is negative, 'y' is non-negative (e.g., x=-2, y=3)
        {
            cnt  +=  1 ; // Add one to the counter
        }
        // If both x < 0 and y < 0, and x < y (e.g., x=-5, y=-1), this specific sub-case
        // does not have an explicit `else` branch here, and falls through to the next calculation.

    }

    // This calculation is applied universally when x is not equal to y.
    // It adds the absolute difference of their absolute values to the counter.
    cnt  +=  Math . abs ( Math . abs ( x )  -  Math . abs ( y ) ) ;

} // End of the main 'else' block


console . log ( cnt ) ; // Print the final calculated value of 'cnt' to standard output

// End of the JavaScript program.