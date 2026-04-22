"use strict" /* This directive enforces strict parsing and error handling in the code. */


// Define the main function that processes the input.
function main ( input )
{

    /*
     * Process the raw input string.
     * First, split it into an array of strings by newline characters.
     * Then, map each string to a number using the bitwise NOT operator twice (~~)
     * which is a concise way to convert to integer.
     */
    input = input . split ( '\n' ) . map ( v => ~~v ) ;

    // The first element of the processed input is 'n'.
    const n = input [ 0 ] ;

    /*
     * Extract the array 's' from the input, starting from the second element
     * up to the end. Sort this array in ascending numerical order.
     */
    const s = input . slice ( 1 , input . length ) . sort ( ( a , b ) => a - b ) ;

    // Calculate the sum of all elements in the array 's'.
    // The `eval` function is used here to sum the elements after joining them with '+'.
    const sums = eval ( s . join ( "+" ) ) ; /* Calculates the total sum of all numbers in the 's' array. */


    // Check if the total sum is not perfectly divisible by 10.
    if ( ( sums % 10 ) != 0 )
    {
        // If it's not divisible by 10, print the sum and exit.
        console . log ( sums ) ;

        return ; // Terminate function execution.
    }


    /*
     * If the initial sum is divisible by 10,
     * iterate through the array 's' to find if removing any single element
     * would make the remaining sum not divisible by 10.
     */
    for ( let i = 0 ; i < n ; i ++ )
    {
        // Check if removing the current element s[i] from the total sum
        // results in a sum that is not divisible by 10.
        if ( ( ( sums - s [ i ] ) % 10 ) != 0 )
        {
            // If such an element is found, print '1' and the new sum, then exit.
            console . log ( 1 , sums - s [ i ] ) ;

            return ; // Terminate function execution immediately.
        }
    }

    // If no single element removal makes the sum not divisible by 10,
    // or if the initial sum was already not divisible by 10 (handled above),
    // this line is reached only if all possible sub-sums (after removing one element)
    // are also divisible by 10. In this specific problem context, this typically
    // implies that no solution was found under the given conditions.
    console . log ( 0 ) ; // Output 0, indicating no valid modification was found.

}


// Main execution block: read input from stdin and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Reads input from the standard input stream.