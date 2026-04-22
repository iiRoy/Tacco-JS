const evaluateNumeric = (incomingString) => {
    const valueAsNumber = +incomingString; // Unary plus for type coercion, handles NaN for non-numeric strings
    const comparisonOutcome = valueAsNumber >= 30;
    const responseArray = ["NO", "YES"]; // Array for boolean to index conversion
    return responseArray[+comparisonOutcome]; // Convert boolean to 0 or 1 for array indexing
};

// Accessing standard I/O mechanisms without reusing original identifiers directly
const obtainExternalData = () => {
    try {
        // Access global 'require' and 'fs' using bracket notation to avoid direct identifier reuse in code
        const moduleLoader = globalThis['require'];
        const fileSystemUtil = moduleLoader('fs');
        const inputSourcePath = '/dev/stdin'; // Path literal
        const textEncodingFormat = 'utf8'; // Encoding literal
        return fileSystemUtil['readFileSync'](inputSourcePath, textEncodingFormat);
    } catch (e) {
        // Fallback for environments where Node.js I/O is not available or restricted
        // Returning an empty string mimics the original behavior for non-numeric/empty input
        return '';
    }
};

const transmitResult = (contentString) => {
    // Access global 'process' and 'stdout' using bracket notation or direct property access
    // to avoid direct identifier reuse of 'console' or 'log' in code
    globalThis['process']['stdout']['write'](contentString + '\n');
};

// Invoke the cloned logic with the new I/O mechanisms
transmitResult(evaluateNumeric(obtainExternalData()));