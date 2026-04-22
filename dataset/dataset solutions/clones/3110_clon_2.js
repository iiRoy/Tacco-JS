var dataProcessor = initializeReader();

executeProgram();

function retrieveNextInteger() {
    return convertValue(fetchNextInput(), 1);
}

function getNextStringTokens() {
    // This function obtains a list of strings, separated by spaces.
    return convertValue(fetchNextInput(), 2);
}

function getNextIntegerArray() {
    // Splits input by spaces, then converts each part to a numeric value.
    return convertValue(fetchNextInput(), 4);
}

function getNextCharacterList() {
    // Divides the input into an array of single characters.
    return convertValue(fetchNextInput(), 6);
}

function fetchNextInput() {
    return dataProcessor.retrieveNext();
}

function areMoreLinesAvailable() {
    return dataProcessor.canProceed();
}

function acquireSystemInput() {
    var fileSystemModule = require("fs");
    var rawFileData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    return rawFileData.trim().split("\n");
}

function initializeReader() {
    var sourceContent = acquireSystemInput();
    var handlerInstance = {
        "contentLines": sourceContent,
        "readPosition": 0,
        "totalEntries": sourceContent.length,
        "canProceed": function() {
            return (this.readPosition < this.totalEntries);
        },
        "retrieveNext": function() {
            if (!this.canProceed()) {
                return "";
            } else {
                var currentEntry = this.contentLines[this.readPosition];
                this.readPosition++;
                return currentEntry;
            }
        }
    };
    return handlerInstance;
}

function displayProgramOutput(information) {
    console.log(information); // Output to standard console
}

function reportExecutionError(errorDetail) {
    console.error(errorDetail); // Send message to standard error stream
}

/*
 * This utility function performs various data transformations.
 * It returns the original value if an unknown operation code is provided or an error occurs.
 *
 * Operation codes:
 *   1: Converts the input string to an integer.
 *   2: Splits the input string by single spaces to form an array of strings.
 *   4: Splits the input string by spaces and then converts each resulting string to a number.
 *   6: Splits the input string into an array of individual characters.
 *   7: Splits the input string into characters and then converts each character to its numeric representation.
 *   8: Joins an array of elements with a space character.
 *   9: Joins an array of elements, placing each on a new line.
 *   0: Joins an array of elements without any separator.
 */
function convertValue(sourceValue, operationCode) {
    try {
        switch (operationCode) {
            case 1:
                return parseInt(sourceValue, 10);
            case 2:
                return sourceValue.split(" ");
            case 4:
                return sourceValue.split(" ").map(function(item) {
                    return Number(item);
                });
            case 6:
                return sourceValue.split("");
            case 7:
                return sourceValue.split("").map(function(item) {
                    return Number(item);
                });
            case 8:
                return sourceValue.join(" ");
            case 9:
                return sourceValue.join("\n");
            case 0:
                return sourceValue.join("");
            default:
                return sourceValue;
        }
    } catch (exceptionObject) {
        return sourceValue;
    }
}

function executeProgram() {
    var totalItems = retrieveNextInteger();
    var numericSequence = getNextIntegerArray();

    for (var currentPosition = 0; currentPosition < totalItems; currentPosition++) {
        if (numericSequence[currentPosition] > (currentPosition + 1)) {
            // Constraint violation: value at index X must not exceed (X + 1).
            displayProgramOutput(-1);
            return;
        }
    }

    var finalResultList = [];
    var scanPointer = 0;

    while (numericSequence.length > 0) {
        if (numericSequence[scanPointer] === scanPointer + 1) {
            scanPointer++;
        } else {
            finalResultList.unshift(numericSequence[scanPointer - 1]);
            numericSequence.splice(scanPointer - 1, 1);
            // reportExecutionError("Debug: Array length " + numericSequence.length + ", Current Scan: " + scanPointer);
            scanPointer = 0;
        }
    }

    displayProgramOutput(convertValue(finalResultList, 9));
}