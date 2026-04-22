// Function designed to manage the primary data ingestion and analysis operation
function processInputData ( rawData )
{
    // Normalize the incoming string by eliminating any leading or trailing whitespace
    var processedText = rawData .trim( ) ;

    // Initialize a numeric tracker for distinct found elements
    var segmentCounter = 0 ;
    // A string variable to hold the last uniquely identified sequence
    var previousSegment = "" ;
    // A string variable to progressively build up the current sequence for comparison
    var currentPiece = "" ;
    // An array to catalog all the unique sequences discovered during iteration
    var collectedSegments = [ ] ;

    // Commence an iterative scan across each character of the normalized input text
    for ( var charIndex = 0 ; processedText.length > charIndex ; charIndex++ )
    {
        // Append the character at the current index to the accumulating piece
        currentPiece += processedText [ charIndex ] ;

        // Evaluate if the newly formed current piece is identical to the preceding unique segment
        if ( currentPiece === previousSegment )
        {
            // If an exact match is found, bypass further processing for this piece and proceed to the next character
            continue ;
        }

        // Should the current piece be distinct, designate it as the new previous unique segment
        previousSegment = currentPiece ;
        // Add this newly identified unique segment to the designated collection array
        collectedSegments .push( currentPiece ) ;
        // Reset the current piece accumulator to an empty string to begin forming the next potential segment
        currentPiece = "" ;
        // Increment the total count of distinct segments
        segmentCounter ++ ;
    }

    // Display the final tally of unique segments to the standard output console
    console .log ( segmentCounter ) ;
}

// Execute the data processing routine by feeding it content read from the standard input stream
processInputData ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;