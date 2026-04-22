/*
 * This script is designed to process standard input data.
 * It initializes stdin, sets its encoding, and attaches a data listener.
 * The core logic involves parsing numerical data and performing specific calculations.
 */

// Initialize standard input to resume its flow, allowing data reception.
process . stdin . resume ( ) ;

// Set the character encoding for the standard input stream to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Attach an event listener to the 'data' event of stdin.
// This function will be called whenever new data is available.
process . stdin . on ( 'data' , function ( line ) {
    // Pass the received line of data to the 'before' function for initial processing.
    before ( line ) ;
} ) ;


// Declare a variable 'log' as an alias for 'console.log' for brevity.
var   log   =   console . log ;


/**
 *  Preprocesses the raw input line(s) received from stdin.
 *  This function handles splitting the input and filtering out empty lines.
 *  @param {string} line - The raw string input, potentially containing multiple lines.
 */
function   before ( line ) {
    // Split the input string into an array of individual lines based on newline characters.
    var   lines   =   line . split ( "\n" ) ;

    // Filter the array to remove any elements that are empty strings.
    lines   =   lines . filter ( function ( e ) {
        return   ( e   !==   "" ) ; // Return true for non-empty strings.
    } ) ;

    // Once lines are processed, pass the cleaned array to the main logic.
    main ( lines ) ;
}


// -----------------------------------------------------------------------------
// The main processing function for the numerical data.
// -----------------------------------------------------------------------------

/**
 *  Executes the primary logic of the program.
 *  It processes an array of string lines, converts them to numbers,
 *  and performs a series of operations to calculate an average.
 *  @param {string[]} lines - An array of string lines, expected to be numerical.
 */
function   main ( lines ) {
    // Convert each string element in the 'lines' array to a number.
    var   ls   =   lines . map ( function ( e ) { return   Number ( e ) ; } ) ;

    // Loop as long as there are more than one element remaining in the 'ls' array.
    while ( ls . length   >   1 ) {
        // Extract the first element from 'ls' and assign it to 'tpl'.
        // This element is assumed to be a count or template value.
        var   tpl   =   ls . shift ( ) ;

        // Create a new array 'arr' by slicing 'ls' from the beginning up to 'tpl' elements.
        var   arr   =   ls . slice ( 0 ,   tpl ) ;

        // Update 'ls' by removing the elements that were just copied into 'arr'.
        ls   =   ls . slice ( tpl ) ;

        // Find the index of the minimum value within 'arr'.
        // Math.min.apply is used to pass array elements as individual arguments.
        var   mid   =   arr . indexOf ( Math . min . apply ( this ,   arr ) ) ;

        // Remove the element at 'mid' (the minimum value) from 'arr'.
        arr . splice ( mid ,   1 ) ;

        // After removing the minimum, find the index of the maximum value in the modified 'arr'.
        var   Mid   =   arr . indexOf ( Math . max . apply ( this ,   arr ) ) ;

        // Remove the element at 'Mid' (the maximum value) from 'arr'.
        arr . splice ( Mid ,   1 ) ;

        // Calculate the sum of the remaining elements in 'arr' using the reduce method.
        var   sum   =   arr . reduce ( function ( p ,   c ,   i ,   a ) { return   p   +   c ; } ) ;

        // Calculate the average of the remaining elements, then take its floor, and log the result.
        log ( Math . floor ( sum   /   arr . length ) ) ;
    }
}