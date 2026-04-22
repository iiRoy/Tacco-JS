// This function processes a given text input to perform a specific calculation.
function ProcessInput ( rawData ) {

    // Split the entire raw text into individual lines, creating an array of strings.
    const lineBlocks = rawData . split ( "\n" ) ;

    // Iterate through the processed line blocks, stepping by two for each problem instance.
    // The outer loop handles each distinct test case present in the input data.
    for ( var outerIndex = 0 ; outerIndex < lineBlocks.length ; outerIndex = outerIndex + 2 ) {

        // Parse the first line of the current block to get the initial count value.
        // This numerical value often dictates the size or number of iterations for subsequent operations.
        var countVal = parseInt ( lineBlocks[outerIndex] ) ;

        // Retrieve the second line of the current block and split it into an array of individual characters.
        var charArray = lineBlocks[outerIndex + 1] . split ( "" ) ;

        // Convert each character in the charArray into its corresponding numerical representation.
        // This transforms the character array into an array of numbers, ready for calculations.
        var numberSequence = charArray . map ( Number ) ;

        // The middle loop iterates downwards from the initial count value.
        // It systematically reduces the effective size of the sequence in each major step of the algorithm.
        for ( var middleCounter = countVal ; middleCounter > 1 ; middleCounter-- ) {

            // The inner loop performs a series of specific operations on the current number sequence.
            // It executes 'middleCounter' times for each iteration of the middle loop.
            for ( var innerIterator = 0 ; innerIterator < middleCounter ; innerIterator++ ) {

                // Calculate the absolute difference between the first two elements currently in the sequence.
                var differenceResult = Math.abs ( numberSequence[0] - numberSequence[1] ) ;

                // Append this newly calculated difference to the very end of the sequence.
                numberSequence . push ( differenceResult ) ;

                // Remove the first element from the sequence, effectively shifting all remaining elements forward.
                numberSequence . shift ( ) ;
            }

            // After the completion of the inner loop, remove the last element from the sequence.
            // This operation further modifies the sequence length or finalizes a processing step.
            numberSequence . pop ( ) ;
        }

        // Output the final remaining element of the sequence to the console for the current problem instance.
        console . log ( numberSequence[0] ) ;
    }
}

// Invoke the primary processing function with data read from the standard input stream.
// This line reads the entire content of '/dev/stdin' as a UTF-8 encoded string and passes it for execution.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;