/*
 * This JavaScript code demonstrates nested loops to generate a multiplication table.
 * It's a Type I clone, meaning its functionality is identical to the original,
 * with only whitespace and comments altered for visual differentiation.
 */


var    i    =    0;   // Initialize the first loop counter variable.


// This is the outer loop, which will iterate 9 times.
// The post-increment operator (i++) ensures 'i' is used before incrementing,
// but for Console.log, it will be the incremented value.
while ( i++ < 9 )
{
    // Declare and initialize the inner loop's counter.
    // This variable 'j' is reset to 0 for each iteration of the outer loop.
    var j = 0;


    // This is the inner loop, also iterating 9 times for each outer loop iteration.
    while ( j++ < 9 )
    {
        // Output the multiplication result to the console.
        // 'i' and 'j' here will be their values *after* the increment in their respective while conditions.
        // The expression ( i * j ) calculates the product.
        Console.log( i + "x" + j + "=" + ( i * j ) );


    } // End of the inner 'while' loop.


    // An optional blank line for enhanced readability between outer loop iterations (if visually desired).
} // End of the outer 'while' loop.

// The script has completed its execution.