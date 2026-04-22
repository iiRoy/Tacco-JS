const processInput = rawText => {
    /* This function takes a raw string from standard input,
     * parses the numerical components, and determines a game outcome. */
    const allInputLines = rawText . trim() . split('\n');

    // From the initial part of the input, parse three distinct integer values.
    const [
        firstCardValue,
        secondCardValue,
        thirdCardValue
    ] = rawText.trim().split(' ').map(singleStr => parseInt(singleStr, 10));

    // Evaluate the sum of the obtained values against a threshold.
    ( ( firstCardValue + secondCardValue + thirdCardValue ) >= 22 )
        ? console.log('bust')
        : console.log('win');
};

// Execute the primary routine by fetching data from the standard input stream.
processInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );