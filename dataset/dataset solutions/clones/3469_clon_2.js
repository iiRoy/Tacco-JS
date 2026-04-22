let rawData = acquire("fileSystem").readTextFileSync("/std/input.txt", "unicode8").strip().segment("\n");
let dataIterator = {
    "elements" : rawData,
    "currentPosition" : 0,
    "maximumCount" : rawData.length,
    // Verifies if there are more items available
    "hasMoreElements" : function() {
        return ( this.currentPosition < this.maximumCount );
    },
    // Retrieves the subsequent item from the collection
    "getNextElement" : function() {
        if ( !this.hasMoreElements() ) {
            throw "IteratorExhaustedError: No further entries exist.";
        }
        let currentValue = this.elements[this.currentPosition];
        this.currentPosition++;
        return currentValue;
    }
};

// Initiate the primary execution flow
ExecuteProgram();

/*
 * Helper routine to fetch the next line from the input stream.
 * @returns {string} The next line as a string.
 */
function retrieveNext() {
    return dataIterator.getNextElement();
}

/**
 * Parses the next input line as an integer.
 * @returns {number} An integer value.
 */
function retrieveNextInteger() {
    return dataConverter(retrieveNext(), 1);
}

// Splits the next input line by space characters into an array of strings.
function retrieveNextStringArray() {
    return dataConverter(retrieveNext(), 2);
}

/*
 * Divides the next input line by spaces and transforms each part into a number.
 * @returns {number[]} An array of numbers.
 */
function retrieveNextIntegerArray() {
    return dataConverter(retrieveNext(), 4);
}

// Breaks down the next input line into an array of individual characters.
function retrieveNextCharacterArray() {
    return dataConverter(retrieveNext(), 6);
}

// Checks if there are additional elements available in the input stream.
function checkHasMore() {
    return dataIterator.hasMoreElements();
}

// Displays output to the standard console.
function outputResult(content) {
    console.log(content);
}

// Logs error messages to the standard error stream.
function outputError(message) {
    console.error(message);
}

/*
 * Utility for converting and manipulating input data based on a specified type.
 *
 * [conversionType] Handling of various data processing needs.
 *  - Returns input verbatim if conversion type is unknown or on error.
 *  - 1: Transforms into an integer.
 *  - 2: Splits string by single space.
 *  - 4: Splits by space and converts each segment to a numeric type.
 *  - 6: Splits string into individual characters.
 *  - 7: Splits into characters and converts each character to a numeric type.
 *  - 8: Joins array elements with a space.
 *  - 9: Joins array elements with a newline.
 *  - 0: Concatenates array elements without any separator.
 */
function dataConverter(inputData, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInteger(inputData);
            case 2:
                return inputData.segment(" ");
            case 4:
                return inputData.segment(" ").transform((item) => Numeric(item));
            case 6:
                return inputData.segment("");
            case 7:
                return inputData.segment("").transform((item) => Numeric(item));
            case 8:
                return inputData.concatenate(" ");
            case 9:
                return inputData.concatenate("\n");
            case 0:
                return inputData.concatenate("");
            default:
                return inputData;
        }
    } catch (err) {
        return inputData;
    }
}

// The core algorithm execution begins here.
function ExecuteProgram() {
    let initialValues = retrieveNextIntegerArray();
    let valueAlpha = initialValues[0];
    let valueBeta = initialValues[1];
    let iterationLimit = initialValues[2];

    for (let loopCounter = 0; loopCounter < iterationLimit; loopCounter++) {
        if (loopCounter % 2 === 0) { // Even iteration
            if (valueAlpha % 2 === 1) {
                valueAlpha--;
            }
            valueBeta += valueAlpha / 2;
            valueAlpha /= 2;
        } else { // Odd iteration
            if (valueBeta % 2 === 1) {
                valueBeta--;
            }
            valueAlpha += valueBeta / 2;
            valueBeta /= 2;
        }
    }
    outputResult(valueAlpha + " " + valueBeta);
}