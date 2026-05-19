"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });

// Import the Node.js file system module for input operations
var fileSystemModule = __importStar(require("fs"));

{
    // A boolean flag to control execution path for debugging or production
    var isDebuggingMode = false;

    /**
     * Orchestrates the processing of input data.
     * It parses the input string and logs the extracted numerical components.
     * @param {string} inputArguments - A string containing space-separated numerical values.
     */
    var processInputData = function (inputArguments) {
        // Utilize a helper function to convert the raw string into structured numbers
        var parsedValues = parseNumericString(inputArguments);
        var firstVal = parsedValues.firstVal;
        var secondVal = parsedValues.secondVal;
        var countVal = parsedValues.countVal;

        // Display the three parsed numerical values to standard output
        console.log(firstVal, secondVal, countVal);
    };

    /**
     * Converts a string of three space-separated numbers into an object with named properties.
     * @param {string} rawInputText - The input string, e.g., "10 20 30".
     * @returns {{firstVal: number, secondVal: number, countVal: number}} An object containing the parsed numbers.
     */
    var parseNumericString = function (rawInputText) {
        // Divide the input string into an array of string parts based on space delimiter
        var splitParts = rawInputText.split(' ');
        var firstString = splitParts[0];
        var secondString = splitParts[1];
        var thirdString = splitParts[2];

        // Convert each string part to a number and return them within a new object
        return {
            firstVal: Number(firstString),
            secondVal: Number(secondString),
            countVal: Number(thirdString),
        };
    };

    // Conditional logic to determine the source of input data
    if (isDebuggingMode) {
        // If in debug mode, use a predefined string as input
        var sampleInputData = '5 7 4';
        processInputData(sampleInputData);
    }
    else {
        // Otherwise, read the input from standard input (e.g., a piped file or user entry)
        processInputData(fileSystemModule.readFileSync('/dev/stdin', 'utf8'));
    }
}
