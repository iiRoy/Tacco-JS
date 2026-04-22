/*
 * This JavaScript code reads data from standard input,
 * performs a series of array manipulations based on the input,
 * and then prints the modified array elements to standard output.
 *
 * It's designed to process a specific input format where:
 * - The first line contains a number 'n'.
 * - Subsequent lines (from the third line onwards) contain pairs of numbers
 *   separated by a comma, indicating array element swaps.
 */
process.stdin.on ( "data" , function ( c ) {

    // Declare and initialize variables for processing input.
    // 'x' will hold the input lines.
    // 'n' will be the primary counter/size.
    // 'a' is the array to be manipulated.
    var x = ( c + "" ) . trim ( ) . split ( "\n" ) ,
        n = + x [ 0 ] ,
        a = [ ] ;

    // Initialize array 'a' with values from 0 to 'n'.
    // This loop effectively fills a[0]...a[n] with their respective indices.
    while ( a [ n ] = n -- ) ;

    // Process the input lines from the third line onwards.
    // These lines contain instructions for swapping elements in array 'a'.
    x . slice ( 2 ) . some ( function ( s , p ) {

        // Split the current line 's' by comma to get the two indices for swapping.
        s = s . split ( "," ) ;

        // Store the value of a[s[0]] in a temporary variable 'p'.
        p = a [ + s [ 0 ] ] ;

        // Perform the swap: assign a[s[1]] to a[s[0]].
        a [ + s [ 0 ] ] = a [ + s [ 1 ] ] ;

        // Complete the swap: assign the temporarily stored value 'p' to a[s[1]].
        a [ + s [ 1 ] ] = p ;

    } ) ; // End of the 'some' loop for processing swap instructions.


    // Iterate through the modified array 'a' (starting from index 1)
    // and print each element to the console.
    a . slice ( 1 ) . some ( function ( a ) {

        // Output the current array element.
        console . log ( a ) ;

    } ) ; // End of the 'some' loop for printing elements.

} ) . resume ( ) ; /* This ensures the process does not exit until all data is read. */