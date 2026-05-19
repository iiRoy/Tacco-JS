var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

rawData = rawData.split("\n");

var currentLineIdx = 0;

while (true) {
    var numEntries = +rawData[currentLineIdx++];

    if (numEntries === 0) {
        break;
    }

    var processedStrings = [];

    for (var entryCounter = 0; entryCounter < numEntries; entryCounter++) {
        processedStrings.push(rawData[currentLineIdx++]);
    }

    processedStrings = processedStrings.map(function (originalName) {
        var filteredName = "";
        var vowelFound = true;

        for (var charIndex = 0; charIndex < originalName.length; charIndex++) {
            var currentChar = originalName[charIndex];
            if (vowelFound) {
                filteredName += currentChar;
                vowelFound = false;
            }
            if (/[aiueo]/.test(currentChar)) {
                vowelFound = true;
            }
        }
        return filteredName;
    }).sort();

    var findCommonPrefixLength = function (strA, strB) {
        var minLength = Math.min(strA.length, strB.length);
        for (var charComparisonIdx = 0; charComparisonIdx < minLength; charComparisonIdx++) {
            if (strA[charComparisonIdx] !== strB[charComparisonIdx]) {
                return charComparisonIdx;
            }
        }
        if (strA.length === strB.length)
            return -1;
        return minLength;
    };

    var maxPrefixLength = 0;
    for (var entryCounter = 0; entryCounter < numEntries; entryCounter++) {
        if (entryCounter === 0)
            continue;
        var currentPrefixLen = findCommonPrefixLength(processedStrings[entryCounter - 1], processedStrings[entryCounter]);
        if (currentPrefixLen === -1) {
            maxPrefixLength = -2;
            break;
        }
        if (currentPrefixLen > maxPrefixLength) {
            maxPrefixLength = currentPrefixLen;
        }
    }
    console.log(maxPrefixLength + 1);
}
