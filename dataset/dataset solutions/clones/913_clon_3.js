function isVowelChar(char) {
    const vowelSet = new Set(['a', 'i', 'u', 'e', 'o']);
    return vowelSet.has(char.toLowerCase());
}

var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

while (true) {
    var currentBlockSize = parseInt(inputLines.shift(), 10);

    if (currentBlockSize === 0) {
        break;
    }

    var blockLines = inputLines.splice(0, currentBlockSize);

    var uniqueGeneratedPrefixes = {};
    var maxPrefixLength = 0;

    for (const currentLineText of blockLines) {
        let lineText = currentLineText;
        let generatedPrefix = '';
        let vowelEncountered = false;

        for (let charIdx = 0; charIdx < lineText.length; charIdx++) {
            if (vowelEncountered) {
                generatedPrefix += lineText[charIdx];
            }
            vowelEncountered = isVowelChar(lineText[charIdx]);
        }
        
        uniqueGeneratedPrefixes[generatedPrefix] = true;
        
        const currentPrefixLength = generatedPrefix.length;
        maxPrefixLength = Math.max(maxPrefixLength, currentPrefixLength);
    }

    let resultFoundForBlock = false;

    for (let prefixLen = 1; prefixLen <= maxPrefixLength; prefixLen++) {
        var truncatedPrefixes = {};
        
        for (const fullPrefix in uniqueGeneratedPrefixes) {
            if (Object.prototype.hasOwnProperty.call(uniqueGeneratedPrefixes, fullPrefix)) {
                const slicedPart = fullPrefix.slice(0, prefixLen);
                truncatedPrefixes[slicedPart] = true;
            }
        }
        
        const numberOfUniqueTruncated = Object.keys(truncatedPrefixes).length;
        if (numberOfUniqueTruncated === currentBlockSize) {
            console.log(prefixLen);
            resultFoundForBlock = true;
            break;
        }
    }

    if (!resultFoundForBlock) {
        console.log(-1);
    }
}
