var rawData  =   require('fs') .  readFileSync( '/dev/stdin'  ,   'utf8'   ) ; // Acquire initial text content from standard input.
var processedText=rawData.trim() ; // Remove any leading or trailing whitespace from the acquired data.

// Begin iterating through the processed text to find and replace specific patterns.
for( var currentPos=0 ; currentPos < processedText.length - 7 ; currentPos++ )
{
    // Extract a sequence of eight characters starting from the current index.
    var charSegment = [
        processedText[ currentPos ] ,
        processedText[ currentPos + 1 ] ,
        processedText[ currentPos + 2 ] ,
        processedText[ currentPos + 3 ] ,
        processedText[ currentPos + 4 ] ,
        processedText[ currentPos + 5 ] ,
        processedText[ currentPos + 6 ] ,
        processedText[ currentPos + 7 ]
    ] ;

    // Check if the exact sequence of characters matches a target string.
    if  ( charSegment.join("") === "AIZUNYAN" )
    {
        // If a direct match is found, advance the position to skip the matched segment
        // and continue to the next iteration without further processing this segment.
        currentPos += 7 ;
        continue ;
    }

    // Sort the characters within the extracted segment alphabetically and then concatenate them into a new string.
    var sortedSegment = charSegment.sort().join("");

    // Evaluate if the newly sorted character segment matches another specific pattern.
    if  ( sortedSegment === "AADINNUY" )
    {
        // If a match is found based on the sorted segment, replace the original
        // 8-character segment in the `processedText` with the desired "AIZUNYAN" string.
        processedText = processedText.slice( 0 , currentPos ) + "AIZUNYAN" + processedText.slice( currentPos + 8 , processedText.length ) ;

        // Adjust the loop counter to account for the 8 characters that were just processed and replaced.
        currentPos += 7 ;
    }
}

// Display the final, modified text content to the standard output.
console.log( processedText ) ;