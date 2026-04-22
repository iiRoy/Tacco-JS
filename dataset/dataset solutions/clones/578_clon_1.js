/*
 * This JavaScript code processes input to find the longest common substring length.
 * It's structured as an Immediately Invoked Function Expression (IIFE).
 *
 * This version is a Type I clone, meaning it's identical to the original
 * in terms of functionality and structure, but differs extensively in
 * whitespace, line breaks, and comments for visual distinction.
 */

// Start of the main program logic, encapsulated within an IIFE.
( function ( input ) {

    // --- Variable Declarations and Initialization ---
    // 'inputs' will store each line of the input, obtained after
    // removing carriage returns and splitting by newline characters.
    var inputs = input . replace ( /\r/g, '' ) . split ( "\n" ) ;

    // 'str' is a temporary array, designed to hold the two strings
    // currently being compared for their longest common substring.
    var str = [ ] ;

    // 's' will reference the shorter of the two strings being compared.
    var s ;

    // 'l' will reference the longer of the two strings being compared.
    var l ;

    // 'tmp' is a declared variable, but it is not utilized in this specific
    // implementation. It remains for structural fidelity as per Type I cloning rules.
    var tmp ;

    // 'count' tracks the current length of a potential common substring
    // being evaluated from a specific starting point.
    var count ;

    // 'max' stores the greatest length of a common substring found
    // across all comparisons within a single pair of input strings.
    var max ;


    // --- Main Processing Loop ---
    // This loop continuously reads and processes pairs of lines from the 'inputs' array.
    // It will terminate only when an empty string is encountered as the first string
    // of a pair, signaling the end of the input sequence.
    while ( true ) {

        // Reset the maximum common substring length for the new pair of strings.
        max = 0 ;

        // Retrieve the first string for the current comparison pair.
        str [ 0 ] = inputs . shift ( ) ;

        // Check if the retrieved string is empty. An empty string signifies
        // the end-of-input marker, indicating no more pairs to process.
        if ( str [ 0 ] === '' ) {
            // If it's an empty string, break out of the infinite processing loop.
            break ;
        }

        // Retrieve the second string for the current comparison pair.
        str [ 1 ] = inputs . shift ( ) ;


        // --- String Length Comparison and Assignment ---
        // To optimize the search for common substrings, the algorithm
        // assigns the shorter string to 's' and the longer to 'l'.
        // This reduces the number of iterations in the subsequent 'for' loop.
        if ( str [ 0 ] . length < str [ 1 ] . length ) {
            // If the first string is shorter than the second.
            s = str [ 0 ] ;
            l = str [ 1 ] ;
        }
        else {
            // If the second string is shorter or both have equal length.
            s = str [ 1 ] ;
            l = str [ 0 ] ;
        }


        // --- Longest Common Substring Search ---
        // This loop iterates through every possible starting character position
        // within the *shorter* string ('s').
        for ( var i = 0 , len = s . length ; i < len ; i ++ ) {

            // Initialize 'count' for the current starting position 'i'.
            // It starts from 'max + 1' as an optimization, assuming we might find
            // a substring at least one character longer than the current maximum.
            count = max + 1 ;

            // This inner 'while' loop attempts to extend the current substring.
            // It continues as long as two conditions are met:
            // 1. The potential substring (s[i]...s[i+count-1]) is still within the bounds of 's'.
            // 2. The substring s.slice(i, i + count) is found within the longer string 'l',
            //    and *crucially*, it must be found at an index strictly greater than 0.
            //    This implies that common substrings starting at index 0 of 'l' are ignored.
            while ( s [ i + count ] && l . indexOf ( s . slice ( i , i + count ) ) > 0 ) {
                // If both conditions are true, increment 'count' to try a longer substring.
                count ++ ;
            }

            // After the 'while' loop, 'count' will be one greater than the actual
            // length of the longest common substring found from this 'i' (due to the
            // last increment before the condition failed).
            // We need to subtract 1 to get the true length.
            if ( count > max ) {
                // If the length found from this 'i' is greater than the overall 'max',
                // update 'max' to this new longest length.
                max = count - 1 ;
            }
        }

        // --- Output Result ---
        // After processing all possible substrings for the current pair of strings,
        // print the maximum length found to the console.
        console . log ( max ) ;
    }

} ) (
    // --- IIFE Invocation ---
    // The entire function block (IIFE) is immediately executed,
    // and its 'input' parameter is populated by reading data from standard input.
    // 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the entire
    // content of '/dev/stdin' as a UTF-8 encoded string.
    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;

// End of the JavaScript file.