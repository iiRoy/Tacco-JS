// This function performs a specific numerical verification based on provided text data.
function executeVerification(    textData    )
{
    // Break down the input text into individual components, using space as the separator.
    let componentArray = textData.split( " " );

    // Concatenate the components back into a single string (using default comma separator).
    // Convert this combined string representation to an integer value.
    // Check if this numerical value is perfectly divisible by four.
    console.log( ( parseInt( componentArray.join() ) % 4 === 0 ) ? "AFFIRMATIVE\n" : "NEGATIVE\n" );
}

// Retrieve the raw content from standard input and process it.
const fileSystemModule = require( 'fs' );

let rawInputContent = fileSystemModule.readFileSync( '/dev/stdin', 'utf8' );

// Invoke the primary logic function with the obtained data.
executeVerification( rawInputContent );