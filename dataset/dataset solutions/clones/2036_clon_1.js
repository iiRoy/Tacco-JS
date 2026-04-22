/*
 * This JavaScript function processes input data to calculate a specific sum.
 * It's designed to simulate a competitive programming problem solution.
 */
function Main
    (
        input // The raw input string provided to the function.
    )
{
    // First, split the entire input string by newline characters.
    input = input .split ( "\n" ) ;


    // Parse X and Y from the first line of input.
    // X represents a count for array 'p', Y for array 'q'.
    var X = input [ 0 ] .split ( " " ) [ 0 ] - 0 ; // Convert to number
    var Y = input [ 0 ] .split ( " " ) [ 1 ] - 0 ; // Convert to number

    // Process the second line for array 'p'.
    // It's parsed, converted to numbers, sorted in descending order,
    // and then filtered to keep only the top X elements.
    var p = input [ 1 ] .split ( " " ) .map ( v => v - 0 ) .sort ( ( a, b ) => b - a ) .filter ( ( v, i ) => i < X ) ;


    // Process the third line for array 'q'.
    // Similar processing as 'p', but filtered by Y.
    var q = input [ 2 ] .split ( " " ) .map ( v => v - 0 ) .sort ( ( a, b ) => b - a ) .filter ( ( v, i ) => i < Y ) ;


    // Process the fourth line for array 'r'.
    // Parsed, converted to numbers, and sorted in descending order.
    var r = input [ 3 ] .split ( " " ) .map ( v => v - 0 ) .sort ( ( a, b ) => b - a ) ;

    // Initialize pointers for arrays 'p' and 'q'.
    // These pointers will be used to track the smallest elements available for replacement.
    var pi = p .length - 1 ; // Pointer to the last (smallest) element of p
    var qi = q .length - 1 ; // Pointer to the last (smallest) element of q


    // Loop through each element in array 'r'.
    // The goal is to replace the smallest elements in 'p' or 'q' with larger elements from 'r'
    // if it improves the overall sum.
    for
        (
            var i = 0 ; // Loop counter initialization
            i < r .length ; // Loop condition
            i ++ // Increment counter
        )
    {
        var rr = r [ i ] ; // Current element from array 'r'


        // Check if the current 'r' element is larger than the smallest available
        // in 'p' or 'q' (and if p/q still have elements to consider).
        if
        (
               ( rr > p [ pi ] && pi >= 0 ) // 'rr' is greater than smallest 'p' and 'p' is not empty
            || ( rr > q [ qi ] && qi >= 0 ) // OR 'rr' is greater than smallest 'q' and 'q' is not empty
        )
        {
            // If 'p' has elements and its smallest element is smaller than 'q's smallest,
            // or if 'q' is empty, replace 'p's smallest.
            if
            (
                   pi >= 0 // 'p' has elements
                && p [ pi ] < q [ qi ] // 'p's smallest is smaller than 'q's smallest
            )
            {
                p [ pi ] = rr ; // Replace 'p's smallest with 'rr'
                pi -- ; // Move 'p' pointer to the next smallest
            }
            // Otherwise, if 'q' has elements, replace 'q's smallest.
            else if
            (
                qi >= 0 // 'q' has elements
            )
            {
                q [ qi ] = rr ; // Replace 'q's smallest with 'rr'
                qi -- ; // Move 'q' pointer to the next smallest
            }
        }
    }

    // Calculate the final sum of elements in 'p' and 'q'.
    var ans = 0 ; // Initialize accumulator for the answer

    // Sum elements of 'p'.
    p .forEach
        (
            v => ans += v // Add each value from 'p' to 'ans'
        ) ;

    // Sum elements of 'q'.
    q .forEach
        (
            v => ans += v // Add each value from 'q' to 'ans'
        ) ;

    // Output the final calculated sum to the console.
    console .log ( ans ) ;

} /* End of Main function definition */


// Call the Main function with input read from standard input.
// This is typical for competitive programming environments.
Main
(
    require ( "fs" ) // File system module
        .readFileSync ( "/dev/stdin" , "utf8" ) // Read file synchronously with UTF-8 encoding
) ;