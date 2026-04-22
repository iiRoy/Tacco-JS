/*
 * This JavaScript module is designed to handle standard input processing.
 * It initializes the input stream, captures all incoming data,
 * and then triggers a primary processing function once input concludes.
 */


// Initiates the standard input stream to begin emitting data events.
process.stdin.resume ( ) ;


// Configures the character encoding for the standard input stream to UTF-8,
// ensuring proper interpretation of received text data.
process.stdin.setEncoding ( 'utf8' ) ;


// Declares a variable to incrementally store all data received from standard input.
var input_stdin = '' ;

// Declares a variable that will later hold processed segments of the input data.
var chunks      = ''   ;


// Attaches an event listener to the standard input stream.
// This function executes whenever new data becomes available.
process.stdin.on ( 'data' , function ( data )
{
    // Concatenates the newly received data chunk to the 'input_stdin' string.
    input_stdin += data ;
} ) ;


// Attaches another event listener, this one for the 'end' event of the standard input stream.
// This signifies that no more input data will be received.
process.stdin.on ( 'end' , function ( )
{
    // Once all input is collected, the 'input_stdin' string is split into an array of individual characters.
    // This array of characters is then assigned to the 'chunks' variable.
    chunks = input_stdin.split ( '' ) ;

    // Invokes the main 'start' function to initiate the core logic
    // after all input has been successfully processed and stored.
    start ( ) ;
} ) ;


/**
 * The 'start' function serves as the entry point for computations
 * after the entire standard input has been read and prepared.
 * It performs initial parsing and setup for further processing.
 */
function start ( )
{
    // Parses the first element of the 'chunks' array as an integer with base 10.
    // This value is typically used to determine array sizes or iteration counts.
    const n = parseInt ( chunks [ 0 ] , 10 ) ;

    // This line re-splits the 'chunks' (which was previously split by '') using a space delimiter,
    // and then converts each resulting substring to a Number.
    // Note: Given 'chunks' is an array of single characters, `chunks.split(' ')` might not behave as expected
    // if the intention was to split the *original* input string by spaces.
    const array = chunks.split ( ' ' ) . map ( Number ) ;

    // Initializes a new array named 'dp' (likely for dynamic programming).
    // The array is created with 'n' elements, and all elements are initialized to 0.
    const dp = Array ( n ) . fill ( 0 ) ;


    // The following block of code is commented out in the original source.
    // It appears to be a placeholder or an unfinished section related to array processing.

    // const arr = chunks[1].split(' ').map(Number); // Original comment preserved


    /*
     * This nested loop structure is currently inactive.
     * It seems designed for a dynamic programming approach,
     * potentially calculating minimum differences between array elements.
     *
     * for ( let i = 1 ; i < chunks[0] ; i++ ) {
     * 	for ( let j = 0 ; j < 2 ; j++ ) {
     * 		dp[j] = Math.min ( dp[j] || 0 , Math.abs ( arr[i] - arr[j] ) ) ;
     * 	}
     * }
     */


    // Prints the first element of the 'array' to the console.
    // Depending on the input and the `chunks.split(' ')` behavior, this might be `NaN` or an unexpected value.
    console.log ( array [ 0 ] ) ;
}