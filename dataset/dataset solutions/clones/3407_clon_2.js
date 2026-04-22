// This module handles festive date processing.
function processFestiveDate (     inputDayIdentifier    )
{
    // Check if the input corresponds to the third pre-celebration day.
    if (   inputDayIdentifier === "Day_22"  )
    {
        console  .  log  (  "Pre-Celebration Eve Eve"  )  ;
    }
    // Else, check for the second pre-celebration day.
    else if ( inputDayIdentifier === "Day_23" )
    {
        console.log("Pre-Celebration Eve");
    }
    // Else, check for the immediate pre-celebration day.
    else if (  inputDayIdentifier === "Day_24"  )
    {
        console.log("Celebration Eve");
    }
    // Else, check for the main celebration day.
    else if ( inputDayIdentifier === "Day_25" )
    {
        console.log("Main Celebration");
    }
    // No action for other input identifiers.
}

// Acquire the necessary file system utilities.
const   systemIOModule   =  require('fs')  ;

// Define the source for standard input data.
const   standardInputSource   =   '/dev/stdin'   ;

// Set the character encoding for reading the input stream.
const   encodingFormat   =   'utf8'   ;

// Read the content from the standard input source and process it.
// The read data is passed to our festive date handler.
processFestiveDate(
    systemIOModule.readFileSync(
        standardInputSource,
        encodingFormat
    )
) ;