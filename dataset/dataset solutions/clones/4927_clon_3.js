const DataTransformationMode = Object.freeze({
    PARSE_INT_SINGLE: 1,
    SPLIT_BY_SPACE_STRINGS: 2,
    SPLIT_BY_SPACE_INTEGERS: 4,
    SPLIT_INTO_CHARS: 6,
    SPLIT_INTO_CHAR_INTEGERS: 7,
    ARRAY_JOIN_WITH_SPACE: 8,
    ARRAY_JOIN_WITH_NEWLINE: 9,
    ARRAY_JOIN_CONCATENATE: 0
});

let programInputManager = initializeInputHandler();

executePrimaryLogic();

function getSingleIntegerLine() {
    return applyDataTransformation(retrieveNextInputLine(), DataTransformationMode.PARSE_INT_SINGLE);
}

function getSpaceSeparatedStrings() {
    return applyDataTransformation(retrieveNextInputLine(), DataTransformationMode.SPLIT_BY_SPACE_STRINGS);
}

function getSpaceSeparatedIntegers() {
    return applyDataTransformation(retrieveNextInputLine(), DataTransformationMode.SPLIT_BY_SPACE_INTEGERS);
}

function getIndividualCharacters() {
    return applyDataTransformation(retrieveNextInputLine(), DataTransformationMode.SPLIT_INTO_CHARS);
}

function retrieveNextInputLine() {
    return programInputManager.fetchNextSegment();
}

function hasMoreInputLines() {
    return programInputManager.checkAvailability();
}

function readStandardInputContent() {
    const fs = require('node:fs');
    const rawContent = fs.readFileSync(0, 'utf8');

    const lines = rawContent.trimEnd().split('\n');

    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
        logError("Warning: Standard input stream was found to be empty.");
    }
    return lines;
}

function initializeInputHandler() {
    const rawInputLines = readStandardInputContent();
    const inputHandler = {
        inputDataLines: rawInputLines,
        currentLineIndex: 0,
        totalLinesCount: rawInputLines.length,

        checkAvailability: function() {
            return this.currentLineIndex < this.totalLinesCount;
        },

        fetchNextSegment: function() {
            if (!this.checkAvailability()) {
                throw new Error("InputBufferExhausted: No more input lines are available for reading.");
            }
            const currentLineContent = this.inputDataLines[this.currentLineIndex];
            this.currentLineIndex += 1;

            if (currentLineContent === undefined) {
                logError(`Undefined content retrieved for line index ${this.currentLineIndex - 1}. Returning empty string.`);
                return "";
            }
            return currentLineContent;
        }
    };
    return inputHandler;
}

function displayOutput(content) {
    process.stdout.write(String(content) + '\n');
}

function logError(errorMessage) {
    process.stderr.write(`[APP_ERROR] ${String(errorMessage)}\n`);
}

function applyDataTransformation(inputValue, transformationMode) {
    try {
        const stringInput = String(inputValue);

        switch (transformationMode) {
            case DataTransformationMode.PARSE_INT_SINGLE:
                return Number.parseInt(stringInput, 10);

            case DataTransformationMode.SPLIT_BY_SPACE_STRINGS:
                return stringInput.split(' ').filter(s => s !== '');

            case DataTransformationMode.SPLIT_BY_SPACE_INTEGERS:
                return stringInput.split(' ').filter(s => s !== '').map(s => Number.parseInt(s, 10));

            case DataTransformationMode.SPLIT_INTO_CHARS:
                return stringInput.split('');

            case DataTransformationMode.SPLIT_INTO_CHAR_INTEGERS:
                return stringInput.split('').filter(s => s !== '').map(s => Number.parseInt(s, 10));

            case DataTransformationMode.ARRAY_JOIN_WITH_SPACE:
                return Array.isArray(inputValue) ? inputValue.join(' ') : stringInput;

            case DataTransformationMode.ARRAY_JOIN_WITH_NEWLINE:
                return Array.isArray(inputValue) ? inputValue.join('\n') : stringInput;

            case DataTransformationMode.ARRAY_JOIN_CONCATENATE:
                return Array.isArray(inputValue) ? inputValue.join('') : stringInput;

            default:
                logError(`Unrecognized data transformation mode identifier: ${transformationMode}. Original value returned.`);
                return inputValue;
        }
    } catch (transformationError) {
        logError(`Failed to transform value "${inputValue}" using mode ${transformationMode}. Details: ${transformationError.message}`);
        return inputValue;
    }
}

function executePrimaryLogic() {
    const inputCharacterSequence = retrieveNextInputLine();

    if (typeof inputCharacterSequence !== 'string' || inputCharacterSequence.length === 0) {
        logError("Primary logic received invalid or empty input sequence. Processing aborted.");
        displayOutput(0);
        return;
    }

    let currentCalculatedScore = 0;

    for (let charPosition = 0; charPosition < inputCharacterSequence.length; charPosition++) {
        const isPositionEven = (charPosition % 2 === 0);
        const isNotTheLastCharacter = (charPosition !== inputCharacterSequence.length - 1);
        const charAtCurrentPosition = inputCharacterSequence[charPosition];

        if (isPositionEven && isNotTheLastCharacter) {
            if (charAtCurrentPosition === 'g') {
                currentCalculatedScore++;
            }
        } else {
            if (charAtCurrentPosition === 'p') {
                currentCalculatedScore--;
            }
        }
    }

    displayOutput(currentCalculatedScore);
}