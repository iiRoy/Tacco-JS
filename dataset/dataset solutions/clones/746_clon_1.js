/* This helper function, named 'over', takes a single argument 'x'.
 * Its primary purpose is to adjust the value of 'x' if it exceeds
 * a certain threshold, specifically 10.
 * This ensures the value wraps around or is normalized.
 */
function   over ( x )
{
    // Check if the input value 'x' is greater than or equal to 10.
    if   ( x   >=   10 )
    {
        // If the condition is met, 'x' is decremented by 10 and then incremented by 1.
        // This effectively means (x % 10) + 1, but expressed differently.
        x   =   x   -   10   +   1 ;
    }
    // The (potentially modified) value of 'x' is then returned.
    return   x ;
}


// --- Main Program Execution Begins Here ---


// First, we read the entire content of the standard input stream.
// The 'fs' module is used for file system operations, 'readFileSync' reads synchronously.
// The path '/dev/stdin' represents the standard input on Unix-like systems.
// The content is interpreted as UTF-8 encoded text.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// The raw input string is then processed:
// 1. Any leading or trailing whitespace is removed using 'trim()'.
// 2. The cleaned string is split into an array of strings, using the newline character ("\n") as a delimiter.
var   arr   =   input . trim ( ) . split ( "\n" ) ;


// We extract the first element from the 'arr' array.
// 'shift()' removes the first element and returns it.
// The '- 0' operation explicitly converts the string to a number.
var   n   =   arr . shift ( )   -   0 ;


// The next element is extracted, representing an ID string.
// It's then split into an array of individual characters.
var   id   =   arr . shift ( ) . split ( "" ) ;


// Another numeric value is extracted from the array, similar to 'n'.
var   a   =   arr . shift ( )   -   0 ;


// The subsequent line is processed to create an array of numbers ('ary').
// It's split by spaces (" "), and 'map(Number)' converts each resulting string part into a number.
var   ary   =   arr . shift ( ) . split ( " " ) . map ( Number ) ;


// Initialize an empty array 'k'. This array will store factors (1 or 2) based on 'id' processing.
var   k   =   [ ] ;

// Initialize a variable 'sum' to 0. This will accumulate a base sum.
var   sum   =   0 ;


// Iterate over each character 'v' and its corresponding index 'i' in the 'id' array.
id . forEach ( function ( v , i )
{
    // Check if the current character is an asterisk ("*").
    if   ( v   ==   "*" )
    {
        // If it's an asterisk, determine the factor to push into 'k'.
        // If the index 'i' is even, push 1.
        if   ( i   %   2   ==   0 )
        {
            k . push ( 1 ) ;
        }
        else
        {
            // Otherwise (if 'i' is odd), push 2.
            k . push ( 2 ) ;
        }
    }
    else
    {
        // If the character is not an asterisk, it's treated as a digit.
        // If the index 'i' is even, simply add its numeric value to 'sum'.
        if   ( i   %   2   ==   0 )
        {
            sum   +=   v   -   0 ;
        }
        else
        {
            // Otherwise (if 'i' is odd), multiply the numeric value by 2,
            // apply the 'over' function, and then add the result to 'sum'.
            sum   +=   over ( ( v   -   0 )   *   2 ) ;
        }
    }
} ) ;


// Declare a 2D array, 'dp', which will be used for dynamic programming.
var   dp   =   [ ] ;

// Initialize the 'dp' array. It will have 8 rows (from index 0 to 7).
for   ( var   i   =   0 ;   i   <=   7 ;   i ++ )
{
    dp [ i ]   =   [ ] ; // Each row is initialized as an empty array.

    // Each cell in the 'dp' array is initialized to 0.
    // The second dimension goes up to 1,000,000.
    for   ( var   s   =   0 ;   s   <=   1000000 ;   s ++ )
    {
        dp [ i ] [ s ]   =   0 ;
    }
}


// Set the base case for the dynamic programming.
// At the initial stage (index 0), the accumulated 'sum' has a count of 1.
dp [ 0 ] [ sum ]   =   1 ;


// This block performs the core dynamic programming calculations.
// It iterates through each element in 'k', representing stages of computation.
for   ( var   i   =   0 ;   i   <   k . length ;   i ++ )
{
    // For each stage 'i', it iterates through each element in 'ary'.
    // These 'ary' elements represent possible values that can be added.
    for   ( var   j   =   0 ;   j   <   ary . length ;   j ++ )
    {
        // It then iterates through all possible sum values 's' that could have been reached
        // at the previous stage (i).
        for   ( var   s   =   0 ;   s   <=   1000000 ;   s ++ )
        {
            // The DP transition:
            // It adds the count from the current state (dp[i][s])
            // to the next state (dp[i+1]) with a new sum.
            // The new sum is calculated by adding 's' to the result of 'over(ary[j] * k[i])'.
            dp [ i + 1 ] [ s   +   over ( ary [ j ]   *   k [ i ] ) ]   +=   dp [ i ] [ s ] ;
        }
    }
}


// Initialize the variable 'ans' to store the final answer, starting at 0.
var   ans   =   0 ;

// Calculate the final answer by summing up specific states from the 'dp' array.
// Iterate through 's' values up to 100,000.
for   ( var   s   =   0 ;   s   <=   100000 ;   s ++ )
{
    // Add the value found at dp[k.length][s * 10] to 'ans'.
    // This targets specific sums for the final answer.
    ans   +=   dp [ k . length ] [ s   *   10 ] ;
}

// Finally, the calculated answer is printed to the console.
console . log ( ans ) ;