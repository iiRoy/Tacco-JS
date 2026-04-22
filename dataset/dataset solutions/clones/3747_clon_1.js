/*
 * This is a Type I clone of the original JavaScript code.
 * All logical and structural elements remain identical.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct, yet functionally equivalent, version.
 */

// Define the main processing function for the application logic.
function    Main    (    input    )    {

    // The input string is split by spaces, and each resulting substring
    // is converted to an integer using a bitwise NOT operator twice (~~).
    // This is a common, terse way to achieve floor(Number(x)).
    input    =    input    .split    (    " "    )    .map    (    a    =>    ~~a    )    ;

    // Check the first element of the processed input array.
    // If it is greater than 8, an invalid state is detected.
    if    (    input[0]    >    8    )    {
        return    ":("    ; // Return a sad face string indicating failure.
    }

    // Check the second element of the processed input array.
    // Similar to the first check, if it's greater than 8, it's an invalid state.
    if    (    input[1]    >    8    )    {
        return    ":("    ; // Return a sad face string indicating failure.
    }

    // If both conditions are met (i.e., neither input value exceeds 8),
    // the operation is considered successful.
    return    "Yay!"    ; // Return a happy message string.

}

// This section contains an Immediately Invoked Function Expression (IIFE)
// responsible for handling the execution environment and output.
// It detects whether the code is running in a Node.js environment
// or a browser environment and adapts its behavior accordingly.

/*
 * The IIFE accepts three parameters (b, c, d) which are used internally
 * for various purposes such as holding the raw input, the result of Main(),
 * and the type of the result, respectively.
 */
(   (   b   ,   c   ,   d   )   =>   {

    // The core logic of the IIFE is a ternary operator.
    // It checks if the 'require' function is defined globally.
    // 'typeof require' will be "function" in Node.js, and "undefined" elsewhere.
    return   "undefined"   !=   typeof   require
        ?   // --- Node.js Environment Logic ---
            // If 'require' is defined, it means we are in Node.js.
            // Read input from standard input (/dev/stdin) using 'fs' module.
            // Then, pass this input to the Main function and log its result to console.
            console   .log   (
                Main   (
                    require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )
                )
            )
        :   // --- Browser Environment Logic ---
            // If 'require' is not defined, assume a browser environment.
            // This part constructs an array of operations to display results in the DOM.
            [
                // 'b' is reassigned here: it processes the initial input string.
                // It splits by newlines, removes the first and last lines (often empty or metadata),
                // and then rejoins the remaining lines.
                b   =   b   .split   (   "\n"   )   .slice   (   1   ,   -1   )   .join   (   "\n"   )   ,

                // 'c' is assigned the result of Main(b), executed within a try-catch block.
                // This handles potential errors during the execution of Main,
                // returning the error stack or message if an exception occurs.
                c   =   function   (   )   {
                    try   {
                        return   Main   (   b   )   ;
                    }   catch   (   f   )   {
                        return   f   .stack   ||   f   .message   ;
                    }
                }   (   )   ,   // The anonymous function is immediately invoked.

                // 'd' stores the JavaScript type of the 'c' variable (the result).
                d   =   typeof   c   ,

                // Conditional assignment: if 'c' is not already a string,
                // it is converted to a JSON string representation.
                "string"   ==   d   ||   (   c   =   JSON   .stringify   (   c   )   )   ,

                // Dynamically creates a <form> element using jQuery (assumed '$' exists).
                // It then appends several <textarea> or <br> elements.
                $   (   "<form>"   )   .append   (
                    // Maps an array of configurations to jQuery elements.
                    [
                        [   10   ,   b   ]   ,   // A textarea for the processed input 'b'.
                        0   ,               // A <br> element for spacing.
                        [   1   ,   d   ]   ,   // A textarea for the type of result 'd'.
                        0   ,               // Another <br> element.
                        [   10   ,   c   ]    // A textarea for the result 'c'.
                    ]   .map   (   f   =>
                        $   (
                            // If 'f' is truthy (an array config), create a <textarea>; otherwise, a <br>.
                            f   ?   "<textarea>"   :   "<br>"   ,
                            // If 'f' is truthy, set attributes for the textarea: rows, cols, and text content.
                            f   &&   {   rows   :   f[0]   ,   cols   :   40   ,   text   :   f[1]   }
                        )
                    )
                )   .appendTo   (   "body"   )   // Finally, append the form to the document's body.
            ]   ;

}   )   (   // The IIFE is immediately invoked with the following template literal string
    // as its first argument, which becomes the 'b' parameter.
    `
8 8
`
)   ; // End of the IIFE call.