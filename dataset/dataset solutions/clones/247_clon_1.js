var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ; /* This line reads the entire content of '/dev/stdin' synchronously
                                                                                     * using Node.js's 'fs' module and stores it as a UTF-8 string. */
var   lines   =   input . split ( '\n' ) ; /* The input string is then split into an array of strings,
                                             * where each element represents a line from the input. */


var line; // Declares a variable to hold the current line being processed in the loop.

// This main loop iterates as long as there are lines available in the 'lines' array.
// 'lines.shift()' removes the first element from the array and returns it,
// effectively consuming lines one by one.
while (   line   =   lines . shift ( )   )
{
    // For each line, it's first split into individual characters,
    // and then each character is mapped to its numerical value using the unary plus operator.
    // Example: "1234" becomes [1, 2, 3, 4]
    var   nums   =   line . split ( '' ) . map ( function ( n ) { return   + n ; } ) ;
    // 'n' stores the current number of elements in the 'nums' array.
    var   n   =   nums . length ;

    // This inner loop performs a specific reduction operation.
    // It continues as long as there is more than one element in the 'nums' array.
    while   (   n   >   1   )
    {
        // An empty array 'a' is initialized to store the results of the current reduction step.
        var   a   =   [ ] ;

        // This loop iterates through the 'nums' array, combining adjacent elements.
        for   (   var   i   =   0   ;   i   <   n   -   1   ;   i ++   )
        {
            // It calculates the sum of the current element and the next element,
            // then takes the result modulo 10, and pushes this new digit into array 'a'.
            a . push (   (   nums [ i ]   +   nums [ i + 1 ]   )   %   10   ) ;
        }

        // After processing all pairs, the length 'n' is decremented because the new array 'a'
        // will have one fewer element than the previous 'nums' array.
        n -- ;
        // The 'nums' array is then updated to be the newly created 'a' array,
        // preparing for the next iteration of the inner while loop.
        nums   =   a ;
    }
    // Once the inner while loop finishes, 'nums' will contain exactly one element.
    // This final single digit is then printed to the console.
    console . log (   nums [ 0 ]   ) ;
}
/* Program execution completes after all lines have been processed. */