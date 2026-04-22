// This array will hold each line read from the input stream.
var dataRows = [ ];


// Import the built-in 'readline' module for handling stream input.
var lineParser = require('readline');


// Create an interactive interface using the standard input and output streams.
var streamInterface = lineParser.createInterface(
 {
    inputSource: process.stdin,  // Standard input stream for reading data.
    outputTarget: process.stdout // Standard output stream for displaying results.
 }
);


// Attach an event listener to process each line as it is received.
streamInterface.on('line',
    function (currentInput)
    {
        dataRows.push(currentInput); // Add the current line to our collection.
    }
);


// Attach another event listener to execute code when the input stream closes.
streamInterface.on('close',
    function ()
    {
        // Split the first input line into individual characters for the primary sequence.
        var primarySequence = dataRows[0].split("");
        // Split the second input line into individual characters for the target pattern.
        var targetPattern = dataRows[1].split("");

        // Initialize a variable to store the starting index of the found pattern, if any.
        var foundIndex = -1;

        // Loop backwards through the primary sequence to find potential matching segments.
        for (
            var outerLoopIdx = primarySequence.length - 1;
            0 <= outerLoopIdx - targetPattern.length + 1;
            outerLoopIdx--
        )
        {
            // Extract a segment from the primary sequence of the same length as the target pattern.
            var subSequence = primarySequence.concat().slice(outerLoopIdx - targetPattern.length + 1, outerLoopIdx + 1);

            // Compare the extracted sub-sequence with the target pattern character by character.
            for (
                var innerLoopIdx = 0;
                innerLoopIdx < targetPattern.length;
                innerLoopIdx++
            )
            {
                // If characters don't match and the sub-sequence character isn't a wildcard, break the inner loop.
                if (
                    targetPattern[innerLoopIdx] !== subSequence[innerLoopIdx]
                    && subSequence[innerLoopIdx] !== "?"
                )
                {
                    break;
                }

                // If characters match (or sub-sequence char is wildcard) and it's the last char, a match is found.
                if (
                    (
                        targetPattern[innerLoopIdx] === subSequence[innerLoopIdx]
                        || subSequence[innerLoopIdx] === "?"
                    )
                    && innerLoopIdx === targetPattern.length - 1
                )
                {
                    foundIndex = outerLoopIdx - targetPattern.length + 1;
                }
            }

            // If a match was successfully identified, exit the outer loop early.
            if (foundIndex !== -1)
            {
                break;
            }
        }


        // Define a utility object for printing messages to the console.
        const outputUtility =
        {
            printMessage: function(messageContent)
            {
                console.log(messageContent);
            }
        };


        // Check if a valid starting index for the pattern was found.
        if (foundIndex === -1)
        {
            outputUtility.printMessage("UNRESTORABLE"); // No match, output failure message.
        }
        else
        {
            // Iterate through the primary sequence to reconstruct it based on the found pattern.
            for (
                var outerLoopIdx = 0;
                outerLoopIdx < primarySequence.length;
                outerLoopIdx++
            )
            {
                // Replace any '?' characters with 'a' if they are outside the matched pattern area.
                if (
                    primarySequence[outerLoopIdx] === "?"
                    && outerLoopIdx !== foundIndex
                )
                {
                    primarySequence[outerLoopIdx] = "a";
                }

                // When the loop index matches the found pattern start, insert the pattern.
                if (outerLoopIdx === foundIndex)
                {
                    for (
                        var innerLoopIdx = 0;
                        innerLoopIdx < targetPattern.length;
                        innerLoopIdx++
                    )
                    {
                        primarySequence[outerLoopIdx + innerLoopIdx] = targetPattern[innerLoopIdx];
                    }
                    // Advance the outer loop index past the inserted pattern.
                    outerLoopIdx += targetPattern.length - 1;
                }
            }

            // Join the characters of the reconstructed primary sequence and display it.
            outputUtility.printMessage(primarySequence.join(""));
        }
    }
);