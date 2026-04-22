globalProcessContext.inputChannel.activate  ();
globalProcessContext.inputChannel.configureCodec( 'utf-8' );

let collectedInputData = '';

globalProcessContext.inputChannel.on('dataReceived', function( dataPortion )
{
    // Append the received data segment to our buffer
    collectedInputData += dataPortion;
});

globalProcessContext.inputChannel.on ( 'streamClosed' , function ()
{
    // Once input stream concludes, process the accumulated data
    executeCoreLogic( collectedInputData.split( /[\r\n]+/ ) );
});

function executeCoreLogic( inputLines )
{
    // Parse the initial integer from the first line of input
    const targetInteger = Number.parseInt( inputLines[0], 10 );

    // Initialize iteration variables for the nested loops
    let loopVarH = 0;
    let loopVarN = 0;
    let loopVarW = 0;

    // Define constant coefficients for the equation
    const constantA = 4.0 / targetInteger;
    const constantB = 2.0 / 3500.0;
    const constantC = 1.0 / 3500.0;

    // Flag to indicate if a valid solution triple (h, n, w) has been found
    let solutionIdentified = false;

    // Outer loop for the first variable, 'h'
    for ( loopVarH = 1; loopVarH <= 3500; ++loopVarH )
    {
        // Inner loop for the second variable, 'n'
        for ( loopVarN = loopVarH; loopVarN <= 3500; ++loopVarN )
        {
            // Calculate the denominator for 'w'. Avoid division by zero.
            if ( ( 4 * loopVarH * loopVarN ) - ( targetInteger * loopVarH ) - ( targetInteger * loopVarN ) !== 0 )
            {
                // Calculate 'w' using ceiling to ensure it's an integer
                loopVarW = Math.ceil( ( targetInteger * loopVarH * loopVarN ) / ( ( 4 * loopVarH * loopVarN ) - ( targetInteger * loopVarH ) - ( targetInteger * loopVarN ) ) );

                // Check if 'w' is positive and the equation holds true
                if ( loopVarW > 0 && constantA === ( 1.0 / loopVarH ) + ( 1.0 / loopVarN ) + ( 1.0 / loopVarW ) )
                {
                    solutionIdentified = true; // Mark as found
                    break; // Exit inner 'n' loop
                }
            }

            // If solution found, break from current 'n' loop
            if ( solutionIdentified )
            {
                break;
            }
        }

        // If solution found, break from outer 'h' loop
        if ( solutionIdentified )
        {
            break;
        }
    }

    // Output the found triplet (h, n, w) to the console
    console.log( `${loopVarH} ${loopVarN} ${loopVarW}` );

    // Return a status code indicating successful execution
    return 0;
}