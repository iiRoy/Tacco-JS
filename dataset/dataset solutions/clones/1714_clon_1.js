/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered significantly.
 * The purpose is to demonstrate visual divergence while maintaining
 * complete structural and logical equivalence.
 */
function main()
{
    // The original code had this line commented out. We retain that.
    //  console.log(input);

    // Extract the value for 'D' from the first element of the input array.
    const D = Number( input[0] ) ;

    // Process the second element of the input to get the array 'c'.
    const c = input[1] . split(' ') . map( Number ) ;


    // Slice the input array to get the raw score lines for each day.
    const scores_of_day = input.slice( 2, D + 2 ) ;

    // Map the raw score lines into a 2D array of numbers.
    const scores = scores_of_day.map( ( text ) =>
    {
        return text.split(' ') . map( Number ) ;
    } ) ;

    // Extract and convert the 't_of_day' values from the input.
    const t_of_day = input.slice( D + 2, 2 * D + 2 ) . map( Number ) ;

    // Initialize the running sum 's' to zero.
    let s = 0 ;

    // Iterate through each day from 0 up to (but not including) D.
    for ( i = 0 ; i < D ; i++ )
    {
        // Add the score for the current day and 't' value to the sum.
        s += scores[i][ t_of_day[i] ] ;

        // Output the current accumulated sum to the console.
        console.log( s ) ;
    }

} // End of the main function definition.


// Declare a global variable to accumulate all input chunks.
var input = '' ;

// Resume the standard input stream to start listening for data.
process.stdin.resume( ) ;

// Set the encoding for the incoming standard input data.
process.stdin.setEncoding( 'utf8' ) ;

// Attach an event listener for when data chunks are received.
process.stdin.on( 'data', function( chunk )
{
    // Append the received data chunk to the 'input' string.
    input += chunk ;
} ) ;

// Attach an event listener for when the standard input stream ends.
process.stdin.on( 'end', function( )
{
    // Split the accumulated input string into an array of lines.
    input = input.split( '\n' ) ;

    // Once all input is processed, call the main application logic.
    main( ) ;
} ) ;