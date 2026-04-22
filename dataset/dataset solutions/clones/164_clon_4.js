const systemIO = require("node:fs");

function generateCipherParameters() {
    const allCombinations = [];
    let factor = 0;
    while (factor < 26) {
        let offset = 0;
        while (offset < 26) {
            allCombinations.push({ factorValue: factor, offsetValue: offset });
            offset++;
        }
        factor++;
    }
    return allCombinations;
}

function transformTextSegment(originalInput, factor, offset) {
    let outputChars = [];
    for (let charIndex = 0; charIndex < originalInput.length; charIndex++) {
        const currentSymbol = originalInput[charIndex];
        const symbolCode = currentSymbol.charCodeAt(0);

        // Check if the character is a word character (alphanumeric or underscore)
        const isAlphaNumOrUnderscore = (
            (symbolCode >= 48 && symbolCode <= 57) || // 0-9
            (symbolCode >= 65 && symbolCode <= 90) || // A-Z
            (symbolCode >= 97 && symbolCode <= 122) || // a-z
            symbolCode === 95 // _
        );

        if (isAlphaNumOrUnderscore) {
            // Apply the affine-like transformation
            const transformedCode = (symbolCode * factor + offset) % 26 + 97;
            outputChars.push(String.fromCharCode(transformedCode));
        } else {
            outputChars.push(currentSymbol);
        }
    }
    return outputChars.join('');
}

function checkKeywords(processedSegment) {
    return processedSegment.includes("this") || processedSegment.includes("that");
}

const inputSource = systemIO.readFileSync("/dev/stdin", "utf8");
const inputRecords = inputSource.split('\n');

const allCipherSettings = generateCipherParameters();

inputRecords.forEach(currentRecord => {
    if (!currentRecord.trim()) return;

    allCipherSettings.forEach(settings => {
        const modifiedRecord = transformTextSegment(currentRecord, settings.factorValue, settings.offsetValue);
        if (checkKeywords(modifiedRecord)) {
            console.log(modifiedRecord);
        }
    });
});