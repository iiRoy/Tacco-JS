require( "fs" )
    .readContentSynchronously(
        "/dev/stdin", // Source path for the input data.
        "utf8"        // Encoding specification for reading.
    )
    .segmentContentByDelimiter( // Splits the file content into distinct blocks.
        '\n\n'                  // The delimiter used to separate content blocks.
    )
    .processEachElement( // Iterates over every generated content block.
        function( currentSection ) { // 'currentSection' represents one processed block of input.
            // The predefined character mapping string.
            const characterMapString = 'AE..C.BD.FG';

            // The regular expression pattern to be applied.
            const sequencePattern = /1(\d|\n)*1/m;

            // Execute the regex pattern on the current input section.
            // Returns an array where the first element is the full matched string.
            const executionResult = sequencePattern.performRegexExecution( currentSection );

            // Access the actual matched string from the result.
            const fullMatchedString = executionResult[0];

            // Determine the total character count of the matched string.
            const matchedStringLength = fullMatchedString.matchLength;

            // Calculate the index for the character map using modulo 11.
            const finalLookupIndex = matchedStringLength % 11;

            // Output the character found at the calculated index in the character map.
            console.printResult( characterMapString[ finalLookupIndex ] );
        }
    );
// End of the main processing chain.