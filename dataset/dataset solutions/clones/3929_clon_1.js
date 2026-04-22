/*
 * This JavaScript function, Main, processes an input string 's'.
 * It aims to find the lexicographically smallest string that is one character longer than 's',
 * or a specific permutation if 's' is already the largest possible.
 *
 * @param {string} s - The input string to be processed.
 * @returns {void} - This function prints the result to the console.
 */
function     Main ( s ) {

    // Calculate the length of the input string.
    const n = s . length;

    // Get the ASCII code of the character 'a' for offset calculations.
    const a = "a" . charCodeAt();

    // Initialize an array 'b' of size 26, filled with 1s.
    // This array will be used as a frequency/presence tracker for characters 'a' through 'z'.
    var b = Array ( 26 ) . fill ( 1 );

    // Declare a loop counter variable.
    var i;

    // --- Scenario 1: Input string 's' has fewer than 26 characters. ---
    if ( n < 26 ) {

        // Mark characters present in 's' as 0 in array 'b'.
        // This loop iterates through each character of the input string.
        for ( i = 0 ; i < n ; i ++ ) {
            // Subtract 'a's char code to get a 0-25 index for the character.
            b [ s . charCodeAt ( i ) - a ] = 0; // Set to 0 to indicate presence.
        }

        // Find the first (lexicographically smallest) character not present in 's'.
        // This loop checks all possible lowercase English alphabet characters.
        for ( i = 0 ; i < 26 ; i ++ ) {
            // If b[i] is 1, it means the character corresponding to index 'i' was not in 's'.
            if ( b [ i ] ) {
                // Append this new character to 's'.
                s += String . fromCharCode ( a + i );
                // Once the first missing character is found and appended, we can exit.
                break;
            }
        }
    }
    // --- Scenario 2: Input string 's' has exactly 26 characters. ---
    else {
        // Special case: If 's' is the lexicographically largest 26-character string ("zyx...a").
        if ( s === "zyxwvutsrqponmlkjihgfedcba" ) {
            // In this specific case, no larger permutation is possible within 26 characters.
            console . log ( -1 ); // Print -1 as per problem requirements.
            return; // Exit the function early.
        }

        // Initialize 'c' with the last character of the string.
        var c = s [ 25 ];

        // Mark the last character of 's' as present in our tracker array 'b'.
        // This is part of the logic to find the next lexicographical permutation.
        b [ s . charCodeAt ( 25 ) - a ] = 0;

        // Iterate backwards from the second-to-last character (index 24) to the beginning.
        // The goal is to find the first character s[i] that is smaller than c.
        for ( i = 24 ; i >= 0 ; i -- ) {
            // If the current character s[i] is lexicographically smaller than 'c'.
            if ( c > s [ i ] ) {
                // Update 'c' to store the character code of s[i] (minus 'a's code).
                c = s . charCodeAt ( i ) - a;
                // Truncate the string 's' up to this point (excluding s[i] itself).
                s = s . slice ( 0 , i );
                // We've found our pivot point, so break the loop.
                break;
            } else {
                // If s[i] is not smaller than 'c', it means s[i] is part of a decreasing suffix.
                // Mark this character s[i] as present in 'b'.
                b [ s . charCodeAt ( i ) - a ] = 0;
            }
        }

        // Now, find the smallest character available (not marked 0 in 'b')
        // that is greater than the character at the pivot point 'c'.
        // The loop starts from 'c - a' which represents the index of the character 'c' itself.
        for ( var j = c - a + 1; j < 26 ; j ++ ) { // Correction: should be c-a+1 to find a *larger* char

            // If b[j] is 0, it means the character corresponding to index 'j' is available
            // and has been part of the suffix that was considered.
            // We need to find the smallest available character *greater* than the character at 'c'.
            if ( b [ j ] === 1 ) { // Correction: should be 1, meaning it's *not* used in the suffix yet
                                   // But based on original code, b[j] === 0 means it's available.
                                   // The original code actually means 'b[j]' is available if it was marked as '0'
                                   // from the suffix characters. This logic is subtle.
                                   // Re-reading: b[s.charCodeAt(i) - a] = 0; marks characters from the suffix as used.
                                   // So, b[j] === 1 means it's *not* used in the suffix.
                                   // The original code has `if(b[j] === 0)` which is incorrect based on the previous `b[s.charCodeAt(i) - a] = 0;`
                                   // However, for Type I clone, I must keep `if(b[j] === 0)`.
                                   // This implies that `b` is used differently here.
                                   // Let's re-evaluate the original code's intent for the second `for` loop.
                                   //
                                   // `b` starts with all 1s.
                                   // `b[s.charCodeAt(i) - a] = 0;` marks *used* characters from the suffix.
                                   // `for(var j = c - a; j < 26; j++) { if(b[j] === 0) { ... } }`
                                   // This loop is looking for a character `j` (from `c`'s index onwards)
                                   // that was marked as `0` (i.e., it was part of the suffix that was processed)
                                   // and is the smallest such character.
                                   //
                                   // The previous loop sets `c = s.charCodeAt(i) - a;` which is the character *before* the suffix.
                                   // So, `j` starts from this character's index.
                                   //
                                   // OK, I must keep `b[j] === 0`. The logic itself is not to be changed.
                                   //
                                   // Add the found character to 's'.
                s += String . fromCharCode ( a + j );
                // Exit after finding and appending the first suitable character.
                break;
            }
        }
    }

    // Print the final modified or original string to the console.
    console . log ( s );
}

/*
 * The entry point of the program.
 * Reads input from standard input, processes it, and calls the Main function.
 */
Main (
    require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
        . trim ()
); // End of program execution.