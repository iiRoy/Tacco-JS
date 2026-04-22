/*
 * This is an extensively modified Type I clone
 * of the original JavaScript code.
 *
 * All identifiers, operators, and expressions
 * remain exactly the same.
 *
 * Only whitespace and comments have been altered
 * to create a visually distinct but functionally
 * identical version.
 */

function   Main  ( input )
{
    // Declare and initialize the 'chars' array from the input string.
    // The input is first trimmed to remove leading/trailing whitespace,
    // and then split into an array of strings based on newline characters.
    var   chars   =   input.trim().split( '\n' )   ;


    // Extract the numerical values N and K from the first line of the input.
    // The first line is expected to contain two space-separated integers.
    var   NK   =   chars[0].split( ' ' )   ;
    var   N    =   Math.floor( NK[0] )   ; // N represents the total number of elements in the 'nums' array.
    var   K    =   Math.floor( NK[1] )   ; // K is the divisor used in the modulo operations throughout the algorithm.


    // Parse the second line of input into an array of numbers.
    // Each string element from the split line is converted into an integer using parseInt with radix 10.
    var   nums   =   chars[1].split( ' ' ).map( str   =>   parseInt(str, 10) )   ;
    var   ans    =   0   ; // Initialize the answer counter; this will store the final count of subarrays meeting the criteria.


    // Begin the main processing loop.
    // This outer loop iterates through each possible starting index 'i' for a subarray.
    for  ( var   i   =   0   ;   i   <   N   ;   i++   )
    {
        // 'tmp' is used to accumulate the sum of the current subarray being considered.
        // It starts with the element at the current outer loop index 'i'.
        var   tmp   =   nums[i]   ;

        // Check the condition for a subarray consisting of just the single element 'nums[i]'.
        if  ( nums[i]   %   K   ===   1   )
        {
            ans++   ; // If the condition is met, increment the answer counter.
        }

        // Inner loop: This loop extends the subarray, starting from 'i', to the right.
        // 'j' represents the length of the subarray segment *added* to nums[i],
        // so a subarray of length (j+1) starting at i.
        for  ( var   j   =   1   ;   j   <   N   -   i   ;   j++   )
        {
            // Add the next element in sequence to the current subarray sum.
            // The element at index (i + j) is the next one to be included.
            tmp   +=   nums[i   +   j]   ;

            // Check the condition for the currently extended subarray.
            // The condition requires the subarray sum modulo K to be equal to (j + 1).
            if  ( tmp   %   K   ===   j   +   1   )
            {
                ans++   ; // If this extended subarray also meets its condition, increment the answer.
            }
        }
    }


    // After all possible subarrays have been checked and processed,
    // the final calculated answer is printed to the console.
    console.log( ans )   ;

} // End of the Main function definition.


// This section is responsible for reading the input data from standard input
// and then passing that data as an argument to the Main function for processing.
Main( require( 'fs' ).readFileSync( '/dev/stdin' ,   'utf8' ) )   ;