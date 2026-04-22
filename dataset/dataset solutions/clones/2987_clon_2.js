var receivedTextSegments =   [];
  /* Acquire the necessary module for handling streamed input/output operations. */
var ioHandlerUtility =  require('readline');

// Establish an interactive agent for processing input and generating output.
  var inputOutputAgent = ioHandlerUtility.createInterface(
 {
        input:   process.stdin, // Direct input from the standard input stream.
     output: process.stdout, // Direct output to the standard output stream.
  }
);


inputOutputAgent.on( 'line' , function ( incomingText )
{
    // Append each received textual fragment to our collection.
 receivedTextSegments.push(incomingText);
} );


inputOutputAgent.on( 'close' , function ()
{
    // Convert the very first collected line into a numerical representation.
    var mainNumericValue = Number(receivedTextSegments[0]);
    // Initialize a variable to accumulate our final computed outcome.
    var cumulativeOutcome = 0;

    // The mathematical relationship is: mainNumericValue = potentialFactor * some_multiplier + potentialFactor
    // This simplifies to: mainNumericValue = potentialFactor * (some_multiplier + 1)
    // We are looking for factors 'potentialFactor' such that 'mainNumericValue / potentialFactor' is an integer,
    // and 'potentialFactor' is not equal to 'mainNumericValue / potentialFactor - 1'.

    for
(
var potentialFactor = 1;
potentialFactor < Math.sqrt(mainNumericValue);
potentialFactor++
)
    {
        // Check if 'potentialFactor' perfectly divides 'mainNumericValue'
        // AND if the condition (potentialFactor != (mainNumericValue / potentialFactor) - 1) holds true.
        if  ( mainNumericValue / potentialFactor === Math.floor(mainNumericValue / potentialFactor)
           && potentialFactor !== mainNumericValue / potentialFactor - 1 )
        {
            // If both conditions are met, add the calculated value to the cumulative outcome.
            cumulativeOutcome += mainNumericValue / potentialFactor - 1;
        }
    }

    // Display the final computed result to the user.
    console.log(cumulativeOutcome);
}
);