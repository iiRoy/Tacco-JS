// This JavaScript code processes a sequence of numbers to find the product of K elements
// with the largest absolute values, subject to certain conditions and modulo arithmetic.

// It reads input from standard input, typically a file or a console stream.

const [   nk   ,   as    ]    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( / \n / ) ;

/*
 *  The first line of input (nk) contains two space-separated integers: N (total count of numbers)
 *  and K (number of elements to choose for the product).
 *  The second line of input (as) contains N space-separated integers, representing the array elements.
 */

const   [ n , k ]    =    nk . split ( / \s / ) . map ( Number ) ; // Parse N and K.

// Parse the array elements, convert them to numbers, and then sort them.
// The sorting criterion is descending order of absolute values.
// This ensures that the first K elements in the 'arr' array will have the largest absolute values.
const arr = as . split ( / \s / ) . map ( Number ) . sort ( ( a , b ) => Math . abs ( b ) - Math . abs ( a ) ) ;

// Define the modulo base as a BigInt. This is typically 10^9 + 7 for competitive programming problems.
const   base    =    BigInt ( Math . pow ( 10 , 9 ) + 7 ) ;


let result = 1n ; // Initialize the product as a BigInt, starting with 1.

let lowestP = null ; // This variable will store the smallest positive number encountered among the first K.

let lowestN = null ; // This variable will store the largest negative number (closest to zero) encountered among the first K.


// Loop through the first K elements of the sorted array.
// These are the elements with the largest absolute values.
for ( let i = 0 ; i < k ; i ++ )
{
    const   v   =   BigInt ( arr [ i ] ) ; // Convert the current number to a BigInt.

    result  *=  v ; // Multiply 'v' into the running product 'result'.

    // Update 'lowestP' or 'lowestN' based on the sign of 'v'.
    if ( v < 0 )
    {
        lowestN = v ; // If 'v' is negative, it's a candidate for 'lowestN'.
    }
    else
    {
        lowestP = v ; // If 'v' is positive (or zero), it's a candidate for 'lowestP'.
    }
}


/*
 *  After selecting the initial K elements, if their product 'result' is negative,
 *  we need to attempt to make it positive by swapping elements if possible.
 *  This involves replacing a number from the initial K with a number from the remaining N-K elements.
 */
if ( result < 0 )
{
    // result1: Attempt to swap out 'lowestP' (smallest positive) with a negative number from remaining elements.
    // If 'lowestP' was null (meaning all initial K were negative), result1 starts at 0n.
    let result1 = lowestP === null ? 0n : result / lowestP ;

    // result2: Attempt to swap out 'lowestN' (largest negative) with a positive number from remaining elements.
    // If 'lowestN' was null (meaning all initial K were positive), result2 starts at 0n.
    let result2 = lowestN === null ? 0n : result / lowestN ;

    let result1Got = false ; // Flag to track if result1 successfully found a negative replacement.
    let result2Got = false ; // Flag to track if result2 successfully found a positive replacement.


    // Iterate through the remaining elements of the array (from index K to N-1).
    for ( let i = k ; i < n ; i ++ )
    {
        const   v   =   BigInt ( arr [ i ] ) ; // Get the current element as a BigInt.

        // If 'v' is negative and we still need a negative replacement for result1.
        if ( v < 0 && ! result1Got )
        {
            result1 *= v ; // Multiply result1 by this new negative number.
            result1Got = true ; // Mark that a replacement for result1 was found.
        }
        // If 'v' is positive and we still need a positive replacement for result2.
        else if ( v > 0 && ! result2Got )
        {
            result2 *= v ; // Multiply result2 by this new positive number.
            result2Got = true ; // Mark that a replacement for result2 was found.
        }

        // If both potential swaps have been attempted (or were not needed/possible), break the loop early.
        if ( ( result1Got || result1 === 0n ) && ( result2Got || result2 === 0n ) )
        {
            break ;
        }
    }

    // Choose the maximum of the two potential results.
    // If a swap didn't occur (e.g., no suitable number was found), its 'resultGot' flag will be false,
    // which converts to 0n when BigInt(resultGot) is used, effectively making that term 0.
    result  =   Math . max ( result1 * BigInt ( result1Got ) , result2 * BigInt ( result2Got ) ) ;
}


/*
 *  If, after all calculations, the 'result' is 0n, it implies that either:
 *  1. All selected K numbers were 0.
 *  2. No valid combination could be found that resulted in a non-zero product.
 *
 *  In this specific case, the problem often implies taking the K numbers with the smallest absolute values
 *  (which would be at the end of our sorted array) to get a product.
 *  If K is 1 and the largest absolute value is 0, then the product is 0.
 *  If all numbers are 0, the product of any K numbers is 0.
 */
if ( result === 0n )
{
    result = 1n ; // Reset result to 1 for recalculation.

    // Iterate from the end of the array to get the K elements with the smallest absolute values.
    for ( let i = n - 1 ; i >= n - k ; i -- )
    {
        result  *=  BigInt ( arr [ i ] ) ; // Multiply these into the result.
    }

    // Ensure the result is non-negative before applying the modulo operation.
    // This is important because JavaScript's % operator can return negative results for negative numbers.
    while ( result < 0 )
    {
        result  +=  base ;
    }

    console . log ( result . toString ( ) ) ; // Output the final result as a string.
}
else
{
    // If the result is not 0n, simply apply the modulo operation and print it.
    // (result % base) ensures the result fits within the required range.
    console . log ( ( result % base ) . toString ( ) ) ;
}

// End of program execution.