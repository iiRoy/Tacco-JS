class CircumferenceProcessor {
    static _factor = Math.PI * 2.0;

    constructor() {
        // No specific initialization required for this utility class
    }

    // Processes the raw text input to compute a derived measurement.
    deriveMeasurement(incomingText) {
        // First, normalize the input string by removing leading/trailing whitespace,
        // mirroring the behavior of the original's .trim()
        const normalizedContent = String(incomingText).trim();

        // Extract the first sequence resembling a number from the normalized content.
        // This handles positive/negative integers and decimals at the beginning of the string.
        const numericStringMatch = normalizedContent.match(/^-?\d+(\.\d+)?/);
        
        // If no numerical sequence is found, `numericStringMatch` will be null.
        // In such cases, the `numericValue` should be NaN, consistent with the original's behavior
        // when attempting to convert a non-numeric string to a number (e.g., "abc"-0 evaluates to NaN).
        const numericValue = numericStringMatch ? Number.parseFloat(numericStringMatch[0]) : NaN;

        // Perform the core calculation using the static factor.
        const calculatedMetric = numericValue * CircumferenceProcessor._factor;

        // Convert the final numerical result to its string representation.
        return calculatedMetric.toString();
    }
}

// This immediately invoked function expression serves as the application's entry point,
// distinct from the original's direct function call.
(function primaryExecutionBlock() {
    // Utilize the Node.js file system module for input, explicitly importing with 'node:' prefix.
    const fileAccessUtility = require("node:fs");

    // Read the entire standard input as a UTF-8 encoded string.
    const rawDataStream = fileAccessUtility.readFileSync("/dev/stdin", { encoding: "utf8" });

    // Instantiate the custom processor to handle the calculation.
    const measurementEngine = new CircumferenceProcessor();

    // Delegate the processing of the raw input to the object's method.
    const outputTextContent = measurementEngine.deriveMeasurement(rawDataStream);

    // Write the computed result to standard output, ensuring a newline character for formatting.
    process.stdout.write(outputTextContent + '\n');
})();