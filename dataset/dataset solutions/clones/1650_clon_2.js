// This utility provides functions to parse input data from standard input.
var INPUT_PARSER = (function () {
    // Factory function to create an instance of the input data handler.
    function createParser(inputString) {
        return new InputDataHandler(inputString);
    }

    // Constructor for the InputDataHandler class.
    function InputDataHandler(inputString) {
        // The raw input string is trimmed and split into an array of lines.
        this._lines = inputString.trim().split("\n");
    }

    // Prototype methods for InputDataHandler to access and transform data.
    InputDataHandler.prototype.getLineValue = function (lineIndex) {
        // Returns the string content of a specific line by its index.
        return this._lines[lineIndex];
    };

    InputDataHandler.prototype.getLineArray = function (lineIndex) {
        // Parses a specific line into an array of numbers or strings.
        return this.stringToArrayOfNumbers(this._lines[lineIndex]);
    };

    InputDataHandler.prototype.getSlicedValues = function (startIndex, sliceLimit) {
        // Extracts a slice of lines and converts each line into a single number or string.
        // The `+sliceLimit + startIndex || undefined` handles cases where sliceLimit might be 0 or null.
        return this._lines.slice(startIndex, +sliceLimit + startIndex || undefined).map(itemValue => this.stringToNumberOrString(itemValue));
    };

    InputDataHandler.prototype.getSlicedArrays = function (startIndex, sliceLimit) {
        // Extracts a slice of lines and converts each line into an array of numbers or strings.
        return this._lines.slice(startIndex, +sliceLimit + startIndex || undefined).map(itemValue => this.stringToArrayOfNumbers(itemValue));
    };

    InputDataHandler.prototype.stringToArrayOfNumbers = function (inputLine) {
        // Splits a given string by spaces and attempts to convert each segment into a number.
        // If conversion fails, the original string segment is kept.
        return inputLine.split(" ").map(itemValue => this.stringToNumberOrString(itemValue));
    };

    InputDataHandler.prototype.stringToNumberOrString = function (inputPart) {
        // Attempts to convert a string part to a number.
        // If the conversion results in NaN (Not-a-Number), the original string part is returned.
        var parsedNum = +inputPart;
        return (parsedNum === parsedNum) ? parsedNum : inputPart;
    };

    // The factory function is returned, allowing external code to create parser instances.
    return createParser;
})();

// Initialize the input reader by reading data from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// The following code block is
