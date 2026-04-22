/*
 * This JavaScript code is an application designed for processing
 * structured input, typically from standard input in a competitive
 * programming context. It reads a set of key-value pairs to build
 * a lookup table, and then uses this table to transform subsequent
 * input lines.
 *
 * This implementation adheres strictly to the original logic
 * and structure, with modifications limited to whitespace and comments
 * to achieve a Type-I clone.
 */

( ( stdin ) => { // Start of the Immediately Invoked Function Expression (IIFE)

    // Declare a constant 'data' to store the processed input lines.
    // The entire input 'stdin' is split into an array of strings,
    // where each string represents a line from the input.
    const data = stdin . split ( '\n' ) ;

    // The first line of the input (after splitting) is expected to be
    // an integer 'n', which specifies the number of entries for the
    // lookup table. 'parseInt' converts the string to an integer,
    // and 'data.shift()' removes this line from the 'data' array.
    const n = parseInt ( data . shift ( ) , 10 ) ;

    // Initialize an empty object 'table'. This object will serve as
    // our lookup table (or hash map) to store key-value associations.
    const table = { } ;

    // Begin a loop to populate the 'table' with 'n' entries.
    // The loop iterates 'n' times, processing one key-value pair per iteration.
    for ( let i = 0 ; i < n ; i ++ ) {

        // For each iteration, take the next line from 'data',
        // split it by a single space character, and store the
        // resulting array (typically [key, value]) in 'row'.
        const row = data . shift ( ) . split ( ' ' ) ;

        // Assign the key-value pair to the 'table' object.
        // The first element of 'row' (row[0]) is the key,
        // and the second element (row[1]) is its corresponding value.
        table [ row [ 0 ] ] = row [ 1 ] ;

    } // End of the loop for populating the lookup table

    // After the 'n' table entries, there is typically an empty line
    // in the input separating the table data from the query data.
    // This line is removed from the 'data' array, as it's not needed.
    data . shift ( ) ;

    // Process the remaining lines in the 'data' array.
    // The 'map' function iterates over each remaining line 'r'.
    // For each 'r', it checks if 'r' exists as a key in the 'table'.
    // If 'r' is found in 'table', its corresponding value is used.
    // Otherwise, 'r' itself is used (no transformation).
    const answer = data . map ( ( r ) => r in table ? table [ r ] : r ) ;

    // Finally, join all the elements of the 'answer' array into
    // a single string, with no separator between elements.
    // A newline character '\n' is then appended to this combined string.
    // The entire resulting string is printed to the console (standard output).
    console . log ( answer . join ( '' ) + '\n' ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // The IIFE is immediately invoked with the content of /dev/stdin