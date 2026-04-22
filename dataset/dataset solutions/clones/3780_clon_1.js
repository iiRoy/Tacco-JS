"use strict"; // Ensure strict mode for cleaner code execution.

// This section reads the input from standard input.
// It reads the first line, which is expected to be a number.
var         S    =    parseInt ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . split ( '\n' ) [ 0 ] ) ;

// Initialize sum_ret with the initial value S.
// This variable will hold the minimum sum of digits found.
var sum_ret = S ;

// This loop iterates through possible split points for the number S.
// It considers pairs (i, S-i) to minimize the sum of their digits.
for ( var i = 1 ; i < parseInt ( S / 2 ) + 1 ; i ++ )
{

    // Calculate the complementary number.
    var rev_i = S - i ; // 'rev_i' is the second part of the pair.

    // Calculate the sum of digits for both 'i' and 'rev_i'.
    // Convert numbers to strings, then split into an array of characters (digits).
    var tmp = Sum_Arr ( i . toString ( ) . split ( "" ) ) + Sum_Arr ( rev_i . toString ( ) . split ( "" ) ) ;

    // Check if the current sum of digits ('tmp') is less than the previously recorded minimum ('sum_ret').
    if ( sum_ret > tmp )
    {
        // If it is, update sum_ret to this new minimum.
        sum_ret = tmp ; // Update the minimum sum found so far.
    }

} // End of the main loop.


// Print the final minimum sum of digits to the console.
console . log ( sum_ret ) ;


/**
 * @function Sum_Arr
 * @param {string[]} str_arr - An array of string-represented digits.
 * @returns {number} The sum of all digits in the array.
 *
 * This helper function calculates the sum of individual digits
 * provided as an array of strings.
 */
function Sum_Arr ( str_arr )
{
    // Initialize the accumulator for the sum.
    let ans = 0 ;

    // Iterate over each element (digit as string) in the input array.
    str_arr . forEach ( function ( elem )
    {
        // Convert the string digit to an integer and add it to the total.
        ans += parseInt ( elem ) ;
    } ) ; // End of forEach loop.

    // Return the calculated sum of digits.
    return ans ;
} // End of Sum_Arr function definition.