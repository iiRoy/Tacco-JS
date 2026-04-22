/* This module provides utilities for parsing input data streams. */
var INPUT_READER=(function(){
    /* Internal helper function to create a new LineDataProcessor. */
    function createInputReader(sourceContent){return new LineDataProcessor(sourceContent);}

    /*
     * Constructor for processing input lines.
     * @param {string} sourceContent - The raw string content to process.
     */
    function LineDataProcessor(sourceContent){
        // Trim whitespace and split the content into individual lines.
        this._lineSegments=sourceContent.trim().split("\n");
        // Initialize the pointer for the current line segment.
        this._currentSegmentIndex=0;
    }

    /*
     * Prototype method to fetch the next token from the current line.
     * It reverses the order of elements on the current line before popping.
     * @param {boolean} returnString - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The fetched token.
     */
    LineDataProcessor.prototype.fetchNextToken=function(returnString){
        var segmentArray=this._lineSegments,
            segmentPointer=this._currentSegmentIndex,
            resultValue;

        // If the current line segment hasn't been processed into parts yet, do so.
        if(typeof segmentArray[segmentPointer]==="string")
            segmentArray[segmentPointer]=segmentArray[segmentPointer].split(" ").reverse();

        // Pop the last element (which is the first after reverse) from the current line's parts.
        resultValue=segmentArray[segmentPointer].pop();

        // If the current line segment is now empty, advance the line pointer.
        if(!segmentArray[segmentPointer].length)
            this._currentSegmentIndex++;

        // Return the token, converting to number if returnString is false.
        return returnString?resultValue:+resultValue;
    };

    /*
     * Prototype method to fetch all tokens from the next line.
     * @param {boolean} returnString - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the next line.
     */
    LineDataProcessor.prototype.fetchLineTokens=function(returnString){
        // Get the current line, split by space, and advance the line pointer.
        var resultValue=this._lineSegments[this._currentSegmentIndex++].split(" ");

        // Return tokens, converting to numbers if returnString is false.
        return returnString?resultValue:resultValue.map(currentElement=>+currentElement);
    };

    /*
     * Prototype method to fetch a matrix of tokens over 'numRows' lines.
     * @param {number} numRows - The number of lines to read for the matrix.
     * @param {boolean} returnString - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    LineDataProcessor.prototype.fetchMatrixTokens=function(numRows,returnString){
        // Slice the required number of lines and split each by space.
        var resultValue=this._lineSegments.slice(this._currentSegmentIndex,this._currentSegmentIndex+=numRows).map(currentElement=>currentElement.split(" "));

        // Return matrix, converting inner elements to numbers if returnString is false.
        return returnString?resultValue:resultValue.map(currentElement=>currentElement.map(innerElement=>+innerElement));
    };

    /*
     * Prototype method to fetch a block of raw lines.
     * @param {number} numRows - The number of lines to read.
     * @param {boolean} returnString - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of lines.
     */
    LineDataProcessor.prototype.fetchRawLines=function(numRows,returnString){
        // Slice the required number of lines directly.
        var resultValue=this._lineSegments.slice(this._currentSegmentIndex,this._currentSegmentIndex+=numRows);

        // Return lines, converting to numbers if returnString is false.
        return returnString?resultValue:resultValue.map(currentElement=>+currentElement);
    };

    return createInputReader;
})();

// Initialize the input data stream from standard input.
var dataInputInstance=INPUT_READER(require("fs").readFileSync("/dev/stdin","utf8"));

/*
 * Creates a multi-dimensional array filled with a specified initial value.
 * @param {any} initialFillValue - The value to fill the array with.
 * @param {...number} dimArgs - The dimensions of the array.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiArray(initialFillValue){
    var dimArgs=arguments,
        dimensionCount=dimArgs.length,
        // Construct the string for array creation.
        arrayCreationCode="Array(dimArgs["+ --dimensionCount+"]).fill(0).map(x=>{return "+initialFillValue+";})";

    // Build the nested array creation string.
    while(--dimensionCount)
        arrayCreationCode="Array(dimArgs["+dimensionCount+"]).fill(0).map(x=>"+arrayCreationCode+")";

    // Evaluate the constructed string to create the array.
    return eval(arrayCreationCode);
}


/*
 * Main function to analyze the input data and compute the final result.
 * @returns {number} The calculated total tally.
 */
console.log(analyzeData());
function analyzeData(){
    // Read the total number of lines from the input.
    var totalLines=dataInputInstance.fetchNextToken();
    // Read all input lines as an array of strings.
    var inputStringArray=dataInputInstance.fetchRawLines(totalLines,1);

    // Initialize counters for specific line patterns.
    var endingWithA_only=0; // Lines ending with 'A' but not starting with 'B'
    var startingWithB_only=0; // Lines starting with 'B' but not ending with 'A'
    var startB_endA=0; // Lines starting with 'B' and ending with 'A'

    var finalTally=0; // Accumulator for the main count.

    // Iterate through each line of the input data.
    for(var lineIterator=0;lineIterator<totalLines;lineIterator++){
        // Get the first character of the current line.
        var previousChar=inputStringArray[lineIterator][0];

        // Iterate through characters of the current line, starting from the second.
        for(var charIterator=1;charIterator<inputStringArray[lineIterator].length;charIterator++){
            // Check for "AB" pairs within the line.
            if(previousChar==="A"&&inputStringArray[lineIterator][charIterator]==="B")
                finalTally++;
            // Update the previous character for the next iteration.
            previousChar=inputStringArray[lineIterator][charIterator];
        }

        // Check the start and end characters of the current line for specific patterns.
        if(inputStringArray[lineIterator][0]==="B"){
            if(inputStringArray[lineIterator][inputStringArray[lineIterator].length-1]==="A")
                startB_endA++; // Line starts with 'B' and ends with 'A'
            else
                startingWithB_only++; // Line starts with 'B' but not ends with 'A'
        }else if(inputStringArray[lineIterator][inputStringArray[lineIterator].length-1]==="A")
            endingWithA_only++; // Line does not start with 'B' but ends with 'A'
    }

    // Calculate minimum and maximum of two counters.
    var minCount=Math.min(endingWithA_only,startingWithB_only);
    var maxCount=Math.max(endingWithA_only,startingWithB_only);

    // Apply final logic to adjust the total tally based on patterns.
    if(maxCount){ // If either endingWithA_only or startingWithB_only is non-zero
        if(startB_endA) // If there are lines starting with B and ending with A
            finalTally+=minCount+startB_endA;
        else
            finalTally+=minCount;
    }else // If both endingWithA_only and startingWithB_only are zero
        finalTally+=startB_endA-1;

    return finalTally; // Return the computed final result.
}