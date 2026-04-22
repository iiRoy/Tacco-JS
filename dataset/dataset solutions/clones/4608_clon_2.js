var inputReader = initializeInputSystem();
processSolution();
function readInteger() {
    return dataTransformer(getNextLine(), 1);
}
function readStringArray() {
    return dataTransformer(getNextLine(), 2);
}
function readIntegerArray() {
    return dataTransformer(getNextLine(), 4);
}
function readCharacterArray() {
    return dataTransformer(getNextLine(), 6);
}
function getNextLine() {
    return inputReader.getNextLine();
}
function hasMoreLines() {
    return inputReader.hasMoreLines();
}
function fetchRawInput() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}
function initializeInputSystem() {
    var rawLines = fetchRawInput();
    var inputSystem = {
        "inputLines" : rawLines,
        "currentLineIndex" : 0,
        "totalLines" : rawLines.length,
        "hasMoreLines" : function() {
            return (this.currentLineIndex < this.totalLines);
        },
        "getNextLine" : function() {
            if (!this.hasMoreLines()) {
                return "";
            } else {
                var currentLineData = this.inputLines[this.currentLineIndex];
                this.currentLineIndex++;
                return currentLineData;
            }
        }
    };
    return inputSystem;
}
function displayResult(outputContent) {
    console.log(outputContent);
}
function logError(errorMessage) {
    console.error(errorMessage);
}
// This helper function manages various input transformations.
// Options for transformation:
// 1: Convert value to an integer.
// 2: Split string by spaces into an array of strings.
// 4: Split string by spaces and convert parts to an array of numbers.
// 6: Split string into individual characters.
// 7: Split string into characters and convert each to a number.
// 8: Join array elements with a space.
// 9: Join array elements with a newline.
// 0: Join array elements without any separator.
// Default: Returns the input value unchanged (e.g., if option is invalid or on error).
function dataTransformer(inputValue, transformOption) {
    try {
        switch (transformOption) {
            case 1:
                return parseInt(inputValue, 10);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map((item) => Number(item));
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map((item) => Number(item));
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (errorObject) {
        return inputValue;
    }
}
function processSolution() {
    var firstLineData = readIntegerArray();
    var numEntries = firstLineData[0];
    var thresholdDuration = firstLineData[1];
    var timePoints = readIntegerArray();
    var totalAccumulatedTime = 0;
    for (var idx = 1; idx < numEntries; idx++) {
        var timeDifference = timePoints[idx] - timePoints[idx - 1];
        if (timeDifference > thresholdDuration) {
            totalAccumulatedTime += thresholdDuration;
        } else {
            totalAccumulatedTime += timeDifference;
        }
    }
    totalAccumulatedTime += thresholdDuration;
    displayResult(totalAccumulatedTime);
}