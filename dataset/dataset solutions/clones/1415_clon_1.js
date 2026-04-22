/*
 * This function is designed to read input from standard input.
 * It leverages the Node.js 'fs' module for file system operations.
 * The input is expected to be a multi-line string, which will be
 * processed and returned as an array of individual lines.
 */
function     stdin   (   )
{
    // Use the 'fs' module to synchronously read the content of /dev/stdin.
    // The content is read as a UTF-8 encoded string.
    var   stdin   =   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;

    // Split the entire input string by newline characters.
    // The regex /\n\r?/ handles both Unix-style (\n) and Windows-style (\r\n) newlines.
    return   stdin   .   split   (   /\n\r?/   )   ;
}


/*
 * Generates an array of consecutive numbers within a specified inclusive range.
 * This utility function is useful for creating sequences of numbers.
 *
 * @param {number} from - The starting integer of the range.
 * @param {number} to   - The ending integer of the range (inclusive).
 * @returns {Array<number>} An array containing all integers from 'from' to 'to'.
 */
function     range   (   from   ,   to   )
{
    // Initialize an empty array that will hold the generated numbers.
    var   ret   =   [   ]   ;

    // Loop from the 'from' value up to and including the 'to' value.
    // In each iteration, the current number 'i' is added to the 'ret' array.
    for   (   var   i   =   from   ;   i   <=   to   ;   i   ++   )
    {
        ret   .   push   (   i   )   ;
    }

    // Return the array populated with numbers from the specified range.
    return   ret   ;
}


// Declare and initialize the 'full' object.
// This object represents a complete deck of four suits (S, H, C, D),
// where each suit initially contains numbers from 1 to 13.
var   full   =   {
        S   :   range   (   1   ,   13   )   ,   // Spades
        H   :   range   (   1   ,   13   )   ,   // Hearts
        C   :   range   (   1   ,   13   )   ,   // Clubs
        D   :   range   (   1   ,   13   )    // Diamonds
    }   ;


// Read input from stdin, skip the first line (often a count or header),
// and then process each subsequent line.
stdin   (   )
    .   slice   (   1   )    // Skip the first element (e.g., the number of cards to remove)
    .   forEach   (   function   (   line   )
    {
        // For each line, split it by a space to separate the suit and the card number.
        // Example: "S 1" would result in tmp[0] = "S", tmp[1] = "1".
        var   tmp   =   line   .   split   (   ' '   )   ;

        // Delete the specified card from the 'full' object.
        // tmp[0] is the suit (e.g., "S").
        // +tmp[1]-1 converts the string number (e.g., "1") to an actual number (1),
        // then subtracts 1 to get the 0-based array index (0).
        // Deleting an array element sets it to 'undefined' and leaves a "hole".
        delete   full   [   tmp   [   0   ]   ]   [   +   tmp   [   1   ]   -   1   ]   ;
    }   )   ;


// Iterate through each suit (property 'p') in the 'full' object.
for   (   var   p   in   full   )
{
    // For each suit, perform the following operations:
    console   .   log   (
        full   [   p   ]
            .   filter   (   function   (   val   )    // Filter out 'undefined' elements (the deleted cards).
            {
                return   val   ;    // Only keep values that are not falsy (i.e., not undefined or null).
            }   )
            .   map   (   function   (   num   )    // Map the remaining numbers to a formatted string.
            {
                return   p   +   ' '   +   num   ;    // Format as "Suit Number" (e.g., "S 1").
            }   )
            .   join   (   "\n"   )    // Join all formatted strings with a newline character.
    )   ;
}