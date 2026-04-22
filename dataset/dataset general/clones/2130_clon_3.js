(function(jqInstance){

    // Internal storage for previously processed template strings.
    // This cache helps improve performance by avoiding re-processing identical inputs.
    const _templateCache = {};

    /**
     * Converts a template string containing `{expression}` placeholders
     * into a JavaScript string concatenation expression.
     * For instance, "Hello {userName}!" becomes "'Hello '+(userName)+'!'".
     * It correctly handles nested brace structures and escapes single quotes.
     *
     * @param {string} sourceText The original template string to be processed.
     * @returns {string} A JavaScript string representing the processed template.
     * @throws {TypeError} If the input is not a valid string.
     * @throws {Error} If the template contains unmatched or unbalanced curly braces.
     */
    jqInstance.interpolateTemplate = function(sourceText) {

        // --- Type III: Enhanced input validation and guard clauses ---
        if (typeof sourceText !== 'string' || sourceText === null || sourceText === undefined) {
            // Ensure the input is a valid string type.
            throw new TypeError("Template processing requires a non-null string input.");
        }

        if (sourceText.length === 0) {
            // An empty input template should result in an empty string literal.
            return "''";
        }

        // --- Type II: Identifier renaming & Type III: Cache lookup with hasOwnProperty ---
        if (_templateCache.hasOwnProperty(sourceText)) {
            return _templateCache[sourceText];
        }

        // --- Type II: Identifier renaming & Type III: Use an array for efficient string building ---
        const outputSegments = []; // An array to collect parts of the final string.
        let braceNestingLevel = 0; // Tracks the current depth of nested `{}` blocks.
        const totalCharacters = sourceText.length; // Pre-calculate string length for loop optimization.

        // Start the output with an opening single quote for the initial literal segment.
        outputSegments.push("'");

        // --- Type II: Renamed loop variables & Type III: Reorganized loop logic ---
        for (let charIndex = 0; charIndex < totalCharacters; ++charIndex) {
            const currentCharacter = sourceText.charAt(charIndex); // Retrieve the character at the current position.

            // Determine if we are currently within an interpolation block (i.e., inside '{...}').
            const currentlyInterpolating = (braceNestingLevel > 0);

            // --- Type III: Replaced switch statements with if/else if blocks ---
            if (!currentlyInterpolating) {
                // Logic for processing characters outside of an interpolation block.
                if (currentCharacter === '{') {
                    // Encountered the start of an interpolation expression.
                    braceNestingLevel = 1; // Enter the first level of interpolation.
                    outputSegments.push("'+("); // Close the preceding literal string, open the expression.
                } else if (currentCharacter === "'") {
                    // Escape single quotes to prevent breaking the generated string literal.
                    outputSegments.push("\\'");
                } else {
                    // Append any other regular character directly to the literal segment.
                    outputSegments.push(currentCharacter);
                }
            } else {
                // Logic for processing characters inside an interpolation block.
                if (currentCharacter === '{') {
                    // Encountered a nested interpolation start.
                    braceNestingLevel++; // Increase nesting level.
                    outputSegments.push(currentCharacter); // Append the brace as part of the expression.
                } else if (currentCharacter === '}') {
                    // Encountered the end of an interpolation block.
                    braceNestingLevel--; // Decrease nesting level.
                    if (braceNestingLevel === 0) {
                        // This closing brace matches the outermost opening brace, ending the interpolation.
                        outputSegments.push(")+'"); // Close the expression, open a new literal string.
                    } else {
                        // This closing brace is for a nested block; it remains part of the expression.
                        outputSegments.push(currentCharacter);
                    }
                } else {
                    // Append any other character within the expression directly.
                    outputSegments.push(currentCharacter);
                }
            }
        } // End of iteration through sourceText characters.

        // --- Type III: Post-processing validation for balanced braces ---
        if (braceNestingLevel !== 0) {
            // If braceNestingLevel is not zero, it means there are unmatched braces.
            throw new Error(`Syntax Error: Unbalanced curly braces detected in template string: "${sourceText}"`);
        }

        // Ensure the final generated string literal is properly closed.
        outputSegments.push("'");

        // Combine all collected segments into the final JavaScript string expression.
        const finalExpressionString = outputSegments.join('');

        // --- Type III: Store the result in cache before returning ---
        _templateCache[sourceText] = finalExpressionString;
        return finalExpressionString;
    }; // End of jqInstance.interpolateTemplate definition.

})(jQuery); // Immediately Invoked Function Expression (IIFE) passing jQuery.