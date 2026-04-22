/*
 * This JavaScript code snippet is a Type I clone, meticulously crafted
 * to be exactly identical to its original counterpart in terms of
 * functionality and structure. The only modifications applied are
 * variations in whitespace (indentation, spacing, blank lines) and
 * the addition of explanatory comments throughout the code.
 *
 * No identifiers, variable names, function names, operators, or
 * expressions have been altered in any way. The logical flow and
 * execution path remain precisely the same as the original source.
 *
 * This version aims to demonstrate extensive stylistic changes while
 * strictly adhering to the Type I clone definition.
 */

var    all    =    [ "" ]    ; // Initialize the primary storage array 'all'.
                             // The first element is an empty string, serving as a placeholder.


// This loop is responsible for pre-calculating all possible permutations
// of numbers from 0 up to (n-1) for various lengths 'n' (from 1 to 10).
for ( var n = 1 ; n <= 10 ; n ++ )
{
    all [ n ]    =    [ ]    ; // Create a new array within 'all' to store permutations for the current length 'n'.

    var    flag    =    [ ]    ; // 'flag' is a temporary array used to keep track of
                             // which numbers (indices) have been used in a permutation.

    // Initialize all elements of the 'flag' array to 'true',
    // indicating that all numbers are initially available for use.
    for ( var i = 0 ; i < n ; i ++ )    flag [ i ] = true ;


    /*
     * The 'loop' function is a recursive helper designed to generate permutations.
     * It builds permutation strings by appending numbers one by one.
     */
    var    loop    =    function ( str )
    {
        // Base case: If the current string 'str' has reached the target length 'n',
        // it means a complete permutation has been formed.
        if ( str.length == n ) all [ n ] . push ( str ) ;
        else // Recursive step: If the permutation is not yet complete.
        {
            // Iterate through all possible numbers (indices from 0 to n-1).
            for ( var i = 0 ; i < n ; i ++ )
            {
                // Check if the number at index 'i' is currently available (not used in 'str').
                if ( flag [ i ] )
                {
                    flag [ i ] = false ; // Mark the number as used for this branch of the recursion.

                    loop ( str + i ) ; // Recursively call 'loop' with the new string,
                                       // appending the current number 'i'.

                    flag [ i ] = true ; // Backtrack: Mark the number as available again,
                                        // allowing it to be used in other permutation branches.
                }
            }
        }
    } ; // End of the 'loop' function definition.

    loop ( "" ) ; // Initiate the permutation generation process by calling 'loop'
                  // with an empty string as the starting point.

} // End of the pre-calculation for loop.


// Read the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
var    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string: remove leading/trailing whitespace,
// then split it into an array of strings based on newline characters.
var    arr    =    input . trim ( ) . split ( "\n" ) ;


// This is the main processing loop for handling multiple test cases.
// It continues indefinitely until a specific termination condition is met.
while ( true )
{
    // Extract the first line from the 'arr' array, convert it to a number,
    // and assign it to the variable 'n'. The '-0' ensures numeric conversion.
    var    n    =    arr . shift ( ) - 0 ;

    // Termination condition: If 'n' is 0, it indicates the end of input,
    // so the loop breaks.
    if ( n == 0 ) break ;


    var    food    =    [ ]    ; // Initialize an array to store details of food items.

    // Read 'n' lines of food data. Each line contains space-separated values.
    for ( var i = 0 ; i < n ; i ++ )    food [ i ] = arr . shift ( ) . split ( " " ) ;


    var    G    =    Infinity    ; // 'G' represents the global minimum value found so far.
                                 // Initialized to Infinity to ensure any valid 'g' will be smaller.

    var    min    ; // 'min' will store the index of the permutation that yields the global minimum 'G'.


    // Iterate over each pre-calculated permutation for the current length 'n'.
    // 'v' is the permutation string, 'allIndex' is its index in 'all[n]'.
    all [ n ] . forEach ( function ( v , allIndex )
    {
        var    sum    =    0    ; // 'sum' accumulates the weights of food items in the current permutation.

        var    g    =    0    ; // 'g' accumulates the weighted sum (weight * (n - i)).

        var    flag    =    true    ; // 'flag' is used to determine if the current permutation
                                    // satisfies a specific condition (sum <= satiety).


        // Iterate through each item in the current permutation 'v'.
        for ( var i = 0 ; i < n ; i ++ )
        {
            var    value    =    v [ i ] - 0    ; // Convert the character from the permutation string to a number,
                                             // representing the index of the food item.

            var    w    =    food [ value ] [ 1 ] - 0    ; // Get the weight 'w' of the food item.

            var    s    =    food [ value ] [ 2 ] - 0    ; // Get the satiety 's' of the food item.

            // Critical condition check: If the accumulated weight 'sum'
            // exceeds the satiety 's' of the current food item.
            if ( sum > s ) { flag = false ; break ; } // If condition met, mark as invalid and exit this inner loop.

            sum += w ; // Add the current item's weight to the total sum.

            g += w * ( n - i ) ; // Update the weighted sum 'g'.
        }


        // This block executes only if the 'flag' became 'false' during the inner loop,
        // meaning at least one food item's satiety was exceeded.
        if ( flag == false )
        {
            g = g / sum ; // Calculate the average weighted sum by dividing 'g' by the total 'sum'.

            // Compare the calculated 'g' with the current global minimum 'G'.
            if ( G > g )
            {
                min = allIndex ; // If 'g' is smaller, update 'min' to store the index of this permutation.
                G = g ; // Update 'G' to this new minimum value.
            }
        }
    } ) ; // End of the forEach loop iterating through permutations.


    // After processing all permutations and finding the 'best' one (based on 'min'),
    // retrieve that permutation string, convert its characters to numbers,
    // reverse the order, and then iterate through the numbers.
    all [ n ] [ min ] . split ( "" ) . map ( Number ) . reverse ( ) . forEach ( function ( v )
    {
        console . log ( food [ v ] [ 0 ] ) ; // For each number 'v' in the reversed permutation,
                                            // print the name (index 0) of the corresponding food item.
    } ) ;

} // End of the main while loop for test cases.