const LINE_BREAK_CHAR = "\n";
const SPACE_CHAR = " ";
const EMPTY_STRING = "";

function processInputData(rawData) {
    // Step 1: Normalize the raw input string by trimming leading/trailing whitespace.
    const trimmedInputString = rawData.trim();

    // Step 2: Split the trimmed input into individual lines based on the line break character.
    const inputLinesArray = trimmedInputString.split(LINE_BREAK_CHAR);

    // Step 3: Process each line to split it into tokens using the space character as a delimiter.
    // This results in an array of arrays, where each inner array contains tokens from a line.
    const tokenArraysFromLines = inputLinesArray.map(line => line.split(SPACE_CHAR));

    // Step 4: Flatten the array of token arrays into a single, one-dimensional array of all tokens.
    const allParsedTokens = [].concat(...tokenArraysFromLines);

    // Define a local utility function to extract the next string token from the token stream.
    const getNextStringToken = () => allParsedTokens.shift();

    // Define a local utility function to extract and parse the next integer token from the stream.
    // Explicitly using radix 10 for robust integer conversion.
    const getNextIntegerToken = () => parseInt(allParsedTokens.shift(), 10);

    // Define a helper function to calculate the sum of an arithmetic series from 1 to 'n'.
    // The formula n * (n + 1) / 2 is used for this calculation.
    const calculateArithmeticSumUpToN = (n) => {
        // This formula correctly handles positive, zero, and negative 'n' values
        // as per the original logic's implicit behavior.
        return n * (n + 1) / 2;
    };

    // Retrieve the first integer value from the input.
    const firstNumericValue = getNextIntegerToken();
    // Retrieve the second integer value from the input.
    const secondNumericValue = getNextIntegerToken();

    // Compute the difference between the second and first numeric values.
    const computedDifference = secondNumericValue - firstNumericValue;

    // Calculate the sum of the series up to the computed difference using the helper function.
    const sumOfDifferenceSeries = calculateArithmeticSumUpToN(computedDifference);

    // Determine the final result by subtracting the second numeric value from the calculated sum.
    const finalCalculatedResult = sumOfDifferenceSeries - secondNumericValue;

    return finalCalculatedResult;
}

// This immediately invoked function expression (IIFE) serves as the entry point
// for the program, handling environment-specific input/output mechanisms.
((inputContent, mainResult, resultType) => {
    // Check if the 'require' function is available, indicating a Node.js environment.
    if (typeof require !== "undefined") {
        // In Node.js, read input from standard input, process it, and print the result to console.
        console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
    } else {
        // In a browser environment, process the hardcoded input string.
        // The input content from the template literal is pre-processed to remove
        // any leading/trailing empty lines that might arise from its definition.
        inputContent = inputContent.split(LINE_BREAK_CHAR).slice(1, -1).join(LINE_BREAK_CHAR);
        
        // Attempt to execute the main processing function with the prepared input.
        try {
            mainResult = processInputData(inputContent);
        } catch (error) {
            // If an error occurs during processing, capture its stack or message.
            mainResult = error.stack || error.message;
        }
        
        // Determine the JavaScript type of the processing result.
        resultType = typeof mainResult;
        
        // If the result is not already a string, convert it to a JSON string for display.
        if (resultType !== "string") {
            mainResult = JSON.stringify(mainResult);
        }
        
        // Utilize a jQuery-like mechanism to display the input, result type, and result
        // within text areas appended to the document body.
        $("<form>").append(
            [[10, inputContent], 0, [1, resultType], 0, [10, mainResult]].map(displayItem =>
                $(displayItem ? "<textarea>" : "<br>", displayItem && { rows: displayItem[0], cols: 40, text: displayItem[1] })
            )
        ).appendTo("body");
    }
})(`
54 65
`);
