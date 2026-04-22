var DATA_PARSER_FACTORY=(function(){

    /*
     * Factory function to create a new input processor instance.
     * @param {string} sourceContent - The raw string content to be parsed.
     * @returns {TextDataProcessor} An instance of the TextDataProcessor.
     */
    function createInputProcessor(sourceContent){
        return new TextDataProcessor(sourceContent);
    }

    /**
     * Constructor for the TextDataProcessor class.
     * Manages parsing lines from a multi-line string.
     * @param {string} rawTextBuffer - The input string containing multiple lines.
     */
    function TextDataProcessor(rawTextBuffer){
        // Store lines after trimming and splitting.
        this._textLines = rawTextBuffer.trim().split("\n");
        // Keep track of the current line being processed.
        this._currentLinePointer = 0;
    }

    /**
     * Extracts the last token from the current line.
     * If the line is a string, it's split and reversed once.
     * Advances the line pointer if the current line becomes empty after extraction.
     * @param {boolean} asString - If true, returns the token as a string; otherwise, converts to number.
     * @returns {string|number} The extracted token.
     */
    TextDataProcessor.prototype.obtainLastToken=function(asString){
        var lineSegments=this._textLines,
            currentLineIdx=this._currentLinePointer,
            extractedValue;

        // If the current line is still a string, split it into tokens and reverse.
        // This is done only once per line to avoid repeated splitting.
        if(typeof lineSegments[currentLineIdx]==="string")
            lineSegments[currentLineIdx]=lineSegments[currentLineIdx].split(" ").reverse();

        // Pop the last element (which is actually the first after reversing).
        extractedValue=lineSegments[currentLineIdx].pop();

        // If no more tokens on the current line, advance to the next line.
        if(!lineSegments[currentLineIdx].length)
            this._currentLinePointer++;

        // Return as string or convert to a number based on the flag.
        return asString ? extractedValue : +extractedValue;
    };

    /**
     * Extracts all tokens from the current line.
     * Advances the line pointer after processing.
     * @param {boolean} keepAsStrings - If true, returns tokens as strings; otherwise, converts all to numbers.
     * @returns {Array<string|number>} An array of tokens.
     */
    TextDataProcessor.prototype.obtainLineTokens=function(keepAsStrings){
        // Split the current line by spaces and advance the pointer.
        var parsedLine=this._textLines[this._currentLinePointer++].split(" ");

        // Return as strings or map to numbers.
        return keepAsStrings ? parsedLine : parsedLine.map(tokenItem=>+tokenItem);
    };

    /**
     * Extracts a matrix of tokens from 'numRows' subsequent lines.
     * Advances the line pointer by 'numRows'.
     * @param {number} numRows - The number of lines to read for the matrix.
     * @param {boolean} stringsOnly - If true, returns tokens as strings; otherwise, converts all to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    TextDataProcessor.prototype.obtainMultiLineTokens=function(numRows,stringsOnly){
        // Slice the required number of lines and split each into tokens.
        var matrixData=this._textLines.slice(this._currentLinePointer,this._currentLinePointer+=numRows).map(rowSegment=>rowSegment.split(" "));

        // Return as strings or map all elements to numbers.
        return stringsOnly ? matrixData : matrixData.map(row=>row.map(item=>+item));
    };

    /**
     * Extracts 'count' raw lines from the input.
     * Advances the line pointer by 'count'.
     * @param {number} count - The number of raw lines to retrieve.
     * @param {boolean} textual - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw lines.
     */
    TextDataProcessor.prototype.obtainRawLines=function(count,textual){
        // Slice the required number of lines.
        var rowSegments=this._textLines.slice(this._currentLinePointer,this._currentLinePointer+=count);

        // Return as strings or map to numbers.
        return textual ? rowSegments : rowSegments.map(lineValue=>+lineValue);
    };

    // Return the factory function.
    return createInputProcessor;
})();

/*
 * Initialize the input handler by reading content from standard input.
 * This will create an instance of TextDataProcessor.
 */
var inputHandler=DATA_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin","utf8"));

/*
 * Main execution block.
 * Logs the result of the primary analysis function.
 */
console.log(analyzeMatrix());

/**
 * Performs a specific analysis on the input data.
 * This function reads a matrix size, then a series of strings,
 * and checks for a rotational symmetry property.
 * @returns {number} The calculated total symmetric sets.
 */
function analyzeMatrix(){
    // Read the dimension (size) of the square matrix from input.
    var matrixSize = inputHandler.obtainLastToken();

    // Read 'matrixSize' lines as strings, which represent rows of characters.
    var charMatrix = inputHandler.obtainRawLines(matrixSize,true);

    // Duplicate the initial 'matrixSize' rows to effectively create a circular buffer.
    // This allows easier access for rotational checks.
    for(var rotationOffset=0;rotationOffset<matrixSize;rotationOffset++)
        charMatrix[rotationOffset+matrixSize]=charMatrix[rotationOffset];

    // Initialize the accumulator for symmetric sets.
    var totalSymmetricSets=0;

    // Iterate through all possible rotational offsets.
    for(rotationOffset=0;rotationOffset<matrixSize;rotationOffset++){
        // Flag to track if the current rotation is symmetric.
        var isCurrentRotationSymmetric=1;

        // Label for breaking out of nested loops efficiently.
        rowLoop:
        // Iterate through all unique pairs of rows (rowIterator, colIterator)
        // where rowIterator < colIterator, within the original matrixSize bounds.
        for(var rowIterator=0;rowIterator<matrixSize;rowIterator++)
            for(var colIterator=rowIterator+1;colIterator<matrixSize;colIterator++){
                // Check if the character at (rowIterator + rotationOffset, colIterator)
                // is equal to the character at (colIterator + rotationOffset, rowIterator).
                // This is the symmetry check for the current rotation.
                if(charMatrix[rowIterator+rotationOffset][colIterator]===charMatrix[colIterator+rotationOffset][rowIterator])
                    // If they are equal, continue to the next pair.
                    continue;
                // If not equal, the current rotation is not symmetric.
                isCurrentRotationSymmetric=0;
                // Break out of both inner loops (colIterator and rowIterator).
                break rowLoop;
            }

        // If the rotation remained symmetric after all checks, add 'matrixSize' to the total.
        if(isCurrentRotationSymmetric)
            totalSymmetricSets+=matrixSize;
    }

    // Return the final count of symmetric sets.
    return totalSymmetricSets;
}