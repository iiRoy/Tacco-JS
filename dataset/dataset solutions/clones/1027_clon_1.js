/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered significantly.
 */

// Import the 'fs' (file system) module to read input from a file.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Split the entire input string into an array of lines based on the newline character.
var lines = input . split ( '\n' ) ;


// The first line of input is usually a count or header, which is not needed for processing operations.
// Remove the first element from the 'lines' array.
lines . shift ( ) ;


// Initialize an empty array 'q' which will act as our dynamic data structure (a queue/list).
var q = [ ] ;

/*
 * Iterate over each line (operation) received from the input.
 * The 'forEach' method is used to process each 'op' string in the 'lines' array.
 */
lines . forEach ( function ( op )
{
    // Split the current operation string by spaces to get command and arguments.
    // For example, "insert 10" becomes ["insert", "10"].
    var arr = op . split ( ' ' ) ;

    // Check the first element of 'arr' to determine the operation type.

    if ( arr [ 0 ] == 'insert' )
    {
        // If the operation is 'insert', add the second element (value) to the beginning of 'q'.
        // This effectively inserts at the front.
        q = [ arr [ 1 ] ] . concat ( q ) ;
    }
    else if ( arr [ 0 ] == 'delete' )
    {
        // If the operation is 'delete', find and remove the specified value.
        // Iterate through the 'q' array to locate the element.
        for ( var i = 0 ; i < q . length ; i ++ )
        {
            // If the current element matches the value to be deleted.
            if ( q [ i ] == arr [ 1 ] )
            {
                // Remove one element at the found index 'i'.
                q . splice ( i , 1 ) ;
                // Exit the loop after deleting the first occurrence.
                break ;
            }
        }
    }
    else if ( arr [ 0 ] == 'deleteFirst' )
    {
        // If the operation is 'deleteFirst', remove the element at the beginning of 'q'.
        q . shift ( ) ;
    }
    else if ( arr [ 0 ] == 'deleteLast' )
    {
        // If the operation is 'deleteLast', remove the element at the end of 'q'.
        q . pop ( ) ;
    }
} ) // End of lines.forEach()

// After all operations are processed, join the elements of 'q' with a space
// and print the resulting string to the console.
console . log ( q . join ( ' ' ) ) ;

// End of JavaScript program.
// This concludes the Type I clone generation.