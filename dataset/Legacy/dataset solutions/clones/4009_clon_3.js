var inputHandler = createInputReader();

processMainLogic();

function readNextInteger() { return convertInput(getNextLine(), 1); }
function readNextStringArray() { return convertInput(getNextLine(), 2); }
function readNextIntegerArray() { return convertInput(getNextLine(), 4); }
function readNextCharacterArray() { return convertInput(getNextLine(), 6); }

function getNextLine() { return inputHandler.getNextLine(); }
function hasMoreLines() { return inputHandler.hasMoreLines(); }

function readInputFile() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function createInputReader() {
    const rawInputLines = readInputFile();
    let currentLineIndex = 0;
    const totalLines = rawInputLines.length;

    function hasMoreLinesInternal() {
        return currentLineIndex < totalLines;
    }

    function getNextLineInternal() {
        if (!hasMoreLinesInternal()) {
            throw "ArrayIndexOutOfBoundsException これ以上ないよ";
        }
        const currentLineContent = rawInputLines[currentLineIndex];
        currentLineIndex++;
        return currentLineContent;
    }

    return {
        hasMoreLines: hasMoreLinesInternal,
        getNextLine: getNextLineInternal
    };
}

function printOutput(messageContent) { console.log(messageContent); }
function printError(messageContent) { console.error(messageContent); }

function mapToNumbers(stringArray) {
    return stringArray.map((numStr) => Number(numStr));
}

function joinArrayElements(arr, separator) {
    return arr.join(separator);
}

function convertInput(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1: return parseInt(inputValue);
            case 2: return inputValue.split(" ");
            case 4: return mapToNumbers(inputValue.split(" "));
            case 6: return inputValue.split("");
            case 7: return mapToNumbers(inputValue.split(""));
            case 8: return joinArrayElements(inputValue, " ");
            case 9: return joinArrayElements(inputValue, "\n");
            case 0: return joinArrayElements(inputValue, "");
            default: return inputValue;
        }
    } catch (e) {
        return inputValue;
    }
}

function processMainLogic() {
    const inputCount = readNextInteger();

    const marchCharacters = ['M', 'A', 'R', 'C', 'H'];
    const marchCounts = {};
    for (const charKey of marchCharacters) {
        marchCounts[charKey] = 0;
    }

    while (hasMoreLines()) {
        const currentLineFirstChar = readNextCharacterArray()[0];
        marchCounts[currentLineFirstChar]++;
    }

    const availableMarchKeys = Object.keys(marchCounts);
    let totalCombinations = 0;
    const numAvailableKeys = availableMarchKeys.length;

    function calculateTripleProduct(idx1, idx2, idx3) {
        const count1 = marchCounts[availableMarchKeys[idx1]];
        const count2 = marchCounts[availableMarchKeys[idx2]];
        const count3 = marchCounts[availableMarchKeys[idx3]];
        return count1 * count2 * count3;
    }

    for (let i = 0; i < numAvailableKeys - 2; i++) {
        for (let j = i + 1; j < numAvailableKeys - 1; j++) {
            for (let k = j + 1; k < numAvailableKeys; k++) {
                totalCombinations += calculateTripleProduct(i, j, k);
            }
        }
    }

    printOutput(totalCombinations);
}
