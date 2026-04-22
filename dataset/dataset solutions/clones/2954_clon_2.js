"use strict";

// This module provides a utility class for processing textual input data
// by parsing it line by line and token by token.
function DataStreamHandler(sourceStringContent, defaultNumberConverter) {
    // An internal array holding all lines of the provided source text.
    this._sourceLinesArray = sourceStringContent.split("\n");
    // A cursor tracking the current token's position within the active line.
    this._currentSegmentPointer = 0;
    // A cursor tracking the index of the current line being processed.
    this._currentLinePointer = 0;
    // The default function used for converting extracted string tokens to numbers,
    // falling back to the global `Number` constructor if none is specified.
    this._valueConversionRoutine = defaultNumberConverter || Number;
}

// Prototype method: Extracts and returns the next available single token (segment)
// from the input stream, advancing the internal pointers.
DataStreamHandler.prototype.retrieveNextValue = function(specificConverter) {
    // Fetch the content of the line currently pointed to.
    var activeLineContent = this._sourceLinesArray[this._currentLinePointer];

    // Only proceed if the current line actually exists.
    if (activeLineContent) {
        // Trim leading/trailing whitespace from the line and then split it into an
        // array of tokens using space as a delimiter.
        var segmentsOnActiveLine = activeLineContent.trim().split(" ");
        // Get the specific token at the current segment pointer.
        var extractedSegmentString = segmentsOnActiveLine[this._currentSegmentPointer];

        // Increment the segment pointer to prepare for the next token.
        this._currentSegmentPointer++;

        // If all tokens on the current line have been consumed, reset the segment
        // pointer and advance to the subsequent line.
        if (segmentsOnActiveLine.length === this._currentSegmentPointer) {
            this._currentSegmentPointer = 0;
            this._currentLinePointer++;
        }

        // Convert the extracted token using the provided `specificConverter` function,
        // or fall back to the instance's default `_valueConversionRoutine` if no
        // specific converter was supplied.
        return specificConverter ? specificConverter(extractedSegmentString) : this._valueConversionRoutine(extractedSegmentString);
    }
};

// Prototype method: Processes all tokens on the current line and returns them
// as an array, applying an optional processing function to each token.
DataStreamHandler.prototype.processLineTokens = function(itemProcessingFunction) {
    // Obtain the string content of the line currently in focus.
    var currentLineBuffer = this._sourceLinesArray[this._currentLinePointer];

    // If the line content is valid, proceed with processing.
    if (currentLineBuffer) {
        // Reset the segment pointer since this method consumes an entire line.
        this._currentSegmentPointer = 0;
        // Advance the line pointer to the next line after this one is processed.
        this._currentLinePointer++;

        // Split the line into tokens and apply either the `itemProcessingFunction`
        // or the default `_valueConversionRoutine` to each token, returning the
        // resulting array.
        return currentLineBuffer.split(" ").map(itemProcessingFunction || this._valueConversionRoutine);
    }
};

// Export the `DataStreamHandler` class to make it available for other modules.
module.exports = DataStreamHandler;


// Primary function responsible for analyzing a numerical input string
// to determine potential date format patterns (MMYY, YYMM, AMBIGUOUS, NA).
function executeDatePatternAnalysis(rawInputText) {
    // Instantiate a new `DataStreamHandler` to manage and parse the incoming text.
    var parserInstance = new DataStreamHandler(rawInputText);

    // Retrieve the initial numerical entry from the input stream.
    var combinedNumericValue = parserInstance.retrieveNextValue();

    // Compute the first two digits as a potential month or year prefix.
    var monthOrYearPrefix = Math.floor(combinedNumericValue / 100);
    // Compute the last two digits as a potential month or year suffix.
    var monthOrYearSuffix = combinedNumericValue % 100;

    // Evaluate if the prefix component falls within the valid range for a month (1 to 12).
    var isPrefixValidMonth = (monthOrYearPrefix >= 1 && monthOrYearPrefix <= 12);
    // Evaluate if the suffix component falls within the valid range for a month (1 to 12).
    var isSuffixValidMonth = (monthOrYearSuffix >= 1 && monthOrYearSuffix <= 12);

    // Apply conditional logic to ascertain the date pattern.
    if (isPrefixValidMonth) {
        if (isSuffixValidMonth) {
            // Both parts are valid months, leading to an ambiguous interpretation.
            console.log("AMBIGUOUS");
        } else {
            // Only the prefix is a valid month, suggesting a MMYY format.
            console.log("MMYY");
        }
    } else if (isSuffixValidMonth) {
        // Only the suffix is a valid month, indicating a YYMM format.
        console.log("YYMM");
    } else {
        // Neither part can be interpreted as a valid month, thus the format is not recognized.
        console.log("NA");
    }
}


// Entry point: Reads the entire content from standard input, encoded as UTF-8,
// and then passes this raw text to the `executeDatePatternAnalysis` function.
executeDatePatternAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));