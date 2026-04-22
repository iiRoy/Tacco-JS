/*
 * This file contains utility functions for input/output and data conversion,
 * along with the main logic for processing a list of numbers.
 *
 * It reads from standard input, processes the data, and writes to standard output.
 * Error messages are sent to standard error.
 */

function myin ( ) {
    // Reads input from standard input using Node.js fs module
    return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ;
}


/*
 * Function: myout
 * Description: Outputs the given text 't' to standard output.
 * Parameters:
 *   t - The text or value to be printed.
 */
function myout ( t ) {
    console . log ( t ) ; // This is the standard output channel.
}

/**
 * myerr - Outputs the given text 't' to standard error.
 * @param {any} t - The text or value to be printed as an error.
 */
function myerr ( t ) {
    console . error ( t ) ;
}

// [no] parameter values for myconv function:
// 0: Do nothing, return input as is.
// 1: Convert to integer.
// 2: Split by single space.
// 3: Split by newline character.
// 4: Split by space and convert each part to a number.
// 5: Split by newline and convert each part to a number.
// 6: Split into individual characters.
// 7: Split into individual characters and convert each to a number.
function myconv ( i , no ) {
    switch ( no ) {
        case 0 : // Case 0: No conversion, return original input.
            return i ;
        case 1 : // Case 1: Parse input as an integer.
            return parseInt ( i ) ;
        case 2 : // Case 2: Split string by space.
            return i . split ( " " ) ;
        case 3 : // Case 3: Split string by newline.
            return i . split ( "\n" ) ;
        case 4 : // Case 4: Split by space, then map to numbers.
            return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
        case 5 : // Case 5: Split by newline, then map to numbers.
            return i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;
        case 6 : // Case 6: Split string into individual characters.
            return i . split ( "" ) ;
        case 7 : // Case 7: Split into characters, then map to numbers.
            return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
    }
}


/*
 * Main function: Entry point of the program.
 * It takes the raw input string, processes it, and outputs the result.
 */
function Main ( input ) {
    // First, convert the raw input string into an array of lines.
    input = myconv ( input , 3 ) ;

    // Convert the first line (N) to an integer.
    var N = myconv ( input [ 0 ] , 1 ) ;

    // Convert the second line (list of numbers) by splitting by space.
    var list = myconv ( input [ 1 ] , 2 ) ;

    // Initialize objects to store counts of numbers at odd and even positions.
    var oddlist = { } ;
    var evenlist = { } ;

    // Loop through the list to populate oddlist and evenlist.
    for ( var i = 0 ; i < N ; i ++ ) {
        // We are interested in counts of numbers at odd and even indices.
        if ( i % 2 == 0 ) { // If the index 'i' is even.
            if ( oddlist [ list [ i ] ] == null ) {
                oddlist [ list [ i ] ] = 1 ; // First occurrence.
            }
            else {
                oddlist [ list [ i ] ] ++ ; // Increment count.
            }
        }
        else { // If the index 'i' is odd.
            if ( evenlist [ list [ i ] ] == null ) {
                evenlist [ list [ i ] ] = 1 ; // First occurrence.
            }
            else {
                evenlist [ list [ i ] ] ++ ; // Increment count.
            }
        }
    }


    // Initialize the output variable.
    var output = 0 ;

    // Get unique keys (numbers) from oddlist and evenlist.
    var oddSet = Array . from ( Object . keys ( oddlist ) ) ;
    var evenSet = Array . from ( Object . keys ( evenlist ) ) ;

    /*
     * Special case: If both odd and even positions have only one unique number,
     * and these numbers are the same, then half of N needs to be changed.
     */
    if ( oddSet . length == 1 && evenSet . length == 1 && evenSet [ 0 ] == oddSet [ 0 ] ) {
        myout ( N / 2 ) ; // Output N/2 directly.
        return ; // Exit the function.
    }

    var tmp = 0 ; // Temporary variable for counting.
    var lastSelect = "" ; // Stores the most frequent number from the odd positions.

    // Find the most frequent number in odd positions.
    for ( var i = 0 ; i < oddSet . length ; i ++ ) {
        if ( tmp < oddlist [ oddSet [ i ] ] ) {
            tmp = oddlist [ oddSet [ i ] ] ;
            lastSelect = oddSet [ i ] ;
        }
    }

    // Calculate changes needed for odd positions.
    output += ( N / 2 ) - tmp ;

    tmp = 0 ; // Reset temporary counter for even positions.

    // If the most frequent number from odd positions is also present in even positions,
    // remove it from consideration for even positions to avoid conflicts.
    if ( evenSet . indexOf ( lastSelect ) != -1 ) {
        evenSet . splice ( evenSet . indexOf ( lastSelect ) , 1 ) ;
    }

    // Find the most frequent number in even positions (after potential removal).
    for ( var i = 0 ; i < evenSet . length ; i ++ ) {
        if ( lastSelect == evenSet [ i ] ) {
            // This 'if' block was originally commented out.
            // It's logically redundant because 'lastSelect' is removed from 'evenSet'
            // if it was present, so this condition will likely never be true here.
            // However, keeping the structure as is for Type I clone.
            // continue; // Skip if it's the same as lastSelect (already handled).
        }
        tmp = Math . max ( tmp , evenlist [ evenSet [ i ] ] ) ;
    }

    // Debugging output for the sets.
    myerr ( oddSet ) ;
    myerr ( evenSet ) ;

    // Calculate changes needed for even positions and add to total output.
    output += ( N / 2 ) - tmp ;

    // Output the final result.
    myout ( output ) ;
}

// Call the Main function with input from myin().
Main ( myin ( ) ) ;