function CalculateOutcome(inputString) {
    // Split the incoming string by spaces to get individual numeric parts.
    inputString = inputString.split(' ');

    // Parse the first three parts into integer variables.
    var initialQuantity = parseInt(inputString[0]);
    var thresholdA = parseInt(inputString[1]);
    var thresholdB = parseInt(inputString[2]);

    // Calculate the difference between thresholdB and thresholdA.
    var valueDifference = thresholdB - thresholdA;

    // Determine the remaining quantity based on initialQuantity and thresholdA.
    var remainingQuantity = initialQuantity - thresholdA;

    // Apply a complex conditional logic to compute the final count.
    // This involves checking conditions on remainingQuantity and valueDifference,
    // and then further checking the parity of remainingQuantity.
    var finalCount = ((remainingQuantity < 2) || (valueDifference < 3))
        ? (initialQuantity + 1)
        : (remainingQuantity % 2 === 0)
            ? (thresholdA + remainingQuantity * valueDifference / 2 + 1)
            : (thresholdA + (remainingQuantity + 1) * valueDifference / 2);

    // Output the computed final count to the console.
    console.log(finalCount);
}

// Read input from standard input and pass it to the main processing function.
CalculateOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
