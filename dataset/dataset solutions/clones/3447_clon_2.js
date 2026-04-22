function computeOutcome(rawData) {
    // This function takes raw input and processes it to derive a numerical output.

    // Extract the very first line from the entire input string.
    let trimmedLine = rawData.split("\n")[0];

    // Further break down this first line into individual string components,
    // assuming they are space-separated numerical values.
    let numericalTokens = trimmedLine.split(" ");

    // Display the calculated sum: the first number plus half of the second number.
    console.log(Number(numericalTokens[0]) + Number(numericalTokens[1]) / 2);

    /*
     * An alternative calculation could simply be half of the second numerical token.
     * console.log(Number(numericalTokens[1]) / 2);
     */
}

// Initiate the outcome computation by reading data from standard input.
computeOutcome( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) );