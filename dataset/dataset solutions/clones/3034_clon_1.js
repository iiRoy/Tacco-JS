// This is a Type I clone of the original JavaScript code.
// All variable names, function names, operators, and expressions are strictly preserved.
// Only whitespace (indentation, spacing, blank lines) and comments have been altered
// to create a visually distinct but functionally identical version.

function   main   (   arg   )
{
    // --- Start of variable declarations and initial processing ---
    // The input 'arg' is expected to be a single string.
    // This string is presumed to contain multiple lines separated by '¥n'.

    var   args   =   args.split   (   '¥n'   )   ;   // This line splits the 'args' variable (which is being declared)
                                                 // by the '¥n' character.
                                                 // Note: In typical scenarios, 'arg' (the parameter) would be split here.

    var   N      =   +args[0]     ;   // The first element of the 'args' array is converted to a number.
                                     // The unary plus operator (+) is used for this type coercion.
                                     // This number is assigned to the variable 'N'.

    var   S      =   args[1]      ;   // The second element of the 'args' array is assigned to the variable 'S'.
                                     // 'S' is expected to be the primary string for processing.

    var   K      =   args[2]      ;   // The third element of the 'args' array is assigned to 'K'.
                                     // It's observed that 'K' is declared but not utilized in the subsequent logic.

    // A blank line for improved readability and visual separation between logical blocks.


    var   tg     =   S[N]         ;   // The character at index 'N' within the string 'S' is extracted.
                                     // This character is stored in the 'tg' variable, which stands for 'target character'.


    var   arr    =   [ ]          ;   // An empty array named 'arr' is initialized.
                                     // This array will be populated with characters based on the processing logic.

    /*
     * This section contains the core logic implemented within a 'for' loop.
     * The loop iterates through the string 'S' character by character.
     * The iteration count is determined by the value of 'N'.
     */
    for
    (
        var   i   =   0   ;       // Loop counter 'i' is initialized to 0.
        i   <   N   ;             // The loop continues as long as 'i' is less than 'N'.
        i++                       // 'i' is incremented by 1 after each iteration.
    )
    {
        // Inside the loop: Conditional check for each character of 'S'.
        // We compare the character at the current index 'i' (S[i]) with the 'tg' character.

        if   (   S[i]   !==   tg   )
        {
            // If the character S[i] is NOT strictly equal to the target character 'tg',
            // then an asterisk character ('*') is appended to the 'arr' array.
            arr.push   (   '*'   )   ;
        }
        else
        {
            // If the character S[i] IS strictly equal to the target character 'tg',
            // then the original character S[i] itself is appended to the 'arr' array.
            arr.push   (   S[i]   )   ;
        }
    }

    // After the loop has completed processing all relevant characters,
    // the elements of the 'arr' array are joined together to form a single string.
    // An empty string ('' ) is passed as the separator, meaning no characters will be inserted between elements.
    // The resulting combined string is then output to the console.
    console.log   (   arr.join   (   ''   )   )   ;
}


// --- Program Execution Start ---
// This part of the code handles the input reading and the invocation of the main function.
// It reads data from standard input ('/dev/stdin') as a UTF-8 encoded string.

main   (
        require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )
       )
; // The 'main' function is called with the content read from stdin.