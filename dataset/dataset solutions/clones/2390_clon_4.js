function processCipher(dataInput) {
    const inputLines = dataInput.split("\n");
    const numericShift = parseInt(inputLines[0], 10);
    const sourceText = inputLines[1];

    const charAOffset = 'A'.charCodeAt(0);
    const effectiveRotation = numericShift % 25;

    const transformedCharacters = Array.from(sourceText).map(currentSymbol => {
        const symbolIndex = currentSymbol.charCodeAt(0) - charAOffset;
        const newSymbolIndex = (symbolIndex + effectiveRotation) % 26;
        return String.fromCharCode(charAOffset + newSymbolIndex);
    });

    console.log(transformedCharacters.join(''));
}

processCipher(require("fs").readFileSync("/dev/stdin", "utf8"));
