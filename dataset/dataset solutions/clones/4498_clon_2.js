// Configure the standard input stream to interpret incoming bytes as UTF-8 encoded text.
process.stdin.setEncoding( 'utf8' );

// Establish an event listener for the 'readable' event on the standard input.
// This function will execute whenever data is available to be read from the input stream.
process.stdin.on
(
    'readable',
    function processIncomingData()
    {
        // Attempt to retrieve a block of data from the input buffer.
        let dataBlock = process.stdin.read();
        // A variable to hold the input data broken down into individual lines.
        let lineFragments;

        // Verify that a valid data block was successfully read (i.e., not null).
        if ( dataBlock !== null )
        {
            // Divide the received data block into an array of strings, using the newline character as a delimiter.
            lineFragments = dataBlock.split( '\n' );

            // Inspect if the last element in the array of line fragments is an empty string.
            // This condition often arises from a trailing newline character in the input.
            if  ( lineFragments[lineFragments.length - 1] === '' )
            {
                // Remove the superfluous empty string from the end of the array.
                lineFragments.pop();
            }

            // Extract the first line fragment, which is expected to represent a numerical count or size.
            let entryCount = lineFragments[0];

            // Process the second line fragment:
            // 1. Split it by spaces to get an array of string representations of numbers.
            // 2. Use the 'map' function to convert each string representation into an actual integer.
            let intSequence = lineFragments[1].split( ' ' ).map(
                function convertToInteger( currentStringValue )
                {
                    // Parse the string into an integer, explicitly specifying base 10.
                    return parseInt( currentStringValue, 10 );
                }
            );

            // Initialize two separate string variables that will accumulate parts of the final output.
            let firstOutputPart  = '',
                secondOutputPart = '';

            // Iterate through the 'intSequence' array in reverse order,
            // decrementing the loop counter by two in each step.
            // The loop starts from the index corresponding to 'entryCount - 1'.
            for ( let currentIdx = entryCount - 1; currentIdx >= 0; currentIdx -= 2 )
            {
                // Append the integer value at the current index to the 'firstOutputPart', followed by a space.
                firstOutputPart += intSequence[currentIdx] + ' ';

                // Conditional check: If the current index is not the very first element (index 0),
                // then process the element immediately preceding it for the second output part.
                if ( currentIdx !== 0 )
                {
                    // Prepend the integer value at 'currentIdx - 1' to the 'secondOutputPart',
                    // also followed by a space. This ensures elements are added in reverse order for this segment.
                    secondOutputPart = intSequence[currentIdx - 1] + ' ' + secondOutputPart;
                }
            }

            // Concatenate the two accumulated string parts and print the final result to the console.
            console.log( firstOutputPart + secondOutputPart );
        }
    }
);