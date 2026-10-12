const LINE_BREAK_CHAR = "\n";
const SPACE_DELIMITER = " ";

/**
 * Parses a hexadecimal string into an integer.
 * @param {string} hexString - The hexadecimal string to parse.
 * @returns {number} The integer representation.
 */
function parseHexadecimalString(hexString) {
    return parseInt(hexString, 16);
}

/**
 * Compares two numbers and returns a string indicating their relationship.
 * @param {number} firstValue - The first value for comparison.
 * @param {number} secondValue - The second value for comparison.
 * @returns {string} ">" if firstValue > secondValue, "=" if firstValue === secondValue, "<" if firstValue < secondValue.
 */
function determineComparisonResult(firstValue, secondValue) {
    const valueDifferenceSign = Math.sign(firstValue - secondValue);
    if (valueDifferenceSign === 1) {
        return ">";
    } else if (valueDifferenceSign === 0) {
        return "=";
    } else { // valueDifferenceSign === -1
        return "<";
    }
}

function processInputAndCompare(rawInputData){
    // Step 1: Split the raw input string into an array of lines.
    const inputLines = rawInputData.split(LINE_BREAK_CHAR);

    // Step 2: For each line, split it into an array of tokens using the space delimiter.
    // This results in an array of arrays (e.g., [['A', 'B'], ['C', 'D']]).
    const tokensPerLineArray = inputLines.map(lineContent => lineContent.split(SPACE_DELIMITER));

    // Step 3: Flatten the array of arrays into a single, one-dimensional list of all tokens.
    // Using the `flat()` method for a cleaner one-level flattening.
    const allInputTokens = tokensPerLineArray.flat();

    // Create a closure to manage the current index for sequential token retrieval.
    let currentTokenIndex = 0;
    const retrieveNextToken = () => allInputTokens[currentTokenIndex++];

    // Retrieve the first token string and parse it as a hexadecimal number.
    const firstTokenString = retrieveNextToken();
    const firstParsedValue = parseHexadecimalString(firstTokenString);

    // Retrieve the second token string and parse it as a hexadecimal number.
    const secondTokenString = retrieveNextToken();
    const secondParsedValue = parseHexadecimalString(secondTokenString);

    // Compare the two parsed values and return the result string.
    return determineComparisonResult(firstParsedValue, secondParsedValue);
}

// Self-executing anonymous function to handle execution environment detection (Node.js vs. Browser).
// The parameters are named to reflect their initial use in the original code's IIFE structure.
((browserInputString, browserResultHolder, browserResultTypeHolder) => {
    // Check if 'require' is defined, which is typical for a Node.js environment.
    if (typeof require !== "undefined") {
        const fileSystemModule = require("fs");
        const standardInputPath = "/dev/stdin";
        const fileEncoding = "utf8";
        const stdinContent = fileSystemModule.readFileSync(standardInputPath, fileEncoding);
        console.log(processInputAndCompare(stdinContent));
    } else {
        // This block simulates the execution in a browser environment.

        // The input string from the template literal often includes leading/trailing empty lines.
        // This step processes the input to remove those, mirroring the original's behavior.
        browserInputString = browserInputString.split(LINE_BREAK_CHAR).slice(1, -1).join(LINE_BREAK_CHAR);

        // Execute the main logic and store the result.
        try {
            browserResultHolder = processInputAndCompare(browserInputString);
        } catch (executionError) {
            // If an error occurs during execution, capture its stack trace or message.
            browserResultHolder = executionError.stack || executionError.message;
        }

        // Determine the JavaScript type of the final result.
        browserResultTypeHolder = typeof browserResultHolder;

        // If the result is not already a string, convert it to a JSON string for consistent display.
        if (browserResultTypeHolder !== "string") {
            browserResultHolder = JSON.stringify(browserResultHolder);
        }

        // Helper function to create and configure DOM elements based on a configuration array.
        const createDomElementForOutput = (elementConfig) => {
            const isTextAreaElement = Array.isArray(elementConfig);
            const elementTag = isTextAreaElement ? "textarea" : "br";
            const newElement = document.createElement(elementTag);

            if (isTextAreaElement) {
                const [rowsCount, contentText] = elementConfig;
                newElement.setAttribute("rows", rowsCount);
                newElement.setAttribute("cols", 40); // Fixed column width as per original
                newElement.textContent = contentText;
            }
            return newElement;
        };

        // Create a form element which will act as a container for the output elements.
        const outputFormContainer = document.createElement("form");

        // Define the configurations for the DOM elements to be generated and appended.
        // This array structure directly mirrors the original's jQuery-like map input.
        const elementConfigurations = [
            [10, browserInputString], // Textarea for input string
            0, // Represents a <br> tag
            [1, browserResultTypeHolder], // Textarea for result type
            0, // Represents a <br> tag
            [10, browserResultHolder] // Textarea for final result
        ];

        // Map the configurations to actual DOM elements and then append each to the form container.
        elementConfigurations.map(createDomElementForOutput).forEach(domElement => outputFormContainer.appendChild(domElement));

        // Finally, append the entire form container to the document body.
        document.body.appendChild(outputFormContainer);
    }
})(`
A B
`);
