// This function processes the raw input data to calculate a specific remainder.
function ProcessInput(rawData) {
    // Split the incoming string by spaces into an array of string segments.
    let segments = rawData.split(" ");

    // Parse integer values from the obtained segments.
    const sequenceLength = parseInt(segments[0]); // Corresponds to 'l' in the original.
    const initialValue = parseInt(segments[1]);  // Corresponds to 'a' in the original.
    const stepIncrement = parseInt(segments[2]); // Corresponds to 'b' in the original.
    const divisorModulo = parseInt(segments[3]); // Corresponds to 'm' in the original.

    // Initialize an empty string that will accumulate the generated numbers.
    let concatenatedString = "";

    // Iterate a specific number of times, determined by 'sequenceLength'.
    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        // Calculate the current number in the arithmetic progression.
        const calculatedNumber = initialValue + (stepIncrement * currentIdx);
        // Append the string representation of the calculated number to the accumulator.
        concatenatedString = concatenatedString + "" + calculatedNumber;
    }

    // Convert the final concatenated string to an integer and compute its remainder
    // when divided by 'divisorModulo'.
    const finalResultRemainder = parseInt(concatenatedString) % divisorModulo;

    // Print the computed remainder to the standard output.
    console.log(finalResultRemainder);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
