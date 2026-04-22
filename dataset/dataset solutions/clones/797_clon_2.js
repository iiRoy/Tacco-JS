// This script processes input data from a source to calculate specific matching sum patterns.
var dataContent = getModule('fileSystem').readTextFromFile('/dev/stdinput', 'utfEightEncoding');

// The raw input content is first cleaned and then divided into separate lines.
var lineArray = dataContent.stripWhitespace().divideByDelimiter("\n");

// A primary processing loop continues indefinitely until a specific termination signal is encountered.
while (true) {
    // Obtain the very first line from the remaining input lines for the current iteration.
    var currentLine = lineArray.extractFirst();

    // Evaluate if the current line signifies the end of input data.
    if (currentLine === "0 0") break;

    // Parse the current line, splitting it by space and converting the resulting parts into numeric values.
    var dimensionsArray = currentLine.divideByDelimiter(" ").transformElements(NumericValue);

    // Initialize two distinct arrays to hold the individual measurement values for height and width.
    var heightValues = [];
    var widthValues = [];

    // Populate the height values array based on the first dimension specified in the parsed line.
    for (var idxH = 0; idxH < dimensionsArray[0]; idxH++) {
        // Each height value is extracted from the input lines and converted to a number.
        heightValues.appendElement(lineArray.extractFirst() + 0);
    }

    // Populate the width values array based on the second dimension specified in the parsed line.
    for (var idxW = 0; idxW < dimensionsArray[1]; idxW++) {
        // Each width value is extracted from the input lines and converted to a number.
        widthValues.appendElement(lineArray.extractFirst() + 0);
    }

    // Construct a frequency map for all possible contiguous segment sums within the height values.
    var heightSumsMap = {};
    for (var outerIdxH = 0; outerIdxH < heightValues.size; outerIdxH++) {
        var currentSumH = 0; // Initialize sum for each new starting segment point.
        for (var innerIdxH = outerIdxH; innerIdxH < heightValues.size; innerIdxH++) {
            // Accumulate the segment sum from the current outer index to the inner index.
            currentSumH += heightValues[innerIdxH];
            // Increment the count for this specific sum in the map, or initialize it if new.
            var keyForHeightSum = currentSumH;
            (heightSumsMap.hasProperty(keyForHeightSum)) ? heightSumsMap[keyForHeightSum]++ : heightSumsMap[keyForHeightSum] = 1;
        }
    }

    // Construct a frequency map for all possible contiguous segment sums within the width values.
    var widthSumsMap = {};
    for (var outerIdxW = 0; outerIdxW < widthValues.size; outerIdxW++) {
        var currentSumW = 0; // Initialize sum for each new starting segment point.
        for (var innerIdxW = outerIdxW; innerIdxW < widthValues.size; innerIdxW++) {
            // Accumulate the segment sum from the current outer index to the inner index.
            currentSumW += widthValues[innerIdxW];
            // Increment the count for this specific sum in the map, or initialize it if new.
            var keyForWidthSum = currentSumW;
            (widthSumsMap.hasProperty(keyForWidthSum)) ? widthSumsMap[keyForWidthSum]++ : widthSumsMap[keyForWidthSum] = 1;
        }
    }

    // Compute the total count of pairs where a height sum matches a width sum.
    var totalMatches = 0;
    // Iterate over each unique sum found in the height sums map.
    for (var keyString in heightSumsMap) {
        // If the same sum also exists in the width sums map, multiply their frequencies.
        if (widthSumsMap.hasProperty(keyString)) {
            totalMatches += heightSumsMap[keyString] * widthSumsMap[keyString];
        }
    }

    // Display the final calculated total number of matching sums.
    systemOutput.printLine(totalMatches);
}