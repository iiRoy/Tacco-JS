// This function serves as the primary entry point for processing the input.
// It takes an array of strings, where each string represents a line of input.
const processData = ( lines ) =>
{
    // The first line contains two space-separated numbers, N and M.
    // We destructure them directly after parsing.
    const [ N , M ] = lines[ 0 ] . split ( ' ' ) . map ( x => +x ) ;

    // The second line contains a sequence of numbers which need to be summed up.
    // This sum is stored in the 'take' variable.
    const take = lines[ 1 ]
        . split ( ' ' )
        . map ( x => +x )
        . reduce ( ( r , x ) => r + x , 0 ) ;

    // Now, we evaluate a condition based on the calculated 'take' value
    // and the 'N' value obtained from the first line.
    if ( take > N )
    {
        // If 'take' is greater than 'N', it indicates an invalid scenario.
        // In this case, we output -1 to the console.
        console . log ( -1 ) ;
    }
    else
    {
        // Otherwise, if 'take' is less than or equal to 'N',
        // we calculate the difference (N - take) and output it.
        console . log ( N - take ) ;
    }
} ;


// Initialize a global variable 'i' as an empty string.
// This variable will accumulate all chunks of data received from standard input.
let i = '' ;

// Attach an event listener to the 'data' event of 'process.stdin'.
// This event fires whenever there's new data available from the standard input stream.
process . stdin . on ( 'data' , ( c ) =>
{
    // Each chunk of data 'c' is appended to our accumulator string 'i'.
    i += c ;
} ) ;

// Attach another event listener to the 'end' event of 'process.stdin'.
// This event signals that there is no more data to be read from standard input.
process . stdin . on ( 'end' , ( ) =>
{
    // Require the 'os' module to get the platform-specific End-Of-Line character.
    const { EOL } = require ( 'os' ) ;

    // Split the accumulated input string 'i' into an array of individual lines.
    // The split is performed using the platform's native End-Of-Line character.
    const lines = i . split ( EOL ) ; // The complete input text, now separated into an array of lines.

    // Finally, invoke our main processing function with the prepared array of lines.
    processData ( lines ) ;
} ) ;