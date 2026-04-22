/*
 This is a Type I clone of the original JavaScript code.
 It includes extensive modifications to whitespace and comments
 while preserving the exact structure and logic of the original.
 */

// Define the main application logic within this function.
function     main   (  )
{
    // Declare counter variables.
    var
    /* Counter for the first condition (Pythagorean triple check) */
    c1      =   0,
    /* Counter for the second condition (equal numbers check) */
    c2      =   0;

    // Iterate over each line of the input data.
    input.forEach(   function    (   line    )
    {
        // Skip processing if the line is empty after trimming whitespace.
        if  (   line.trim   (   )   ===   ''   )
        {
            return  ;
        }

        // Split the line by comma and convert each part to a floating-point number.
        line    =   line.split  (   ','   )   .map    (   parseFloat   )   ;

        // Check if the numbers form a Pythagorean triple (a^2 + b^2 = c^2).
        if  (   line    [   0   ]   *   line    [   0   ]   +   line    [   1   ]   *   line    [   1   ]   ===   line    [   2   ]   *   line    [   2   ]   )
        {
            // Increment the first counter if the condition is met.
            c1++;
        }
        // Otherwise, check if the first two numbers are equal.
        else    if  (   line    [   0   ]   ===   line    [   1   ]   )
        {
            // Increment the second counter if this condition is met.
            c2++;
        }
    }   )   ;

    // Output the final counts to the console, separated by a newline.
    console.log (   '%d\n%d'   ,   c1   ,   c2   )   ;
}

// Global variable to store the entire input received from stdin.
var
input   =   ''   ;

// Resume the standard input stream to start receiving data.
process.stdin.resume  (   )   ;
// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding (   'utf8'   )   ;

// Attach a 'data' event listener to process.stdin.
// This function is called whenever new data chunks are available.
process.stdin.on    (   'data'   ,   function    (   chunk   )
{
    // Append the received data chunk to the 'input' variable.
    input   +=   chunk   ;
}   )   ;

// Attach an 'end' event listener to process.stdin.
// This function is called once all input has been received.
process.stdin.on    (   'end'   ,   function    (   )
{
    // Split the accumulated input string by newlines to get an array of lines.
    input   =   input.split (   '\n'   )   ;
    // Call the main function to start processing the input.
    main    (   )   ;
}   )   ;