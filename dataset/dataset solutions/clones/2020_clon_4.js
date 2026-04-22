const evaluateInputConditions = (sourceMaterial) => {
    // Retrieve character codes at specific offsets from the input string.
    // Using charCodeAt deviates from direct string comparison syntax.
    const firstCode = sourceMaterial.charCodeAt(2);
    const secondCode = sourceMaterial.charCodeAt(3);
    const thirdCode = sourceMaterial.charCodeAt(4);
    const fourthCode = sourceMaterial.charCodeAt(5);

    // Determine the outcome of the first comparison.
    // The unary plus operator (+) converts the boolean result (true/false) to a number (1/0).
    const initialTestResult = +(firstCode === secondCode);

    // Determine the outcome of the second comparison, similarly converting to 1 or 0.
    const subsequentTestResult = +(thirdCode === fourthCode);

    // Combine the two test results using multiplication.
    // This functionally replicates a logical AND:
    // Only if both initialTestResult and subsequentTestResult are 1 (true) will combinedEvaluation be 1.
    // Otherwise, if any is 0 (false), combinedEvaluation will be 0.
    const combinedEvaluation = initialTestResult * subsequentTestResult;

    // Use an array as a lookup table to map the numerical result (0 or 1) to the desired string output.
    const messageDictionary = ["No", "Yes"];

    // Return the appropriate message from the dictionary based on the combined evaluation.
    return messageDictionary[combinedEvaluation];
};

// This section handles the program's execution flow, including input acquisition and output.
// It replaces the original 'Main' function call and 'console.log' with alternative implementations
// to adhere to the 'no reused identifier' constraint for standard library functions used in the logic.
// globalThis.require is used to ensure explicit global scope access for the module loader.
// globalThis.process.stdout.write is used for output, as it is a different identifier from console.log,
// and an explicit newline character ('\n') is appended as write does not add it by default.
globalThis.process.stdout.write(
    evaluateInputConditions(
        globalThis.require("fs").readFileSync("/dev/stdin", "utf8")
    ) + '\n'
);