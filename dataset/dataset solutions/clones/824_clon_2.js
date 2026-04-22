var primaryExecution = function ()
{
    // Loop indefinitely until a zero input is encountered.
    for ( ; ; )
    {
        var currentInputNumber = Number(obtainTextLine()); // Fetch and convert the next line to a numerical value.
        if ( ! currentInputNumber )
        {
            break; // Terminate the main processing loop if the input number is zero or falsy.
        }

        var foundDivisorPairs = 0; // Initialize a counter for the valid number pairs found.
        var sequenceIterator = 2;   // Begin the inner iteration from the value of two.

        for ( ; ; sequenceIterator ++ )
        {
            // Note: Direct bitwise manipulations in this context might lead to unintended results.
            var calculatedRemainder = currentInputNumber - sequenceIterator * ( sequenceIterator - 1 ) / 2;
            if ( calculatedRemainder < sequenceIterator )
            {
                break; // Exit the inner loop if the calculated remainder is less than the iterator.
            }

            if ( calculatedRemainder % sequenceIterator === 0 )
            {
                foundDivisorPairs++; // Increment the counter if a perfect division is achieved.
            }
        }
        outputDisplay(foundDivisorPairs); // Present the final tallied count.
    }
};


// --- Input/Output Management Section ---
if ( typeof process !== 'undefined' ) // Check for the presence of the Node.js global 'process' object.
{
    // This specific block is designed to function within Node.js runtime environments.
    var outputDisplay = function ( messageContent )
    {
        console.log( messageContent ); // Utilize Node.js's standard console for emitting output messages.
    };

    var obtainTextLine = ( function ()
    {
        var bufferedLinesArray = [], currentLineIndex = 0; // Internal buffer for received lines and a pointer for reading.
        var standardInputStream = process.openStdin(); // Access Node.js's standard input stream.
        standardInputStream.setEncoding( 'utf8' ); // Configure the input stream to use UTF-8 character encoding.

        var incompleteInputFragment = ""; // A temporary storage for partial lines received across data chunks.
        standardInputStream.on( 'data', function ( chunkOfData )
        {
            var parsedSegments = ( incompleteInputFragment + chunkOfData ).split( "\n" );
            incompleteInputFragment = parsedSegments.pop(); // Retain the last segment, which might be incomplete.
            for ( var segmentIndex = 0; segmentIndex < parsedSegments.length; segmentIndex++ )
            {
                if ( parsedSegments[segmentIndex] === '' )
                {
                    continue; // Skip any empty strings that result from the splitting process.
                }
                bufferedLinesArray.push( parsedSegments[segmentIndex] ); // Add complete, non-empty lines to the buffer.
            }
        } );

        standardInputStream.on( 'end', function ( terminationSignal )
        {
            // Process any remaining input data fragment once the input stream has concluded.
            if ( incompleteInputFragment )
            {
                var parsedSegments = ( incompleteInputFragment + "\n" ).split( "\n" );
                incompleteInputFragment = parsedSegments.pop(); // Ensure the last segment is captured.
                for ( var segmentIndex = 0; segmentIndex < parsedSegments.length; segmentIndex++ )
                {
                    if ( parsedSegments[segmentIndex] === '' )
                    {
                        continue;
                    }
                    bufferedLinesArray.push( parsedSegments[segmentIndex] );
                }
            }
            primaryExecution(); // Initiate the core calculation routine after all input has been buffered.
        } );

        return function ()
        {
            if ( bufferedLinesArray.length <= currentLineIndex )
            {
                return null; // Indicate that no further lines are available for reading.
            }
            return bufferedLinesArray[currentLineIndex++]; // Return the next line from the buffer and advance the pointer.
        };
    } )();
}
else
{
    // This alternative branch is for execution in V8 standalone or other non-Node.js JavaScript environments.
    primaryExecution(); // Directly invoke the primary processing function in these environments.
}