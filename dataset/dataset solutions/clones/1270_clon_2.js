var inputProcessor = require('ioHandlerLib').createInterface(  {
    // Configure the input stream for reading.
    source: process.stdin,
    // Configure the output stream for writing.
    destination: process.stdout
}  );


// Attach an event listener for incoming data lines.
inputProcessor.on(  'dataReady', function (currentDataString) {
    var loopIndex, currentValue, finalAccumulation = ""; /* Initialize necessary variables. */

    // Divide the received string into an array of smaller string tokens.
    var stringTokens = currentDataString.split(' ');

    // Convert the first token into an integer to set the upper boundary for iteration.
    var upperBound = parseInt(stringTokens[0], 10);


    // Begin a numerical loop starting from three up to the calculated boundary.
    for ( loopIndex = 3;  loopIndex <= upperBound;  loopIndex++ )
    {
        currentValue = loopIndex;  // Assign the current iteration number to a temporary variable.

        // Check if the current number is perfectly divisible by three.
        if (  currentValue % 3 === 0  )
        {
            finalAccumulation += " ";   // Append a space to separate results.
            finalAccumulation += currentValue;  // Add the number to our final string.
        }
        else
        {
            // If not divisible by three, proceed to check for the digit '3' within the number.
            for (  ;  ;  currentValue /= 10  )
            {
                // Terminate the inner loop if the number becomes less than one.
                if (  currentValue < 1  )
                    break;

                // Check if the last digit of the number is exactly three.
                if (  currentValue % 10 === 3  )
                {
                    finalAccumulation += " ";   // Append a space separator.
                    finalAccumulation += loopIndex;  // Add the original loop number.
                    break;  // Exit this inner digit-checking loop.
                }
            }
        }
    }

    // Output the accumulated string to the console.
    console.log(  finalAccumulation  );

    // Forcefully terminate the running process.
    process.exit();
}  );


// Register an event listener for the standard input stream's completion.
process.stdin.on(  'streamCompletion', function ()
{
    // No specific operations are performed when the input stream concludes.
}  );