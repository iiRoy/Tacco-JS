// This JavaScript module is designed to process structured input data, typically from standard input,
// and perform a series of mathematical computations for each provided query.
// It applies several transformations and calculations to pairs of numbers.

/**
 * A utility function to safely parse a string into an integer.
 * It includes basic validation to ensure the input is a valid numeric string.
 *
 * @param {string} numericString The string representation of a number.
 * @returns {number} The parsed integer value.
 * @throws {Error} If the input string cannot be parsed into a valid number.
 */
const convertToNumeric = (numericString) => {
    // Utilizing parseInt with radix for explicit base 10 conversion,
    // which is generally safer than unary plus for arbitrary strings.
    const convertedValue = parseInt(numericString, 10);

    // Introduce a guard clause for invalid numeric inputs.
    if (isNaN(convertedValue)) {
        console.error(`Input Error: Encountered non-numeric data "${numericString}". Skipping.`);
        // For robust error handling, we might return a default value, or throw.
        // Throwing ensures the program doesn't proceed with invalid data.
        throw new Error(`Invalid number format: "${numericString}"`);
    }
    return convertedValue;
};

/**
 * Executes the core mathematical logic for a given pair of numbers (operandA, operandB).
 * This function encapsulates the complex calculation steps from the original problem.
 *
 * @param {number} operandA The first number in the pair.
 * @param {number} operandB The second number in the pair.
 * @returns {number} The final computed numerical outcome for the pair.
 */
const computeIndividualResult = (operandA, operandB) => {
    // Determine the smaller and larger values from the input pair.
    // Original: `var b = Math.max(a[0], a[1]); a = Math.min(a[0], a[1]);`
    const minimumValue = Math.min(operandA, operandB);
    const maximumValue = Math.max(operandA, operandB);

    // Calculate an intermediate reference value, involving square root and ceiling operations.
    // Original: `var c = Math.ceil(Math.sqrt(a * b)) - 1;`
    // Introduce intermediate variables for clarity and to break down the expression.
    const productOfInputs = minimumValue * maximumValue;
    const squareRootOfProduct = Math.sqrt(productOfInputs);
    const derivedReference = Math.ceil(squareRootOfProduct) - 1;

    // Initialize the primary accumulator for the final result.
    // Original: `var ans = (a - 1) * 2;`
    // Rewritten to use the minimumValue directly and expand the multiplication.
    let finalCalculatedAnswer = (minimumValue * 2) - 2;

    // Apply a conditional increment based on the relationship between minimum and maximum values.
    // Original: `if(a < b - 1) ans++;`
    // Rewritten condition for improved readability.
    if (minimumValue < (maximumValue - 1)) {
        finalCalculatedAnswer += 1; // Add one to the current answer.
    }

    // Incorporate another component into the answer, ensuring a non-negative contribution.
    // Original: `ans += Math.max(c - a, 0) * 2;`
    // Introduce an explicit temporary variable for the max operation result.
    const differenceToConsider = Math.max(derivedReference - minimumValue, 0);
    finalCalculatedAnswer += (differenceToConsider * 2);

    // Perform a final conditional adjustment (decrement) based on a specific floor division check.
    // Original: `if(Math.floor(a / c * b) === c) ans--;`
    // Introduce a temporary variable for the complex expression inside Math.floor.
    const floorComparisonExpression = (minimumValue / derivedReference) * maximumValue;
    if (Math.floor(floorComparisonExpression) === derivedReference) {
        finalCalculatedAnswer -= 1; // Subtract one from the answer.
    }

    return finalCalculatedAnswer;
};

/**
 * The primary function responsible for orchestrating the data processing flow.
 * It takes a raw string input, parses it, and computes results for multiple queries.
 *
 * @param {string} fullInputString The complete raw string input, typically containing multiple lines.
 */
function processInputContent(fullInputString) {
    // Implement a robust guard clause for empty or invalid input types.
    if (typeof fullInputString !== 'string' || fullInputString.trim().length === 0) {
        console.error("Operation Aborted: Input data is either empty or not in string format.");
        return; // Terminate execution if input is invalid.
    }

    // Split the input string into individual lines, handling various line ending conventions.
    const contentLines = fullInputString.split(/\r?\n/);

    // Filter out any completely empty lines that might result from splitting,
    // especially from trailing newlines or malformed input.
    const validDataLines = contentLines.filter(line => line.trim() !== '');

    // Another guard clause: if no valid data lines remain after filtering.
    if (validDataLines.length === 0) {
        console.error("No processable data found after cleaning input lines.");
        return;
    }

    // The very first non-empty line is expected to contain the total number of queries.
    // Original: `const q = +s[0];`
    let totalNumberOfQueries;
    try {
        totalNumberOfQueries = convertToNumeric(validDataLines[0]);
    } catch (parseError) {
        console.error(`Failed to parse query count: ${parseError.message}`);
        return; // Exit if the query count is invalid.
    }

    // Introduce a validation step for the parsed number of queries.
    // Ensure it's a positive number and doesn't exceed available data lines.
    if (totalNumberOfQueries <= 0) {
        console.warn(`Warning: Number of queries specified is ${totalNumberOfQueries}. No calculations will be performed.`);
        return;
    }
    if (totalNumberOfQueries > validDataLines.length - 1) {
        console.warn(`Warning: Specified queries (${totalNumberOfQueries}) exceed available data lines (${validDataLines.length - 1}). Processing all available data.`);
        totalNumberOfQueries = validDataLines.length - 1; // Adjust to prevent out-of-bounds access.
    }

    // An array to store the results of each individual query.
    // This allows for collecting all outputs before printing, instead of printing immediately.
    const allComputedOutputs = [];

    // Loop through each query, starting from the second line of the input.
    // Original: `for(var i = 0; i < q; i++){ ... }`
    for (let currentQueryIndex = 0; currentQueryIndex < totalNumberOfQueries; currentQueryIndex++) {
        const dataLineIndex = currentQueryIndex + 1; // Data lines start from index 1.

        // Ensure we have a valid line to process for the current query.
        if (dataLineIndex >= validDataLines.length) {
            console.warn(`Data insufficiency: Expected line ${dataLineIndex + 1} for query ${currentQueryIndex + 1}, but none found. Stopping.`);
            break; // Break the loop if no more data is available.
        }

        // Parse the current data line, splitting by space and converting to numbers.
        // Original: `var a = s[i+1].split(" ").map(a => +a);`
        let parsedNumbersForLine;
        try {
            parsedNumbersForLine = validDataLines[dataLineIndex].split(" ")
                                                                 .map(strVal => convertToNumeric(strVal));
        } catch (mapError) {
            console.error(`Error processing line ${dataLineIndex + 1}: ${mapError.message}. Skipping this query.`);
            continue; // Skip to the next query if parsing fails for this line.
        }


        // Validate that exactly two numbers were parsed from the line.
        if (parsedNumbersForLine.length !== 2) {
            console.warn(`Skipping query ${currentQueryIndex + 1}: Expected two numbers on line ${dataLineIndex + 1}, but found ${parsedNumbersForLine.length}.`);
            continue; // Move to the next query.
        }

        // Delegate the core calculation for the pair to the dedicated helper function.
        const currentQueryResult = computeIndividualResult(parsedNumbersForLine[0], parsedNumbersForLine[1]);
        allComputedOutputs.push(currentQueryResult); // Store the result.
    }

    // After all queries are processed, print each collected result on a new line.
    // Original: `console.log(ans);` inside the loop.
    allComputedOutputs.forEach(outputValue => console.log(outputValue));
}


// This conditional block ensures that the main processing function is called
// only when the script is executed directly (not when imported as a module).
if (require.main === module) {
    try {
        // Dynamically import the 'fs' (file system) module for input reading.
        const fileSystemModule = require("fs");
        const standardInputFilePath = "/dev/stdin";
        const textEncoding = "utf8";

        // Read the entire content from standard input synchronously.
        const receivedInputData = fileSystemModule.readFileSync(standardInputFilePath, textEncoding);

        // Initiate the main processing workflow with the read input.
        processInputContent(receivedInputData);
    } catch (systemError) {
        // Catch and report any errors that occur during file reading or initial setup.
        console.error("An unhandled system error occurred during execution:", systemError.message);
        // For debugging, the full stack trace can be useful:
        // console.error(systemError.stack);
        process.exit(1); // Exit with a non-zero status code to indicate an error.
    }
}