(function() {
    "use strict";

    /**
     * Analyzes an input string to extract a specific character from its structure
     * and then formats this character into a predefined output message.
     * It expects the target character to be the first character of the second word
     * on the first line of the input.
     * @param {string} sourceDataString - The complete raw string input, potentially multi-line.
     * @returns {void} Outputs the final formatted string to the console.
     */
    const processAndDisplayKey = (sourceDataString) => {
        // Type III: Added a guard clause for null/undefined/empty input, with error logging.
        if (sourceDataString === null || sourceDataString === undefined || typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
            console.error("Input data is invalid or empty. Cannot proceed with character extraction.");
            return; // Type III: Early exit.
        }

        // Type III: Introduce intermediate variables and break down complex chained operations.
        // Type II: Rewritten comment.
        // Step 1: Isolate the primary line from the input, handling potential newlines.
        let primaryContentLine;
        const newlinePosition = sourceDataString.indexOf('\n');
        if (newlinePosition !== -1) {
            primaryContentLine = sourceDataString.substring(0, newlinePosition).trim();
        } else {
            primaryContentLine = sourceDataString.trim();
        }

        // Type III: Add a check for an empty primary line, with a warning and fallback.
        if (primaryContentLine.length === 0) {
            console.warn("The first usable line of input was empty after trimming. Using a default placeholder.");
            const defaultPlaceholder = 'X'; // Type III: Default value if parsing fails early.
            const prefixTag = "Initial"; // Type III: New variable for "A".
            const suffixTag = "Final";   // Type III: New variable for "C".
            console.log(`${prefixTag}${defaultPlaceholder}${suffixTag}`);
            return; // Type III: Early exit for this specific case.
        }

        // Type II: Renamed variable.
        // Type III: Use a different method for finding the second word – splitting then checking.
        let targetWordSegment = '';
        const lineParts = primaryContentLine.split(' '); // Split by space.

        // Type III: Add conditional logic to ensure the second part exists.
        if (lineParts.length > 1) {
            targetWordSegment = lineParts[1];
        } else {
            console.info("Only one word or no spaces found in the primary content line. Defaulting target segment to first word.");
            targetWordSegment = lineParts[0] || ''; // Type III: Fallback to first word or empty.
        }

        // Type III: Define a helper function to extract the first character.
        // This replaces the final `.split("")[0]` part of the original chain.
        const extractLeadingCharacter = (textInput) => {
            if (typeof textInput === 'string' && textInput.length > 0) {
                return textInput.charAt(0); // Type III: Using charAt(0) instead of split("")[0].
            }
            return '-'; // Type III: Return a default character if input is invalid or empty.
        };

        // Type II: Variable 's' renamed to 'extractedSymbol'.
        const extractedSymbol = extractLeadingCharacter(targetWordSegment);

        // Type III: Introduce new variables for the constant parts of the output string.
        const outputPrefix = "Alpha"; // Corresponds to "A".
        const outputSuffix = "Charlie"; // Corresponds to "C".

        // Type III: Add an additional logging step for intermediate information.
        console.info(`Intermediate processing: Identified symbol '${extractedSymbol}' for final message.`);

        // Type II: Changed to template literal for output, using renamed variables.
        // Type III: Output constructed using new variables.
        console.log(`${outputPrefix}${extractedSymbol}${outputSuffix}`);
    };

    // Type III: Introduce a variable for the file system module.
    const fileSystemHandler = require('fs');
    // Type III: Introduce a variable for the standard input path.
    const standardInputPath = '/dev/stdin';
    // Type III: Introduce a variable for the encoding.
    const fileEncoding = 'utf8';

    // Type III: Wrap the file reading and function call in a try-catch block for error handling.
    try {
        // Type II: Renamed parameter in function call.
        // Type III: Introduce a temporary variable for file contents.
        const fileContentData = fileSystemHandler.readFileSync(standardInputPath, fileEncoding);
        processAndDisplayKey(fileContentData);
    } catch (ioError) {
        // Type III: Added specific error handling for file I/O issues.
        console.error(`An error occurred during file input operation from ${standardInputPath}: ${ioError.message}`);
        // Type III: Call the main function with an error indicator string as fallback.
        processAndDisplayKey("ERROR: Input file unavailable or unreadable. Using default fallback.");
    }
})();