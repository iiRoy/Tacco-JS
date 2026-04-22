function ProcessInputData(rawData) {
    // Split the raw input string by newline characters into an array of lines.
    rawData = rawData.split("\n");
    const firstStringSegment = rawData[0]; // Store the very first line of input.
    const secondStringSegment = rawData[1]; // Store the subsequent line of input.

    // Commence a loop that iterates based on the combined length of both string segments.
    for (let loopCounter = 0; loopCounter < firstStringSegment.length + secondStringSegment.length; loopCounter++) {
        // Evaluate if the current iteration index is an even number.
        if (loopCounter % 2 === 0) {
            // If even, display a character from the first segment.
            console.log(firstStringSegment[loopCounter / 2]);
        } else {
            // If odd, display a character from the second segment.
            console.log(secondStringSegment[loopCounter / 2]);
        }
    }
}

// Invoke the primary processing routine, feeding it data acquired from standard input.
ProcessInputData( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );