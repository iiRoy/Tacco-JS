/*
 * This is a Type I clone of the original JavaScript code.
 * The core logic, identifiers, and operations remain absolutely identical.
 * Only whitespace (spacing, indentation, blank lines) and comments have been
 * extensively altered to create a visually distinct but functionally equivalent version.
 */

// Define the primary function named 'Main' which accepts a single argument 'input'.
function    Main    (    input    )

{
        // Reassign the 'input' parameter by splitting its string content
        // into an array of strings, using the newline character as a delimiter.
    var    input    =    input    .    split    (    '\n'    )    ;


        // Declare a variable 'iti'.
        // It is assigned the first element of the 'input' array (which is the first line),
        // further split into an array of individual characters.
    var    iti    =    input    [    0    ]    .    split    (    ''    )    ;


        // Declare a variable 'ni'.
        // It is assigned the second element of the 'input' array (the second line),
        // also split into an array of individual characters.
    var    ni    =    input    [    1    ]    .    split    (    ''    )    ;


        // Declare a variable 'san'.
        // It is assigned the third element of the 'input' array (the third line),
        // similarly split into an array of individual characters.
    var    san    =    input    [    2    ]    .    split    (    ''    )    ;


        // Log to the console the concatenation of three specific characters:
        // 1. The first character from the 'iti' array.
        // 2. The second character from the 'ni' array.
        // 3. The third character from the 'san' array.
    console    .    log    (    iti    [    0    ]    +    ni    [    1    ]    +    san    [    2    ]    )    ;

}    // End of the 'Main' function definition.


// This line executes the 'Main' function immediately after its definition.
// The input for 'Main' is obtained by reading the content of '/dev/stdin'
// (a standard input stream, common in competitive programming environments)
// synchronously using Node.js's 'fs' (file system) module.
// The content is read as a 'utf8' encoded string.
Main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;