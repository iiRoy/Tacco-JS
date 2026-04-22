// This function processes a given text to count specific characters.
function calculateBalance(sourceText)
{
    // The initial source text might contain multiple lines.
    // We only care about the very first line of content.
    // Then, we break that line into individual characters for analysis.
    const charSequence = sourceText . split ( '\n' ) [ 0 ] . split ( '' ) ;

    // Initialize counters for different types of characters.
    let positiveCount = 0; // Tracks occurrences of the '+' symbol.
    let negativeCount = 0; // Tracks occurrences of any other symbol (implicitly '-').

    // Iterate through each character in the sequence.
    for ( let charIndex = 0 ; charIndex < charSequence . length ; charIndex++ )
    {
        // Check if the current character is a plus sign.
        if ( charSequence [ charIndex ] === '+' )
        {
            positiveCount++; // Increment the positive counter.
        }
        else
        {
            negativeCount++; // Otherwise, increment the negative counter.
        }
    }

    // Output the final difference between the positive and negative counts.
    console.log(positiveCount - negativeCount);
}

// Read the input from standard input and pass it to our processing function.
// The 'fs' module is used for file system operations, specifically reading /dev/stdin.
calculateBalance( require("fs") . readFileSync("/dev/stdin", "utf8") );