const filesystemAccess = require("fs");

(function() {
    const inputFilePath = "/dev/stdin";
    const encodingScheme = "utf8";
    const tokenDelimiter = /\s/;

    // This function encapsulates the core arithmetic transformation for a single number.
    // The original inner loop, after 9 iterations of `i*=2` or `i/=3` and `r+=i`,
    // effectively calculates `initialNumericInput * (211 / 27)`.
    const computeTransformedValue = function(initialNumericInput) {
        const transformationRatio = 211 / 27;
        return initialNumericInput * transformationRatio;
    };

    // Read all content from the standard input synchronously.
    const rawInputContent = filesystemAccess.readFileSync(inputFilePath, encodingScheme);
    
    // Convert the raw content to a string and split it into individual tokens based on whitespace.
    const inputTokens = rawInputContent.toString().split(tokenDelimiter);

    // Process each token using a functional approach.
    // The original code's outer loop implicitly skips empty string tokens (`""`)
    // but processes whitespace-only tokens (e.g., `"   "`) as `NaN`.
    const processedOutputs = inputTokens.reduce((accumulatedResults, currentSegment) => {
        // Replicating the original loop's behavior: only process if the segment is not an empty string.
        // `parseFloat` will convert valid numbers and return `NaN` for non-numeric or whitespace-only strings.
        if (currentSegment.length > 0) {
            const numericalInterpretation = parseFloat(currentSegment);
            accumulatedResults.push(computeTransformedValue(numericalInterpretation));
        }
        return accumulatedResults;
    }, []);

    // Format each calculated value to 8 decimal places and print it to the console.
    processedOutputs.map(finalValue => finalValue.toFixed(8)).forEach(formattedString => {
        console.log(formattedString);
    });
})();