const processInputAndOutput = () => {
    const fileSystemHandler = require("fs");
    const receivedString = fileSystemHandler.readFileSync("/dev/stdin", "utf8");

    const transformAndSquare = (textualInput) => {
        // Use Number() for explicit conversion, matching the original's implicit coercion behavior
        const numericalRepresentation = Number(textualInput);
        // Use Math.pow for a different squaring mechanism
        return Math.pow(numericalRepresentation, 2);
    };

    const finalComputationResult = transformAndSquare(receivedString);

    // Use process.stdout.write for output, an alternative to console.log
    // Ensure the output is a string, similar to console.log's behavior
    process.stdout.write(finalComputationResult.toString() + '\n');
};

// Invoke the primary processing function
processInputAndOutput();