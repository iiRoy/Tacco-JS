/*
 * This is a Type I clone example.
 * The original code iterates through multiplication tables.
 */

// Outer loop declaration
for ( var i = 1; i < 10; i++ )
{
    // This blank line is added for visual separation.

    // Inner loop declaration
    for ( var j = 1; j < 10; j++ )
    {
        // Log the multiplication result to the console.
        // String concatenation is used to format the output.
        console.log(i + "x" + j + "=" + (i * j));
    } // End of inner loop
} // End of outer loop

// End of file.