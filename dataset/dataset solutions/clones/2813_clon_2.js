function compressConsecutiveSymbols(sourceString) {
    if (sourceString.length === 0) {
        return "";
    }

    let compressedResult = "";
    let activeSymbol = sourceString[0];
    let activeFrequency = 1;

    for (
        let currentPosition = 1;
        currentPosition < sourceString.length;
        currentPosition++
    ) {
        if (sourceString[currentPosition] === activeSymbol) {
            activeFrequency++;
            continue;
        }

        compressedResult +=
            activeSymbol +
            String(activeFrequency);

        activeSymbol = sourceString[currentPosition];
        activeFrequency = 1;
    }

    compressedResult +=
        activeSymbol +
        String(activeFrequency);

    return compressedResult;
}