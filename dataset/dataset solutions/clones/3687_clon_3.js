class InputDataHandler {
    #bufferedInputLines;
    #currentReadPosition;
    #totalAvailableLines;

    constructor() {
        this.#bufferedInputLines = this.#fetchRawSystemInput();
        this.#currentReadPosition = 0;
        this.#totalAvailableLines = this.#bufferedInputLines.length;

        if (this.#totalAvailableLines === 0) {
            console.warn("InputDataHandler: No input lines were found. Ensure input is provided.");
        }
    }

    #fetchRawSystemInput() {
        const standardInputSource = "/dev/stdin";
        try {
            const fileSystemAccess = require("fs");
            const rawContentBuffer = fileSystemAccess.readFileSync(standardInputSource, "utf8");
            // Trim leading/trailing whitespace from the whole content, then split by newlines.
            // Filter out any resultant empty strings to handle multiple newlines gracefully.
            return rawContentBuffer.trim().split("\n").filter(line => line.trim().length > 0);
        } catch (ioError) {
            console.error(`CRITICAL: Error reading from ${standardInputSource}. Details: ${ioError.message}`);
            // In case of an error, return an empty array to prevent subsequent processing issues.
            return [];
        }
    }

    hasMoreData() {
        return this.#currentReadPosition < this.#totalAvailableLines;
    }

    retrieveNextLine() {
        if (!this.hasMoreData()) {
            console.warn("InputDataHandler: Attempted to read beyond the end of the input stream. Returning empty string.");
            return "";
        }
        const lineContent = this.#bufferedInputLines[this.#currentReadPosition];
        this.#currentReadPosition++;
        return lineContent;
    }
}

const inputLineManager = new InputDataHandler();

applicationEntryPoint();

function displayOutput(message) {
    console.log(message);
}

function recordError(errorMessage) {
    console.error(errorMessage);
}

const DataConversionSchema = Object.freeze({
    PARSE_AS_INTEGER: "PARSE_AS_INTEGER",
    SPLIT_BY_WHITESPACE_TO_STRINGS: "SPLIT_BY_WHITESPACE_TO_STRINGS",
    SPLIT_BY_WHITESPACE_TO_NUMBERS: "SPLIT_BY_WHITESPACE_TO_NUMBERS",
    BREAK_INTO_CHARACTERS: "BREAK_INTO_CHARACTERS",
    BREAK_INTO_NUMERIC_CHARS: "BREAK_INTO_NUMERIC_CHARS",
    CONCAT_WITH_SPACE: "CONCAT_WITH_SPACE",
    CONCAT_WITH_NEWLINE: "CONCAT_WITH_NEWLINE",
    CONCAT_DIRECTLY: "CONCAT_DIRECTLY"
});

function processDataTransformation(payload, transformationRule) {
    const convertArrayElementsToNumbers = (arr) => {
        if (!Array.isArray(arr)) {
            recordError("ERROR: 'convertArrayElementsToNumbers' received non-array input. Skipping conversion.");
            return arr;
        }
        return arr.map(element => Number(element));
    };

    if (payload === undefined || payload === null) {
        recordError("WARNING: 'processDataTransformation' received undefined/null payload. Returning as-is.");
        return payload;
    }

    try {
        switch (transformationRule) {
            case DataConversionSchema.PARSE_AS_INTEGER:
                return parseInt(String(payload), 10);
            case DataConversionSchema.SPLIT_BY_WHITESPACE_TO_STRINGS:
                return String(payload).split(" ");
            case DataConversionSchema.SPLIT_BY_WHITESPACE_TO_NUMBERS:
                return convertArrayElementsToNumbers(String(payload).split(" "));
            case DataConversionSchema.BREAK_INTO_CHARACTERS:
                return String(payload).split("");
            case DataConversionSchema.BREAK_INTO_NUMERIC_CHARS:
                return convertArrayElementsToNumbers(String(payload).split(""));
            case DataConversionSchema.CONCAT_WITH_SPACE:
                return Array.isArray(payload) ? payload.join(" ") : (recordError("ERROR: Join operation requires an array."), payload);
            case DataConversionSchema.CONCAT_WITH_NEWLINE:
                return Array.isArray(payload) ? payload.join("\n") : (recordError("ERROR: Join operation requires an array."), payload);
            case DataConversionSchema.CONCAT_DIRECTLY:
                return Array.isArray(payload) ? payload.join("") : (recordError("ERROR: Join operation requires an array."), payload);
            default:
                recordError(`WARNING: Unknown transformation rule: ${transformationRule}. Returning original payload.`);
                return payload;
        }
    } catch (transformError) {
        recordError(`EXCEPTION: Data transformation failed for rule '${transformationRule}': ${transformError.message}`);
        return payload;
    }
}

function retrieveNextInteger() {
    const rawInput = inputLineManager.retrieveNextLine();
    return processDataTransformation(rawInput, DataConversionSchema.PARSE_AS_INTEGER);
}

function retrieveNextStringArray() {
    const rawInput = inputLineManager.retrieveNextLine();
    return processDataTransformation(rawInput, DataConversionSchema.SPLIT_BY_WHITESPACE_TO_STRINGS);
}

function retrieveNextNumericArray() {
    const rawInput = inputLineManager.retrieveNextLine();
    return processDataTransformation(rawInput, DataConversionSchema.SPLIT_BY_WHITESPACE_TO_NUMBERS);
}

function retrieveNextCharacterArray() {
    const rawInput = inputLineManager.retrieveNextLine();
    return processDataTransformation(rawInput, DataConversionSchema.BREAK_INTO_CHARACTERS);
}

function isAbsoluteDifferenceMatching(valueX, valueY, targetDifference) {
    const calculatedDifference = Math.abs(valueX - valueY);
    return calculatedDifference === targetDifference;
}

function applicationEntryPoint() {
    const executionStartTimestamp = process.hrtime.bigint();

    const initialConfiguration = retrieveNextNumericArray();
    
    if (!Array.isArray(initialConfiguration) || initialConfiguration.length < 3) {
        recordError("FATAL: Initial configuration line is malformed or incomplete. Expected at least 3 numeric parameters.");
        displayOutput("Application terminated due to critical input error.");
        return;
    }

    const [
        upperBoundForLoops,        // Corresponds to 'N' in the original problem.
        _ignoredSecondParameter,   // Corresponds to 'M', which is not utilized in the core logic.
        requiredAbsoluteDifference // Corresponds to 'd'.
    ] = initialConfiguration;

    if (upperBoundForLoops < 1) {
        displayOutput("WARNING: The upper bound for iteration (N) must be a positive integer. No computations performed.");
        return;
    }

    const frequencyDistributionMap = {}; // Will store counts of how many times each match score occurs.

    for (let firstCounter = 1; firstCounter <= upperBoundForLoops; firstCounter++) {
        for (let secondCounter = 1; secondCounter <= upperBoundForLoops; secondCounter++) {
            for (let thirdCounter = 1; thirdCounter <= upperBoundForLoops; thirdCounter++) {
                for (let fourthCounter = 1; fourthCounter <= upperBoundForLoops; fourthCounter++) {
                    let currentCombinationScore = 0;

                    if (isAbsoluteDifferenceMatching(firstCounter, secondCounter, requiredAbsoluteDifference)) {
                        currentCombinationScore++;
                    }
                    if (isAbsoluteDifferenceMatching(thirdCounter, secondCounter, requiredAbsoluteDifference)) {
                        currentCombinationScore++;
                    }
                    if (isAbsoluteDifferenceMatching(thirdCounter, fourthCounter, requiredAbsoluteDifference)) {
                        currentCombinationScore++;
                    }

                    // Increment the count for the current score. If the score hasn't been seen, initialize it to 0 first.
                    frequencyDistributionMap[currentCombinationScore] = (frequencyDistributionMap[currentCombinationScore] || 0) + 1;
                }
            }
        }
    }

    const executionEndTimestamp = process.hrtime.bigint();
    const totalDurationInMs = Number(executionEndTimestamp - executionStartTimestamp) / 1_000_000;

    displayOutput("\n--- Program Execution Report ---");
    displayOutput(`Configured Parameters: Max Iteration Value (N)=${upperBoundForLoops}, Required Difference (d)=${requiredAbsoluteDifference}`);
    displayOutput("Calculated Match Score Frequencies:");
    displayOutput(JSON.stringify(frequencyDistributionMap, null, 4)); // Pretty print the result object
    displayOutput(`Total Processing Time: ${totalDurationInMs.toFixed(4)} milliseconds`);
    displayOutput("----------------------------------\n");
}