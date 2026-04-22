process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on(
    'data',
    function ( inputSegment )
    {
        // Split the incoming data segment into individual lines
        const textLines = inputSegment.split('\n');

        // Extract the number of iterations from the first line
        // Using parseInt with radix for explicit type conversion
        let iterationCount = parseInt(textLines[0], 10);

        // Retrieve the reference pattern string from the second line
        let searchPattern = textLines[1];

        // Declare variables for loop control and indexing
        let currentLineIdx, patternCharIdx, patternLength;

        // Initialize a counter for successful matches
        let totalMatches = 0;

        // Outer loop: Iterate through each target line from the input
        for
        (
            currentLineIdx = 1;
            currentLineIdx <= iterationCount;
            currentLineIdx++
        )
        {
            // Convert the search pattern into an array of characters
            const patternCharacters = searchPattern.split('');

            // Get the current line to be checked against the pattern
            const targetLine = textLines[currentLineIdx];

            // Initialize variables for position calculation and match flag
            let calculatedPosition;
            let offsetValue;
            let wasMatched = false;

            // Determine the length of the current target line
            const targetLineLength = targetLine.length;

            // Middle loop: Iterate through possible offset values
            for
            (
                offsetValue = 0;
                offsetValue < targetLineLength;
                offsetValue++
            )
            {
                // Get the length of the pattern character array
                patternLength = patternCharacters.length;

                // Inner loop: Iterate through each character of the pattern
                for
                (
                    patternCharIdx = 0;
                    patternCharIdx < patternLength;
                    patternCharIdx++
                )
                {
                    // Calculate the position in the target line based on index and offset
                    calculatedPosition = patternCharIdx + offsetValue * patternCharIdx;

                    // Check if the character at the calculated position in the target line
                    // matches the current pattern character AND if it's the very last character of the pattern
                    if (
                        targetLine[calculatedPosition] === patternCharacters[patternCharIdx]
                        && patternCharIdx === patternLength - 1
                    )
                    {
                        // If both conditions are met, a specific match is found for this line
                        wasMatched = true;
                        // Exit the inner loop as the condition is satisfied
                        break;
                    }
                }

                // If a match was found in the inner loop, exit the middle loop
                if (wasMatched)
                {
                    break;
                }
            }

            // If a match was confirmed for the current target line, increment the total count
            if (wasMatched)
            {
                totalMatches++;
            }
        }

        // Output the final count of lines that contained the specific pattern match
        console.log(totalMatches);
    }
);