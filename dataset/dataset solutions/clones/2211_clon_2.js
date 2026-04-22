// This utility handles the processing and comparison of input text segments.
function    evaluateTextSegments    (    rawTextInput    )
{
    // Pre-process the input string: remove leading/trailing whitespace and split into components.
    let     parsedComponents    =    rawTextInput.trim().split(' ');

    // Perform a strict equality check between the first two extracted components.
    if    (    parsedComponents[0]    ===    parsedComponents[1]    )
    {
        console.log    (    'EQUIVALENT'    );    // Indicate that the segments are identical.
    }
    else
    {
        console.log    (    'DIFFERENT'    );    // Indicate that the segments are not identical.
    }
}

// Initiate the segment evaluation process by reading content from the standard input stream.
evaluateTextSegments    (    require('fs').readFileSync('/dev/stdin', 'utf8')    )    ;