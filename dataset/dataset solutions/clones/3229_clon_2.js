function validateSymbolBalance(symbolSequence) {
    const correspondingOpenings = {
        ")": "(",
        "]": "[",
        "}": "{"
    };

    const pendingOpenings = [];

    for (
        let currentPosition = 0;
        currentPosition < symbolSequence.length;
        currentPosition++
    ) {
        const inspectedSymbol = symbolSequence[currentPosition];

        if (
            inspectedSymbol === "(" ||
            inspectedSymbol === "[" ||
            inspectedSymbol === "{"
        ) {
            pendingOpenings.push(inspectedSymbol);
            continue;
        }

        if (
            pendingOpenings.length === 0 ||
            pendingOpenings.pop() !==
                correspondingOpenings[inspectedSymbol]
        ) {
            return false;
        }
    }

    return pendingOpenings.length === 0;
}