/*
 * This file contains the main logic for processing character mappings.
 * It determines if two strings S and T maintain a consistent character relationship.
 * The input is read from standard input and processed by the Main function.
 */

// Define the core processing function.
// This function takes a raw input string and performs the necessary operations.
function Main ( input ) {
    // Split the input string by newline characters to get individual lines.
    input = input.split ( "\n" ) ;

    // Get the first line as string S and convert it to an array of characters.
    var S = input [ 0 ] . split ( "" ) ;

    // Get the second line as string T and convert it to an array of characters.
    var T = input [ 1 ] . split ( "" ) ;

    // Initialize the answer variable to "Yes", assuming consistency until proven otherwise.
    var ans = "Yes" ;

    // Loop as long as string T still has characters to process.
    while ( T . length != 0 ) {
        // Iterate through the remaining characters of T, starting from the second element.
        // This loop checks for consistency between the first character and subsequent characters.
        for ( i = 1 ; i < T . length ; i ++ ) {
            // Check if the current character in T is the same as the first character in T.
            if ( T [ 0 ] == T [ i ] ) {
                // If they are the same, then their corresponding characters in S must also be the same.
                // If they are different, it means the mapping is inconsistent.
                if ( S [ 0 ] != S [ i ] ) {
                    ans = "No" ; // Set answer to "No" and break the inner loop.
                    break ;
                }
            }

            // Check if the current character in S is the same as the first character in S.
            if ( S [ 0 ] == S [ i ] ) {
                // If they are the same, then their corresponding characters in T must also be the same.
                // If they are different, it means the mapping is inconsistent.
                if ( T [ 0 ] != T [ i ] ) {
                    ans = "No" ; // Set answer to "No" and break the inner loop.
                    break ;
                }
            }
        }

        // If 'ans' has become "No" during the inner loop, then break the outer loop as well.
        if ( ans == "No" ) {
            break ;
        }

        // Remove the first character from S and T for the next iteration.
        // This effectively shifts the focus to the next pair of characters.
        S . shift ( ) ;
        T . shift ( ) ;
    }

    // Output the final answer to the console.
    console . log ( '%s' , ans ) ;
}


// This debug function is intended for local testing in a browser environment.
// It retrieves input from an HTML element and passes it to the Main function.
function debug ( ) {
    var input = document . getElementById ( "input" ) . value ;
    Main ( input ) ;
}


// This line executes the Main function with input read from standard input.
// It's typically used in environments like Node.js for competitive programming.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of file.
// This program checks for consistent one-to-one character mapping.
// If a character in S maps to a character in T, then that mapping must hold true
// throughout the entire string pair for all occurrences of those characters.