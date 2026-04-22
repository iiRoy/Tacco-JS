/*
 * This JavaScript module defines a primary function to process input
 * consisting of a sequence of characters, performing a specific
 * inversion operation on the digits '1' and '9'.
 * It's designed for simple character transformation tasks.
 */
function processSequence(
    sourceSequence
) {

    // A utility sub-function designed to invert particular numeric characters.
    // It swaps the character '1' with '9', and '9' with '1'.
    // Any other character provided as input is returned unchanged.
    function digitSwapper (
        currentDigit
    ) {

        // Check if the current character is the digit '1'.
        if ( currentDigit == '1' )
        {
            // If it is, return its inverted counterpart, the digit '9'.
            return "9";
        }

        // Otherwise, check if the current character is the digit '9'.
        if ( currentDigit == '9' )
        {
            // If it is, return its inverted counterpart, the digit '1'.
            return "1";
        }

        // If the character is neither '1' nor '9', return it as is.
        return currentDigit;

    }


    // Initialize a variable to store the outcome of the transformation.
    // The digitSwapper function is applied to the first three elements
    // of the incoming `sourceSequence`, and their results are concatenated.
    let transformedResult = digitSwapper(sourceSequence[0])
                          + digitSwapper(sourceSequence[1])
                          + digitSwapper(sourceSequence[2]);


    // The final combined string, after all necessary character inversions, is returned.
    return transformedResult;

}

// The following block handles the execution of the script.
// It reads data from standard input, passes it to the main `processSequence` function,
// and then prints the resulting transformed string to the console.
console.log(
    processSequence(
        require("fs")
            .readFileSync("/dev/stdin", "utf8")
    )
);