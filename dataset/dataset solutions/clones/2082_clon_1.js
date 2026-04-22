/*
 * This JavaScript function, named Main, processes a given input string.
 * Its primary purpose is to analyze the input based on specific criteria
 * and output either "Yes" or "No" to the console.
 * The logic involves checking the length of the input and searching for
 * a particular substring at specific intervals.
 */
function Main ( input )
{
    // First, we perform an initial check on the length of the 'input' string.
    // The expression `!(input.length)%2` evaluates to true if the input's length
    // is an odd number.
    // If the length is odd, the condition is met, and we proceed inside this block.
    if ( ! ( input . length ) % 2 )
    {
        // If the input string has an odd number of characters,
        // we immediately print "No" to the console.
        console . log ( "No" ) ;
        // After printing, the function's execution is terminated here,
        // preventing any further processing.
        return ;
    }

    // Initialize a variable 'ret' (short for result) with the default value "Yes".
    // This value will be changed to "No" later if certain conditions are met.
    var ret = "Yes" ;

    // We now enter a 'for' loop to iterate through the input string.
    // The loop starts with 'i' at 0, continues as long as 'i' is less than the
    // total length of the input, and crucially, 'i' is incremented by 2 in each step.
    // This means we are checking every other character position.
    for ( i = 0 ; i < input . length ; i = i + 2 )
    {
        // Inside the loop, we use `input.indexOf("hi", i)` to search for the
        // substring "hi" within the 'input' string. The search begins from
        // the current index 'i'.
        // If `indexOf` returns -1, it means the substring "hi" was NOT found
        // starting from the specified index.
        // If `indexOf` returns any other value (0 or greater), it means "hi" WAS found.
        if ( input . indexOf ( "hi" , i ) != -1 )
        {
            // If the substring "hi" is found at an even-indexed position (0, 2, 4, ...),
            // then the condition for a "No" result is met.
            ret = "No" ;
            // Once "hi" is found, there's no need to continue checking the rest
            // of the string, so we use 'break' to exit the loop immediately.
            break ;
        }
    }

    // Finally, after the loop has completed (either by finishing or by a 'break'),
    // the value stored in the 'ret' variable is printed to the console.
    // This will be either "Yes" or "No" based on the logic above.
    console . log ( ret ) ;
} // End of the Main function definition.


// This is the entry point for executing the program.
// It uses Node.js's built-in 'fs' (file system) module to read data.
// `require("fs").readFileSync("/dev/stdin", "utf8")` reads the entire content
// of the standard input stream ('/dev/stdin') as a UTF-8 encoded string.
// This read content is then passed as an argument to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;