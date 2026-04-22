function evaluateSequence(sourceMaterial) {
    const primaryContent = sourceMaterial.trim().split('\n')[0];
    const targetToken = primaryContent.split(/\s+/)[0];

    const characterValidationScheme = new Map();
    characterValidationScheme.set(0, new Set(['R', 'U', 'D'])); // For 0-indexed even positions (1st, 3rd, 5th, etc.)
    characterValidationScheme.set(1, new Set(['L', 'U', 'D'])); // For 0-indexed odd positions (2nd, 4th, 6th, etc.)

    const conformanceResult = [...targetToken].every((currentSymbol, symbolPosition) => {
        const positionParity = symbolPosition % 2;
        const permittedSymbols = characterValidationScheme.get(positionParity);
        return permittedSymbols.has(currentSymbol);
    });

    console.log(conformanceResult ? "Yes" : "No");
}

evaluateSequence(require("node:fs").readFileSync("/dev/stdin", "utf8"));