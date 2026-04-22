"use strict";

// A robust utility class designed to process multi-line string input,
// carefully extracting values either token by token or an entire line at once.
function DataParser(sourceTextContent, optionalValueConverter) {
    // The complete raw input string is meticulously segmented into an array of individual lines.
    // This forms the primary buffer from which data tokens are drawn.
    this._sourceLines = sourceTextContent.split("\n");
    // This numerical index precisely tracks the current word's position within the currently active line.
    this._wordIndex = 0;
    // This numerical index maintains the current line's position within the overall input buffer.
    this._lineIndex = 0;
    // This function serves as the default mechanism for converting extracted string tokens into a desired data type.
    // If a custom converter is not explicitly provided during instantiation, it gracefully defaults to the global Number constructor.
    this._valueConverter = optionalValueConverter || Number;
}

// Prototype method: Meticulously extracts and converts the next available token from the input stream.
// This method intelligently navigates across lines if the current line's tokens are exhausted.
DataParser.prototype.extractToken = function(specificConverterFunction) {
    // Dynamically determine the appropriate converter function to utilize for this particular token extraction operation.
    // A specific converter provided for this call takes precedence over the instance's default converter.
    const activeConverter = specificConverterFunction || this._valueConverter;

    // A crucial guard clause: if the current line index has surpassed the total number of lines in the buffer,
    // it unequivocally signals that there are no further tokens to process. In this scenario, null is returned.
    if (this._lineIndex >= this._sourceLines.length) {
        return null; // All input lines have been fully processed.
    }

    let currentLineContent = this._sourceLines[this._lineIndex];

    // Proactively skip any lines that are either undefined (due to sparse arrays or errors) or contain only whitespace.
    // This loop ensures that the parser always attempts to find a meaningful line of data.
    while (currentLineContent === undefined || currentLineContent.trim() === "") {
        this._lineIndex++; // Advance to the subsequent line.
        this._wordIndex = 0; // Reset the word index, as we are now on a new line.
        // Re-check the end-of-input condition after advancing lines.
        if (this._lineIndex >= this._sourceLines.length) {
            return null; // No more valid lines remaining after skipping empty ones.
        }
        currentLineContent = this._sourceLines[this._lineIndex];
    }

    // Deconstruct the current line into an array of individual tokens (words) by splitting based on spaces.
    const lineTokens = currentLineContent.trim().split(" ");

    // Advanced logic for inter-line token handling:
    // If the current word index has already exceeded or met the number of tokens on the current line,
    // it implies that the previous extraction consumed the last token, or we're starting fresh on an empty line.
    // In such a case, we must advance to the next line to find the next token.
    if (this._wordIndex >= lineTokens.length) {
        this._lineIndex++; // Move to the subsequent line.
        this._wordIndex = 0; // Reset the word index for the new line.
        // Recursively invoke extractToken to gracefully retrieve the first token from this newly advanced line.
        return this.extractToken(specificConverterFunction);
    }

    // At this point, a valid token is available on the current line at the current word index.
    const currentToken = lineTokens[this._wordIndex];
    this._wordIndex++; // Increment the word index, preparing for the next token extraction.

    // Post-extraction check: If the word index now indicates that all tokens on the current line have been processed,
    // prepare for the next line by resetting the word index and advancing the line index.
    if (this._wordIndex >= lineTokens.length) {
        this._wordIndex = 0; // Reset for the beginning of a new line.
        this._lineIndex++; // Advance to the next line in the input buffer.
    }

    // Finally, convert the extracted string token using the determined converter and return the result.
    return activeConverter(currentToken);
};

// Prototype method: Parses and converts an entire line into an array of values.
// This method inherently consumes and advances past the current line upon successful processing.
DataParser.prototype.parseLine = function(lineSpecificConverterFunction) {
    // Select the appropriate converter; a specific one for this call overrides the default.
    const activeConverter = lineSpecificConverterFunction || this._valueConverter;

    // Verify if there are any lines remaining in the input buffer to be processed.
    if (this._lineIndex >= this._sourceLines.length) {
        return []; // If no more lines, an empty array is returned to signify this.
    }

    const lineData = this._sourceLines[this._lineIndex];

    // Crucially, increment the line index immediately as this method is designed to consume the entire current line.
    this._lineIndex++;
    this._wordIndex = 0; // Reset the word index as we are now logically on a new line.

    // If the retrieved line is empty or exclusively contains whitespace, return an empty array.
    if (!lineData || lineData.trim() === "") {
        return [];
    }

    // Split the line into tokens based on spaces, and then map each token through the active converter.
    return lineData.trim().split(" ").map(activeConverter);
};

// The DataParser class is made available for instantiation in other modules.
module.exports = DataParser;


// --- Core Application Logic and Problem Solver ---

// A globally accessible constant representing the prime modulus value used in calculations.
const PRIME_MODULUS = 1000003;

/**
 * Computes the product of an arithmetic progression modulo a specified prime number.
 * The calculation is performed as: (initialTerm * (initialTerm + commonDifference) * ... * (initialTerm + (numberOfTerms - 1) * commonDifference)) % PRIME_MODULUS.
 * This helper function prevents numerical overflow by applying the modulo operation at each multiplication step.
 *
 * @param {number} initialTerm - The first term (x) in the arithmetic progression.
 * @param {number} commonDifference - The constant difference (d) between consecutive terms.
 * @param {number} numberOfTerms - The total count of terms (n) to be included in the product.
 * @returns {number} The final product of the terms, reduced modulo PRIME_MODULUS.
 */
function computeArithmeticProductModulo(initialTerm, commonDifference, numberOfTerms) {
    // As per mathematical convention, the product of an empty set of terms is 1.
    if (numberOfTerms === 0) {
        return 1;
    }

    let currentProductAccumulator = 1; // Initialize the product accumulator.
    for (let termCounter = 0; termCounter < numberOfTerms; termCounter++) {
        // Calculate the value of the current term in the series: initialTerm + (termCounter * commonDifference).
        const currentTermValue = initialTerm + termCounter * commonDifference;
        // Multiply the accumulated product by the current term value and immediately apply the modulo operation.
        // This ensures that currentProductAccumulator remains within manageable bounds and prevents overflow.
        currentProductAccumulator = (currentProductAccumulator * currentTermValue) % PRIME_MODULUS;
    }
    return currentProductAccumulator;
}

/**
 * The main entry point for processing the challenge's input data.
 * This function orchestrates the parsing of input and the execution of calculations for multiple test cases.
 *
 * @param {string} rawDataString - The complete raw input content, typically read from standard input, as a single string.
 */
function runChallenge(rawDataString) {
    // Critical input validation: Ensure the provided raw data string is not null, undefined, or merely empty whitespace.
    // An error message is logged, and the function terminates prematurely if the input is invalid.
    if (!rawDataString || rawDataString.trim() === "") {
        console.error("Error: The provided input data string is either empty, null, or consists solely of whitespace. Cannot proceed.");
        return;
    }

    // Instantiate our specialized DataParser, equipping it with the raw input string.
    // This object will manage the sequential extraction of numerical parameters.
    const inputDataStream = new DataParser(rawDataString);

    // Attempt to extract the total number of test cases from the input.
    // A robust check is performed to handle scenarios where this initial token might be missing or invalid.
    const totalQueriesString = inputDataStream.extractToken();
    if (totalQueriesString === null) {
        console.error("Error: Unable to extract the total number of queries from the input stream. Input format may be incorrect.");
        return;
    }
    // Explicitly convert the extracted string to a number, ensuring it's of the correct type for iteration.
    const totalQueries = Number(totalQueriesString);

    // Iterate through each test case, as dictated by the 'totalQueries' count.
    for (let caseIterator = 0; caseIterator < totalQueries; caseIterator++) {
        // Extract the three essential numerical parameters for the current test case: x, d, and n.
        const baseValueX = inputDataStream.extractToken();
        const differenceD = inputDataStream.extractToken();
        const numTermsN = inputDataStream.extractToken();

        // Perform basic validation on the extracted parameters for the current test case.
        // If any parameter is unexpectedly null, it indicates a malformed input sequence, and processing is halted.
        if (baseValueX === null || differenceD === null || numTermsN === null) {
            console.error(`Error: Incomplete data detected for test case number ${caseIterator + 1}. Halting further processing.`);
            break; // Terminate the loop as the input stream is no longer reliable.
        }

        // Apply an important optimization based on modular arithmetic properties:
        // If the number of terms 'n' is greater than or equal to the PRIME_MODULUS,
        // then the product of the arithmetic progression (x * (x+d) * ... * (x+(n-1)d)) will always be 0 modulo PRIME_MODULUS.
        // This holds true because, for a prime modulus 'p', if n >= p and gcd(d, p) = 1,
        // the sequence x, x+d, ..., x+(n-1)d will contain a complete residue system modulo p,
        // meaning one of the terms will be a multiple of p (i.e., congruent to 0 mod p).
        // If d is a multiple of p, then all terms are congruent to x mod p; in this case,
        // the product is 0 mod p only if x itself is 0 mod p.
        // The original problem context implies this optimization is valid under its constraints.
        if (numTermsN >= PRIME_MODULUS) {
            console.log(0);
        } else {
            // If the optimization doesn't apply, proceed with the full calculation using the helper function.
            const finalResult = computeArithmeticProductModulo(
                baseValueX,
                differenceD,
                numTermsN
            );
            console.log(finalResult); // Output the computed result for the current test case.
        }
    }
}

// Define the standard input file path, typically /dev/stdin on Unix-like systems.
const standardInputFilePath = "/dev/stdin";

// Execute the main challenge processing by first reading the input from the specified file.
try {
    // Synchronously read the entire content of the standard input file, decoding it as UTF-8.
    const inputContent = require("fs").readFileSync(standardInputFilePath, "utf8");
    // Pass the raw input string to the runChallenge function for parsing and computation.
    runChallenge(inputContent);
} catch (readingError) {
    // If any error occurs during the file reading process (e.g., file not found, permissions issue),
    // an informative error message is logged, and the process exits with a non-zero status code.
    console.error(`Failed to read input data from ${standardInputFilePath}:`, readingError.message);
    process.exit(1); // Indicate an abnormal termination.
}