const InputOutputManager = (function() {
    let inputReaderInstance;
    let collectedInputLines = [];
    let dataProcessor;

    const setupInputReader = () => {
        inputReaderInstance = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        inputReaderInstance.on('line', (lineContent) => { collectedInputLines.push(lineContent); });
        inputReaderInstance.on('close', () => {
            dataProcessor = createDataProcessor(collectedInputLines);
            console.error("\n");
            const executionStartTime = Date.now();
            executeSolution();
            const executionEndTime = Date.now() - executionStartTime;
            OutputUtility.logDebug("time : " + (executionEndTime) + "ms");
            OutputUtility.logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
        });
    };

    const createDataProcessor = (sourceLines) => {
        return {
            lineData: sourceLines,
            currentLineIndex: 0,
            totalLines: sourceLines.length,
            hasMoreData: function() { return (this.currentLineIndex < this.totalLines); },
            retrieveNextToken: function() {
                if (this.hasMoreData()) {
                    return this.lineData[this.currentLineIndex++];
                } else {
                    throw "ArrayIndexOutOfBoundsException ‚There is no more input";
                }
            }
        };
    };

    const InputConversionUtility = {
        toInteger: (inputString) => parseInt(inputString),
        splitBySpace: (inputString) => inputString.split(" "),
        splitBySpaceAndMapToNumber: (inputString) => inputString.split(" ").map(Number),
        splitByCharacter: (inputString) => inputString.split(""),
        splitByCharacterAndMapToNumber: (inputString) => inputString.split("").map(Number),
        joinWithSpace: (array) => array.join(" "),
        joinWithNewline: (array) => array.join("\n"),
        joinWithoutSeparator: (array) => array.join("")
    };

    const OutputUtility = {
        logOutput: (content) => console.log(content),
        logDebug: (content) => console.error("debug:" + require("util").inspect(content, false, null))
    };

    // Public interface for input/output operations
    const getNextInteger = () => InputConversionUtility.toInteger(dataProcessor.retrieveNextToken());
    const getNextStringArray = () => InputConversionUtility.splitBySpace(dataProcessor.retrieveNextToken());
    const getNextIntegerArray = () => InputConversionUtility.splitBySpaceAndMapToNumber(dataProcessor.retrieveNextToken());
    const getNextCharacterArray = () => InputConversionUtility.splitByCharacter(dataProcessor.retrieveNextToken());
    const getNextRawToken = () => dataProcessor.retrieveNextToken();
    const checkHasMoreData = () => dataProcessor.hasMoreData();

    return {
        initialize: setupInputReader,
        readInt: getNextInteger,
        readStrArray: getNextStringArray,
        readIntArray: getNextIntegerArray,
        readCharArray: getNextCharacterArray,
        readToken: getNextRawToken,
        hasData: checkHasMoreData,
        print: OutputUtility.logOutput,
        debug: OutputUtility.logDebug,
        conversion: InputConversionUtility // Expose for specific join operations
    };
})();

// Initialize the input/output system
InputOutputManager.initialize();

// Main solution logic
function executeSolution() {
    const targetNumber = InputOutputManager.readInt();
    let currentKValue = 0;
    let isTargetTriangular = false;

    // Helper function to determine if a number is triangular and find its 'k'
    const findTriangularK = (numToCheck) => {
        let kIterator = 0;
        while (true) {
            const calculatedTriangular = (kIterator * (kIterator + 1)) / 2;
            if (calculatedTriangular === numToCheck) {
                return { found: true, k: kIterator };
            }
            if (calculatedTriangular > numToCheck) {
                // If the calculated value exceeds the target, it's not triangular
                return { found: false, k: kIterator };
            }
            kIterator++;
        }
    };

    const triangularCheckResult = findTriangularK(targetNumber);
    isTargetTriangular = triangularCheckResult.found;
    currentKValue = triangularCheckResult.k;

    if (!isTargetTriangular) {
        InputOutputManager.print("No");
        return;
    }

    InputOutputManager.print("Yes");

    const matrixSize = currentKValue + 1;
    const resultMatrix = Array.from({ length: matrixSize }, () => new Array(currentKValue));

    let valueCounter = 1;
    for (let rowIdx = 0; rowIdx < currentKValue; rowIdx++) {
        for (let colIdx = rowIdx; colIdx < currentKValue; colIdx++) {
            const correspondingRowIdx = colIdx + 1; // Helper variable for clarity
            resultMatrix[rowIdx][colIdx] = valueCounter;
            resultMatrix[correspondingRowIdx][rowIdx] = valueCounter;
            valueCounter++;
        }
    }

    InputOutputManager.debug(resultMatrix);

    const finalFormattedLines = generateFormattedOutput(resultMatrix, currentKValue);
    InputOutputManager.print(finalFormattedLines);
}

// Helper function to format the matrix into output strings
function generateFormattedOutput(matrixData, kValForPrefix) {
    const outputStringArray = [];
    const totalRows = matrixData.length;
    for (let i = 0; i < totalRows; i++) {
        const currentRowData = matrixData[i];
        currentRowData.unshift(kValForPrefix); // Add the k value to the start of each row
        outputStringArray.push(InputOutputManager.conversion.joinWithSpace(currentRowData));
    }
    return InputOutputArray.conversion.joinWithNewline(outputStringArray);
}
