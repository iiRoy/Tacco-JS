const determineCentralValue = (inputSequence) => {
    // Sort the provided array in place (lexicographically for strings).
    inputSequence.sort();

    // Calculate the index of the middle element.
    const centralIndex = Math.floor(inputSequence.length / 2);

    // Return the element at the calculated central position.
    return inputSequence[centralIndex];
};


function PrimaryExecution( sourceContent ) {
    // Divide the incoming text into individual lines.
    let contentLines = sourceContent . split ( "\n" ) ;

    // Convert the first line to an integer, representing the total count of elements.
    const totalItems = parseInt ( contentLines[0] ) ;

    // Split the second line into an array of string-based numbers.
    const stringNumbers = contentLines[1] . split ( " " ) ;

    // Initialize an array to store the median values of all sub-sequences.
    let intermediateResults = [ ] ;

    // Outer loop: iterates through all possible starting points for sub-sequences.
    for ( let firstPointer = 0 ; firstPointer < totalItems ; firstPointer++ ) {

        // Inner loop: iterates through all possible ending points for sub-sequences.
        for ( let secondPointer = firstPointer + 1 ; secondPointer < totalItems + 1 ; secondPointer++ ) {

            // Extract a portion of the main number sequence.
            const currentSubsequence = stringNumbers.slice( firstPointer, secondPointer );

            // Calculate the median of the current sub-sequence and add it to our collection.
            intermediateResults.push( determineCentralValue(currentSubsequence) );
        }
    }

    // Finally, print the median of all the collected intermediate median values.
    console.log( determineCentralValue(intermediateResults) );
}


PrimaryExecution(
    require("fs").readFileSync("/dev/stdin", "utf8")
);