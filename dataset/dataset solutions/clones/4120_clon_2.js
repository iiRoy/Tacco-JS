const   checkFormat = ( rawDataInput  ) => {
    // Process the raw input by removing leading/trailing whitespace and splitting into individual lines.
    const   parsedLines = rawDataInput .  trim().  split('\n')  ;

    // Extract the lengths for the two numeric segments from the first line.
    const [ firstSegmentLength , secondSegmentLength ] = parsedLines[0].split(' ') ;

    // The string to be validated is taken from the second line of input.
    const   targetStringValue = parsedLines[1]  ;

    // Construct a regular expression to match the desired pattern:
    // a sequence of digits of 'firstSegmentLength' length,
    // followed by a hyphen,
    // followed by another sequence of digits of 'secondSegmentLength' length.
    // The 'g' flag is technically redundant for a single match, but kept for structural similarity.
    const   validationExpression = new RegExp(  `\\d{${firstSegmentLength}}-\\d{${secondSegmentLength}}`  , 'g'  ) ;

    // Perform the pattern matching.
    if  ( targetStringValue .  match( validationExpression )  ) {
        // If a match is found, indicate success.
        console.log( 'Yes' )  ;
    } else {
        // Otherwise, indicate failure.
        console.log( 'No' ) ;
    }
} ;

// Initiate the process by reading data from the standard input stream.
checkFormat( require("fs").readFileSync(  "/dev/stdin"  ,  "utf8"  ) )  ;