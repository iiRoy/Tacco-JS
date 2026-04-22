// This main routine orchestrates the processing of incoming textual data.
function ProcessInputData(incomingTextData) {
    // First, we segment the raw input string into an array of individual lines.
    let segmentedLines = incomingTextData.split("\n");

    // Extract the primary numerical value from the very first line of the input.
    // It's parsed as an integer with a base-10 radix.
    const keyNumericalValue = parseInt(segmentedLines[0], 10);

    // We then enter an iterative search phase. This loop is designed to run indefinitely
    // until a specific condition is satisfied, at which point it will be explicitly terminated.
    for (let currentIterationIndex = 1; currentIterationIndex > 0; currentIterationIndex++) {

        // Calculate a derived numerical quantity using a specific mathematical formula.
        // This formula is related to finding integer solutions for triangular numbers.
        // The expression (8 * keyNumericalValue * currentIterationIndex) + 1 is part of a discriminant.
        let derivedQuantity = 0.5 * (Math.sqrt((8 * keyNumericalValue * currentIterationIndex) + 1) - 1);

        // Evaluate if the computed 'derivedQuantity' is an integer.
        // This check is crucial for identifying the desired mathematical property.
        if (Number.isInteger(derivedQuantity) === true) {
            // If the quantity is indeed an integer, we output it to the standard console stream.
            console.log(derivedQuantity);
            // Once the first valid integer is found, there's no need to continue iterating,
            // so we exit the loop immediately.
            break;
        }
    }
}

// Invoke the data processing function. The input is sourced directly from the standard input stream
// (typically /dev/stdin in Unix-like systems), read entirely as a UTF-8 encoded string.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));