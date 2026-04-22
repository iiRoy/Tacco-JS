/*
 * This file contains utility functions for card generation,
 * input processing, and output logging,
 * along with the main logic to filter and display card data.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered, while the functional code remains exact.
 */

// Define the 'cards' function, responsible for generating a complete deck of standard playing cards.
var cards   =   function  ( )
{
    // Initialize an empty array. This array will store the generated card strings.
    var array   =   [ ] ;

    // Define the four standard suits for a deck of cards.
    var suit    =   [ 'S' , 'H' , 'C' , 'D' ] ;

    // Define the thirteen numbers/ranks for each suit, from Ace (1) to King (13).
    var numbers =   [ 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 , 11 , 12 , 13 ] ;

    // Outer loop: Iterate through each suit defined in the 'suit' array.
    for  ( var  i   =   0 ;  i   <   suit . length ;  i ++ )
    {
        // Inner loop: For the current suit, iterate through each number/rank.
        for  ( var  j   =   0 ;  j   <   numbers . length ;  j ++ )
        {
            // Construct the card string (e.g., "S 1", "H 13") by concatenating
            // the current suit, a space, and the string representation of the current number.
            // Then, add this newly created card string to our 'array'.
            array . push ( suit [ i ]   +   ' '   +   numbers [ j ] . toString ( ) ) ;
        }
    }

    // After all cards have been generated, return the complete array of card strings.
    return  array ;
} ; // End of the 'cards' function definition.


// Define the 'input' function, designed to read data from standard input.
var input   =   function  ( )
{
    // Utilize Node.js's 'fs' module to synchronously read the content of '/dev/stdin'.
    // The content is expected to be UTF-8 encoded.
    // Finally, the read content is split into an array of strings, using the newline character ('\n') as a delimiter.
    return  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . split ( '\n' ) ;
} ; // End of the 'input' function definition.


// Define the 'out' function, a simple utility to log a value to the console.
var out     =   function  ( x )
{
    // Print the provided argument 'x' to the standard output.
    console . log ( x ) ;

    // Return the argument 'x'. This can be useful for chaining or debugging purposes,
    // allowing the logged value to be passed along.
    return  x ;
} ; // End of the 'out' function definition.


/*
 * Main Program Execution Block:
 * This section orchestrates the primary logic of the script.
 * It involves reading user input, generating a full deck of cards,
 * filtering out cards that were present in the input, and then
 * displaying the cards that were *not* in the input.
 */

// First, call the 'input' function to read all lines from standard input.
// Store the resulting array of input lines in a variable also named 'array'.
var array   =   input ( ) ;

// Generate a complete deck of cards by calling the 'cards' function.
cards ( )
    // Filter this generated deck of cards. The filter keeps only those cards
    // that are NOT found within the 'array' (which holds the input lines).
    . filter ( function  ( element )
    {
        // The 'indexOf' method returns -1 if the 'element' (a card string)
        // is not found in the 'array' (the input lines).
        // So, we return 'true' for cards that are missing from the input.
        return  array . indexOf ( element )   ==   -1 ;
    } )
    // For each card that passed the filter (i.e., was not in the input),
    // call the 'out' function to print it to the console.
    . forEach ( out ) ;

// The script concludes here.