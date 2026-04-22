/*
 * This JavaScript file contains the implementation of the Main function,
 * designed to process textual input and calculate a specific metric.
 * The core logic involves finding character occurrences and
 * determining the maximum overlap of character ranges within a string.
 */
function Main ( input ) {
    // The primary function responsible for handling the program's logic.

    // First, we process the raw input string.
    // It is split into an array of strings based on newline characters.
    input = input . split ( "\n" ) ;

    // The first line of input (input[0]) is parsed as an integer.
    // This integer 'n' typically represents the length or size relevant to the problem.
    var n = parseInt ( input [ 0 ] , 10 ) ;

    // The second line of input (input[1]) is assigned to the variable 's'.
    // 's' is the string on which the main operations will be performed.
    s = input [ 1 ] ;

    // Initialize an array named 'char'.
    // Although declared, this specific array is not utilized in the subsequent logic
    // of the provided code snippet. It might be a remnant or for future extension.
    var char = new Array ( 26 ) ; // Array to hold 26 elements, potentially for a-z.

    // Initialize an array 'l' to store the leftmost index for each character.
    // Each element l[i] will hold the starting position of the i-th character.
    var l = new Array ( 26 ) ;

    // Initialize an array 'r' to store the rightmost index for each character.
    // Each element r[i] will hold the ending position of the i-th character.
    var r = new Array ( 26 ) ;

    // --- Loop Section 1: Determining Character Range Boundaries ---
    /*
     * This extensive loop iterates 26 times, once for each lowercase English alphabet character
     * (from 'a' to 'z'). For each character, it identifies its first (leftmost) and
     * last (rightmost) appearance within the string 's'.
     */
    for ( var i = 0 ; i < 26 ; i ++ ) { // Loop through all 26 possible character indices (0-25).

        // Inner loop to find the first occurrence (left boundary) of the current character.
        // It scans the string 's' from left to right.
        for ( l [ i ] = 0 ; l [ i ] < n ; l [ i ] ++ ) {
            // Check if the character at the current string position matches the target character.
            // 'i + 97' converts the 0-25 index to the ASCII code for 'a' through 'z'.
            if ( s . charCodeAt ( l [ i ] ) == i + 97 ) {
                break ; // If a match is found, the leftmost boundary is set, and we exit this inner loop.
            }
        }

        // Another inner loop to find the last occurrence (right boundary) of the current character.
        // This loop scans the string 's' from right to left, starting from 'n' (one past the end)
        // down to the previously found left boundary 'l[i]'.
        for ( r [ i ] = n ; r [ i ] >= l [ i ] ; r [ i ] += -1 ) {
            // Again, check if the character at the current position matches the target character.
            if ( s . charCodeAt ( r [ i ] ) == i + 97 ) {
                break ; // If a match is found, the rightmost boundary is set, and this inner loop terminates.
            }
        }
    } // End of the first major character range determination loop.


    // Declare a variable 'counter' to temporarily hold counts during the next phase.
    var counter ;
    // Initialize 'max' to 0. This variable will store the highest count found.
    var max = 0 ;

    // --- Loop Section 2: Calculating Maximum Overlapping Ranges ---
    /*
     * This section iterates through each position 'j' in the input string 's'.
     * For every position, it determines how many distinct character ranges
     * (as defined by 'l' and 'r' arrays) encompass that specific position.
     * The goal is to find the maximum number of such overlapping ranges.
     */
    for ( var j = 0 ; j < n ; j ++ ) { // Iterate through each index 'j' of the string 's'.
        counter = 0 ; // Reset the counter for each new position 'j' being evaluated.

        // Inner loop: Iterate through all 26 character ranges (a-z).
        for ( var k = 0 ; k < 26 ; k ++ ) {
            // Check if the current position 'j' falls within the range of character 'k'.
            // A position 'j' is considered within the range if it's greater than or equal to
            // the leftmost boundary 'l[k]' AND strictly less than the rightmost boundary 'r[k]'.
            // The right boundary 'r[k]' is typically exclusive here, meaning the character
            // itself is at r[k]-1.
            if ( j >= l [ k ] && j < r [ k ] ) {
                counter ++ ; // If 'j' is within the range, increment the counter.
            }
        }

        // After checking all 26 ranges for the current position 'j',
        // compare the accumulated 'counter' with the current 'max' value.
        if ( counter > max ) {
            max = counter ; // If 'counter' is greater, update 'max' to this new value.
        }
    } // End of the second major loop for finding maximum overlaps.

    // Finally, output the calculated maximum value to the console.
    // The '%d' format specifier is used for integer output.
    console . log ( '%d' , max ) ;

} // End of the Main function definition.

// This line executes the Main function.
// It reads the input from standard input (/dev/stdin) using Node.js's 'fs' module,
// specifying 'utf8' encoding for the input stream.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;