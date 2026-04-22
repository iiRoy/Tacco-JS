process . stdin . resume ( ); // Initialize the standard input stream to listen for data

process.stdin.setEncoding( 'utf8' ); // Configure the input stream to interpret data as UTF-8 characters

/*
 * This variable serves as a temporary storage buffer
 * for all incoming data segments from the standard input.
 */
let rawInputBuffer = "";

// Attach an event listener to capture each incoming data fragment
process . stdin . on (
    'data',
    ( dataChunk ) => { // The 'dataChunk' parameter holds a segment of the input
        rawInputBuffer += dataChunk; // Append the new data segment to the buffer
    }
);

// Define an event listener for when the entire input stream has concluded
process . stdin . on ( 'end' , ( eventArgumentIgnored ) => {
    // First, remove any trailing whitespace characters from the accumulated buffer
    // Then, split the cleaned string into an array of substrings, using space as the delimiter
    rawInputBuffer = rawInputBuffer.replace( /\s*$/g, '' ).split( ' ' );

    // After processing the raw input, invoke the primary execution function
    beginComputationAndOutput();
} );


/**
 * This central function manages the core logic:
 * performing a calculation on the processed input and then
 * displaying the final outcome to the standard output.
 */
function beginComputationAndOutput( )
{
    // Perform a 'reduce' operation on the array of input strings.
    // It multiplies all elements together, effectively converting them to numbers implicitly.
    let finalProductValue = rawInputBuffer.reduce( ( accumulatedValue, currentElement ) => {
        return accumulatedValue * currentElement;
    } );

    // Convert the numerical result to a string and write it to the standard output stream
    process.stdout.write( finalProductValue.toString() );
}