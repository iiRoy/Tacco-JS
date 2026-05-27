var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var charArray = rawData.split('');

const ALPHABET_SIZE = 26;
const LOWERCASE_A_CODE = 'a'.charCodeAt(0);

function getShiftedChar(originalChar, currentShift) {
    var transformedChar;
    var charCode = originalChar.charCodeAt(0);

    var isLowercaseLetter = (charCode >= LOWERCASE_A_CODE && charCode < LOWERCASE_A_CODE + ALPHABET_SIZE);

    if (!isLowercaseLetter) {
        transformedChar = originalChar;
    } else {
        var relativeCode = charCode - LOWERCASE_A_CODE;
        var shiftedRelativeCode = (relativeCode + currentShift) % ALPHABET_SIZE;
        transformedChar = String.fromCharCode(shiftedRelativeCode + LOWERCASE_A_CODE);
    }
    return transformedChar;
}

function hasDecipheredKeywords(textToCheck) {
    var targetKeywords = ['the', 'this', 'that'];
    for (var k = 0; k < targetKeywords.length; k++) {
        if (textToCheck.indexOf(targetKeywords[k]) >= 0) {
            return true;
        }
    }
    return false;
}

var finalOutput;

for (var shiftVal = 0; shiftVal < ALPHABET_SIZE; shiftVal++) {
    var processedChars = charArray.map(function(currentChar) {
        return getShiftedChar(currentChar, shiftVal);
    });
    var processedString = processedChars.join('');

    if (hasDecipheredKeywords(processedString)) {
        finalOutput = processedString;
        break;
    }
}

console.log(finalOutput);
