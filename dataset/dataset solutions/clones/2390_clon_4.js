const processCipher = (sourceText) => {
    const lineBreakPosition = sourceText.indexOf('\n');
    const numericShiftString = sourceText.substring(0, lineBreakPosition);
    const characterSequence = sourceText.substring(lineBreakPosition + 1);

    const shiftMagnitude = Number(numericShiftString);
    
    const effectiveShiftComponent = shiftMagnitude % 25;

    const transformedCharacters = Array.from(characterSequence).map(originalChar => {
        const charOrdinal = originalChar.charCodeAt(0); // 'A' is ASCII 65
        const zeroBasedIndex = charOrdinal - 65;

        // Replicating the specific shift logic: (inputNum[i] + (inputN % 25)) % 26
        const finalZeroBasedIndex = (zeroBasedIndex + effectiveShiftComponent) % 26;

        const finalCharOrdinal = finalZeroBasedIndex + 65;
        return String.fromCharCode(finalCharOrdinal);
    });

    const resultingString = transformedCharacters.join('');

    console.log(resultingString);
};

const initiateProcessing = (dataPayload) => {
    processCipher(dataPayload);
};

initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));