'use strict';

const charMap = [];

for (let currentCode = 0; currentCode < 256; currentCode++) {
    let modifiedCode = currentCode - 3;
    
    if (modifiedCode < 65) {
        modifiedCode += 26;
    }
    
    charMap[currentCode] = String.fromCharCode(modifiedCode);
}

function processEncodedText(encodedInput) {
    return Array.from(encodedInput).map(charUnit => charMap[charUnit.charCodeAt(0)]).join('');
}

require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').forEach(function (dataLine) {
    console.log(processEncodedText(dataLine));
});