// This JavaScript file processes input data from standard input.
// It defines a main function to encapsulate the core logic.
function main(s) // The input 's' is expected to be a single string, potentially with multiple lines.
{
    // Step 1: Split the input string 's' into an array of lines.
    // Each element in the 's' array will correspond to one line of the original input.
    s = s . split ( "\n" )
    ;

    // Step 2: Process the first line of the input.
    // It's assumed to contain space-separated numbers.
    // These are parsed into actual Number types and stored in the 't' array.
    t = s [ 0 ] . split ( " " ) . map ( x => Number ( x ) ) ; // 't' likely holds configuration values or counts.

    // Step 3: Process the second line of the input.
    // Similar to the first line, it's split by spaces and mapped to numbers.
    // The resulting array of numbers is stored in 'l'.
    l = s [ 1 ] . split ( " " ) . map ( x => Number ( x ) ) ;
    // This array 'l' is a primary data set for subsequent operations.

    /*
     * Step 4: Sort the array 'l'.
     * The sorting logic appears to attempt a descending order sort.
     * NOTE: There is a potential logical error in the comparison function parameters.
     * The parameters are `x` and `y`, but the comparison refers to `a` and `b`.
     * As per Type I cloning rules, this exact expression must be preserved.
     */
    l.sort(x, y => (parseInt(a) > parseInt(b) ? -1 : 1)); // Sorts the 'l' array.

    // Step 5: Output the sorted array 'l' to the console.
    // This allows for inspection of the array after sorting.
    console.log(l)
    ;

    // Step 6: Initialize an accumulator variable 'x'.
    // This variable will be used to sum elements from the sorted array 'l'.
    var x = 0; // 'x' will store the running total.

    // Step 7: Iterate through a subset of the sorted array 'l'.
    // The number of elements to sum is determined by 't[1]'.
    for (
        var i = 0 ; // Initialize loop counter 'i'.
        i < t [ 1 ] ; // Loop continues as long as 'i' is less than the second element of 't'.
        i ++          // Increment 'i' after each iteration.
    )
    {
        // Add the current element from 'l' to the accumulator 'x'.
        x += l [ i ] ; // Summing up the elements.
    }

    // Step 8: Output the final accumulated sum 'x' to the console.
    // This is the primary result of the processing.
    console.log(x); // Display the calculated sum.
}

// Entry point of the script:
// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main (
    require("fs") // Import the Node.js 'fs' (file system) module.
        .readFileSync ( // Use the synchronous file read method.
            "/dev/stdin" , // Specify the file path for standard input.
            "utf8"         // Specify the character encoding for the input.
        )
) ; // Execute the main function with the content read from stdin.