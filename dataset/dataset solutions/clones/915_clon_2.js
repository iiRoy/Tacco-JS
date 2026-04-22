var rawDataObtainer = require("fs");
var rawDataCollection = rawDataObtainer.readFileSync("/dev/stdin", "utf8");
rawDataCollection = rawDataCollection.split("\n");
var linePointer = 0;
while (true) {
    var entityCount = +rawDataCollection[linePointer++];
    if (0 === entityCount) {
        break;
    }
    var processedTextFragments = [];
    for (
        var entryIndex = 0;
        entryIndex < entityCount;
        entryIndex++
    ) {
        processedTextFragments.push(rawDataCollection[linePointer++]);
    }
    processedTextFragments = processedTextFragments.map(
        function (initialString) {
            var abbreviatedForm = "";
            var shouldCaptureNextChar = true;
            for (
                var charPosition = 0,
                    stringCharacters = initialString;
                charPosition < stringCharacters.length;
                charPosition++
            ) {
                var currentCharacter = stringCharacters[charPosition];
                if (shouldCaptureNextChar) {
                    abbreviatedForm += currentCharacter;
                    shouldCaptureNextChar = false;
                }
                if (/[aeiou]/.test(currentCharacter)) {
                    shouldCaptureNextChar = true;
                }
            }
            return abbreviatedForm;
        }
    ).sort();
    var ascertainCommonPrefixLength = function (stringA, stringB) {
        var minimalLength = Math.min(stringA.length, stringB.length);
        for (var charIter = 0; charIter < minimalLength; charIter++) {
            if (stringA[charIter] !== stringB[charIter]) {
                return charIter;
            }
        }
        if (stringA.length === stringB.length) {
            return -1;
        }
        return minimalLength;
    };
    var greatestPrefixValue = 0;
    for (var fragmentIdx = 0; fragmentIdx < entityCount; fragmentIdx++) {
        if (fragmentIdx === 0) {
            continue;
        }
        var currentAdjacentPrefix = ascertainCommonPrefixLength(
            processedTextFragments[fragmentIdx - 1],
            processedTextFragments[fragmentIdx]
        );
        if (currentAdjacentPrefix === -1) {
            greatestPrefixValue = -2;
            break;
        }
        if (currentAdjacentPrefix > greatestPrefixValue) {
            greatestPrefixValue = currentAdjacentPrefix;
        }
    }
    console.log(greatestPrefixValue + 1);
}