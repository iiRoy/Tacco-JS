/*
 * This is an extensively modified Type I clone
 * of the original JavaScript code.
 *
 * All logical and structural elements, including
 * variable names, function names, operators, and expressions,
 * remain precisely identical.
 *
 * Only whitespace (indentation, spacing, blank lines)
 * and comments have been altered or added.
 */

function   Main   (   input   )
{
    // The main function begins here.
    // It processes the input string.

    input   =   input.split (   "\n"   )


    /*
     * Initialize the main string 'str' with the first line of input.
     * This string will be modified based on subsequent commands.
     */
    var   str   =   input[0] ;


    // Remove the first line of input, as it's already processed.
    input.shift (   ) ;


    /*
     * Initialize 'n', a crucial variable that determines
     * the direction of string concatenation operations.
     * It can be either 1 or -1.
     */
    var   n   =   1 ;


    // Iterate through the remaining lines of the input array.
    for   (   var   i   =   0   ;   i   <   input.length   ;   i++   )
    {
        // For each line, split it into parts based on spaces.
        var   mem   =   input[i].split (   " "   ) ;

        /*
         * Check the first part of the current command.
         * If it's '1', toggle the value of 'n' (multiply by -1).
         * This effectively reverses the string concatenation logic.
         */
        if   (   mem[0]   ==   1   )
        {
            n   *=   -1   ;
        }
        else
        {
            /*
             * If the first part is not '1', then it's a concatenation command.
             * The second part of the command (mem[1]) determines the type of concatenation.
             * We convert mem[1] to a number using '-0' for the switch statement.
             */
            switch   (   mem[1]   -   0   )
            {
                case   1   :
                    // Case 1: Specific concatenation rule based on 'n'.
                    switch   (   n   )
                    {
                        case   1   :
                            // If n is 1, append mem[2] to 'str'.
                            str   +=   mem[2]   ;
                            break   ;

                        case   -1   :
                            // If n is -1, prepend mem[2] to 'str'.
                            // Note the assignment: str = (mem[2] + str).
                            str   =   mem[2]   +=   str   ;
                            break   ;
                    }
                    break   ;

                case   2   :
                    // Case 2: Another specific concatenation rule, also based on 'n'.
                    switch   (   n   )
                    {
                        case   -1   :
                            // If n is -1, append mem[2] to 'str'.
                            str   +=   mem[2]   ;
                            break   ;

                        case   1   :
                            // If n is 1, prepend mem[2] to 'str'.
                            // Note the assignment: str = (mem[2] + str).
                            str   =   mem[2]   +=   str   ;
                            break   ;
                    }
                    break   ;
            }
        }

        // The original code had a commented-out debug line here.
        // console.log(str, n);
    }


    /*
     * After processing all commands, determine the final output.
     * The value of 'n' dictates whether the string should be printed
     * as is, or in reverse.
     */
    if   (   n   ==   -1   )
    {
        // If 'n' is -1, print the string 'str' directly.
        console.log   (   str   )
    }
    else
    {
        // If 'n' is 1, reverse the string 'str' and then print it.
        // This involves splitting into characters, reversing, and rejoining.
        console.log   (   str.split (   ""   ).reverse (   ).join (   ""   )   )
    }
}

// Call the Main function with input read from standard input.
// The input is read as UTF-8 and any leading/trailing whitespace is trimmed.
Main (   require (   "fs"   ).readFileSync (   "/dev/stdin"   ,   "utf8"   ).trim (   )   ) ;