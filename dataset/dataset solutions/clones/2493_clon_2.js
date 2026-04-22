// This module handles input data processing.
function processInputData( rawData )
{
    // The initial data is cleaned and segmented into lines.
    var processedLines = rawData . trim (  ) . split (  '\n'  ) ;

    // A numerical indicator is extracted from the first segment.
    var sequenceLength = Number ( processedLines [ 0 ] ) ;

    // The second segment is transformed into an array of individual characters.
    var characterSequence = processedLines [ 1 ] . split (  ''  ) ;

    // A counter for distinct character groups is initialized.
    var segmentCounter = 0 ;

    // Check if the primary length indicator is a positive value.
    if ( sequenceLength > 0 )
    {
        segmentCounter ++ ; // If so, increment the group counter.
    }

    // Iterate through the character array using an index.
    for ( var charPos = 0 ; charPos <= sequenceLength ; charPos ++ )
    {
        // Compare the character at the current position with the subsequent one.
        if ( characterSequence [ charPos ] !== characterSequence [ charPos + 1 ] )
        {
            segmentCounter ++ ; // Increment the counter if a change is detected.
        }
    }

    // Display the final calculated count, adjusted by one unit.
    console . log ( segmentCounter - 1 ) ;
}


// Invoking the primary data processing routine with standard file system input.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;