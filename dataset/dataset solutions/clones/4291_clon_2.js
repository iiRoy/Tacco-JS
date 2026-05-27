var inputHandler = initializeInput();

processMainLogic();

function readInteger() {
    return dataConverter(getNextLine(), 1);
}

function readStringArray() {
    return dataConverter(getNextLine(), 2);
}

function readIntegerArray() {
    return dataConverter(getNextLine(), 4);
}

function readCharacterArray() {
    return dataConverter(getNextLine(), 6);
}

function getNextLine() {
    return inputHandler.next();
}

function hasMoreLines() {
    return inputHandler.hasNext();
}

function getInputContent() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInput() {
    var rawInputLines = getInputContent();
    var inputProcessor = {
        "lineBuffer": rawInputLines,
        "currentLineIndex": 0,
        "totalLines": rawInputLines.length,
        "hasNext": function() {
            return (this.currentLineIndex < this.totalLines);
        },
        "next": function() {
            if (!this.hasNext()) {
                return "";
            } else {
                var currentLineData = this.lineBuffer[this.currentLineIndex];
                this.currentLineIndex++;
                return currentLineData;
            }
        }
    };
    return inputProcessor;
}

function printResult(val) {
    console.log(val);
}

function logError(val) {
    console.error(val);
}

function dataConverter(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputValue);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map((itemValue) => Number(itemValue));
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map((itemValue) => Number(itemValue));
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (err) {
        return inputValue;
    }
}

function processMainLogic() {
    var inputString = getNextLine();
    var stringLength = inputString.length;
    var nonXCharacters = inputString.replace(/x/g, "");
    var reversedNonX = "";
    var xCount = 0;
    var xGroupCounts = [];

    for (var idx = 0; idx < stringLength; idx = (idx + 1) | 0) {
        if (inputString[idx] !== "x") {
            reversedNonX = inputString[idx] + reversedNonX;
            xGroupCounts.push(xCount);
            xCount = 0;
        } else {
            xCount++;
        }
    }
    xGroupCounts.push(xCount);

    logError(xGroupCounts);
    if (reversedNonX !== nonXCharacters) {
        printResult(-1);
        return;
    }
    var totalOperations = 0;
    for (var idx = 0; idx < xGroupCounts.length; idx = (idx + 1) | 0) {
        totalOperations += Math.abs(xGroupCounts[idx] - xGroupCounts[xGroupCounts.length - 1 - idx]);
    }
    printResult(totalOperations / 2);
}
