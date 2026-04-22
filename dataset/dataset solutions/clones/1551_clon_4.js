function processStrings(fullInput) {
    const [sourceText, patternText] = fullInput.split("\n");

    if (patternText.length === 0) {
        return console.log(0);
    }

    const possibleShiftRange = sourceText.length - patternText.length;

    if (possibleShiftRange < 0) {
        return console.log(patternText.length);
    }

    const allOffsets = Array.from({ length: possibleShiftRange + 1 }, (_, offsetIndex) => offsetIndex);

    const characterDivergences = allOffsets.map(currentOffset => {
        return Array.from({ length: patternText.length }, (_, characterPosition) => characterPosition)
            .reduce((cumulativeDifferences, characterPosition) => {
                const sourceChar = sourceText[currentOffset + characterPosition];
                const patternChar = patternText[characterPosition];
                return cumulativeDifferences + (sourceChar !== patternChar ? 1 : 0);
            }, 0);
    });

    const minimumDivergence = Math.min(...characterDivergences);

    console.log(minimumDivergence);
}

processStrings(require("fs").readFileSync("/dev/stdin", "utf8"));