// This module performs a specific statistical calculation based on input data.
function CalculateProbability(inputString)
{
    // First, parse the incoming string by splitting it into components
    // and then converting each component into a numeric type.
    const numericValues = inputString
        .split(" ") // Separate the string by space characters
        .map(
            (currentPart) => +currentPart // Convert each part to a number
        );

    // Extract individual parameters from the processed numeric array.
    let totalItems = numericValues[0]; // Represents the total count of items.
    let targetIndex = numericValues[1] - 1; // Adjusts an index value by decrementing it.
    let distanceValue = numericValues[2]; // A specific distance or offset value.

    // Determine a dynamic multiplier based on the distance value.
    // If distanceValue is truthy (non-zero), use 2; otherwise, use 1.
    const multiplierFactor = distanceValue ? 2 : 1;

    // Perform the final calculation using the derived parameters.
    // The formula is (targetIndex * (totalItems - distanceValue) * multiplierFactor) / (totalItems * totalItems).
    console.log(
        (targetIndex * (totalItems - distanceValue) * multiplierFactor) /
        (totalItems * totalItems)
    );
}

// Invoke the primary calculation function.
// It reads input from standard input (/dev/stdin) asynchronously
// using the Node.js 'fs' (file system) module and passes it as a UTF-8 string.
CalculateProbability(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);