/*
 * This JavaScript program processes a list of Roman numeral strings,
 * provided one per line via standard input, and outputs their
 * corresponding decimal integer values to standard output.
 *
 * It is a Type I clone, meaning its logic and structure are identical
 * to the original, with only variations in whitespace and comments.
 *
 * Created by a sophisticated code cloning algorithm.
 * Date of generation: 2023-10-27
 *
 */

// This string defines the mapping for Roman numeral characters.
// The index of each character in this string is used in the
// value calculation formula. The first character '.' is a placeholder.
r = ".IVXLCDM" ;



// Begin chain of operations to process input.

require ( "fs" ) // Obtain the Node.js 'fs' (file system) module.
    . readFileSync ( // Synchronously read the entire content of a file.
        "/dev/stdin" , // Specifies standard input as the source file.
        "utf8"         // Ensures the content is read as a UTF-8 string.
    )

    . split ( '\n' ) // Divides the input string into an array of lines, using newline as delimiter.


    . map ( // Iterates over each line of the input.

        function ( i ) // 'i' represents the current line (Roman numeral string).
        {
            // Conditional processing: If the line 'i' is non-empty (truthy)...
            i

                ?
                (
                    // Initialize working variables for each Roman numeral string.
                    // 'n': temporarily holds current character's value and its index.
                    // 's': accumulates the total decimal sum for the current line.
                    // 'p': stores the decimal value of the previously processed character.
                    n = s = p = 0 ,

                    i . split ( '' ) // Splits the current Roman numeral string into an array of characters.

                        . map ( // Iterates over each individual character 'c' in the Roman numeral.
                            function ( c )
                            {
                                // This is the core calculation for a Roman numeral character's value.
                                // It's a very compact expression that determines 'n' (the current character's decimal value).
                                // First, `n = r.indexOf(c)` gets the index of 'c' in the 'r' string.
                                // Then, `n` is reused in the `Math.pow` and modulo operations to derive the value.
                                n = Math . pow ( 10 , ~~ ( ( n = r . indexOf ( c ) ) / 2 ) ) / ( 2 - ( n % 2 ) ) ;

                                // Check for subtractive notation (e.g., IV, IX, XL, etc.).
                                // If the current character's value 'n' is greater than the previous character's value 'p',
                                // it implies the previous value was part of a subtraction.
                                // In such cases, subtract twice the previous value from the sum 's'.
                                // Example: For "IV", when 'V' is processed, 'n' (5) > 'p' (1).
                                //          So, 's' (which was 1) becomes 's - p*2' (1 - 1*2 = -1).
                                //          Then 's += n' makes it -1 + 5 = 4.
                                n > p
                                    ?
                                    s -= p * 2 // Apply the subtraction correction.
                                    :
                                    0 ;        // No correction needed.

                                // Add the current character's decimal value to the running total.
                                s += n ;

                                // Update the 'previous' value to the 'current' value for the next iteration.
                                p = n ;
                            }
                        ) , // End of the inner 'map' function for characters.


                    // After all characters in a line have been processed, print the final sum.
                    console . log ( s )
                )
                :
                0 // If the line 'i' was empty or falsy, do nothing (represented by '0').
        }
    ) // End of the outer 'map' function for lines.
; // End of the entire script.


// Additional blank lines for visual separation.


/*
 * This concludes the Type I clone generation.
 * All identifiers, operators, and expressions are strictly identical
 * to the original source code. Only whitespace and comments have been altered
 * to create a visually distinct, yet functionally equivalent, representation.
 */