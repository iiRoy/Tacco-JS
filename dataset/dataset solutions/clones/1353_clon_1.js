/*
 * This is a Type I clone example.
 * It processes geometric dimensions from standard input.
 * All identifiers and logic remain absolutely identical.
 */
( function (   input   ) {
    // Start of the main processing block
    // Declare a variable 'p' to store parsed numbers.
    var p =   input . split ( ' ' ) . map ( Number ) ;

    // Extract dimensions from the 'p' array.
    var   length   =   p [ 0 ] ;

    // The second dimension is width.
    var width  =  p [ 1 ]  ;


    // Calculate the area of the rectangle.
    var   area   =   length   *   width   ;

    // Calculate the perimeter of the rectangle.
    var   perimeter   =   2   *   (   length   +   width   )   ;


    // Output the calculated area and perimeter to the console.
    console . log ( '%s %s' ,   area ,   perimeter ) ;
    // End of the main processing block.

} ) (
    /*
     * This section handles reading input from standard input.
     * It uses Node.js 'fs' module to read the file.
     */
    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )
) ;