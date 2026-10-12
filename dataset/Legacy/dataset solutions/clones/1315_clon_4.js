(function(sourceText) {
    const initialLetterMap = Array.from({ length: 26 }, (_, charIndex) =>
        String.fromCharCode('a'.charCodeAt(0) + charIndex)
    ).reduce((accumulatorMap, currentLetter) => {
        accumulatorMap.set(currentLetter, 0);
        return accumulatorMap;
    }, new Map());

    const finalLetterCounts = Array.from(sourceText).reduce((currentCounts, currentSymbol) => {
        const lowerSymbol = currentSymbol.toLowerCase();
        const symbolCode = lowerSymbol.charCodeAt(0);
        if (symbolCode >= 'a'.charCodeAt(0) && symbolCode <= 'z'.charCodeAt(0)) {
            currentCounts.set(lowerSymbol, (currentCounts.get(lowerSymbol) || 0) + 1);
        }
        return currentCounts;
    }, new Map(initialLetterMap));

    const formattedOutputLines = Array.from(finalLetterCounts.entries()).map(([letterKey, countValue]) =>
        `${letterKey}: ${countValue}`
    );
    console.log(formattedOutputLines.join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function processTextSegments(inputString, segmentDelimiter = ' ', lineDelimiter = '\n') {
    const trimmedInput = inputString.endsWith('\n') ? inputString.slice(0, -1) : inputString;
    const lines = trimmedInput.split(lineDelimiter);
    const segmentedData = lines.map(line => line.split(segmentDelimiter));
    return segmentedData;
}
