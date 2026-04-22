/*
 * This module orchestrates a specific numerical transformation
 * based on incoming text data from an external source.
 * It calculates two intermediate values and then their difference.
 */
function    ExecuteCalculation(
    rawTextualInput
) {
    // Parse the textual input into a numerical representation.
    // It's expected to be a single integer string, potentially with surrounding whitespace.
    const
        numericRepresentation = parseInt(
            (
                rawTextualInput
                    .trim()
                    .split(/\s+/)
            )[0],
            10
        );

    // Compute the initial scaled quantity.
    // This value serves as the primary operand.
    let
        primaryQuantity = 800 * numericRepresentation;

    // Determine the secondary derived quantity.
    // This often represents a deduction or a rate-based adjustment.
    let
        secondaryQuantity = 200 * (numericRepresentation / 15);

    // Display the final computed outcome, which is the net result.
    console.log(
        primaryQuantity - secondaryQuantity
    );
}

// Application startup routine:
// Acquires environmental data from the standard input stream
// and dispatches it for processing.
ExecuteCalculation(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);