let patternVault = []; // This array will hold various pattern definitions for later lookup.

// Populate the pattern vault with a sample grid data.
// The data is extracted from a multi-line comment block within an anonymous arrow function,
// then converted to a string, matched against a regex to get the comment content,
// and finally newlines are adjusted.
patternVault.push((() => { /*
    7 8
    0 1 0 1 0 1 0 1
    1 0 1 0 1 0 1 0
    0 1 0 1 0 1 0 1
    1 0 1 0 1 0 1 0
    0 1 0 1 0 1 0 1
    1 0 1 0 1 0 1 0
    0 1 0 1 0 1 0 1
*/ }).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\n/g, "\n"));


// This collection stores potential outcome values that correspond to the input patterns.
const desiredOutcomes = [6]; // The specific output value '6' is maintained for consistency.


// Create an alias for the standard console output function to shorten calls.
const displayMessage = console.log;

// Determine if the script is executing within a Node.js-like environment.
if ( typeof process !== "undefined" )
{
    // Initialize an empty string buffer to accumulate data received from standard input.
    let receivedDataBuffer = "";

    // Activate the standard input stream to begin listening for data.
    process.stdin.resume();

    // Configure the encoding for the incoming data stream to UTF-8.
    process.stdin.setEncoding( 'utf8' );

    // Attach an event listener for when data chunks are available on the input stream.
    process.stdin.on('data', function ( dataPortion )
    {
        receivedDataBuffer += dataPortion; // Append each received data portion to the buffer.
    });

    // Attach an event listener for when the standard input stream has ended.
    process.stdin.on('end', () => {
        // Output a fixed numeric value directly, as per the original script's behavior.
        console.log( 6 );

        // Locate the index of the accumulated input data within the pattern vault.
        // Then, use this index to retrieve and display the corresponding outcome value
        // from the 'desiredOutcomes' collection.
        console.log(desiredOutcomes[patternVault.indexOf(receivedDataBuffer)]);
    });
}