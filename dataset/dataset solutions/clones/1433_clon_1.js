function    Main   (   input   ) {
    // This is the primary function responsible for processing the input.
    // It takes a single string 'input' which contains multiple lines.

    var    inputArr   =    input  .  split ( '\n' ) ;   // Split the input string into an array of lines.
    var    cards      =    ''   ;                     // Initialize an empty string to hold the current set of cards.

    // Begin an infinite loop to process card shuffling operations.
    for ( var    i = 0 ;   true ;   i++ )    {

        // Check if the current line in inputArr is not a number.
        if (   isNaN (   inputArr [ i ]   )   ) {

            // If it's not a number, it means a new set of cards or a break condition.

            if (   i   !==   0   ) {
                // If this isn't the very first iteration, output the previously processed cards.
                output (   cards   ) ;
            }

            cards    =    inputArr [ i ] ;   // Assign the current non-numeric line as the new 'cards' string.

            // Check if the current 'cards' string is the break signal.
            if (   cards   ==   '-'   ) {
                // If it's '-', terminate the loop.
                break   ;
            }
            else
            {
                // If it's not '-', it means it's a new set of cards string.
                // Increment 'i' to skip the next line, which would be the first shuffle amount for this new set.
                i ++ ;
            }

        }
        else
        {
            // If the current line is a number, it represents a shuffle amount.

            // Perform the shuffle operation:
            // Take a slice from the number indicated by the current line (converted to int) to the end,
            // and concatenate it with a slice from the beginning up to that same number.
            // This effectively moves the first 'n' cards to the end.
            cards    =    cards  .  slice (   toInt (   inputArr [ i ]   )   )   +   cards  .  slice (   0 ,   toInt (   inputArr [ i ]   )   )   ;
        }

    } // End of the main processing loop.

} // End of the Main function definition.


/*
 * Helper function: ascendingOrder
 * This function is used for sorting in ascending numerical order.
 * It calculates the difference between two values.
 * @param {number} val1 - The first value for comparison.
 * @param {number} val2 - The second value for comparison.
 * @returns {number} A negative value if val1 < val2, positive if val1 > val2, or zero if val1 == val2.
 */
function   ascendingOrder   (   val1 ,   val2   ) {
    return   val1   -   val2   ;
}

/*
 * Helper function: descendingOrder
 * This function is used for sorting in descending numerical order.
 * It calculates the difference between two values in reverse.
 * @param {number} val1 - The first value for comparison.
 * @param {number} val2 - The second value for comparison.
 * @returns {number} A negative value if val2 < val1, positive if val2 > val1, or zero if val2 == val1.
 */
function   descendingOrder   (   val1 ,   val2   ) {
    return   val2   -   val1   ;
}

/*
 * Helper function: toInt
 * Converts a string to an integer using base 10.
 * @param {string} str - The string to convert.
 * @returns {number} The integer representation of the string.
 */
function   toInt   (   str   ) {
    return   parseInt (   str ,   10   )   ;
}

/*
 * Helper function: toStr
 * Converts a number to its string representation in base 10.
 * @param {number} num - The number to convert.
 * @returns {string} The string representation of the number.
 */
function   toStr   (   num   ) {
    return   num  .  toString (   10   )   ;
}

/*
 * Utility function: output
 * Prints the given string to the console.
 * If debug mode is enabled, it also outputs to a specific DOM element.
 * @param {string} str - The string to output.
 */
function   output   (   str   ) {
    if (   _Isdebug   ) {
        document  .  getElementById ( "Console" )  .  value   +=   (   str   +   "\n"   )   ;
    }
    console  .  log (   str   )   ;
}

// Global variable: _Isdebug
// Controls whether debug output is sent to a DOM element.
var   _Isdebug   =   false   ;

/*
 * Debugging function: debug
 * Activates debug mode, reads input from a DOM element,
 * adds a newline, and then calls the Main function with that input.
 */
function   debug   (   ) {
    _Isdebug   =   true   ; // Enable debug mode.
    var   input   =   document  .  getElementById ( "Console" )  .  value   ; // Get input from the Console element.
    document  .  getElementById ( "Console" )  .  value   +=   "\n"   ; // Add a newline for visual separation.
    Main (   input   )   ; // Process the input using the Main function.
}

// Main execution block:
// Reads input from standard input (usually a file) and passes it to the Main function.
Main (   require ( "fs" )  .  readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;