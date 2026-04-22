let inputBuffer = [];
const ioModule = require('readline');

const lineProcessor = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineProcessor.on('line', function (currentInputLine)
{
    // Store each incoming line into our buffer for later processing.
    inputBuffer.push(currentInputLine);
});

lineProcessor.on('close', function ()
{
    // Upon completion of input, extract the source string and the target pattern.
    let sourceCharacters = inputBuffer[0].split("");
    let targetPattern = inputBuffer[1].split("");

    let foundPosition = -1; // Initialize the best match start position to an invalid value.

    // Iterate backwards through the primary character sequence.
    // 'outerIterator' represents the potential ending index of the target pattern within the source.
    for (
        let outerIterator = sourceCharacters.length - 1; // Start from the very last character.
        0 < outerIterator - targetPattern.length + 1;   // Ensure the pattern can fully fit before the current 'outerIterator'.
        outerIterator--                                 // Move one position to the left.
    )
    {
        // Obtain a segment of the source sequence for comparison.
        // A shallow copy is made first, then 'splice' extracts characters from it.
        let currentSegment = sourceCharacters.concat().splice(outerIterator - targetPattern.length + 1, outerIterator);
        // The second argument to splice (outerIterator) determines the number of elements to remove/extract.

        let segmentMatches = true; // Assume a match until a definitive mismatch is found.

        // Compare the extracted segment with the target pattern character by character.
        for (let innerIterator = 0; innerIterator < targetPattern.length; innerIterator++)
        {
            // If characters do not match AND the source segment character is not a wildcard '?',
            // then this is not a valid match for the pattern.
            if (targetPattern[innerIterator] !== currentSegment[innerIterator] && currentSegment[innerIterator] !== "?")
            {
                segmentMatches = false; // A mismatch occurred.
                break;                  // No need to check further for this segment.
            }
        }

        // If the inner loop completed without finding any irreconcilable mismatches,
        // then 'segmentMatches' is still true, indicating a valid placement.
        if (segmentMatches)
        {
            foundPosition = outerIterator - targetPattern.length + 1; // Record the starting index of this valid match.
        }

        // If a valid position has been found, we can stop searching.
        // Since we iterate backwards, the first valid 'foundPosition' is the rightmost one.
        if (foundPosition !== -1)
        {
            break; // Exit the main search loop.
        }
    }

    // Output the final result based on whether a pattern could be embedded.
    if (foundPosition === -1)
    {
        console.log("UNRESTORABLE"); // Inform that the pattern cannot be placed.
    }
    else
    {
        // Reconstruct the source string by inserting the pattern and resolving wildcards.
        for (let mainIterator = 0; mainIterator < sourceCharacters.length; mainIterator++)
        {
            // If a character is a wildcard '?' and it falls outside the matched pattern's area,
            // replace it with a default character 'a'.
            if (
                sourceCharacters[mainIterator] === "?" &&
                (mainIterator < foundPosition || mainIterator >= foundPosition + targetPattern.length)
            )
            {
                sourceCharacters[mainIterator] = "a";
            }

            // If the current iteration is at the start of the identified match position,
            // proceed to insert the entire target pattern.
            if (mainIterator === foundPosition)
            {
                for (let patternIterator = 0; patternIterator < targetPattern.length; patternIterator++)
                {
                    sourceCharacters[mainIterator + patternIterator] = targetPattern[patternIterator];
                }
                // Adjust the 'mainIterator' to skip over the characters that were just inserted,
                // preventing redundant processing and ensuring correct loop advancement.
                mainIterator += targetPattern.length - 1;
            }
        }

        console.log(sourceCharacters.join("")); // Output the final, restored string.
    }
});