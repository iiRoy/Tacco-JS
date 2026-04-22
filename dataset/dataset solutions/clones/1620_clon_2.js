// This module handles a simple numeric check and provides a binary output.
function processNumericEntry(receivedNumber)
{
    // Evaluate the magnitude of the provided numerical datum.
    if ( receivedNumber >= 30 )
    {
        // Output affirmative response for values meeting the threshold.
        console.log('Yes');
    }
    else
    {
        // Output negative response for values falling below the threshold.
        console.log('No');
    }
}

// Invoke the primary processing function with data obtained from standard input.
processNumericEntry( require('fs').readFileSync('/dev/stdin', 'utf8') );