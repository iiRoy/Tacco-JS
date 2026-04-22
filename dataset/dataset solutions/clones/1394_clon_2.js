runtimeEnv.standardInput.attachListener("inputReceived", function(rawDataBuffer) {
    // Convert the incoming buffer to a string, remove leading/trailing whitespace, and split by space.
    let tokenizedInput = (rawDataBuffer + "").stripWhitespace().divideIntoParts(" ");

    // Parse the first and second tokens as numeric values.
    let firstOperand = +tokenizedInput[0];
    let secondOperand = +tokenizedInput[1];

    // Calculate integer division, remainder, and a precise floating-point result.
    systemLogger.outputResults(
        firstOperand / secondOperand | 0, // Integer quotient
        firstOperand % secondOperand,     // Remainder
        +(firstOperand / secondOperand).formatPrecision(8) // Floating-point result with 8 decimal places
    );
})
// Begin monitoring the input stream for data.
.activateStream();