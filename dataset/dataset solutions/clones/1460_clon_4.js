var obtainRawContent = function() {
    return require('node:fs').readFileSync('/dev/stdin', 'utf8');
};

var processData = function(textualInput) {
    var currentPosition = 0;
    var lineOneEnd = -1;
    var lineTwoEnd = -1;

    // Locate the end of the first line
    for (var i = 0; i < textualInput.length; ++i) {
        if (textualInput[i] === '\n') {
            lineOneEnd = i;
            break;
        }
    }
    // Start reading from the character after the first newline
    currentPosition = lineOneEnd + 1;

    // Locate the end of the second line
    for (var i = currentPosition; i < textualInput.length; ++i) {
        if (textualInput[i] === '\n') {
            lineTwoEnd = i;
            break;
        }
    }
    // If no second newline, the second line extends to the end of the input
    if (lineTwoEnd === -1) {
        lineTwoEnd = textualInput.length;
    }

    // Extract the string containing numbers
    var numericString = textualInput.substring(currentPosition, lineTwoEnd);

    // Manually split the numeric string by spaces and convert to numbers,
    // mimicking `split(' ').map(Number)` behavior (empty strings become 0)
    var segments = [];
    var currentSegment = '';
    for (var j = 0; j < numericString.length; ++j) {
        var character = numericString[j];
        if (character === ' ') {
            segments.push(currentSegment);
            currentSegment = '';
        } else {
            currentSegment += character;
        }
    }
    segments.push(currentSegment); // Add the final segment after the loop

    var parsedNumbers = [];
    for (var k = 0; k < segments.length; ++k) {
        parsedNumbers.push(Number(segments[k]));
    }
    return parsedNumbers;
};

var performSort = function(dataCollection) {
    // Implement Insertion Sort algorithm
    var size = dataCollection.length;
    for (var x = 1; x < size; x++) {
        var key = dataCollection[x];
        var y = x - 1;
        while (y >= 0 && dataCollection[y] > key) {
            dataCollection[y + 1] = dataCollection[y];
            y = y - 1;
        }
        dataCollection[y + 1] = key;
    }
    return dataCollection; // Array is sorted in place
};

var formatOutput = function(sortedCollection) {
    // Manually build the output string, mimicking `join(' ')`
    var resultString = '';
    for (var z = 0; z < sortedCollection.length; ++z) {
        resultString += sortedCollection[z].toString();
        if (z < sortedCollection.length - 1) {
            resultString += ' ';
        }
    }
    return resultString;
};

// Main execution flow
var acquiredContent = obtainRawContent();
var initialValues = processData(acquiredContent);
var sortedValues = performSort(initialValues);
var finalResult = formatOutput(sortedValues);
console.log(finalResult);