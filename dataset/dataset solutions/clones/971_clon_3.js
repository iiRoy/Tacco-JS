var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var trimmedInput = rawData.trim();
var lineSegments = trimmedInput.split("\n");

var mainString = lineSegments[0];
var searchPattern = lineSegments[1];

function verifySubstringMatch(sourceText, startIndex, patternText) {
    var currentPatternLength = patternText.length;
    var sourceTextLength = sourceText.length;

    // Early exit if the pattern cannot possibly fit from startIndex
    if (startIndex + currentPatternLength > sourceTextLength) {
        return false;
    }

    for (var patternCharIndex = 0; patternCharIndex < currentPatternLength; patternCharIndex++) {
        if (sourceText[startIndex + patternCharIndex] !== patternText[patternCharIndex]) {
            return false;
        }
    }
    return true;
}

var primaryStringLength = mainString.length;
var targetPatternLength = searchPattern.length;

for (var currentMainIndex = 0; currentMainIndex <= primaryStringLength - targetPatternLength; currentMainIndex++) {
    var isCurrentMatch = verifySubstringMatch(mainString, currentMainIndex, searchPattern);
    if (isCurrentMatch) {
        console.log(currentMainIndex);
    }
}
