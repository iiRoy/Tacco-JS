function ProcessData ( sourceContent ) {
    // The 'sourceContent' variable holds the complete input string.

    sourceContent = sourceContent.split ( "\n" ) ; // Divide the raw input into an array of individual lines.
    
    // Each line from the input is stored sequentially, e.g., first line at 'lineRecords[0]', second at 'lineRecords[1]', and so on.
    let lineRecords = sourceContent;

    let totalEntries = parseInt( lineRecords[0].split ( " " ) );

    let lineIndex = 0;
    let finalDecision = "No";

    while ( lineIndex < totalEntries - 2 )
    {
        let currentLineTokens = lineRecords[lineIndex + 1].split(" ");
        let firstNumber = parseInt( currentLineTokens[0] );
        let secondNumber = parseInt( currentLineTokens[1] );

        if ( firstNumber === secondNumber )
        {
            let nextSegmentTokens = lineRecords[ lineIndex + 2 ].split ( " " );
            if ( parseInt( nextSegmentTokens[0] ) === parseInt( nextSegmentTokens[1] ) )
            {
                let thirdSegmentTokens = lineRecords[ lineIndex + 3 ].split ( " " );
                if ( parseInt( thirdSegmentTokens[0] ) === parseInt( thirdSegmentTokens[1] ) )
                {
                    finalDecision = "Yes";
                    break;
                }
                else
                {
                    lineIndex += 3;
                }
            }
            else
            {
                lineIndex += 2;
            }
        }
        else
        {
            lineIndex++;
        }
    }
    // Display the outcome
    console.log( finalDecision );
}

/* Do not modify the following code block. It handles reading from standard input and invoking the primary processing function. */
ProcessData( require("fs").readFileSync("/dev/stdin", "utf8") );