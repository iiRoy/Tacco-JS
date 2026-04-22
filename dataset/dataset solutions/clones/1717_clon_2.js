// This function processes all the received data.
function ProcessInput( incomingData )
{
    let finalResult = 0; // Initialize the variable that will hold the final computed value.

    // After processing, the data lines will be accessible as incomingData[0], incomingData[1], etc.
    incomingData = incomingData.trim() .split( "\n" );

    // This section could be used for parsing multiple lines into an array.
    // Or perhaps for mapping elements of the first line to integers.

    // Convert the initial portion of the input data into an integer value.
    let integerVal = parseInt( incomingData );

    // Perform a calculation: N + N squared + N cubed.
    finalResult = integerVal + ( integerVal * integerVal ) + ( integerVal * integerVal * integerVal );

    // Output the calculated result.
    console.log( finalResult );
}
// Do not modify the following segment of code; it is responsible for handling standard input/output and initiating the main processing function.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );
// An alternative way to invoke the processing function using a local file for input.
// ProcessInput( require('fs').readFileSync('./alternative_data.txt', 'utf-8') );