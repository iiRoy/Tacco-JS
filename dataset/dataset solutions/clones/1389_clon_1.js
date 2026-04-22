/* This JavaScript code snippet demonstrates basic array manipulation
 * and conditional looping based on input data.
 * It's structured as an IIFE (Immediately Invoked Function Expression).
 *
 * This version is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source. All identifiers,
 * operators, and expressions remain precisely the same.
 */

( function ( input )
{
    // The input string is first split into an array of lines.
    // Each line represents a record.
    input = input . split ( "\n" ) ;

    // A new array named 'data' is initialized.
    // This array will store parsed numeric values from each line.
    var data = [ ] ;

    // An index variable is set to 0 to keep track of the current record.
    var index = 0 ;

    // This loop iterates through each line obtained from the input.
    for ( var i = 0 ; i < input . length ; i ++ )
    {
        // For each line, it's further split by spaces.
        // The resulting array of strings (which should be numbers)
        // is then stored at the corresponding position in the 'data' array.
        data [ i ] = input [ i ] . split ( " " ) ;
    }

    // This 'while' loop processes the 'data' array.
    // It continues as long as the first two elements of the current record
    // (data[index][0] and data[index][1]) are not equal to 0.
    while ( data [ index ] [ 0 ] != 0 && data [ index ] [ 1 ] != 0 )
    {
        // Inside the loop, it prints the second element followed by the first.
        // The unary '+' operator is used to explicitly convert the string
        // values (from input.split(" ")) into numbers before they are
        // concatenated with the space string.
        console . log ( + data [ index ] [ 1 ] + " " + + data [ index ] [ 0 ] ) ;

        // After processing the current record, the index is incremented
        // to move to the next record in the 'data' array.
        index ++ ;
    }

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // The IIFE is immediately invoked, passing the content of standard input as a string.