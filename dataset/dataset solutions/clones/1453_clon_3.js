var outputHandler = console.log;

const NEWLINE_SEPARATOR = "\n";
const WHITESPACE_DELIMITER = " ";

const NUMERIC_PARSER = Number;

function compareNumbersAsc(valA, valB) {
    return valA - valB;
}

function processNumericString(inputStr) {
    const stringParts = inputStr.split(WHITESPACE_DELIMITER);
    const parsedNumbers = stringParts.map(NUMERIC_PARSER);
    parsedNumbers.sort(compareNumbersAsc);
    return parsedNumbers;
}

const nodeRuntimeProcess = typeof process !== "undefined" ? process : null;

if (nodeRuntimeProcess) {
    let accumulatedInputBuffer = "";
    nodeRuntimeProcess.stdin.resume();
    nodeRuntimeProcess.stdin.setEncoding('utf8');
    nodeRuntimeProcess.stdin.on('data', function (receivedDataChunk) {
        accumulatedInputBuffer += receivedDataChunk;
    });
    nodeRuntimeProcess.stdin.on('end', function () {
        handleFullInput(accumulatedInputBuffer);
    });
}

function handleFullInput(completeInputString) {
    const relevantLines = completeInputString.split(NEWLINE_SEPARATOR).slice(1, -1);
    executeMainLogic(relevantLines);
}

function executeMainLogic(dataLineSegments) {
    const targetLine = dataLineSegments.pop();
    const sortedNumericValues = processNumericString(targetLine);
    const formattedOutput = sortedNumericValues.join(WHITESPACE_DELIMITER);
    outputHandler(formattedOutput);
}
