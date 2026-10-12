function processInputData(sourceContent) {
    const cleanedContent = sourceContent.trim();
    const requiredSymbols = new Set(['1', '9', '7', '4']);

    const remainingSymbolsAfterScan = Array.from(cleanedContent).reduce((accumulatorSet, currentCharacter) => {
        if (accumulatorSet.has(currentCharacter)) {
            accumulatorSet.delete(currentCharacter);
        }
        return accumulatorSet;
    }, new Set(requiredSymbols));

    if (remainingSymbolsAfterScan.size === 0) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
