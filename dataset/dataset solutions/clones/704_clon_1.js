process . stdin . resume ( ) ; /* This line ensures the standard input stream stays open. */
process . stdin . setEncoding ( 'utf8' ) ; /* Set the encoding for incoming data to UTF-8. */

// Register a callback for incoming data events.
process . stdin . on ( 'data' , function ( line ) {
    // Pass the received line to the 'before' processing function.
    before ( line ) ;
} ) ;

var log = console . log ; // Store a reference to console.log for brevity.

/*
 * This function processes the raw input line, splitting it
 * and filtering out empty entries before passing to main.
 */
function before ( line ) {
    var lines = line . split ( "\n" ) ; // Split the input string by newline characters.

    // Filter out any empty strings that might result from splitting.
    lines = lines . filter ( function ( e ) {
        return ( e !== "" ) ; // Only keep non-empty elements.
    } ) ;

    main ( lines ) ; // Call the main processing logic with the cleaned lines.
}

// --- Main processing logic for the input data ---
/**
 * The core function that takes an array of string lines,
 * converts them to numbers, and performs calculations.
 * @param {Array<string>} lines - An array of string representations of numbers.
 */
function main ( lines ) {
    // Convert all string elements in 'lines' to numbers.
    var ls = lines . map ( function ( e ) { return Number ( e ) ; } ) ;

    // Continue processing as long as there are more than one element remaining.
    while ( ls . length > 1 ) {
        var tpl = ls . shift ( ) ; // Extract the first element, which represents the template size.

        // Create a sub-array 'arr' from 'ls' based on the 'tpl' size.
        var arr = ls . slice ( 0 , tpl ) ;

        // Update 'ls' to contain the remaining elements after 'arr' was sliced.
        ls = ls . slice ( tpl ) ;

        // Find the index of the minimum value within the 'arr' sub-array.
        var mid = arr . indexOf ( Math . min . apply ( this , arr ) ) ;
        arr . splice ( mid , 1 ) ; // Remove the minimum value from 'arr'.

        // Find the index of the maximum value within the modified 'arr'.
        var Mid = arr . indexOf ( Math . max . apply ( this , arr ) ) ;
        arr . splice ( Mid , 1 ) ; // Remove the maximum value from 'arr'.

        // Calculate the sum of the remaining elements in 'arr'.
        var sum = arr . reduce ( function ( p , c , i , a ) { return p + c ; } ) ;

        // Log the floor of the average of the remaining elements.
        log ( Math . floor ( sum / arr . length ) ) ;
    }
}