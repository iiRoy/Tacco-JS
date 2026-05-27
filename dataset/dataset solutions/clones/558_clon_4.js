'use strict';

function decodeCipher(encodedSequence) {
    const characterUnits = Array.from(encodedSequence);

    const decodedCharacters = characterUnits.map(function(charUnit) {
        const initialCode = charUnit.charCodeAt(0);
        const shiftedCode = initialCode - 3;
        const finalCode = shiftedCode + (shiftedCode < 65 ? 26 : 0);
        return String.fromCharCode(finalCode);
    });
    
    return decodedCharacters.join('');
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
const inputLines = rawInputContent.trim().split('\n');

inputLines.forEach(function (currentInputItem) {
    console.log(decodeCipher(currentInputItem));
});
