var lines = [ ] ;
var result = 0 ; // This variable 'result' is declared but currently unused in the program's logic.

/*
 *   This block imports the necessary 'readline' module.
 *   The 'readline' module provides an interface for reading data from a Readable stream
 *   (like process.stdin) one line at a time.
 */
var    readline    =    require (    'readline'    )    ;


var rl =   readline.createInterface (
    {
        input   :   process.stdin    ,   // Configure the input stream to be standard input.
        output  :   process.stdout   ,   // Configure the output stream to be standard output.
    }
    )
; // The 'rl' object is now an instance of the readline interface.

// Attach an event listener for the 'line' event.
rl . on ( 'line' , function ( x )
{
    // Whenever a new line of input is received from the user, it is pushed into the 'lines' array.
    // The 'x' parameter represents the received line of text.
        lines . push ( x ) ;
} )
; // End of the 'line' event listener definition.


// Attach an event listener for the 'close' event.
// This event fires when the input stream receives an "end" signal, indicating no more data.
rl . on ( 'close' , function ( )
{

    // The first line of input is treated as the source string 'S'.
    // It's split into an array of individual characters.
    var S = lines [ 0 ] . split ( "" ) ;

    // The second line of input is converted to a number and stored in 'K'.
    var K = Number ( lines [ 1 ] ) ;


    // Initialize a 2D array named 'word'.
    // This array will store substrings generated from 'S'.
    // Its dimensions are (S.length x S.length), initialized with empty strings.
    var word = Array ( S . length ) . fill ( "" ) . map ( i => i = Array ( S . length ) . fill ( "" ) ) ;

    // Initialize an empty array named 'dictionary'.
    // This array will temporarily hold all generated substrings before filtering for uniqueness.
    var dictionary = [ ] ;


    // Outer loop: Iterates through each character of 'S' to define the starting point of a substring.
    // 開始文字 : This comment indicates the loop for the starting character.
    for ( var i = 0 ; i < S . length ; i ++ )
    {
        // Inner loop: Iterates from the current starting point 'i' to the end of 'S'.
        // This loop extends the substring character by character.
        // 終了文字 : This comment indicates the loop for the ending character.
        for ( var j = i ; j < S . length ; j ++ )
        {
            // Conditional check: If the length of the current substring (word[i][j])
            // is already greater than or equal to 'K', we can stop extending it
            // from this starting position 'i', as longer substrings might not be relevant
            // for finding the K-th smallest.
            if ( K <= word [ i ] [ j ] . length )
            {
                break ; // Exit the inner loop.
            }
            else // If the current substring length is less than K, continue to extend it.
            {
                // Form a new substring by appending the character S[j] to the previous substring word[i][j].
                word [ i ] [ j + 1 ] = word [ i ] [ j ] + S [ j ] ;
                // Add this newly formed substring to our 'dictionary' array.
                dictionary . push ( word [ i ] [ j + 1 ] ) ;
            }
        }
    }


    // Filter the 'dictionary' array to remove any duplicate substrings.
    // The filter method creates a new array with all elements that pass the test implemented by the provided function.
    dictionary = dictionary . filter ( ( value , index , array ) =>
    {
        // The condition `array.indexOf(value) === index` ensures that only the first occurrence
        // of each unique substring is kept.
        return ( array . indexOf ( value ) === index ) ;
    } )
    ; // End of the filter method call.

    // Sort the 'dictionary' array alphabetically (lexicographically).
    dictionary . sort ( ) ;

    // Output the K-th smallest unique substring.
    // Since arrays are 0-indexed, we access the element at index `K - 1`.
    console . log ( dictionary [ K - 1 ] ) ;


}
)
; // End of the 'close' event listener definition.