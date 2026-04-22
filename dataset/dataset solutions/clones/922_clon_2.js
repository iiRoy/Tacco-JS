// This script performs a specific sequence reduction operation on input data.
// It reads content from standard input, processes it, and prints a single character result.
var     rawInputContent    =    require( 'fs' )     .     readFileSync    (    '/proc/self/fd/0'    ,    'utf-8'    )    ;

// The entire input content is first trimmed of leading/trailing whitespace,
// then split into an array of lines using the newline character as a delimiter.
var parsedLinesCollection    =    rawInputContent    .    trim    ( )
                                .    split    (    '\n'    )    ;

// The first line of the input is extracted. In this particular algorithm,
// this extracted value is not utilized further, but its extraction is part of the flow.
var     firstLineIdentifier    =    parsedLinesCollection    .    shift    ( )    ;

// The second line of the input is considered the primary sequence for processing.
var     booleanSequence    =    parsedLinesCollection    .    shift    ( )    ;

// Before reduction, all whitespace characters are removed from the sequence.
// This ensures only the 'T' and 'F' characters are present for logic evaluation.
booleanSequence    =    booleanSequence    .    replace    (    / +/g    ,    ''    )    ;

// The core logic iterates, reducing the sequence length by processing
// pairs of characters until only a single character remains.
while    (    booleanSequence    .    length    !==    1    )
{
    // The 'replace' method is used here to find the first occurrence of two
    // consecutive 'T' or 'F' characters and applies a transformation.
    booleanSequence    =    booleanSequence    .    replace    (    /[TF]{2}/    ,    function    (    twoCharSegment    )
                                                                {
                                                                    // If the segment is 'TT', it evaluates to 'T'.
                                                                    if    (    twoCharSegment    ===    'TT'    )    return    'T'    ;
                                                                    // If the segment is 'TF', it evaluates to 'F'.
                                                                    if    (    twoCharSegment    ===    'TF'    )    return    'F'    ;
                                                                    // If the segment is 'FT', it evaluates to 'T'.
                                                                    if    (    twoCharSegment    ===    'FT'    )    return    'T'    ;
                                                                    // If the segment is 'FF', it evaluates to 'T'.
                                                                    if    (    twoCharSegment    ===    'FF'    )    return    'T'    ;
                                                                }    )    ;
}

// Finally, the resulting single character, representing the reduced boolean sequence,
// is printed to the console.
console    .    log    (    booleanSequence    )    ;