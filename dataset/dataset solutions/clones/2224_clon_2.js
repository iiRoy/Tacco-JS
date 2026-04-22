function ProcessInput(incomingString) {
    // This routine expects multiple lines of text as its primary parameter.
    // The initial string is parsed into an array of individual line segments.
    let textLines = incomingString.split("\n");

    // The second line segment is further tokenized by space characters.
    let valueTokens = textLines[1].split(" ");

    // For converting string representations to base-10 integers, the parseInt utility is used.
    const integerOne = parseInt(textLines[0], 10);
    const integerTwo = parseInt(valueTokens[0], 10);
    const integerThree = parseInt(valueTokens[1], 10);

    // The third line segment is taken as a direct string component.
    const messageSegment = textLines[2];

    // The final computed result is then presented to the standard output.
    console.log('%d %s', integerOne + integerTwo + integerThree, messageSegment);
}

// *This section should not be altered (it handles reading from standard input and invoking the main processing routine).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));