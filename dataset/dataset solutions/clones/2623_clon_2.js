var lineReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var dataSource;
var inputBuffer = [];

lineReader.on('line', function(currentLine) {
    inputBuffer.push(currentLine);
});

lineReader.on('close', function() {
    dataSource = initializeInputSource(inputBuffer);
    console.error('\n↑Input ↓Output');

    executeCoreLogic();
});


function deepCopyValue(originalData) {
    return (originalData instanceof Set) ? new Set(Array.from(originalData)) : JSON.parse(JSON.stringify(originalData));
}


function readInteger() { return formatData(retrieveNextItem(), 1); }
function readStringArray() { return formatData(retrieveNextItem(), 2); }
function readIntArray() { return formatData(retrieveNextItem(), 4); }
function readCharArray() { return formatData(retrieveNextItem(), 6); }


function retrieveNextItem() { return dataSource.retrieveNextItem(); }
function hasMoreData() { return dataSource.hasMoreData(); }


function initializeInputSource(sourceLines) {

    return {
        dataLines: sourceLines,
        currentPosition: 0,
        totalLines: sourceLines.length,

        hasMoreData: function() { return (this.currentPosition < this.totalLines); },
        retrieveNextItem: function() {
            if (this.hasMoreData()) {
                return this.dataLines[this.currentPosition++];
            } else {
                throw 'InputDataExhaustedException – No more lines available for processing.';
            }
        }
    };
}


function displayResult(content) {
    console.log(content);
}


function logDebugMessage(dataToInspect) {
    console.error('debug output:' + require('util').inspect(dataToInspect, false, null));
}


// This function handles various data transformations based on the specified type.
// The 'conversionType' parameter determines the operation:
// 1: Converts to an integer.
// 2: Splits a string by spaces into an array of strings.
// 4: Splits by spaces and converts each part to a number.
// 6: Splits a string into an array of individual characters.
// 7: Splits by characters and converts each to a number.
// 8: Joins an array of elements with spaces.
// 9: Joins an array of elements with newlines.
// 0: Joins an array of elements without any separator.
// Default: Returns the input value unchanged.
function formatData(valueToConvert, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(valueToConvert);
            case 2:
                return valueToConvert.split(' ');
            case 4:
                return valueToConvert.split(' ').map(Number);
            case 6:
                return valueToConvert.split('');
            case 7:
                return valueToConvert.split('').map(Number);
            case 8:
                return valueToConvert.join(' ');
            case 9:
                return valueToConvert.join('\n');
            case 0:
                return valueToConvert.join('');
            default:
                return valueToConvert;
        }
    } catch (e) {
        return valueToConvert; // In case of conversion errors, return original value.
    }
}


function executeCoreLogic() {
    var totalElements = readInteger();

    for (var firstIndex = 0; firstIndex < totalElements - 1; firstIndex++) {
        for (var secondIndex = firstIndex + 1; secondIndex < totalElements; secondIndex++) {
            var differenceIndices = [];
            for (var bitPosition = 0; bitPosition < 10; bitPosition++) {
                // Compare the k-th bit of firstIndex and secondIndex
                if (((firstIndex >> bitPosition) & 1) !== ((secondIndex >> bitPosition) & 1)) {
                    differenceIndices.push(bitPosition + 1);
                }
            }
            displayResult(formatData(differenceIndices, 8));
        }
    }
}