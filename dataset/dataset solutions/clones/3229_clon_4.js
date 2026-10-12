function determineCompleteNesting(symbols) {
    let remainingSymbols = symbols;
    let previousState;

    do {
        previousState = remainingSymbols;

        remainingSymbols = remainingSymbols.replace(
            /\(\)|\[\]|\{\}/g,
            ""
        );
    } while (remainingSymbols !== previousState);

    return remainingSymbols.length === 0;
}