/* This module provides a flexible input processing utility. */
var INPUT_PROC=(function() {
    /* Main factory function for creating input handlers. */
    function InputHandlerFactory(sourceText) {
        return new DataStreamHandler(sourceText);
    }

    /*
     * Constructor for the DataStreamHandler.
     * It prepares the input string for sequential reading.
     */
    function DataStreamHandler(inputString) {
        /* Internal buffer holding lines of data. */
        this._inputBuffer = inputString.trim().split("\n");
        /* Pointer to the current line being processed. */
        this._linePointer = 0;
    }

    /*
     * Extracts a single element from the current line.
     * If the line becomes empty after extraction, advances to the next line.
     * @param {boolean} keepStrings - If true, returns the element as a string; otherwise, attempts to convert to number.
     * @returns {string|number} The extracted element.
     */
    DataStreamHandler.prototype.extractElement = function(keepStrings) {
        var  currentLines = this._inputBuffer,
             ptr = this._linePointer,
             elementResult;

        // If the current line is still a string, split and reverse it for easy popping.
        if (typeof currentLines[ptr] === "string") {
            currentLines[ptr] = currentLines[ptr].split(" ").reverse();
        }

        elementResult = currentLines[ptr].pop();

        // If the current line is now empty, move to the next line.
        if (!currentLines[ptr].length) {
            this._linePointer++;
        }

        return keepStrings ? elementResult : +elementResult;
    };

    /*
     * Reads an entire line, splits it into tokens, and returns them.
     * Advances the line pointer.
     * @param {boolean} keepStrings - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    DataStreamHandler.prototype.fetchLineParts = function(keepStrings) {
        var lineParts = this._inputBuffer[this._linePointer++].split(" ");
        return keepStrings ? lineParts : lineParts.map(val => +val);
    };

    /*
     * Reads a specified number of lines (N) as a 2D array (matrix).
     * Advances the line pointer by N.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} keepStrings - If true, returns elements as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    DataStreamHandler.prototype.getGridData = function(numLines, keepStrings) {
        var grid = this._inputBuffer.slice(this._linePointer,this._linePointer+=numLines)
                                 .map(line => line.split(" "));
        return keepStrings ? grid : grid.map(row => row.map(item => +item));
    };

    /*
     * Reads a specified number of lines (N) as a 1D array of raw strings.
     * Advances the line pointer by N.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} keepStrings - If true, returns lines as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    DataStreamHandler.prototype.getRawLines = function(numLines, keepStrings) {
        var rawData = this._inputBuffer.slice(this._linePointer,this._linePointer+=numLines);
        return keepStrings ? rawData : rawData.map(val => +val);
    };

    return InputHandlerFactory;
})();

/* Initialize the input processor with data from standard input. */
var dataProcessor = INPUT_PROC( require("fs").readFileSync("/dev/stdin", "utf8") );

/*
 * Helper function to create multi-dimensional arrays.
 * Not used in the main logic of this specific problem, but included for completeness.
 * @param {*} fillWith - The value to fill the innermost array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., 2, 3 for a 2x3 array).
 * @returns {Array} A multi-dimensional array.
 */
function buildNestedArray(fillWith) {
    var  allArguments = arguments,
         dimensionCount = allArguments.length,
         generatedCode = "Array(allArguments[" + --dimensionCount + "]).fill(fillWith)";
    while (--dimensionCount) {
        generatedCode = "Array(allArguments[" + dimensionCount + "]).fill(0).map(x => " + generatedCode + ")";
    }
    return eval(generatedCode);
}

/*
 * Executes the main problem-solving logic.
 * Reads heights and determines the count of visible peaks.
 */
console.log(processHeights());

function processHeights() {
    /* Total number of elevation points to consider. */
    var totalElements = dataProcessor.extractElement();
    /* Array containing all the height values. */
    var elevationData = dataProcessor.fetchLineParts();

    /* Variable to store the final count of visible peaks. */
    var resultValue = 0;
    /* Keeps track of the maximum height encountered so far. */
    var peakHeight = 0;

    /* Iterate through each elevation point. */
    for (var elementIndex = 0; elementIndex < totalElements; elementIndex++) {
        // If the current elevation is greater than or equal to the previously seen maximum,
        // it means this point is a new visible peak or contributes to the current one.
        if (peakHeight <= elevationData[elementIndex]) {
            peakHeight = elevationData[elementIndex];
            resultValue++;
        }
    }

    return resultValue;
}