/**
 * Represents the outcome of a parsing attempt.
 * This class encapsulates the success status, the value extracted,
 * and the new position in the input string after the parse.
 */
class ParseOutcome {
    /**
     * Initializes a new ParseOutcome instance.
     * @param {boolean} isSuccess - True if the parsing operation was successful, false otherwise.
     * @param {*} parsedValue - The data or token successfully extracted by the parser. Null if unsuccessful.
     * @param {number} nextParseIndex - The character index in the input string where subsequent parsing should commence.
     */
    constructor(isSuccess, parsedValue, nextParseIndex) {
        this.isSuccess = isSuccess;
        this.parsedValue = parsedValue;
        this.nextParseIndex = nextParseIndex;
    }

    /**
     * Factory method to create a successful parse outcome.
     * @param {*} value - The value that was successfully parsed.
     * @param {number} nextIndex - The index for the next parsing step.
     * @returns {ParseOutcome} A successful ParseOutcome object.
     */
    static success(value, nextIndex) {
        return new ParseOutcome(true, value, nextIndex);
    }

    /**
     * Factory method to create a failed parse outcome.
     * @param {number} initialIndex - The starting index where the parse attempt began and failed.
     * @returns {ParseOutcome} A failed ParseOutcome object.
     */
    static failure(initialIndex) {
        return new ParseOutcome(false, null, initialIndex);
    }
}

/**
 * Generates a parser combinator that attempts to match a specific string literal
 * at the current parsing position within the input source.
 *
 * @param {string} literalText - The exact string sequence this parser should look for.
 * @returns {function(string, number): ParseOutcome} A parser function that takes an input string and a starting index.
 */
function parseStringLiteral(literalText) {
    // Guard clause: Ensure the literalText is a valid non-empty string.
    if (typeof literalText !== 'string' || literalText.length === 0) {
        console.warn(`[parseStringLiteral] Invalid 'literalText' provided: ${literalText}. Returning a parser that always fails.`);
        return (inputSource, startIndex) => ParseOutcome.failure(startIndex);
    }

    // Pre-calculate the length for efficiency.
    const textLength = literalText.length;

    return function (inputSource, startIndex) {
        // Validate input parameters for the parser function itself.
        if (typeof inputSource !== 'string' || startIndex < 0 || startIndex > inputSource.length) {
            return ParseOutcome.failure(startIndex);
        }

        // Check if there's enough remaining input to match the literal.
        if (startIndex + textLength > inputSource.length) {
            return ParseOutcome.failure(startIndex); // Not enough characters left.
        }

        // Extract the potential match from the input source.
        const segmentToExamine = inputSource.substring(startIndex, startIndex + textLength);

        // Perform the comparison.
        if (segmentToExamine === literalText) {
            // If match is found, return success with the matched text and the new index.
            return ParseOutcome.success(literalText, startIndex + textLength);
        } else {
            // Otherwise, return failure, retaining the original index.
            return ParseOutcome.failure(startIndex);
        }
    };
}

/**
 * Creates a parser combinator that attempts to apply a series of parser functions
 * in the order they are provided. It returns the result of the first parser that succeeds.
 * If all parsers fail, the `tryAny` combinator also fails.
 *
 * @param {...function(string, number): ParseOutcome} parserCollection - A variable number of parser functions to try.
 * @returns {function(string, number): ParseOutcome} A parser function.
 */
function tryAny(...parserCollection) {
    // Guard clause: Handle cases where no parsers are provided.
    if (!parserCollection || parserCollection.length === 0) {
        console.warn('[tryAny] No parsers provided to tryAny. This parser will always fail.');
        return (sourceString, currentPosition) => ParseOutcome.failure(currentPosition);
    }

    return function (sourceString, currentPosition) {
        // Basic validation for the input string and position.
        if (typeof sourceString !== 'string' || currentPosition < 0 || currentPosition > sourceString.length) {
            return ParseOutcome.failure(currentPosition);
        }

        // Iterate through each parser in the collection.
        for (let parserIndex = 0; parserIndex < parserCollection.length; parserIndex++) {
            const currentParser = parserCollection[parserIndex];

            // Validate that the current item is indeed a function.
            if (typeof currentParser !== 'function') {
                console.error(`[tryAny] Element at index ${parserIndex} is not a valid parser function. Skipping.`);
                continue; // Skip and try the next parser.
            }

            // Attempt to parse with the current parser.
            const attemptResult = currentParser(sourceString, currentPosition);

            // If successful, we immediately return its result.
            if (attemptResult.isSuccess) {
                return attemptResult;
            }
        }

        // If the loop completes, it means all parsers failed.
        return ParseOutcome.failure(currentPosition);
    };
}

/**
 * Constructs a parser combinator that requires all provided parsers to succeed
 * in a specific sequence. The results of each successful sub-parser are collected
 * into an array. If any parser in the sequence fails, the entire `parseSequence` fails.
 *
 * @param {...function(string, number): ParseOutcome} sequenceOfParsers - A variable number of parser functions to apply sequentially.
 * @returns {function(string, number): ParseOutcome} A parser function.
 */
function parseSequence(...sequenceOfParsers) {
    // Guard clause: Ensure there's a sequence of parsers to apply.
    if (!sequenceOfParsers || sequenceOfParsers.length === 0) {
        console.warn('[parseSequence] No parsers provided to parseSequence. This parser will always fail.');
        return (sourceText, initialIndex) => ParseOutcome.failure(initialIndex);
    }

    return function (sourceText, initialIndex) {
        // Basic validation for the input string and position.
        if (typeof sourceText !== 'string' || initialIndex < 0 || initialIndex > sourceText.length) {
            return ParseOutcome.failure(initialIndex);
        }

        const extractedValues = []; // Stores the parsed values from each successful step.
        let currentScanIndex = initialIndex; // Tracks the current position in the input string.

        // Loop through each parser in the defined sequence.
        for (let stepIdx = 0; stepIdx < sequenceOfParsers.length; stepIdx++) {
            const currentStepParser = sequenceOfParsers[stepIdx];

            // Validate that the current item in the sequence is a function.
            if (typeof currentStepParser !== 'function') {
                console.error(`[parseSequence] Element at index ${stepIdx} is not a valid parser function. Sequence fails.`);
                return ParseOutcome.failure(initialIndex); // An invalid parser in sequence causes overall failure.
            }

            // Attempt to parse the input at the current position.
            const stepOutcome = currentStepParser(sourceText, currentScanIndex);

            // If the current step fails, the entire sequence fails.
            if (!stepOutcome.isSuccess) {
                // Return failure, reverting to the original starting index for the sequence.
                return ParseOutcome.failure(initialIndex);
            }
            
            // If successful, store the parsed value and update the scan index.
            extractedValues.push(stepOutcome.parsedValue);
            currentScanIndex = stepOutcome.nextParseIndex;
        }

        // If all parsers in the sequence succeeded, return the collected values and the final index.
        return ParseOutcome.success(extractedValues, currentScanIndex);
    };
}

/**
 * Implements a lazy parser combinator, useful for handling recursive grammar definitions.
 * The actual parser function is only created and memoized on its first invocation,
 * preventing infinite loops during parser construction.
 *
 * @param {function(): function(string, number): ParseOutcome} parserFactory - A function that, when called, returns the actual parser.
 * @returns {function(string, number): ParseOutcome} A memoized parser function.
 */
function defer(parserFactory) {
    // Guard clause: Ensure a valid factory function is provided.
    if (typeof parserFactory !== 'function') {
        console.warn('[defer] Expected a function for \'parserFactory\'. Returning a parser that always fails.');
        return (textToParse, parsingOffset) => ParseOutcome.failure(parsingOffset);
    }

    let memoizedParser = null; // This variable will hold the parser once it's initialized.

    return function (textToParse, parsingOffset) {
        // Validate input string and offset for the deferred parser.
        if (typeof textToParse !== 'string' || parsingOffset < 0 || parsingOffset > textToParse.length) {
            return ParseOutcome.failure(parsingOffset);
        }

        // If the parser hasn't been created yet, call the factory to initialize it.
        if (memoizedParser === null) {
            memoizedParser = parserFactory(); // Execute the factory function.
            // Additional validation: Ensure the factory actually returned a function.
            if (typeof memoizedParser !== 'function') {
                console.error('[defer] Parser factory did not return a valid parser function. This is an error in parser definition.');
                return ParseOutcome.failure(parsingOffset);
            }
        }
        // Delegate the actual parsing to the (now initialized) memoized parser.
        return memoizedParser(textToParse, parsingOffset);
    };
}

/**
 * Creates a parser combinator that applies a transformation function to the
 * successfully parsed value of a base parser. If the base parser fails,
 * the transformation is skipped, and the failure is propagated.
 *
 * @param {function(string, number): ParseOutcome} baseParser - The parser whose successful output will be transformed.
 * @param {function(*): *} transformationFunction - A function to apply to the parsed value.
 * @returns {function(string, number): ParseOutcome} A new parser function that includes the transformation.
 */
function transformResult(baseParser, transformationFunction) {
    // Guard clauses: Validate both the base parser and the transformation function.
    if (typeof baseParser !== 'function') {
        console.warn('[transformResult] Expected a function for \'baseParser\'. Returning a parser that always fails.');
        return (inputString, startOffset) => ParseOutcome.failure(startOffset);
    }
    if (typeof transformationFunction !== 'function') {
        console.warn('[transformResult] Expected a function for \'transformationFunction\'. Returning a parser that always fails.');
        return (inputString, startOffset) => ParseOutcome.failure(startOffset);
    }

    return function (inputString, startOffset) {
        // Validate input string and offset for the transforming parser.
        if (typeof inputString !== 'string' || startOffset < 0 || startOffset > inputString.length) {
            return ParseOutcome.failure(startOffset);
        }

        // First, attempt to parse using the base parser.
        const parseAttempt = baseParser(inputString, startOffset);

        // If the base parser was successful, apply the transformation.
        if (parseAttempt.isSuccess) {
            // Introduce intermediate variables for clarity in the transformation step.
            const originalParsedValue = parseAttempt.parsedValue;
            const transformedValue = transformationFunction(originalParsedValue);
            // Return a new success outcome with the transformed value.
            return ParseOutcome.success(transformedValue, parseAttempt.nextParseIndex);
        } else {
            // If the base parser failed, simply return its failure outcome.
            return parseAttempt;
        }
    };
}

/**
 * Generates a parser combinator that attempts to match any single character
 * from a predefined set of allowed characters at the current parsing position.
 *
 * @param {string} allowedChars - A string containing all characters that are considered valid matches.
 * @returns {function(string, number): ParseOutcome} A parser function.
 */
function parseAnyCharFromSet(allowedChars) {
    // Guard clause: Ensure the set of allowed characters is a non-empty string.
    if (typeof allowedChars !== 'string' || allowedChars.length === 0) {
        console.warn('[parseAnyCharFromSet] Invalid or empty \'allowedChars\' provided. This parser will always fail.');
        return (inputData, scanPosition) => ParseOutcome.failure(scanPosition);
    }

    // Use a Set for efficient O(1) average-case lookup of allowed characters.
    const charLookupSet = new Set(allowedChars);

    return function (inputData, scanPosition) {
        // Validate input data and scan position.
        // Check for end-of-string or invalid position.
        if (typeof inputData !== 'string' || scanPosition < 0 || scanPosition >= inputData.length) {
            return ParseOutcome.failure(scanPosition);
        }

        // Get the character at the current scanning position.
        const currentChar = inputData[scanPosition];

        // Check if this character is present in our set of allowed characters.
        if (charLookupSet.has(currentChar)) {
            // If it's a match, return success with the matched character and advance the position by one.
            return ParseOutcome.success(currentChar, scanPosition + 1);
        } else {
            // If no match, return failure, keeping the original position.
            return ParseOutcome.failure(scanPosition);
        }
    };
}