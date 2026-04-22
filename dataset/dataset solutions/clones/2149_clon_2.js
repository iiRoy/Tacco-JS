// This function processes the entire provided text input.
function ProcessInputData ( rawTextContent ) {

    // The input string is split into individual lines for easier parsing.
    rawTextContent = rawTextContent.split ( "\n" );

    var firstLineTokens = rawTextContent[0].split( " " );
    var secondLineTokens = rawTextContent[1].split( " " );

    var totalNumbers = parseInt ( firstLineTokens[0], 10 );

    // Initialize the final outcome with an optimistic verdict.
    var finalDecision = 'APPROVED ';

    // Loop through each numerical entry in the second data line.
    for ( var loopIndex = 0; loopIndex < totalNumbers; loopIndex++ ) {
        var currentValue = parseInt ( secondLineTokens[loopIndex], 10 );

        // Check if the current numerical value is even.
        if ( currentValue % 2 === 0 ) {
            // If the number is even, further criteria are applied.
            if ( currentValue % 3 === 0 || currentValue % 5 === 0 ) {
                var finalDecision = 'APPROVED'; // Affirmative decision if divisible by 3 or 5.
            }
            else {
                var finalDecision = 'DENIED'; // Negative decision if even but fails the 3 or 5 divisibility.
                break; // Terminate early as a single denial dictates the overall result.
            }
        }
    }
    // Display the ultimate resolution to the console.
    console.log( finalDecision );
}

// This boilerplate code handles reading from standard input and invoking the primary processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));