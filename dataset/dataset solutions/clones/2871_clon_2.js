// This function orchestrates the primary logic of the application.
function ProcessInput(receivedText) {
    // Split the incoming text by spaces into an array of string tokens.
    let  segments = receivedText.split(" ");

    // Parse the first segment as an integer to determine the iteration limit.
    const  limitCount = parseInt(segments[0]);

    // Parse the second segment as an integer for the starting value of the series.
    const initialTerm = parseInt(segments[1]);

    // Parse the third segment as an integer for the common difference or step factor.
    const incrementFactor = parseInt(segments[2]);

    // Parse the fourth segment as an integer to be used as the modulus.
    const modulusVal = parseInt(segments[3]);

    // Initialize an empty string to accumulate calculated values.
    let accumulatedString = "";

    // Iterate 'limitCount' times to generate a sequence.
    for (let loopIndex = 0; loopIndex < limitCount; loopIndex++) {
        // Calculate the current term in the arithmetic progression.
        let calculatedValue = initialTerm + (incrementFactor * loopIndex);
        // Append the string representation of the current term to the accumulator.
        accumulatedString = accumulatedString + "" + calculatedValue;
    }

    // Convert the accumulated string to an integer and compute its remainder
    // when divided by the specified modulus value.
    let finalRemainder = parseInt(accumulatedString) % modulusVal;

    // Output the final computed remainder to the console.
    console.log(finalRemainder);
}

// Invoke the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));