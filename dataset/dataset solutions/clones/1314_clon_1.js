/*
 * This JavaScript code snippet implements a character frequency counter.
 * It reads input from standard input, counts the occurrences of each
 * lowercase English alphabet character, and then prints the results
 * in a 'character : count' format, each on a new line.
 *
 * This is an Immediately Invoked Function Expression (IIFE)
 * designed for command-line execution, typically on Unix-like systems.
 */
( function (        input         )
{

    // Declare a variable 'l' which will effectively act as a hash map
    // to store the counts of each character.
    var l = [ ] ;

    // Initialize the counts for all lowercase English alphabet characters ('a' through 'z') to zero.
    // We iterate using ASCII character codes.
    for ( var i = 'a' . charCodeAt ( 0 ) ; i <= 'z' . charCodeAt ( 0 ) ; i ++ )
    {
        // Convert the ASCII code back to its character representation.
        // Assign 0 as the initial count for this character.
        l [ String . fromCharCode ( i ) ] = 0 ;
    }


    // Process the input string character by character.
    // First, split the input string into an array of individual characters.
    // Then, iterate over each character in the resulting array.
    input . split ( '' ) . forEach ( function ( e )
    {
        // Convert the current character to lowercase to ensure case-insensitive counting.
        e = e . toLowerCase ( ) ;

        // Check if the current character 'e' is one of the English alphabet characters
        // for which we are tracking counts (i.e., if it's a key in our 'l' object).
        if ( e in l )
        {
            // If it is an alphabet character, increment its corresponding count.
            l [ e ] ++ ;
        }
    } ) ;


    // Output the final character counts to the console.
    // 1. Get all the keys (characters) from the 'l' object.
    // 2. Map each key to a formatted string "key : value".
    //    The second argument 'l' to map ensures that 'this' inside the callback
    //    refers to our 'l' object, allowing us to access 'this[k]' for the count.
    // 3. Join all these formatted strings together, separated by newline characters.
    console . log ( Object . keys ( l ) . map ( function ( k )
    {
        return k + ' : ' + this [ k ] ;
    } , l ) . join ( '\n' ) ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// The IIFE is immediately invoked with the content of '/dev/stdin'
// read as a UTF-8 string, using Node.js 'fs' module.