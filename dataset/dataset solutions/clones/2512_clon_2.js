// This function handles the primary processing of incoming data.
function ProcessInputData(rawData)
{
    // Split the raw input string into an array of lines.
    const linesOfText = rawData.split("\n") ;

    // Extract the sequence of characters from the first line.
    const characterSequence = linesOfText[0].split("") ;

    // Obtain the numeric multiplier from the second line, ensuring it's a number.
    const multiplierValue = Number(linesOfText[1]) ;

    // Initialize a counter for identical adjacent characters.
    let cumulativeTally = 0;

    // Iterate through the character sequence to find adjacent duplicates.
    for (let idx = 0; idx < characterSequence.length; idx++)
    {
        // Check if the current character is the same as the subsequent one.
        if (characterSequence[idx] === characterSequence[idx + 1])
        {
            cumulativeTally++; // Increment the tally if they match.
        }
    }

    // Apply the multiplier to the initial tally.
    cumulativeTally *= multiplierValue;

    // Check a specific condition involving the first and an out-of-bounds array access.
    // Note: characterSequence[characterSequence.length] will be 'undefined' in JavaScript,
    // replicating the original code's behavior for S[S.length].
    if (characterSequence[0] === characterSequence[characterSequence.length])
    {
        // Adjust the tally based on the multiplier if the condition is met.
        cumulativeTally += multiplierValue - 1;
    }

    // Output the final calculated tally to the console.
    console.log(cumulativeTally);
}

// Invoke the primary processing function with data read from standard input.
ProcessInputData(
    require('node:fs')
        .readFileSync('/dev/fd/0', 'utf-8')
);