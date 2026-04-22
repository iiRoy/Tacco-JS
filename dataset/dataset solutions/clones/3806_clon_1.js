// This is a JavaScript function designed to solve a specific problem.
// It analyzes a sequence of numbers to find certain patterns based on sums and bitwise XORs.

function    Main    (   input   )
{
    // The raw input string is first split into an array of lines.
    // Each element of 'input' array will correspond to one line of the original input.
    input   =   input . split ( "\n" ) ;

    // The first line of input typically contains the size of the array or other parameters.
    // Here, it's parsed as the variable 'N'. Note that 'map(Number)' is applied to a split result,
    // so 'N' will technically be an array containing a single number (e.g., [5]).
    var     N   =   input [ 0 ] . split ( " " ) . map ( Number ) ;

    // The second line of input contains the actual data array 'A'.
    // It's split by spaces and each part is converted to a number.
    var     A   =   input [ 1 ] . split ( " " ) . map ( Number ) ;


    // Initialize a counter variable. This will store the number of times
    // a specific condition (sum equals XOR sum) is met.
    var     count   =   0 ;


    // Start of the main logic: a nested loop structure.
    // The outer loop iterates through the array 'A' from the first element up to the second-to-last.
    // 'N - 1' is used here, which implicitly converts the array 'N' (e.g., [5]) to its numerical value (5 - 1 = 4).
    for     (   var     i   =   0 ;   i   <   N   -   1 ;   i ++   )
    {
        // For each starting element A[i], we initialize two accumulators:
        // 'add' for the sum, and 'xor' for the bitwise XOR.
        var     add     =   A [ i ] ;
        var     xor     =   A [ i ] ;

        // The inner loop starts from the element immediately following 'i' up to the last element.
        // This forms all possible subarrays starting at 'i'.
        for     (   var     j   =   i   +   1 ;   j   <   N ;   j ++   )
        {
            // In each step of the inner loop, add the current element A[j] to the running sum.
            add     +=  A [ j ] ;

            // Also, perform a bitwise XOR operation with the current element A[j].
            xor     ^=  A [ j ] ;

            // Check if the accumulated sum is strictly equal to the accumulated bitwise XOR sum.
            if      (   add   ===   xor   )
            {
                // If the condition is met, increment our counter.
                count ++ ;
            } // End of if condition check
        }     // End of inner for loop (iterating 'j')
    }         // End of outer for loop (iterating 'i')


    // This section handles the final output.
    // Outputting the result.
    // Note: 'count + N' might result in string concatenation if N is an array (e.g., [5]).
    // The JavaScript engine will implicitly convert N to a string for concatenation if 'count' is a number.
    console . log ( count   +   N ) ;

} // End of Main function definition