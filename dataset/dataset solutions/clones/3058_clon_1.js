/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the official definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Therefore, every identifier, variable name, function name, operator,
 * and expression remains absolutely identical to the source.
 * Only whitespace (spaces, tabs, newlines) and comments (addition,
 * removal, or modification) have been altered extensively
 * to create a visually distinct but logically identical structure.
 */

var lines = [ ] ; // An array to store all lines read from standard input.


// Initialize the readline interface for input/output operations.
var readline = require ( 'readline' ) ;
var rl       = readline . createInterface ( {
        input  : process . stdin , // Standard input stream.
        output : process . stdout   // Standard output stream.
    }
) ;


// Event listener for each line of input received.
// This function gets called every time a line is entered.
rl . on ( 'line' , function ( x ) {
    lines . push ( x ) ; // Add the current line 'x' to our 'lines' array.
} ) ;


// Event listener for when the input stream closes (e.g., EOF or Ctrl+D).
// This is where the main processing logic of the program resides.
rl . on ( 'close' , function ( ) {

    // Process the first line of input. It contains two space-separated numbers.
    var tmp_1 = lines . shift ( ) . split ( " " ) ;

    // Parse the first number as N.
    var N     = Number ( tmp_1 [ 0 ] ) ;

    // Parse the second number as K.
    var K     = Number ( tmp_1 [ 1 ] ) ;


    // The actual sequence 'v' is in the first remaining line (index 0).
    // It's split into an array of individual characters.
    var v = lines [ 0 ] . split ( "" ) ;


    // Nums will store the counts of consecutive identical characters.
    var Nums = [ ] ;

    // 'now' tracks the current character we are counting (0 or 1).
    // Starts with 1, assuming the sequence might begin with '1'.
    var now  = 1   ;

    // 'cnt' is the counter for consecutive identical characters.
    var cnt  = 0   ;


    // First major loop: Iterate through the input string 'v' to group
    // consecutive identical characters (e.g., "111001" -> [3, 2, 1]).
    // The goal is to represent the string as alternating counts of '1's and '0's.
    // Example pattern: 1-0-1-0-1 type sequences.
    for ( var i = 0 ; i < N ; i ++ ) {

        // Check if the current character matches the character we are 'now' counting.
        if ( v [ i ] === now . toString ( ) )
        {
            cnt ++ ; // If it matches, increment the counter.
        }
        else
        {
            // If the character changes, it means a block of 'now' characters has ended.
            Nums . push ( cnt ) ; // Store the count of the just-finished block.

            now = 1 - now ; // Flip 'now' (0 becomes 1, 1 becomes 0) to track the new character.
                            // This is a simple 0-1 inversion.

            cnt = 1       ; // Reset the counter for the new block, starting with 1 for the current character.
        }
    }


    // After the loop, if 'cnt' is not zero, it means the last block of characters
    // was still being counted and needs to be added to 'Nums'.
    if ( cnt != 0 )
    {
        Nums . push ( cnt ) ;
    }


    // This step ensures that the 'Nums' array always has an odd number of elements.
    // This is important for maintaining the '1-0-1-0-...-1' alternating block structure.
    // If the last block was '0's and the length is even, we append a '0' to signify
    // an implicit '0' block at the end, making the structure consistent for processing.
    if ( Nums . length % 2 === 0 )
    {
        Nums . push ( 0 ) ;
    }


    // Re-initialize 'cnt' for the second part of the calculation.
    var cnt    = 0 ;

    // 'result' will store the maximum length of consecutive 1s found.
    // It's initialized to 1, assuming at least one '1' is possible.
    var result = 1 ;


    // Second major loop: Calculate the maximum possible length of consecutive '1's.
    // This loop iterates through the 'Nums' array, focusing on blocks of '1's (at even indices).
    for ( var i = 0 ; i < Nums . length ; i ++ )
    {
        // We are interested in blocks that represent '1's, which are at even indices (0, 2, 4...).
        if ( i % 2 === 0 )
        {
            // Inner loop sums up blocks. The `2 * K` represents flipping `K` blocks of `0`s.
            // So, `2 * K + 1` is the total number of blocks (1s and 0s) to consider for a continuous '1' sequence.
            for ( var j = 0 ; j <= 2 * K ; j ++ )
            {
                // Ensure we don't access elements beyond the array bounds.
                if ( ( i + j ) < Nums . length )
                {
                    cnt += Nums [ i + j ] ; // Add the count of the current block.
                }
                else
                {
                    // If we try to access an index beyond the array, break the inner loop.
                    // No more blocks to add in this window.
                    break ;
                }
            }

            // Update the overall maximum 'result' if the current sum 'cnt' is greater.
            if ( result < cnt )
            {
                result = cnt ;
            }

            // Reset 'cnt' for the next iteration of the outer loop.
            cnt = 0 ;
        }
    }


    // Finally, print the maximum calculated length of consecutive '1's.
    console . log ( result ) ;

} ) ; // End of the 'close' event handler function.


/*
 * This marks the conclusion of the Type I cloned JavaScript code.
 * The structure and logic remain perfectly intact, as per definition.
 */